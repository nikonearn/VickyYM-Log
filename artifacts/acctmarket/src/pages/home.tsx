import React from "react";
import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetFeaturedProducts, useListCategories, useGetSettings } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck, Zap, Lock, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredProducts, isLoading: isFeaturedLoading } = useGetFeaturedProducts();
  const { data: categories, isLoading: isCategoriesLoading } = useListCategories();
  const { data: settings } = useGetSettings();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Badge variant="outline" className="border-primary/50 text-primary-foreground bg-primary/20 mb-6 py-1 px-4 text-sm backdrop-blur-sm">
            Premium Digital Assets
          </Badge>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400">
            {settings?.siteTagline || "The Underground Marketplace for Premium Accounts"}
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            High-quality, verified social media logs and credentials. Fresh stock added daily. Secure payments and instant delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                Browse Shop <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-zinc-700 hover:bg-zinc-800 text-white">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border-none shadow-sm hover-elevate">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle>Instant Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Accounts are delivered instantly to your dashboard and email the moment payment is confirmed.</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-sm hover-elevate">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle>Verified Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Every account is checked and verified before listing. We guarantee the quality of our logs.</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-sm hover-elevate">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <CardTitle>Secure Escrow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Your funds are safe. We support automated deposits via Paystack for a seamless purchasing experience.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Star className="h-6 w-6 text-primary fill-primary" /> 
                Featured Stock
              </h2>
              <p className="text-muted-foreground mt-2">Premium quality accounts currently in high demand.</p>
            </div>
            <Link href="/shop" className="hidden sm:flex items-center text-primary font-medium hover:underline">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {isFeaturedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="h-[200px] rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full mt-2" />
                </div>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
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
                      <Button size="sm">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-xl bg-muted/20">
              <p className="text-muted-foreground">No featured products right now.</p>
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/shop">
              <Button variant="outline" className="w-full">
                View all stock <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-zinc-950 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Browse by Platform</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Find exactly what you need across all major social and digital platforms.</p>
          </div>

          {isCategoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 bg-zinc-800 rounded-xl" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/shop?category=${category.id}`}>
                  <div className="h-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-zinc-800 hover:border-primary/50 transition-all cursor-pointer group">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: category.color ? `${category.color}20` : 'rgba(255,255,255,0.1)', color: category.color || 'white' }}
                    >
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-zinc-100">{category.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{category.productCount} Items</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </PublicLayout>
  );
}
