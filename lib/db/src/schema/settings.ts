import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("AcctMarket"),
  siteTagline: text("site_tagline").notNull().default("Premium Social Media Accounts"),
  currency: text("currency").notNull().default("NGN"),
  currencySymbol: text("currency_symbol").notNull().default("₦"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  paystackPublicKey: text("paystack_public_key").notNull().default(""),
  paystackSecretKey: text("paystack_secret_key").notNull().default(""),
  aboutText: text("about_text"),
  faqText: text("faq_text"),
  termsText: text("terms_text"),
  contactEmail: text("contact_email"),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
