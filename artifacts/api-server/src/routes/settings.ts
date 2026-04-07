import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

function formatPublicSettings(s: typeof settingsTable.$inferSelect) {
  return {
    siteName: s.siteName,
    siteTagline: s.siteTagline,
    currency: s.currency,
    currencySymbol: s.currencySymbol,
    logoUrl: s.logoUrl,
    faviconUrl: s.faviconUrl,
    paystackPublicKey: s.paystackPublicKey,
    aboutText: s.aboutText,
    faqText: s.faqText,
    termsText: s.termsText,
    contactEmail: s.contactEmail,
  };
}

function formatAdminSettings(s: typeof settingsTable.$inferSelect) {
  return {
    ...formatPublicSettings(s),
    paystackSecretKey: s.paystackSecretKey,
    maintenanceMode: s.maintenanceMode,
  };
}

router.get("/settings", async (_req, res): Promise<void> => {
  const [settings] = await db.select().from(settingsTable).limit(1);
  if (!settings) {
    res.json({
      siteName: "AcctMarket",
      siteTagline: "Premium Social Media Accounts",
      currency: "NGN",
      currencySymbol: "₦",
      logoUrl: null,
      faviconUrl: null,
      paystackPublicKey: "",
      aboutText: null,
      faqText: null,
      termsText: null,
      contactEmail: null,
    });
    return;
  }
  res.json(formatPublicSettings(settings));
});

router.get("/admin/settings", requireAdmin, async (_req, res): Promise<void> => {
  const [settings] = await db.select().from(settingsTable).limit(1);
  if (!settings) {
    res.json({
      siteName: "AcctMarket",
      siteTagline: "Premium Social Media Accounts",
      currency: "NGN",
      currencySymbol: "₦",
      logoUrl: null,
      faviconUrl: null,
      paystackPublicKey: "",
      paystackSecretKey: "",
      aboutText: null,
      faqText: null,
      termsText: null,
      contactEmail: null,
      maintenanceMode: false,
    });
    return;
  }
  res.json(formatAdminSettings(settings));
});

router.patch("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(settingsTable).limit(1);
  let settings;
  if (!existing) {
    [settings] = await db.insert(settingsTable).values({
      siteName: parsed.data.siteName ?? "AcctMarket",
      siteTagline: parsed.data.siteTagline ?? "Premium Social Media Accounts",
      currency: parsed.data.currency ?? "NGN",
      currencySymbol: parsed.data.currencySymbol ?? "₦",
      paystackPublicKey: parsed.data.paystackPublicKey ?? "",
      paystackSecretKey: parsed.data.paystackSecretKey ?? "",
    }).returning();
  } else {
    [settings] = await db.update(settingsTable).set(parsed.data).where(eq(settingsTable.id, existing.id)).returning();
  }
  res.json(formatAdminSettings(settings!));
});

export default router;
