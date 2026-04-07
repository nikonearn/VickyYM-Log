import React, { useEffect, useRef } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetProduct, useUpdateProduct, useListCategories, getListProductsQueryKey, getGetProductQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminProductEdit() {
  const [, params] = useRoute("/admin/products/:id/edit");
  const productId = params?.id ? parseInt(params.id) : 0;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories } = useListCategories();
  
  const { data: product, isLoading } = useGetProduct(productId, {
    query: {
      enabled: !!productId
    }
  });
  
  const updateProduct = useUpdateProduct();

  // State for form
  const [formData, setFormData] = React.useState({
    name: "",
    categoryId: 0,
    description: "",
    price: 0,
    originalPrice: "" as string | number,
    quality: "fresh",
    imageUrl: "",
    stockLogs: "",
    previewInfo: "",
    isAvailable: true,
    isFeatured: false,
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (product && initializedForId.current !== productId) {
      initializedForId.current = productId;
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description || "",
        price: product.price,
        originalPrice: product.originalPrice || "",
        quality: product.quality,
        imageUrl: product.imageUrl || "",
        stockLogs: "", // Don't fetch logs, just allow appending/replacing
        previewInfo: product.previewInfo || "",
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
      });
    }
  }, [product, productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: name === 'categoryId' ? Number(value) : value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      originalPrice: formData.originalPrice === "" ? undefined : Number(formData.originalPrice),
      stockLogs: formData.stockLogs === "" ? undefined : formData.stockLogs,
    };

    updateProduct.mutate(
      { id: productId, data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) });
          toast({ title: "Product updated", description: "Changes have been saved." });
          setLocation("/admin/products");
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err?.data?.error || "Could not update product.", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;
  if (!product) return <AdminLayout><div className="p-8">Product not found</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link href="/admin/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Product Name</label>
                  <Input name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea name="description" value={formData.description} onChange={handleChange} className="min-h-[120px]" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Preview Info</label>
                  <p className="text-xs text-muted-foreground mb-2">Public info shown before purchase</p>
                  <Input name="previewInfo" value={formData.previewInfo} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory ({product.stockCount} in stock)</CardTitle>
                <CardDescription>Append new logs to existing inventory.</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium mb-1 block">Add Stock Logs</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Leave blank to keep existing stock. Paste one account per line to ADD to inventory.
                  </p>
                  <Textarea 
                    name="stockLogs"
                    value={formData.stockLogs} 
                    onChange={handleChange}
                    placeholder="user1:pass1&#10;user2:pass2" 
                    className="min-h-[150px] font-mono text-sm" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Select value={String(formData.categoryId)} onValueChange={(v) => handleSelectChange('categoryId', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Quality Label</label>
                  <Select value={formData.quality} onValueChange={(v) => handleSelectChange('quality', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresh">Fresh</SelectItem>
                      <SelectItem value="aged">Aged</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Price</label>
                    <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Compare at</label>
                    <Input name="originalPrice" type="number" step="0.01" value={formData.originalPrice} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media & Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Image URL</label>
                  <Input name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div>
                      <label className="text-base font-medium">Active</label>
                      <p className="text-sm text-muted-foreground">Show in storefront</p>
                    </div>
                    <Switch checked={formData.isAvailable} onCheckedChange={(c) => handleSwitchChange('isAvailable', c)} />
                  </div>

                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div>
                      <label className="text-base font-medium">Featured</label>
                      <p className="text-sm text-muted-foreground">Show on homepage</p>
                    </div>
                    <Switch checked={formData.isFeatured} onCheckedChange={(c) => handleSwitchChange('isFeatured', c)} />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={updateProduct.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateProduct.isPending ? "Saving..." : "Update Product"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
