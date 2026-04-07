import { Router, type IRouter } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { CreateCategoryBody, UpdateCategoryBody, UpdateCategoryParams, DeleteCategoryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const cats = await db.select().from(categoriesTable).where(eq(categoriesTable.isActive, true));
  const counts = await db.select({ categoryId: productsTable.categoryId, cnt: count() })
    .from(productsTable)
    .where(eq(productsTable.isAvailable, true))
    .groupBy(productsTable.categoryId);
  const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.cnt)]));
  const result = cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    color: c.color,
    isActive: c.isActive,
    productCount: countMap.get(c.id) ?? 0,
    createdAt: c.createdAt.toISOString(),
  }));
  res.json(result);
});

router.post("/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [cat] = await db.insert(categoriesTable).values({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    icon: parsed.data.icon,
    color: parsed.data.color,
    isActive: parsed.data.isActive ?? true,
  }).returning();
  res.status(201).json({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    color: cat.color,
    isActive: cat.isActive,
    productCount: 0,
    createdAt: cat.createdAt.toISOString(),
  });
});

router.patch("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [cat] = await db.update(categoriesTable).set(parsed.data).where(eq(categoriesTable.id, params.data.id)).returning();
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  const [countRow] = await db.select({ cnt: count() }).from(productsTable).where(eq(productsTable.categoryId, cat.id));
  res.json({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    color: cat.color,
    isActive: cat.isActive,
    productCount: Number(countRow?.cnt ?? 0),
    createdAt: cat.createdAt.toISOString(),
  });
});

router.delete("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
