import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../lib/auth";
import { requireAuth } from "../middlewares/auth";
import { UpdateProfileBody, ChangePasswordBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.patch("/users/profile", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Partial<{ username: string; fullName: string; bio: string; avatar: string }> = {};
  if (parsed.data.username) updates.username = parsed.data.username;
  if (parsed.data.fullName) updates.fullName = parsed.data.fullName;
  if (parsed.data.bio != null) updates.bio = parsed.data.bio;
  if (parsed.data.avatar != null) updates.avatar = parsed.data.avatar;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.userId!)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    avatar: user.avatar,
    bio: user.bio,
    balance: parseFloat(user.balance ?? "0"),
    isAdmin: user.isAdmin,
    isBanned: user.isBanned,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/users/change-password", requireAuth, async (req, res): Promise<void> => {
  const parsed = ChangePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (!verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }
  const passwordHash = hashPassword(parsed.data.newPassword);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, req.userId!));
  res.json({ message: "Password changed successfully" });
});

export default router;
