import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListProducts, useListCategories, useGetSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Lock, ShieldCheck, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_ICONS: Record<string, string> = {
  Instagram: "📸",
  Facebook: "👤",
  "Gmail PVA": "📧",
  "Twitter / X Logs": "🐦",
  TikTok: "🎵",
  Snapchat: "👻",
};

function getCategoryEmoji(name: string) {
  for (const [key, emoji] of Object.entries(CATEGORY_ICONS)) {
    if (name.includes(key)) return emoji;
  }
  return "🔑";
}

export default function Shop() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [quality, setQuality] = useState<string>("all");
  const [page, setPage] = useState(1);
  const { data: settings } = useGetSettings();
  const { data: categories } = useListCategories();

  const { data: productsData, isLoading } = useListProducts({
    query: {
      queryKey: ["products", { search, categoryId: categoryId === "all" ? undefined : Number(categoryId), quality: quality === "all" ? undefined : quality, page, limit: 50 }],
    },
    categoryId: categoryId === "all" ? undefined : Number(categoryId),
    search: search || undefined,
    quality: quality === "all" ? undefined : quality,
    page,
    limit: 50,
  });

  const products = productsData?.products ?? [];

  const grouped: Record<string, typeof products> = {};
  for (const p of products) {
    const cat = p.categoryName || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }

  const symbol = settings?.currencySymbol || "₦";

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-[#0f172a] text-white rounded-t-lg px-5 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">Products</h1>
          <Package className="h-5 w-5 opacity-70" />
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-t-0 rounded-b-lg mb-6 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search accounts..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={categoryId} onValueChange={(val) => { setCategoryId(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={quality} onValueChange={(val) => { setQuality(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="All Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quality</SelectItem>
              <SelectItem value="fresh">Fresh</SelectItem>
              <SelectItem value="aged">Aged</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <Skeleton className="h-5 w-48" />
                <div className="flex justify-between">
                  <Skeleton className="h-7 w-28" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([catName, catProducts]) => (
              <div key={catName} className="rounded-lg overflow-hidden border border-border shadow-sm">
                <div className="bg-[#0f172a] text-white px-5 py-3">
                  <span className="font-bold text-sm tracking-widest uppercase">
                    {getCategoryEmoji(catName)} {catName}
                  </span>
                </div>
                <div className="bg-white dark:bg-zinc-900 divide-y divide-border">
                  {catProducts.map((product) => (
                    <div key={product.id} className="px-5 py-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-[#0f172a] flex items-center justify-center text-xl shrink-0">
                          {getCategoryEmoji(catName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm uppercase leading-tight text-foreground truncate">
                            {product.name}
                          </p>
                          {product.previewInfo && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.previewInfo}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Price:</p>
                          <p className="text-xl font-bold text-foreground">{symbol}{Number(product.price).toLocaleString()}.00</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Stock:</p>
                          {product.isAvailable && product.stockCount > 0 ? (
                            <p className="text-base font-semibold text-green-500">{product.stockCount} pcs.</p>
                          ) : (
                            <p className="text-base font-semibold text-destructive">Out of stock</p>
                          )}
                        </div>
                      </div>

                      <Link href={`/shop/${product.id}`}>
                        <Button
                          className="w-full gap-2 font-semibold"
                          disabled={!product.isAvailable || product.stockCount === 0}
                          style={{ background: "linear-gradient(90deg, #e879f9, #ec4899)", border: "none", color: "white" }}
                        >
                          <Lock className="h-4 w-4" />
                          Purchase
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {productsData && productsData.totalPages > 1 && (
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <span className="flex items-center text-sm font-medium px-2">
                  Page {page} of {productsData.totalPages}
                </span>
                <Button variant="outline" onClick={() => setPage((p) => Math.min(productsData.totalPages, p + 1))} disabled={page === productsData.totalPages}>
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-xl bg-muted/20">
            <ShieldCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <h3 className="font-semibold mb-1">No products found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters.</p>
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCategoryId("all"); setQuality("all"); setPage(1); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
