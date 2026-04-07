import crypto from "crypto";

const tokenStore = new Map<string, { userId: number; expiresAt: Date }>();

export function createToken(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  tokenStore.set(token, { userId, expiresAt });
  return token;
}

export function validateToken(token: string): number | null {
  const entry = tokenStore.get(token);
  if (!entry) return null;
  if (entry.expiresAt < new Date()) {
    tokenStore.delete(token);
    return null;
  }
  return entry.userId;
}

export function deleteToken(token: string): void {
  tokenStore.delete(token);
}
