import { db } from "@workspace/db";
import {
  usersTable,
  categoriesTable,
  productsTable,
  settingsTable,
} from "@workspace/db/schema";
import { count } from "drizzle-orm";
import { hashPassword } from "./auth";
import { logger } from "./logger";

const STOCK_ENTRY = (email: string, pass: string) => `${email}:${pass}`;

const SAMPLE_STOCK = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    STOCK_ENTRY(`user${i + 1}@example.com`, `Pass${i + 1}word!`)
  ).join("\n");

export async function seedIfEmpty(): Promise<void> {
  const [{ total }] = await db.select({ total: count() }).from(usersTable);
  if (Number(total) > 0) return;

  logger.info("Seeding database with initial data...");

  const [{ settingsTotal }] = await db.select({ settingsTotal: count() }).from(settingsTable);
  if (Number(settingsTotal) === 0) {
    await db.insert(settingsTable).values({
      siteName: "VickyYM Log Store",
      siteTagline: "Social Media Account Store",
      currency: "NGN",
      currencySymbol: "₦",
      paystackPublicKey: "",
      paystackSecretKey: "",
      aboutText: "AcctMarket is the #1 marketplace for premium social media account credentials. We provide fresh, verified, and aged accounts for Instagram, Facebook, Gmail, Twitter/X, TikTok, and Snapchat.",
      faqText: "**How does delivery work?**\nAfter purchasing, your account credentials are delivered instantly to your order history.\n\n**Are the accounts guaranteed?**\nAll accounts are tested before listing. We provide replacements for dead accounts within 24 hours.\n\n**How do I deposit funds?**\nUse Paystack to fund your wallet with any Nigerian bank card or bank transfer.",
      contactEmail: "support@acctmarket.com",
      maintenanceMode: false,
    });
  }

  await db.insert(usersTable).values([
    {
      username: "admin",
      email: "admin@acctmarket.com",
      passwordHash: hashPassword("admin123"),
      fullName: "Admin User",
      balance: "0.00",
      isAdmin: true,
      isBanned: false,
    },
    {
      username: "testuser",
      email: "test@acctmarket.com",
      passwordHash: hashPassword("user123"),
      fullName: "Test User",
      balance: "15000.00",
      isAdmin: false,
      isBanned: false,
    },
  ]);

  const [igCat] = await db
    .insert(categoriesTable)
    .values([
      { name: "Instagram Logs", slug: "instagram-logs", description: "Fresh and aged Instagram account credentials", icon: "Instagram", color: "#E1306C", isActive: true },
      { name: "Facebook Logs", slug: "facebook-logs", description: "Facebook account logs with full access", icon: "Facebook", color: "#1877F2", isActive: true },
      { name: "Gmail PVA", slug: "gmail-pva", description: "Phone-verified Gmail accounts", icon: "Mail", color: "#EA4335", isActive: true },
      { name: "Twitter / X Logs", slug: "twitter-x-logs", description: "Twitter/X verified account credentials", icon: "Twitter", color: "#1DA1F2", isActive: true },
      { name: "TikTok Logs", slug: "tiktok-logs", description: "TikTok account logs with followers", icon: "Music2", color: "#69C9D0", isActive: true },
      { name: "Snapchat Logs", slug: "snapchat-logs", description: "Snapchat account credentials", icon: "Camera", color: "#FFFC00", isActive: true },
    ])
    .returning();

  const cats = await db.select().from(categoriesTable);
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));

  const ig = catBySlug.get("instagram-logs")!.id;
  const fb = catBySlug.get("facebook-logs")!.id;
  const gm = catBySlug.get("gmail-pva")!.id;
  const tw = catBySlug.get("twitter-x-logs")!.id;
  const tt = catBySlug.get("tiktok-logs")!.id;
  const sc = catBySlug.get("snapchat-logs")!.id;

  await db.insert(productsTable).values([
    {
      categoryId: ig,
      name: "Instagram Fresh Accounts x10",
      slug: "instagram-fresh-x10",
      description: "Fresh Instagram accounts, registered within the last 30 days. Includes email:password combo. Great for bulk automation.",
      price: "2500.00",
      originalPrice: "3500.00",
      quality: "fresh",
      stockLogs: SAMPLE_STOCK(5),
      stockCount: 5,
      isAvailable: true,
      isFeatured: true,
      previewInfo: "Format: email:password | 30-day aged | USA region",
      totalSold: 45,
    },
    {
      categoryId: ig,
      name: "Instagram Aged 1-Year Verified",
      slug: "instagram-aged-1yr",
      description: "Aged 1+ year Instagram accounts with phone verification. High trust score. Ready for business use.",
      price: "5000.00",
      originalPrice: "7000.00",
      quality: "aged",
      stockLogs: SAMPLE_STOCK(3),
      stockCount: 3,
      isAvailable: true,
      isFeatured: true,
      previewInfo: "Format: email:password | 1+ year | Phone verified",
      totalSold: 23,
    },
    {
      categoryId: ig,
      name: "Instagram Premium Verified Business",
      slug: "instagram-premium-biz",
      description: "Premium Instagram business accounts with 500+ followers. Phone verified with 2FA backup codes included.",
      price: "12000.00",
      originalPrice: "15000.00",
      quality: "premium",
      stockLogs: SAMPLE_STOCK(2),
      stockCount: 2,
      isAvailable: true,
      isFeatured: true,
      previewInfo: "Includes 2FA backup codes | 500+ followers | Business profile",
      totalSold: 8,
    },
    {
      categoryId: fb,
      name: "Facebook Personal Accounts x5",
      slug: "facebook-personal-x5",
      description: "Real Facebook personal accounts with friends and activity history. Includes email and password access.",
      price: "3500.00",
      originalPrice: "5000.00",
      quality: "fresh",
      stockLogs: SAMPLE_STOCK(3),
      stockCount: 3,
      isAvailable: true,
      isFeatured: true,
      previewInfo: "Format: email:password | With friend history",
      totalSold: 31,
    },
    {
      categoryId: fb,
      name: "Facebook Aged 2FA Accounts",
      slug: "facebook-aged-2fa",
      description: "Facebook accounts aged 2+ years with 2FA enabled. Comes with email recovery access.",
      price: "7500.00",
      originalPrice: null,
      quality: "aged",
      stockLogs: SAMPLE_STOCK(2),
      stockCount: 2,
      isAvailable: true,
      isFeatured: true,
      previewInfo: "Format: email:password:2fa_code | 2+ year aged",
      totalSold: 12,
    },
    {
      categoryId: gm,
      name: "Gmail PVA Accounts x20",
      slug: "gmail-pva-x20",
      description: "Phone-verified Gmail accounts. Each account comes with full access details. Never used for spam.",
      price: "4000.00",
      originalPrice: "6000.00",
      quality: "verified",
      stockLogs: SAMPLE_STOCK(5),
      stockCount: 5,
      isAvailable: true,
      isFeatured: true,
      previewInfo: "Format: email:password | Phone verified | Fresh",
      totalSold: 67,
    },
    {
      categoryId: tw,
      name: "Twitter/X Verified Accounts",
      slug: "twitter-x-verified",
      description: "Twitter/X accounts with email verified. Full login access included. Great for marketing.",
      price: "6000.00",
      originalPrice: "8000.00",
      quality: "verified",
      stockLogs: SAMPLE_STOCK(4),
      stockCount: 4,
      isAvailable: true,
      isFeatured: false,
      previewInfo: "Format: email:password | Email verified | Active accounts",
      totalSold: 15,
    },
    {
      categoryId: tt,
      name: "TikTok Creator Accounts 10k+",
      slug: "tiktok-creator-10k",
      description: "TikTok accounts with 10,000+ followers. Includes full login credentials and email access.",
      price: "8500.00",
      originalPrice: "10000.00",
      quality: "aged",
      stockLogs: SAMPLE_STOCK(2),
      stockCount: 2,
      isAvailable: true,
      isFeatured: true,
      previewInfo: "Format: email:password | 10k+ followers | Creator badge",
      totalSold: 19,
    },
    {
      categoryId: sc,
      name: "Snapchat Active Accounts",
      slug: "snapchat-active",
      description: "Active Snapchat accounts with streak history. Includes email and password. USA-based.",
      price: "2000.00",
      originalPrice: "3000.00",
      quality: "fresh",
      stockLogs: SAMPLE_STOCK(6),
      stockCount: 6,
      isAvailable: true,
      isFeatured: false,
      previewInfo: "Format: email:password | Active streak | USA region",
      totalSold: 9,
    },
  ]);

  logger.info("Database seeded successfully.");
}
