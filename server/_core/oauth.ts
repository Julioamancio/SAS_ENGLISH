import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Initiate OAuth login flow
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    const redirectUri = `${req.protocol}://${req.get("host")}/api/oauth/callback`;
    const state = Buffer.from(redirectUri).toString("base64");
    
    // Build OAuth authorization URL
    const oauthPortalUrl = process.env.VITE_OAUTH_PORTAL_URL || "";
    const appId = ENV.appId;
    const authUrl = `${oauthPortalUrl}/app-auth?appId=${encodeURIComponent(appId)}&redirectUri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&type=signIn`;
    
    res.redirect(authUrl);
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    console.log("[OAuth] Callback received", { code: code?.substring(0, 10) + "...", state: state?.substring(0, 20) + "..." });

    if (!code || !state) {
      console.error("[OAuth] Missing code or state");
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      console.log("[OAuth] Exchanging code for token...");
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      console.log("[OAuth] Token received successfully");

      console.log("[OAuth] Getting user info...");
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      console.log("[OAuth] User info received:", { openId: userInfo.openId, name: userInfo.name, email: userInfo.email });

      if (!userInfo.openId) {
        console.error("[OAuth] openId missing from user info");
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      console.log("[OAuth] Upserting user to database...");
      // Skip Manus OAuth upsert - using new auth system
      // await db.upsertUser({
      //   openId: userInfo.openId,
      //   name: userInfo.name || null,
      //   email: userInfo.email ?? null,
      //   loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
      //   lastSignedIn: new Date(),
      // });
      console.log("[OAuth] User upserted successfully");

      console.log("[OAuth] Creating session token...");
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      console.log("[OAuth] Session token created");

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      console.log("[OAuth] Cookie set, redirecting to /");

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed:", error);
      console.error("[OAuth] Error details:", error instanceof Error ? error.message : String(error));
      console.error("[OAuth] Error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({ 
        error: "OAuth callback failed",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}
