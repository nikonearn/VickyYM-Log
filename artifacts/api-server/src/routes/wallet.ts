import { Router, type IRouter } from "express";
import { db, transactionsTable, usersTable, depositsTable } from "@workspace/db";
import { eq, desc, count, sum, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { ListTransactionsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/wallet/balance", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [deposits] = await db
    .select({ total: sum(depositsTable.amount) })
    .from(depositsTable)
    .where(eq(depositsTable.userId, req.userId!));

  const [spent] = await db
    .select({ total: sum(transactionsTable.amount) })
    .from(transactionsTable)
    .where(and(eq(transactionsTable.userId, req.userId!), eq(transactionsTable.type, "purchase")));

  const recentTxs = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, req.userId!))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(5);

  res.json({
    balance: parseFloat(user.balance ?? "0"),
    totalDeposited: parseFloat(deposits?.total ?? "0"),
    totalSpent: parseFloat(spent?.total ?? "0"),
    recentTransactions: recentTxs.map((t) => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      description: t.description,
      balanceBefore: parseFloat(t.balanceBefore),
      balanceAfter: parseFloat(t.balanceAfter),
      createdAt: t.createdAt.toISOString(),
    })),
  });
});

router.get("/wallet/transactions", requireAuth, async (req, res): Promise<void> => {
  const params = ListTransactionsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const page = params.data.page ?? 1;
  const limit = params.data.limit ?? 10;
  const offset = (page - 1) * limit;

  const [{ total }] = await db.select({ total: count() }).from(transactionsTable).where(eq(transactionsTable.userId, req.userId!));
  const txs = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, req.userId!))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    transactions: txs.map((t) => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      description: t.description,
      balanceBefore: parseFloat(t.balanceBefore),
      balanceAfter: parseFloat(t.balanceAfter),
      createdAt: t.createdAt.toISOString(),
    })),
    total: Number(total),
    page,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

export default router;
