import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../lib/auth";
import { createToken, deleteToken } from "../lib/tokens";
import { requireAuth } from "../middlewares/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, email, password, fullName } = parsed.data;

  const [existingEmail] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existingEmail) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }
  const [existingUsername] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (existingUsername) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    username,
    email,
    passwordHash,
    fullName,
    balance: "0.00",
    isAdmin: false,
    isBanned: false,
  }).returning();

  const token = await createToken(user.id);

  res.status(201).json({
    user: {
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
    },
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  if (user.isBanned) {
    res.status(401).json({ error: "Your account has been suspended" });
    return;
  }
  if (!verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = await createToken(user.id);

  res.json({
    user: {
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
    },
    token,
  });
});

router.post("/auth/logout", requireAuth, async (req, res): Promise<void> => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    await deleteToken(header.slice(7));
  }
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(401).json({ error: "User not found" });
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

export default router;
