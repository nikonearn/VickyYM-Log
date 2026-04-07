import { Router, type IRouter } from "express";
import { db, usersTable, productsTable, ordersTable, depositsTable, ticketsTable, ticketMessagesTable, transactionsTable, categoriesTable } from "@workspace/db";
import { eq, desc, count, sum, gte, and, ilike } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import {
  ListAdminUsersQueryParams,
  GetAdminUserParams,
  UpdateAdminUserParams,
  UpdateAdminUserBody,
  ListAdminOrdersQueryParams,
  ListAdminDepositsQueryParams,
  ApproveDepositParams,
  ListAdminTicketsQueryParams,
  AdminReplyTicketParams,
  AdminReplyTicketBody,
  GetSalesReportQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/dashboard", requireAdmin, async (_req, res): Promise<void> => {
  const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(usersTable);
  const [{ totalProducts }] = await db.select({ totalProducts: count() }).from(productsTable);
  const [{ totalOrders }] = await db.select({ totalOrders: count() }).from(ordersTable);
  const [{ totalRevenue }] = await db.select({ totalRevenue: sum(ordersTable.productPrice) }).from(ordersTable);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [{ todayRevenue }] = await db.select({ todayRevenue: sum(ordersTable.productPrice) }).from(ordersTable).where(gte(ordersTable.createdAt, today));
  const [{ todayOrders }] = await db.select({ todayOrders: count() }).from(ordersTable).where(gte(ordersTable.createdAt, today));
  const [{ pendingTickets }] = await db.select({ pendingTickets: count() }).from(ticketsTable).where(eq(ticketsTable.status, "open"));
  const [{ pendingDeposits }] = await db.select({ pendingDeposits: count() }).from(depositsTable).where(eq(depositsTable.status, "pending"));

  const recentOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5);

  const salesByCat = await db
    .select({
      categoryId: productsTable.categoryId,
      totalSales: count(ordersTable.id),
      totalRevenue: sum(ordersTable.productPrice),
    })
    .from(ordersTable)
    .innerJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .groupBy(productsTable.categoryId);

  const catIds = salesByCat.map((s) => s.categoryId);
  const cats = catIds.length > 0
    ? await db.select().from(categoriesTable)
    : [];
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  res.json({
    totalUsers: Number(totalUsers),
    totalProducts: Number(totalProducts),
    totalOrders: Number(totalOrders),
    totalRevenue: parseFloat(totalRevenue ?? "0"),
    todayRevenue: parseFloat(todayRevenue ?? "0"),
    todayOrders: Number(todayOrders),
    pendingTickets: Number(pendingTickets),
    pendingDeposits: Number(pendingDeposits),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      userId: o.userId,
      productId: o.productId,
      productName: o.productName,
      productPrice: parseFloat(o.productPrice),
      status: o.status,
      deliveredLogs: o.deliveredLogs,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
    salesByCategory: salesByCat.map((s) => ({
      categoryName: catMap.get(s.categoryId) ?? `Category ${s.categoryId}`,
      totalSales: Number(s.totalSales),
      totalRevenue: parseFloat(s.totalRevenue ?? "0"),
    })),
  });
});

router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const params = ListAdminUsersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const page = params.data.page ?? 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = params.data.search ? [ilike(usersTable.email, `%${params.data.search}%`)] : [];

  const [{ total }] = conditions.length > 0
    ? await db.select({ total: count() }).from(usersTable).where(and(...conditions))
    : await db.select({ total: count() }).from(usersTable);

  const users = conditions.length > 0
    ? await db.select().from(usersTable).where(and(...conditions)).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset)
    : await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);

  const userIds = users.map((u) => u.id);
  const orderCounts = userIds.length > 0
    ? await db.select({ userId: ordersTable.userId, cnt: count() }).from(ordersTable).groupBy(ordersTable.userId)
    : [];
  const depositSums = userIds.length > 0
    ? await db.select({ userId: depositsTable.userId, total: sum(depositsTable.amount) }).from(depositsTable).where(eq(depositsTable.status, "completed")).groupBy(depositsTable.userId)
    : [];

  const orderMap = new Map(orderCounts.map((o) => [o.userId, Number(o.cnt)]));
  const depositMap = new Map(depositSums.map((d) => [d.userId, parseFloat(d.total ?? "0")]));

  res.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      balance: parseFloat(u.balance ?? "0"),
      isAdmin: u.isAdmin,
      isBanned: u.isBanned,
      totalOrders: orderMap.get(u.id) ?? 0,
      totalDeposited: depositMap.get(u.id) ?? 0,
      createdAt: u.createdAt.toISOString(),
    })),
    total: Number(total),
    page,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

