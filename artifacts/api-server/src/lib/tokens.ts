import crypto from "crypto";
import { db, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function createToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({ token, userId, expiresAt });
  return token;
}

export async function validateToken(token: string): Promise<number | null> {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.token, token));
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
    return null;
  }
  return session.userId;
}

export async function deleteToken(token: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
}
