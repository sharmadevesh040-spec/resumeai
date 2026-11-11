import { NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { validateGitHubUrl, validateLinkedInUrl } from "@/lib/import/url-validator";
import { fetchGitHubProfile, GitHubImportResult } from "@/lib/import/github-service";
import { processLinkedInUrl, LinkedInImportResult, LinkedInParsedProfile } from "@/lib/import/linkedin-service";
import { normalizeProfileToResume } from "@/lib/import/normalizer";
import { generateResumeWithGemini } from "@/lib/ai/resume-generator";

export const maxDuration = 30; // 30s timeout for multi-source fetching

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      githubUrl,
      linkedinUrl,
      targetRole,
      companyName,
      jobDescription,
      targetResumeId,
      linkedinProfileData, // Optional pre-parsed LinkedIn data (e.g. from client PDF upload)
      directContact, // Optional contact & education prefill
    } = body;

    const stagesCompleted: string[] = [];

    // Stage 1: Validate URLs
    const githubValidation = githubUrl ? validateGitHubUrl(githubUrl) : null;
    const linkedinValidation = linkedinUrl ? validateLinkedInUrl(linkedinUrl) : null;

    const hasValidGitHub = Boolean(githubValidation && githubValidation.isValid);
    const hasValidLinkedIn = Boolean(linkedinValidation && linkedinValidation.isValid);
    const hasPreParsedLinkedIn = Boolean(
      linkedinProfileData && (linkedinProfileData.fullName || linkedinProfileData.experiences?.length > 0)
    );

    if (!hasValidGitHub && !hasValidLinkedIn && !hasPreParsedLinkedIn) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one valid profile link (GitHub or LinkedIn) or uploaded profile is required.",
          diagnostics: {
            github: githubValidation?.error || (githubUrl ? "Invalid GitHub URL" : "Not provided"),
            linkedin: linkedinValidation?.error || (linkedinUrl ? "Invalid LinkedIn URL" : "Not provided"),
          },
        },
        { status: 400 }
      );
    }

    stagesCompleted.push("Profile links validated successfully");

    // Stage 2: Concurrent profile data collection
    let githubResult: GitHubImportResult | undefined;
    let linkedinResult: LinkedInImportResult | undefined;

    const fetchPromises: Promise<void>[] = [];

    if (hasValidGitHub && githubValidation?.username) {
      fetchPromises.push(
        (async () => {
          githubResult = await fetchGitHubProfile(
            githubValidation.username!,
            targetRole,
            jobDescription
          );
        })()
      );
    }

    if (hasPreParsedLinkedIn) {
      linkedinResult = {
        success: true,
        source: "pdf_export",
        profile: linkedinProfileData as LinkedInParsedProfile,
      };
    } else if (hasValidLinkedIn && linkedinValidation?.username) {
      fetchPromises.push(
        (async () => {
          linkedinResult = await processLinkedInUrl(linkedinValidation.username!);
        })()
      );
    }

    await Promise.allSettled(fetchPromises);

    // Verify at least one service produced usable data
    const githubUsable = Boolean(githubResult && (githubResult.profile || githubResult.topRepositories.length > 0));
    const linkedinUsable = Boolean(
      linkedinResult &&
        linkedinResult.profile &&
        linkedinResult.success &&
        (
          linkedinResult.source === "url_public" ||
          linkedinResult.source === "pdf_export" ||
          (linkedinResult.profile.experiences && linkedinResult.profile.experiences.length > 0) ||
          (linkedinResult.profile.education && linkedinResult.profile.education.length > 0)
        )
    );

    if (!githubUsable && !linkedinUsable) {
      return NextResponse.json(
        {
          success: false,
          requiresPdfUpload: linkedinResult?.requiresPdfUpload || false,
          requiresOAuth: linkedinResult?.requiresOAuth || false,
          authUrl: linkedinResult?.authUrl,
          error:
            linkedinResult?.warning ||
            "Unable to retrieve profile information from LinkedIn. Please upload your LinkedIn Profile PDF or connect via LinkedIn.",
          warnings: [githubResult?.warning, linkedinResult?.warning].filter(Boolean),
        },
        { status: 422 }
      );
    }

    if (githubUsable) {
      stagesCompleted.push(`Fetched GitHub profile & scored top ${githubResult?.topRepositories.length || 0} repositories`);
    }
    if (linkedinUsable) {
      stagesCompleted.push(
        linkedinResult?.source === "pdf_export"
          ? "Parsed verified LinkedIn PDF profile"
          : linkedinResult?.source === "url_public"
          ? `Extracted ${linkedinResult.profile?.experiences.length || 0} positions & ${linkedinResult.profile?.education.length || 0} education records from LinkedIn`
          : "Identified LinkedIn profile credentials"
      );
    } else if (hasValidLinkedIn && !linkedinUsable) {
      stagesCompleted.push("LinkedIn direct access restricted; proceeding with verified GitHub data and prompt for PDF upload");
    }

    // Stage 3: Gemini-powered profile analysis and resume generation
    stagesCompleted.push("Gemini analyzing candidate profile, repositories, and technical background");

    const generationResult = await generateResumeWithGemini({
      github: githubResult,
      linkedin: linkedinUsable ? linkedinResult?.profile : undefined,
      targetRole: targetRole || null,
      companyName: companyName || null,
      jobDescription: jobDescription || null,
      directContact: directContact || undefined,
    });

    if (hasValidLinkedIn && !linkedinUsable && linkedinResult?.warning) {
      generationResult.missingInformationWarnings.push(
        "LinkedIn access restricted: Upload your official LinkedIn Profile PDF (Profile > More > Save to PDF) to import all company experiences and college degrees."
      );
    }

    stagesCompleted.push("Generated ATS-compliant action verbs, project narratives, and role alignment with Gemini");
    stagesCompleted.push(`Recommended optimal template: ${generationResult.recommendedTemplate}`);

    const finalResume = generationResult.resume;

    // Stage 4: Database persistence
    const user = await getCurrentUser();
    let resumeId = targetResumeId || `import-${Date.now()}`;

    try {
      // Store in ImportedProfile table for audit and intelligence
      await db.importedProfile.create({
        data: {
          userId: user?.id || null,
          linkedinUrl: linkedinValidation?.normalizedUrl || null,
          githubUrl: githubValidation?.normalizedUrl || null,
          githubUsername: githubValidation?.username || null,
          rawGithubData: githubResult ? JSON.stringify(githubResult) : null,
          rawLinkedinData: linkedinResult ? JSON.stringify(linkedinResult) : null,
          normalizedData: JSON.stringify(finalResume),
          selectedRepos: githubResult ? JSON.stringify(githubResult.topRepositories) : null,
          targetRole: targetRole || null,
        },
      });

      // If user is authenticated, create or update the resume
      if (user) {
        if (targetResumeId) {
          // Explicit update of existing resume
          const existing = await db.resume.findFirst({
            where: { id: targetResumeId, userId: user.id },
          });

          if (existing) {
            await db.resume.update({
              where: { id: targetResumeId },
              data: {
                title: finalResume.title,
                targetRole: finalResume.targetJob.targetRole,
                templateId: finalResume.style.templateId,
                atsScore: finalResume.atsAnalysis?.overallScore || 90,
                contentJson: JSON.stringify(finalResume),
                styleSettings: JSON.stringify(finalResume.style),
              },
            });
            resumeId = existing.id;
          }
        } else {
          // Create new resume without overwriting anything
          const created = await db.resume.create({
            data: {
              userId: user.id,
              title: finalResume.title,
              targetRole: finalResume.targetJob.targetRole,
              templateId: finalResume.style.templateId,
              atsScore: finalResume.atsAnalysis?.overallScore || 92,
              contentJson: JSON.stringify(finalResume),
              styleSettings: JSON.stringify(finalResume.style),
            },
          });

          await db.resumeVersion.create({
            data: {
              resumeId: created.id,
              versionNumber: 1,
              title: "Imported from GitHub & LinkedIn",
              contentJson: JSON.stringify(finalResume),
            },
          });

          resumeId = created.id;
        }
      }
    } catch (dbErr) {
      console.warn("DB save warning (running in memory/guest fallback):", dbErr);
    }

    finalResume.id = resumeId;
    stagesCompleted.push("Resume prepared for Live Editor and Vector Export");

    return NextResponse.json({
      success: true,
      resumeId,
      resume: finalResume,
      recommendedTemplate: generationResult.recommendedTemplate,
      recommendationReason: generationResult.recommendationReason,
      missingInformationWarnings: generationResult.missingInformationWarnings,
      sourcesUsed: generationResult.sourcesUsed,
      requiresOAuth: linkedinResult?.requiresOAuth,
      requiresPdfUpload: linkedinResult?.requiresPdfUpload,
      authUrl: linkedinResult?.authUrl,
      scopeLimitedInfo: linkedinResult?.scopeLimitedInfo,
      linkedinWarning: linkedinResult?.warning,
      stagesCompleted,
    });
  } catch (error) {
    console.error("Auto-generate error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error during auto-generation",
      },
      { status: 500 }
    );
  }
}
