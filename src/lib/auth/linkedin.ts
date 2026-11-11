import crypto from "crypto";
import { cookies } from "next/headers";

export const LINKEDIN_COOKIE_STATE = "rf_li_oauth_state";
export const LINKEDIN_COOKIE_TOKEN = "rf_li_token";
export const LINKEDIN_COOKIE_PROFILE = "rf_li_profile";

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
  id_token?: string;
}

export interface LinkedInUserInfo {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  locale?: {
    country: string;
    language: string;
  };
}

export interface LinkedInConnectedAccount {
  isConnected: boolean;
  user?: {
    sub: string;
    name: string;
    email?: string;
    picture?: string;
    vanityName?: string;
  };
  tokenExpired?: boolean;
  missingCredentials?: boolean;
}

export function getLinkedInOAuthConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID || "";
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || "";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/auth/linkedin/callback`;

  return {
    clientId,
    clientSecret,
    redirectUri,
    isConfigured: Boolean(clientId && clientSecret),
  };
}

/**
 * Generates official LinkedIn OAuth 2.0 authorization URL
 * Uses standard OpenID Connect scopes: openid, profile, email
 */
export function generateLinkedInAuthUrl(returnTo?: string, vanity?: string): { url: string; state: string } {
  const config = getLinkedInOAuthConfig();
  const statePayload = {
    csrf: crypto.randomBytes(16).toString("hex"),
    returnTo: returnTo || "/create",
    vanity: vanity || "",
    timestamp: Date.now(),
  };

  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    scope: "openid profile email",
  });

  return {
    url: `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`,
    state,
  };
}

/**
 * Exchanges authorization code for an OAuth 2.0 access token
 */
export async function exchangeLinkedInAuthCode(code: string): Promise<LinkedInTokenResponse> {
  const config = getLinkedInOAuthConfig();

  if (!config.isConfigured) {
    throw new Error(
      "LinkedIn OAuth credentials are not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in your environment."
    );
  }

  const bodyParams = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyParams.toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`LinkedIn token exchange failed (${res.status}): ${errorBody}`);
  }

  const data = (await res.json()) as LinkedInTokenResponse;
  return data;
}

/**
 * Fetches authenticated user info using official OpenID UserInfo endpoint
 */
export async function fetchLinkedInUserInfo(accessToken: string): Promise<LinkedInUserInfo> {
  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LinkedIn userinfo request failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as LinkedInUserInfo;
  return data;
}

/**
 * Checks current LinkedIn connection status from cookies / stored session
 */
export function getStoredLinkedInAccount(): LinkedInConnectedAccount {
  const cookieStore = cookies();
  const token = cookieStore.get(LINKEDIN_COOKIE_TOKEN)?.value;
  const profileJson = cookieStore.get(LINKEDIN_COOKIE_PROFILE)?.value;
  const config = getLinkedInOAuthConfig();

  if (!config.isConfigured && !token) {
    return {
      isConnected: false,
      missingCredentials: true,
    };
  }

  if (!token || !profileJson) {
    return {
      isConnected: false,
      missingCredentials: !config.isConfigured,
    };
  }

  try {
    const profile = JSON.parse(profileJson);
    return {
      isConnected: true,
      user: profile,
    };
  } catch {
    return {
      isConnected: false,
    };
  }
}
