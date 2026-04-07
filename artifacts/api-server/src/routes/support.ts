import { Router, type IRouter } from "express";
import { db, ticketsTable, ticketMessagesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  CreateTicketBody,
  GetTicketParams,
  ReplyTicketParams,
  ReplyTicketBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatTicket(t: typeof ticketsTable.$inferSelect) {
  return {
    id: t.id,
    userId: t.userId,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

function formatMessage(m: typeof ticketMessagesTable.$inferSelect) {
  return {
    id: m.id,
    ticketId: m.ticketId,
    userId: m.userId,
    message: m.message,
    isAdmin: m.isAdmin === "true",
    createdAt: m.createdAt.toISOString(),
  };
}

router.get("/support/tickets", requireAuth, async (req, res): Promise<void> => {
  const tickets = await db
    .select()
    .from(ticketsTable)
    .where(eq(ticketsTable.userId, req.userId!))
    .orderBy(desc(ticketsTable.updatedAt));
  res.json(tickets.map(formatTicket));
});

router.post("/support/tickets", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [ticket] = await db.insert(ticketsTable).values({
    userId: req.userId!,
    subject: parsed.data.subject,
    status: "open",
    priority: parsed.data.priority ?? "medium",
  }).returning();
  await db.insert(ticketMessagesTable).values({
    ticketId: ticket.id,
    userId: req.userId!,
    message: parsed.data.message,
    isAdmin: "false",
  });
  res.status(201).json(formatTicket(ticket));
});

router.get("/support/tickets/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [ticket] = await db
    .select()
    .from(ticketsTable)
    .where(and(eq(ticketsTable.id, params.data.id), eq(ticketsTable.userId, req.userId!)));
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  const messages = await db
    .select()
    .from(ticketMessagesTable)
    .where(eq(ticketMessagesTable.ticketId, ticket.id))
    .orderBy(ticketMessagesTable.createdAt);
  res.json({ ...formatTicket(ticket), messages: messages.map(formatMessage) });
});

router.post("/support/tickets/:id/reply", requireAuth, async (req, res): Promise<void> => {
  const params = ReplyTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ReplyTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [ticket] = await db
    .select()
    .from(ticketsTable)
    .where(and(eq(ticketsTable.id, params.data.id), eq(ticketsTable.userId, req.userId!)));
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  const [msg] = await db.insert(ticketMessagesTable).values({
    ticketId: ticket.id,
    userId: req.userId!,
    message: parsed.data.message,
    isAdmin: "false",
  }).returning();
  await db.update(ticketsTable).set({ status: "open" }).where(eq(ticketsTable.id, ticket.id));
  res.status(201).json(formatMessage(msg));
});

export default router;
