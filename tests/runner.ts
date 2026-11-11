import { testResumeJsonValidation } from "./resume-json.test";
import { testAiAndAtsAnalysis } from "./ai-ats.test";
import { testPdfAndDocxGeneration } from "./pdf-docx.test";
import { testAuthCrypto } from "./auth.test";
import { testAutoImportSuite } from "./auto-import.test";
import { runComprehensiveEngineTests } from "./comprehensive-engine.test";
import { testGeminiModulesSuite } from "./gemini-modules.test";

async function runAllTests() {
  console.log("====================================================");
  console.log("   ResumeForge AI — Comprehensive Test Suite        ");
  console.log("====================================================\n");

  let passed = 0;
  let failed = 0;

  try {
    testResumeJsonValidation();
    passed++;
  } catch (err: any) {
    console.error("  ✖ Resume JSON Validation Failed:", err.message);
    failed++;
  }

  try {
    await testAiAndAtsAnalysis();
    passed++;
  } catch (err: any) {
    console.error("  ✖ AI / ATS Engine Failed:", err.message);
    failed++;
  }

  try {
    await testPdfAndDocxGeneration();
    passed++;
  } catch (err: any) {
    console.error("  ✖ PDF / DOCX Generation Failed:", err.message);
    failed++;
  }

  try {
    testAuthCrypto();
    passed++;
  } catch (err: any) {
    console.error("  ✖ Auth / Crypto Failed:", err.message);
    failed++;
  }

  try {
    await testAutoImportSuite();
    passed++;
  } catch (err: any) {
    console.error("  ✖ Auto-Import Pipeline Failed:", err.message);
    failed++;
  }

  try {
    await runComprehensiveEngineTests();
    passed++;
  } catch (err: any) {
    console.error("  ✖ Comprehensive Engine Tests Failed:", err.message);
    failed++;
  }

  try {
    await testGeminiModulesSuite();
    passed++;
  } catch (err: any) {
    console.error("  ✖ Dedicated Gemini Modules Suite Failed:", err.message);
    failed++;
  }

  console.log("\n----------------------------------------------------");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("====================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!\n");
  }
}

runAllTests();
