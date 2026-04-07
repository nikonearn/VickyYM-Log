import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, desc, count, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateOrderBody, ListOrdersQueryParams, GetOrderParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    userId: o.userId,
    productId: o.productId,
    productName: o.productName,
    productPrice: parseFloat(o.productPrice),
    status: o.status,
    deliveredLogs: o.deliveredLogs,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const page = params.data.page ?? 1;
  const limit = params.data.limit ?? 10;
  const offset = (page - 1) * limit;

  const [{ total }] = await db.select({ total: count() }).from(ordersTable).where(eq(ordersTable.userId, req.userId!));
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, req.userId!))
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    orders: orders.map(formatOrder),
    total: Number(total),
    page,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.productId));
  if (!product || !product.isAvailable) {
    res.status(400).json({ error: "Product is not available" });
    return;
  }
  if (product.stockCount <= 0) {
    res.status(400).json({ error: "Product is out of stock" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const userBalance = parseFloat(user.balance ?? "0");
  const price = parseFloat(product.price);
  if (userBalance < price) {
    res.status(400).json({ error: "Insufficient balance. Please deposit funds to continue." });
    return;
  }

  const logs = product.stockLogs ?? "";
  const logLines = logs.split("\n").filter((l) => l.trim().length > 0);
  const deliveredLog = logLines[0] ?? "No log available";
  const remainingLogs = logLines.slice(1).join("\n");

  const newBalance = userBalance - price;
  await db.update(usersTable).set({ balance: String(newBalance) }).where(eq(usersTable.id, req.userId!));
  await db.update(productsTable).set({
    stockLogs: remainingLogs,
    stockCount: product.stockCount - 1,
    totalSold: product.totalSold + 1,
    isAvailable: product.stockCount - 1 > 0,
  }).where(eq(productsTable.id, product.id));

  await db.insert(transactionsTable).values({
    userId: req.userId!,
    type: "purchase",
    amount: String(price),
    description: `Purchased: ${product.name}`,
    balanceBefore: String(userBalance),
    balanceAfter: String(newBalance),
  });

  const [order] = await db.insert(ordersTable).values({
    userId: req.userId!,
    productId: product.id,
    productName: product.name,
    productPrice: String(price),
    status: "completed",
    deliveredLogs: deliveredLog,
  }).returning();

  res.status(201).json(formatOrder(order));
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, params.data.id), eq(ordersTable.userId, req.userId!)));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(formatOrder(order));
});

export default router;
