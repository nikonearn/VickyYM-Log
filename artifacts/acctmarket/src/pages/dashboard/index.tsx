import React from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/auth";
import { useGetWalletBalance, useListOrders, useListTransactions, useGetSettings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, ShoppingCart, ArrowUpRight, ArrowDownRight, CreditCard, Clock, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: settings } = useGetSettings();
  
  const { data: walletInfo, isLoading: isWalletLoading } = useGetWalletBalance();
  const { data: ordersData, isLoading: isOrdersLoading } = useListOrders({
    limit: 5
  });
  const { data: txData, isLoading: isTxLoading } = useListTransactions({
    limit: 5
  });

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
                {settings?.currencySymbol || "₦"}{(walletInfo?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                {settings?.currencySymbol || "₦"}{(walletInfo?.totalDeposited || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                {settings?.currencySymbol || "₦"}{(walletInfo?.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
              <CardDescription>Your latest purchases</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isOrdersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : ordersData?.orders && ordersData.orders.length > 0 ? (
              <div className="space-y-4">
                {ordersData.orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div>
                      <p className="font-medium">{order.productName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-semibold text-primary text-sm">
                        {settings?.currencySymbol || "₦"}{order.productPrice.toLocaleString()}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={
                          order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
                <Button asChild variant="link" className="mt-2">
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
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : txData?.transactions && txData.transactions.length > 0 ? (
              <div className="space-y-4">
                {txData.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        tx.type === 'deposit' || tx.type === 'refund' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'refund' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
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
                        tx.type === 'deposit' || tx.type === 'refund' ? 'text-green-500' : 'text-foreground'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}
                        {settings?.currencySymbol || "₦"}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                <p>No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
