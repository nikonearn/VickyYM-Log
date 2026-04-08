import React, { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/auth";
import { useGetWalletBalance, useListOrders, useListTransactions, useGetSettings, useGetOrder } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, ShoppingCart, ArrowUpRight, ArrowDownRight, CreditCard, Clock, Store, ShieldCheck, Copy, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: settings } = useGetSettings();
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: walletInfo, isLoading: isWalletLoading } = useGetWalletBalance();
  const { data: ordersData, isLoading: isOrdersLoading } = useListOrders({ limit: 5 });
  const { data: txData, isLoading: isTxLoading } = useListTransactions({ limit: 5 });
  const { data: selectedOrder, isLoading: isOrderLoading } = useGetOrder(
    selectedOrderId || 0,
    { query: { enabled: !!selectedOrderId } }
  );

  const symbol = settings?.currencySymbol || "₦";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Credentials copied to clipboard." });
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

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Welcome back, {user.fullName || user.username}.</p>
        </div>
        <Button asChild size="lg" className="gap-2 shrink-0">
          <Link href="/shop">
            <Store className="h-5 w-5" />
            Buy Accounts
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isWalletLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                {symbol}{(walletInfo?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            )}
            <div className="mt-4">
              <Button asChild size="sm" className="w-full">
                <Link href="/dashboard/deposit">Deposit Funds</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isWalletLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {symbol}{(walletInfo?.totalDeposited || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isWalletLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {symbol}{(walletInfo?.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Click any order to view credentials</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isOrdersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : ordersData?.orders && ordersData.orders.length > 0 ? (
              <div className="space-y-3">
                {ordersData.orders.map((order) => (
                  <button
                    key={order.id}
                    className="w-full text-left flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/80 transition-all cursor-pointer"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div>
                      <p className="font-medium text-sm">{order.productName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-semibold text-primary text-sm">
                        {symbol}{order.productPrice.toLocaleString()}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          order.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20 text-xs" :
                          order.status === "pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs" :
                          "bg-red-500/10 text-red-500 border-red-500/20 text-xs"
                        }
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No orders yet</p>
                <Button asChild variant="link" size="sm" className="mt-1">
                  <Link href="/shop">Start shopping</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your wallet history</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/wallet">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isTxLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : txData?.transactions && txData.transactions.length > 0 ? (
              <div className="space-y-3">
                {txData.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        tx.type === "deposit" || tx.type === "refund" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {tx.type === "deposit" || tx.type === "refund" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm capitalize">{tx.type}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-[150px] truncate" title={tx.description}>
                          {tx.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-bold text-sm ${
                        tx.type === "deposit" || tx.type === "refund" ? "text-green-500" : "text-foreground"
                      }`}>
                        {tx.type === "deposit" || tx.type === "refund" ? "+" : "-"}
                        {symbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {format(new Date(tx.createdAt), "MMM d")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id} — {selectedOrder?.productName}</DialogTitle>
            <DialogDescription>
              {selectedOrder ? format(new Date(selectedOrder.createdAt), "MMMM d, yyyy h:mm a") : "Loading..."}
            </DialogDescription>
          </DialogHeader>

          {isOrderLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Amount Paid</span>
                  <p className="font-bold text-primary mt-1">{symbol}{selectedOrder.productPrice.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Status</span>
                  <p className="mt-1">
                    <Badge
                      variant="outline"
                      className={
                        selectedOrder.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        selectedOrder.status === "pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      }
                    >
                      {selectedOrder.status.toUpperCase()}
                    </Badge>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Account Credentials
                </h3>

                {selectedOrder.status === "completed" && selectedOrder.deliveredLogs ? (
                  <>
                    <div className="bg-zinc-950 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto whitespace-pre-wrap border border-zinc-800">
                      {selectedOrder.deliveredLogs}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="secondary" className="flex-1" onClick={() => copyToClipboard(selectedOrder.deliveredLogs || "")}>
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => downloadLogs(selectedOrder)}>
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center border rounded-lg bg-muted/20 text-muted-foreground text-sm">
                    No credentials available for this order.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
