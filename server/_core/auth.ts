import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Express, Request, Response, NextFunction } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

const SALT_ROUNDS = 10;
const JWT_SECRET = ENV.jwtSecret;

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create JWT token
 */
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "365d" });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Register authentication routes
 */
export function registerAuthRoutes(app: Express) {
  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ error: "Name, email and password are required" });
        return;
      }

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const userId = await db.createUser({
        email,
        name,
        password: hashedPassword,
        loginMethod: "email",
        role: "professor", // Default role
      });

      // Create token
      const token = createToken({
        userId,
        email,
        role: "professor",
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: userId, email, name, role: "professor" } });
    } catch (error) {
      console.error("[Auth] Registration failed:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login with email/password
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Get user
      const user = await db.getUserByEmail(email);
      if (!user || !user.password) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Update last signed in
      await db.updateUserLastSignedIn(user.id);

      // Create token
      const token = createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const token = req.cookies[COOKIE_NAME];
      if (!token) {
        res.json({ user: null });
        return;
      }

      const payload = verifyToken(token);
      if (!payload) {
        res.json({ user: null });
        return;
      }

      const user = await db.getUserById(payload.userId);
      if (!user) {
        res.json({ user: null });
        return;
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Get user failed:", error);
      res.json({ user: null });
    }
  });
}

/**
 * Middleware to extract user from JWT token
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[COOKIE_NAME];
  
  if (!token) {
    (req as any).user = null;
    next();
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    (req as any).user = null;
    next();
    return;
  }

  try {
    const user = await db.getUserById(payload.userId);
    (req as any).user = user || null;
  } catch (error) {
    (req as any).user = null;
  }

  next();
}
