import React, { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListOrders, useGetSettings, useGetOrder } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Search, Clock, Copy, CheckCircle, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Orders() {
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { data: settings } = useGetSettings();
  const { toast } = useToast();
  
  const { data: ordersData, isLoading } = useListOrders({
    query: {
      queryKey: ["orders", { page, limit: 10 }]
    },
    page,
    limit: 10
  });

  const { data: selectedOrder, isLoading: isOrderLoading } = useGetOrder(
    selectedOrderId || 0,
    {
      query: {
        enabled: !!selectedOrderId
      }
    }
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Credentials copied to clipboard.",
    });
  };

  const downloadLogs = (order: any) => {
    if (!order?.deliveredLogs) return;
    
    const blob = new Blob([order.deliveredLogs], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-${order.id}-logs.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">View and manage your purchased accounts.</p>
        </div>
        <Button asChild>
          <Link href="/shop">Browse Store</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm text-muted-foreground">
              <div className="col-span-2 md:col-span-2">Order ID</div>
              <div className="col-span-5 md:col-span-4">Product</div>
              <div className="hidden md:block md:col-span-2">Date</div>
              <div className="col-span-3 md:col-span-2 text-right">Amount</div>
              <div className="col-span-2 md:col-span-2 text-right">Status</div>
            </div>
            
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : ordersData?.orders && ordersData.orders.length > 0 ? (
              <div className="divide-y">
                {ordersData.orders.map((order) => (
                  <div key={order.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/20 transition-colors">
                    <div className="col-span-2 md:col-span-2 font-mono text-sm">
                      #{order.id}
                    </div>
                    <div className="col-span-5 md:col-span-4">
                      <p className="font-medium text-sm truncate">{order.productName}</p>
                      <div className="md:hidden text-xs text-muted-foreground mt-1">
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                    <div className="hidden md:block md:col-span-2 text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </div>
                    <div className="col-span-3 md:col-span-2 text-right font-semibold text-sm">
                      {settings?.currencySymbol || "₦"}{order.productPrice.toLocaleString()}
                    </div>
                    <div className="col-span-2 md:col-span-2 flex justify-end items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={
                          order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20 hidden lg:inline-flex' : 
                          order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hidden lg:inline-flex' : 
                          'bg-red-500/10 text-red-500 border-red-500/20 hidden lg:inline-flex'
                        }
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedOrderId(order.id)}
                        className="h-8 w-8 text-primary"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-4 opacity-20" />
                <p>No orders found.</p>
              </div>
            )}
          </div>
          
          {ordersData && ordersData.totalPages > 1 && (
            <div className="p-4 border-t flex justify-between items-center bg-muted/20">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {ordersData.totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.min(ordersData.totalPages, p + 1))}
                disabled={page === ordersData.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              {selectedOrder ? format(new Date(selectedOrder.createdAt), "MMMM d, yyyy h:mm a") : ""}
            </DialogDescription>
          </DialogHeader>

          {isOrderLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Product</span>
                  <p className="font-medium mt-1">{selectedOrder.productName}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Amount Paid</span>
                  <p className="font-bold text-primary mt-1">
                    {settings?.currencySymbol || "₦"}{selectedOrder.productPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Account Credentials
                </h3>
                <Badge 
                  variant="outline" 
                  className={
                    selectedOrder.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    selectedOrder.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  }
                >
                  {selectedOrder.status.toUpperCase()}
                </Badge>
              </div>

              {selectedOrder.status === 'completed' && selectedOrder.deliveredLogs ? (
                <div className="relative">
                  <div className="bg-zinc-950 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto whitespace-pre-wrap border border-zinc-800">
                    {selectedOrder.deliveredLogs}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" className="flex-1" onClick={() => copyToClipboard(selectedOrder.deliveredLogs || "")}>
                      <Copy className="h-4 w-4 mr-2" /> Copy to Clipboard
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => downloadLogs(selectedOrder)}>
                      <Download className="h-4 w-4 mr-2" /> Download as .txt
                    </Button>
                  </div>
                </div>
              ) : selectedOrder.status === 'pending' ? (
                <div className="p-8 text-center border rounded-lg bg-yellow-500/5 border-yellow-500/20">
                  <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-yellow-600 font-medium">Order is pending completion.</p>
                  <p className="text-sm text-yellow-600/80 mt-1">Logs will appear here once processed.</p>
                </div>
              ) : (
                <div className="p-8 text-center border rounded-lg bg-red-500/5 border-red-500/20">
                  <p className="text-red-500 font-medium">Order failed or was cancelled.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">Failed to load order.</div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
