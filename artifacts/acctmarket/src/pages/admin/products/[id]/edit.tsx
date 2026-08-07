import React, { useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminProduct, useUpdateProduct, useListCategories, getListProductsQueryKey, getGetAdminProductQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const productSchema = z.object({
  name: z.string().min(3, "Name is required"),
  categoryId: z.coerce.number().min(1, "Category is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  originalPrice: z.coerce.number().optional().or(z.literal("")),
  quality: z.string().min(1, "Quality is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  stockLogs: z.string().optional(),
  previewInfo: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminProductEdit() {
  const [, params] = useRoute("/admin/products/:id/edit");
  const productId = params?.id ? parseInt(params.id) : 0;

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories } = useListCategories();

  const { data: product, isLoading } = useGetAdminProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetAdminProductQueryKey(productId) }
  });

  const updateProduct = useUpdateProduct();
  const [stockLogEntries, setStockLogEntries] = useState<string[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      categoryId: 0,
      description: "",
      price: 0,
      originalPrice: "",
      quality: "fresh",
      imageUrl: "",
      stockLogs: "",
      previewInfo: "",
      isAvailable: true,
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (product) {
      const entries = (product.stockLogs || "").split("\n").filter((line) => line.trim().length > 0);
      setStockLogEntries(entries);
      form.reset({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description || "",
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : "",
        quality: product.quality,
        imageUrl: product.imageUrl || "",
        stockLogs: entries.join("\n"),
        previewInfo: product.previewInfo || "",
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
      });
    }
  }, [product, form]);

  const updateStockLogEntries = (entries: string[]) => {
    setStockLogEntries(entries);
    form.setValue("stockLogs", entries.join("\n"), { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = (values: ProductFormValues) => {
    const payload = {
      ...values,
      originalPrice: values.originalPrice === "" ? undefined : Number(values.originalPrice),
      // Always send this field, including an empty string, so removing the
      // final saved credential also clears inventory on the server.
      stockLogs: values.stockLogs ?? "",
    };

    updateProduct.mutate(
      { id: productId, data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminProductQueryKey(productId) });
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previewInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preview Info</FormLabel>
                        <FormDescription>Public info shown before purchase</FormDescription>
                        <FormControl>
                          <Input placeholder="Followers: 10k | OGE: Yes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory ({stockLogEntries.length} in stock)</CardTitle>
                  <CardDescription>Edit or remove individual credentials. Changes are saved when you update the product.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="stockLogs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Logs (Credentials)</FormLabel>
                        <div className="space-y-3">
                          {stockLogEntries.map((entry, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="mt-2 w-7 shrink-0 text-right text-xs text-muted-foreground">
                                {index + 1}.
                              </span>
                              <Textarea
                                value={entry}
                                onChange={(event) => {
                                  const entries = [...stockLogEntries];
                                  entries[index] = event.target.value;
                                  updateStockLogEntries(entries);
                                }}
                                className="min-h-10 flex-1 resize-y font-mono text-sm"
                                aria-label={`Credential ${index + 1}`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="mt-1 text-muted-foreground hover:text-destructive"
                                onClick={() => updateStockLogEntries(stockLogEntries.filter((_, itemIndex) => itemIndex !== index))}
                                aria-label={`Remove credential ${index + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {stockLogEntries.length === 0 && (
                            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                              No credentials saved for this product yet.
                            </p>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateStockLogEntries([...stockLogEntries, ""])}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add credential
                          </Button>
                        </div>
                        <input type="hidden" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select value={String(field.value)} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality Label</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fresh">Fresh</SelectItem>
                            <SelectItem value="aged">Aged</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compare at</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="Optional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Media & Visibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-4 mt-6">
                    <FormField
                      control={form.control}
                      name="isAvailable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>Show in storefront</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Featured</FormLabel>
                            <FormDescription>Show on homepage</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
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
      </Form>
    </AdminLayout>
  );
}