router.get("/admin/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetAdminUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const [{ cnt }] = await db.select({ cnt: count() }).from(ordersTable).where(eq(ordersTable.userId, user.id));
  const [{ total }] = await db.select({ total: sum(depositsTable.amount) }).from(depositsTable).where(and(eq(depositsTable.userId, user.id), eq(depositsTable.status, "completed")));
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    balance: parseFloat(user.balance ?? "0"),
    isAdmin: user.isAdmin,
    isBanned: user.isBanned,
    totalOrders: Number(cnt),
    totalDeposited: parseFloat(total ?? "0"),
    createdAt: user.createdAt.toISOString(),
  });
});

router.patch("/admin/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAdminUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!existingUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.isBanned != null) updates.isBanned = parsed.data.isBanned;
  if (parsed.data.isAdmin != null) updates.isAdmin = parsed.data.isAdmin;
  if (parsed.data.balance != null) updates.balance = String(parsed.data.balance);
  if (parsed.data.adjustBalance != null) {
    const current = parseFloat(existingUser.balance ?? "0");
    updates.balance = String(current + parsed.data.adjustBalance);
  }

  const [user] = await db.update(usersTable).set(updates as never).where(eq(usersTable.id, params.data.id)).returning();
  const [{ cnt }] = await db.select({ cnt: count() }).from(ordersTable).where(eq(ordersTable.userId, user.id));
  const [{ total }] = await db.select({ total: sum(depositsTable.amount) }).from(depositsTable).where(and(eq(depositsTable.userId, user.id), eq(depositsTable.status, "completed")));
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    balance: parseFloat(user.balance ?? "0"),
    isAdmin: user.isAdmin,
    isBanned: user.isBanned,
    totalOrders: Number(cnt),
    totalDeposited: parseFloat(total ?? "0"),
    createdAt: user.createdAt.toISOString(),
  });
});

