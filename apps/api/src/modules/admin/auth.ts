import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import type { Database } from "../../db/index.js";
import { adminSessions, adminUsers } from "../../db/schema.js";

const cookieName = "portfolio_admin";
const csrfHeader = "x-csrf-token";
const oneWeekSeconds = 60 * 60 * 24 * 7;
const bcryptRounds = 12;
const maxLoginAttempts = 5;
const loginWindowMs = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export type AdminAuthConfig = {
  adminEmail: string;
  adminPassword?: string;
  adminToken: string;
};

export type AdminSession = {
  id: string;
  email: string;
  csrfToken: string;
};

function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function readCookie(header: string | undefined, name: string) {
  return header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

function clientKey(input: { ip?: string; email?: unknown }) {
  return `${input.ip ?? "unknown"}:${typeof input.email === "string" ? input.email.toLowerCase() : "unknown"}`;
}

export function isLoginRateLimited(input: { ip?: string; email?: unknown }) {
  const key = clientKey(input);
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + loginWindowMs });
    return false;
  }
  attempt.count += 1;
  return attempt.count > maxLoginAttempts;
}

export function clearLoginRateLimit(input: { ip?: string; email?: unknown }) {
  loginAttempts.delete(clientKey(input));
}

export async function createPasswordHash(password: string) {
  return bcrypt.hash(password, bcryptRounds);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function makeAdminCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${cookieName}=${token}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${oneWeekSeconds}`;
}

export function clearAdminCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${cookieName}=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function validateAdminLogin(db: Database, input: { email?: unknown; password?: unknown }) {
  if (typeof input.email !== "string" || typeof input.password !== "string") return null;
  const user = await db.query.adminUsers.findFirst({ where: eq(adminUsers.email, input.email.toLowerCase()) });
  return user && await verifyPassword(input.password, user.passwordHash) ? user : null;
}

export async function createAdminSession(db: Database, adminUserId: string) {
  const token = randomBytes(32).toString("base64url");
  const csrfToken = randomBytes(32).toString("base64url");
  const csrfTokenHash = hashToken(csrfToken);
  const session = {
    id: randomBytes(16).toString("base64url"),
    adminUserId,
    tokenHash: hashToken(token),
    csrfTokenHash,
    expiresAt: new Date(Date.now() + oneWeekSeconds * 1000)
  };
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  await db.insert(adminSessions).values(session);
  return { token, csrfToken: csrfTokenHash, sessionId: session.id };
}

export async function getAdminSession(db: Database, cookieHeader: string | undefined): Promise<AdminSession | null> {
  const token = readCookie(cookieHeader, cookieName);
  if (!token) return null;
  const session = await db.query.adminSessions.findFirst({
    where: and(eq(adminSessions.tokenHash, hashToken(token)), gt(adminSessions.expiresAt, new Date())),
    with: { adminUser: true }
  });
  return session ? { id: session.id, email: session.adminUser.email, csrfToken: session.csrfTokenHash } : null;
}

export async function revokeCurrentAdminSession(db: Database, cookieHeader: string | undefined) {
  const token = readCookie(cookieHeader, cookieName);
  if (token) await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)));
}

export async function revokeAdminSession(db: Database, id: string) {
  await db.delete(adminSessions).where(eq(adminSessions.id, id));
}

export async function requireAdminSession(request: { method: string; headers: Record<string, string | string[] | undefined> }, db: Database) {
  const session = await getAdminSession(db, request.headers.cookie as string | undefined);
  if (!session) return null;
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && request.headers[csrfHeader] !== session.csrfToken) return null;
  return session;
}
