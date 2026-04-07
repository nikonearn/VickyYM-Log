import { Router, type IRouter } from "express";
import { db, depositsTable, usersTable, transactionsTable, settingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { InitiateDepositBody, VerifyDepositParams } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

router.post("/deposits/initiate", requireAuth, async (req, res): Promise<void> => {
  const parsed = InitiateDepositBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.amount < 100) {
    res.status(400).json({ error: "Minimum deposit is ₦100" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [settings] = await db.select().from(settingsTable).limit(1);
  const secretKey = settings?.paystackSecretKey ?? process.env.PAYSTACK_SECRET_KEY ?? "";

  if (!secretKey) {
    res.status(500).json({ error: "Payment gateway not configured. Please contact admin." });
    return;
  }

  const reference = `ACCTMKT_${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
  const amountKobo = Math.round(parsed.data.amount * 100);

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountKobo,
        reference,
        callback_url: parsed.data.callbackUrl,
      }),
    });

    if (!response.ok) {
      res.status(500).json({ error: "Failed to initiate payment" });
      return;
    }

    const data = (await response.json()) as {
      status: boolean;
      data: { authorization_url: string; access_code: string; reference: string };
    };

    await db.insert(depositsTable).values({
      userId: req.userId!,
      amount: String(parsed.data.amount),
      reference,
      gateway: "paystack",
      status: "pending",
    });

    res.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    });
  } catch (_err) {
    res.status(500).json({ error: "Payment gateway error" });
  }
});

router.get("/deposits/verify/:reference", requireAuth, async (req, res): Promise<void> => {
  const params = VerifyDepositParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deposit] = await db.select().from(depositsTable).where(eq(depositsTable.reference, params.data.reference));
  if (!deposit) {
    res.status(404).json({ error: "Deposit not found" });
    return;
  }
  if (deposit.userId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  if (deposit.status === "completed") {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    res.json({ status: "success", amount: parseFloat(deposit.amount), newBalance: parseFloat(user?.balance ?? "0"), message: "Already processed" });
    return;
  }

  const [settings] = await db.select().from(settingsTable).limit(1);
  const secretKey = settings?.paystackSecretKey ?? process.env.PAYSTACK_SECRET_KEY ?? "";

  if (!secretKey) {
    res.status(500).json({ error: "Payment gateway not configured" });
    return;
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${params.data.reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = (await response.json()) as {
      status: boolean;
      data: { status: string; amount: number };
    };

    if (!data.status || data.data.status !== "success") {
      await db.update(depositsTable).set({ status: "failed" }).where(eq(depositsTable.reference, params.data.reference));
      res.json({ status: "failed", amount: 0, newBalance: 0, message: "Payment not successful" });
      return;
    }

    const amountNaira = data.data.amount / 100;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    const prevBalance = parseFloat(user?.balance ?? "0");
    const newBalance = prevBalance + amountNaira;

    await db.update(usersTable).set({ balance: String(newBalance) }).where(eq(usersTable.id, req.userId!));
    await db.update(depositsTable).set({ status: "completed" }).where(eq(depositsTable.reference, params.data.reference));
    await db.insert(transactionsTable).values({
      userId: req.userId!,
      type: "deposit",
      amount: String(amountNaira),
      description: `Paystack deposit via ${params.data.reference}`,
      balanceBefore: String(prevBalance),
      balanceAfter: String(newBalance),
    });

    res.json({ status: "success", amount: amountNaira, newBalance, message: "Balance credited successfully" });
  } catch (_err) {
    res.status(500).json({ error: "Payment verification error" });
  }
});

router.get("/deposits", requireAuth, async (req, res): Promise<void> => {
  const deps = await db
    .select()
    .from(depositsTable)
    .where(eq(depositsTable.userId, req.userId!))
    .orderBy(desc(depositsTable.createdAt));
  res.json(deps.map((d) => ({
    id: d.id,
    userId: d.userId,
    amount: parseFloat(d.amount),
    reference: d.reference,
    gateway: d.gateway,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
  })));
});

export default router;