router.get("/admin/orders", requireAdmin, async (req, res): Promise<void> => {
  const params = ListAdminOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const page = params.data.page ?? 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = params.data.status ? [eq(ordersTable.status, params.data.status)] : [];
  const [{ total }] = conditions.length > 0
    ? await db.select({ total: count() }).from(ordersTable).where(and(...conditions))
    : await db.select({ total: count() }).from(ordersTable);
  const orders = conditions.length > 0
    ? await db.select().from(ordersTable).where(and(...conditions)).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset)
    : await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);

  res.json({
    orders: orders.map((o) => ({
      id: o.id,
      userId: o.userId,
      productId: o.productId,
      productName: o.productName,
      productPrice: parseFloat(o.productPrice),
      status: o.status,
      deliveredLogs: o.deliveredLogs,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
    total: Number(total),
    page,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

router.get("/admin/deposits", requireAdmin, async (req, res): Promise<void> => {
  const params = ListAdminDepositsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const page = params.data.page ?? 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = params.data.status ? [eq(depositsTable.status, params.data.status)] : [];
  const [{ total }] = conditions.length > 0
    ? await db.select({ total: count() }).from(depositsTable).where(and(...conditions))
    : await db.select({ total: count() }).from(depositsTable);
  const deposits = conditions.length > 0
    ? await db.select().from(depositsTable).where(and(...conditions)).orderBy(desc(depositsTable.createdAt)).limit(limit).offset(offset)
    : await db.select().from(depositsTable).orderBy(desc(depositsTable.createdAt)).limit(limit).offset(offset);

  res.json({
    deposits: deposits.map((d) => ({
      id: d.id,
      userId: d.userId,
      amount: parseFloat(d.amount),
      reference: d.reference,
      gateway: d.gateway,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
    })),
    total: Number(total),
    page,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

router.post("/admin/deposits/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  const params = ApproveDepositParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deposit] = await db.select().from(depositsTable).where(eq(depositsTable.id, params.data.id));
  if (!deposit) {
    res.status(404).json({ error: "Deposit not found" });
    return;
  }
  if (deposit.status === "completed") {
    res.status(400).json({ error: "Deposit already approved" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, deposit.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const prevBalance = parseFloat(user.balance ?? "0");
  const amount = parseFloat(deposit.amount);
  const newBalance = prevBalance + amount;
  await db.update(usersTable).set({ balance: String(newBalance) }).where(eq(usersTable.id, user.id));
  const [updated] = await db.update(depositsTable).set({ status: "completed" }).where(eq(depositsTable.id, deposit.id)).returning();
  await db.insert(transactionsTable).values({
    userId: user.id,
    type: "deposit",
    amount: String(amount),
    description: `Manual deposit approval by admin`,
    balanceBefore: String(prevBalance),
    balanceAfter: String(newBalance),
  });
  res.json({
    id: updated.id,
    userId: updated.userId,
    amount: parseFloat(updated.amount),
    reference: updated.reference,
    gateway: updated.gateway,
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.get("/admin/support/tickets", requireAdmin, async (req, res): Promise<void> => {
  const params = ListAdminTicketsQueryParams.safeParse(req.query);
  const conditions = params.success && params.data.status ? [eq(ticketsTable.status, params.data.status)] : [];
  const tickets = conditions.length > 0
    ? await db.select().from(ticketsTable).where(and(...conditions)).orderBy(desc(ticketsTable.updatedAt))
    : await db.select().from(ticketsTable).orderBy(desc(ticketsTable.updatedAt));
  res.json(tickets.map((t) => ({
    id: t.id,
    userId: t.userId,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  })));
});

router.post("/admin/support/tickets/:id/reply", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminReplyTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AdminReplyTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, params.data.id));
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  const [msg] = await db.insert(ticketMessagesTable).values({
    ticketId: ticket.id,
    userId: req.userId!,
    message: parsed.data.message,
    isAdmin: "true",
  }).returning();
  await db.update(ticketsTable).set({ status: "answered" }).where(eq(ticketsTable.id, ticket.id));
  res.status(201).json({
    id: msg.id,
    ticketId: msg.ticketId,
    userId: msg.userId,
    message: msg.message,
    isAdmin: msg.isAdmin === "true",
    createdAt: msg.createdAt.toISOString(),
  });
});

router.get("/admin/reports/sales", requireAdmin, async (req, res): Promise<void> => {
  const params = GetSalesReportQueryParams.safeParse(req.query);
  const period = (params.success ? params.data.period : null) ?? "30days";
  const days = period === "7days" ? 7 : period === "90days" ? 90 : 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const orders = await db.select().from(ordersTable).where(gte(ordersTable.createdAt, since)).orderBy(ordersTable.createdAt);
  const [{ totalRevenue }] = await db.select({ totalRevenue: sum(ordersTable.productPrice) }).from(ordersTable).where(gte(ordersTable.createdAt, since));

  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const date = o.createdAt.toISOString().split("T")[0]!;
    const existing = dailyMap.get(date) ?? { revenue: 0, orders: 0 };
    dailyMap.set(date, {
      revenue: existing.revenue + parseFloat(o.productPrice),
      orders: existing.orders + 1,
    });
  }

  const topProducts = await db
    .select({
      productName: ordersTable.productName,
      totalSold: count(ordersTable.id),
      totalRevenue: sum(ordersTable.productPrice),
    })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, since))
    .groupBy(ordersTable.productName)
    .orderBy(desc(count(ordersTable.id)))
    .limit(10);

  res.json({
    period,
    totalRevenue: parseFloat(totalRevenue ?? "0"),
    totalOrders: orders.length,
    dailyData: Array.from(dailyMap.entries()).map(([date, d]) => ({ date, ...d })),
    topProducts: topProducts.map((p) => ({
      productName: p.productName,
      totalSold: Number(p.totalSold),
      totalRevenue: parseFloat(p.totalRevenue ?? "0"),
    })),
  });
});

export default router;
