import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, desc, count, inArray, SQL } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatProduct(p: typeof productsTable.$inferSelect, categoryName: string) {
  return {
    id: p.id,
    categoryId: p.categoryId,
    categoryName,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
    quality: p.quality,
    stockCount: p.stockCount,
    isAvailable: p.isAvailable,
    isFeatured: p.isFeatured,
    previewInfo: p.previewInfo,
    imageUrl: p.imageUrl,
    totalSold: p.totalSold,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products/featured", async (_req, res): Promise<void> => {
  const featured = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.isFeatured, true), eq(productsTable.isAvailable, true)))
    .limit(8)
    .orderBy(desc(productsTable.totalSold));

  const catIds = [...new Set(featured.map((p) => p.categoryId))];
  const cats = catIds.length > 0
    ? await db.select().from(categoriesTable).where(inArray(categoriesTable.id, catIds))
    : [];
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  res.json(featured.map((p) => formatProduct(p, catMap.get(p.categoryId) ?? "")));
});

router.get("/products", async (req, res): Promise<void> => {
  const params = ListProductsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { categoryId, search, minPrice, maxPrice, quality, page = 1, limit = 12 } = params.data;

  const conditions: SQL[] = [];
  if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (minPrice != null) conditions.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice != null) conditions.push(lte(productsTable.price, String(maxPrice)));
  if (quality) conditions.push(eq(productsTable.quality, quality));

  const offset = (page - 1) * limit;
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(productsTable)
    .where(whereClause);

  const products = await db
    .select()
    .from(productsTable)
    .where(whereClause)
    .orderBy(desc(productsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const catIds = [...new Set(products.map((p) => p.categoryId))];
  const cats = catIds.length > 0
    ? await db.select().from(categoriesTable).where(inArray(categoriesTable.id, catIds))
    : [];
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  res.json({
    products: products.map((p) => formatProduct(p, catMap.get(p.categoryId) ?? "")),
    total: Number(total),
    page,
    totalPages: Math.ceil(Number(total) / limit),
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
  res.json(formatProduct(product, cat?.name ?? ""));
});

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const logs = parsed.data.stockLogs ?? "";
  const lines = logs.split("\n").filter((l) => l.trim().length > 0);
  const stockCount = lines.length;

  const [product] = await db.insert(productsTable).values({
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    price: String(parsed.data.price),
    originalPrice: parsed.data.originalPrice ? String(parsed.data.originalPrice) : null,
    quality: parsed.data.quality ?? "fresh",
    stockLogs: logs,
    stockCount,
    previewInfo: parsed.data.previewInfo,
    imageUrl: parsed.data.imageUrl,
    isFeatured: parsed.data.isFeatured ?? false,
    isAvailable: parsed.data.isAvailable ?? true,
  }).returning();

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
  res.status(201).json(formatProduct(product, cat?.name ?? ""));
});

router.patch("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price != null) updates.price = String(parsed.data.price);
  if (parsed.data.originalPrice != null) updates.originalPrice = String(parsed.data.originalPrice);
  if (parsed.data.stockLogs != null) {
    const lines = parsed.data.stockLogs.split("\n").filter((l) => l.trim().length > 0);
    updates.stockCount = lines.length;
  }

  const [product] = await db.update(productsTable).set(updates as Parameters<typeof productsTable.$inferSelect>[0]).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
  res.json(formatProduct(product, cat?.name ?? ""));
});

router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
