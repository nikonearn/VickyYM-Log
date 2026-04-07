import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListProducts, useListCategories, useGetSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ShieldCheck, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Shop() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [quality, setQuality] = useState<string>("all");
  const [page, setPage] = useState(1);
  const { data: settings } = useGetSettings();

  const { data: categories } = useListCategories();
  
  const { data: productsData, isLoading } = useListProducts({
    query: {
      queryKey: ["products", { search, categoryId: categoryId === "all" ? undefined : Number(categoryId), quality: quality === "all" ? undefined : quality, page, limit: 12 }]
    },
    categoryId: categoryId === "all" ? undefined : Number(categoryId),
    search: search || undefined,
    quality: quality === "all" ? undefined : quality,
    page,
    limit: 12
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground mt-2">Browse our collection of premium, verified accounts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Search accounts..." 
                      className="pl-9"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={categoryId} onValueChange={(val) => { setCategoryId(val); setPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quality</label>
                  <Select value={quality} onValueChange={(val) => { setQuality(val); setPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Qualities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Qualities</SelectItem>
                      <SelectItem value="fresh">Fresh</SelectItem>
                      <SelectItem value="aged">Aged</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="h-[200px] rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full mt-2" />
                  </div>
                ))}
              </div>
            ) : productsData?.products && productsData.products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {productsData.products.map((product) => (
                    <Card key={product.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors hover-elevate">
                      <div className="aspect-[4/3] bg-muted relative">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                            <ShieldCheck className="h-12 w-12 opacity-20" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge variant="secondary" className="bg-background/80 backdrop-blur text-foreground font-semibold">
                            {product.categoryName}
                          </Badge>
                          <Badge className="bg-primary text-primary-foreground font-semibold">
                            {product.quality}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-4 pb-0 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={product.isAvailable ? "outline" : "destructive"} className="text-xs">
                            {product.isAvailable ? `Stock: ${product.stockCount}` : "Out of Stock"}
                          </Badge>
                          {product.isFeatured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                        </div>
                        <CardTitle className="line-clamp-2 text-lg leading-tight">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm mt-2">{product.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-4 flex items-center justify-between border-t mt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Price</span>
                          <span className="font-bold text-lg text-primary">
                            {settings?.currencySymbol || "₦"}{product.price.toLocaleString()}
                          </span>
                        </div>
                        <Link href={`/shop/${product.id}`}>
                          <Button size="sm">Details</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {productsData.totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center px-4 font-medium">
                      Page {page} of {productsData.totalPages}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => Math.min(productsData.totalPages, p + 1))}
                      disabled={page === productsData.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 border rounded-xl bg-muted/20">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setCategoryId("all"); setQuality("all"); setPage(1); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
