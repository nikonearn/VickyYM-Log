import React, { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetProduct, useGetSettings, useCreateOrder, useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Info, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ProductDetail() {
  const [, params] = useRoute("/shop/:id");
  const productId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const { data: product, isLoading } = useGetProduct(productId, {
    query: {
      enabled: !!productId
    }
  });
  const { data: settings } = useGetSettings();
  const { data: user } = useGetMe({ query: { enabled: isAuthenticated } });
  
  const createOrder = useCreateOrder();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'fresh': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'aged': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'verified': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'premium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const handlePurchase = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to purchase items.",
        variant: "destructive"
      });
      setLocation("/login");
      return;
    }
    
    setIsConfirmOpen(true);
  };

  const confirmPurchase = () => {
    createOrder.mutate(
      { data: { productId } },
      {
        onSuccess: (order) => {
          setIsConfirmOpen(false);
          toast({
            title: "Purchase Successful!",
            description: "Your account logs are ready in your dashboard.",
          });
          setLocation(`/dashboard/orders`);
        },
        onError: (error: any) => {
          setIsConfirmOpen(false);
          toast({
            title: "Purchase Failed",
            description: error?.data?.error || "Could not complete purchase. Check your balance.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-24 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!product) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The item you're looking for doesn't exist or was removed.</p>
          <Link href="/shop">
            <Button><ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <Link href="/shop" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-muted rounded-xl overflow-hidden aspect-[4/3] md:aspect-square relative border border-border/50">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-800 p-8">
                <ShieldCheck className="h-32 w-32 opacity-20 mb-4" />
                <span className="text-zinc-600 font-medium">AcctMarket Premium</span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge className="bg-background/90 text-foreground backdrop-blur-md text-sm px-3 py-1">
                {product.categoryName}
              </Badge>
              <Badge variant="outline" className={`text-sm px-3 py-1 backdrop-blur-md ${getQualityColor(product.quality)}`}>
                {product.quality.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mt-4 pb-6 border-b border-border/50">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    {settings?.currencySymbol || "₦"}{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-muted-foreground line-through">
                      {settings?.currencySymbol || "₦"}{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="ml-auto flex flex-col items-end">
                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Availability</span>
                <Badge variant={product.isAvailable ? "default" : "destructive"} className="text-sm">
                  {product.isAvailable ? `${product.stockCount} IN STOCK` : "SOLD OUT"}
                </Badge>
              </div>
            </div>
            
            <div className="py-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                Description
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {product.description || "No description provided."}
              </p>
            </div>
            
            {product.previewInfo && (
              <div className="py-4 px-5 bg-muted/50 rounded-lg border border-border/50 mb-6">
                <h4 className="font-semibold text-sm mb-2 text-foreground/80">Account Preview Info:</h4>
                <p className="text-sm text-muted-foreground font-mono">{product.previewInfo}</p>
              </div>
            )}
            
            <div className="mt-auto pt-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Instant automated delivery via dashboard.</span>
              </div>
              
              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-bold" 
                disabled={!product.isAvailable || createOrder.isPending}
                onClick={handlePurchase}
              >
                {createOrder.isPending ? "Processing..." : product.isAvailable ? "Purchase Now" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase <strong>{product.name}</strong> for {settings?.currencySymbol || "₦"}{product.price.toLocaleString()}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between p-3 bg-muted rounded-lg mb-4">
              <span className="text-muted-foreground">Your Balance:</span>
              <span className={`font-semibold ${user && user.balance < product.price ? "text-destructive" : ""}`}>
                {settings?.currencySymbol || "₦"}{(user?.balance || 0).toLocaleString()}
              </span>
            </div>
            
            {user && user.balance < product.price && (
              <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>You don't have enough balance. Please <Link href="/dashboard/deposit" className="underline font-bold">deposit funds</Link> first.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button 
              onClick={confirmPurchase} 
              disabled={createOrder.isPending || (user ? user.balance < product.price : true)}
            >
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
