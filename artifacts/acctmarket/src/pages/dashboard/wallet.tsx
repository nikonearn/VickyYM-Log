import React, { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetWalletBalance, useListTransactions, useGetSettings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletPage() {
  const [page, setPage] = useState(1);
  const { data: settings } = useGetSettings();
  
  const { data: walletInfo, isLoading: isWalletLoading } = useGetWalletBalance();
  const { data: txData, isLoading: isTxLoading } = useListTransactions({
    query: {
      queryKey: ["transactions", { page, limit: 15 }]
    },
    page,
    limit: 15
  });

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Manage your funds and view transaction history.</p>
        </div>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/dashboard/deposit">Deposit Funds</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="col-span-1 md:col-span-1 bg-gradient-to-br from-primary/20 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {isWalletLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-4xl font-extrabold text-foreground">
                {settings?.currencySymbol || "₦"}{(walletInfo?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <ArrowDownRight className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isWalletLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-500">
                {settings?.currencySymbol || "₦"}{(walletInfo?.totalDeposited || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isWalletLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {settings?.currencySymbol || "₦"}{(walletInfo?.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All your deposits, purchases, and refunds</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm text-muted-foreground">
              <div className="col-span-2 md:col-span-2">Type</div>
              <div className="col-span-5 md:col-span-4">Description</div>
              <div className="hidden md:block md:col-span-2">Date</div>
              <div className="col-span-5 md:col-span-4 text-right">Amount / Balance</div>
            </div>
            
            {isTxLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : txData?.transactions && txData.transactions.length > 0 ? (
              <div className="divide-y">
                {txData.transactions.map((tx) => {
                  const isPositive = tx.type === 'deposit' || tx.type === 'refund';
                  
                  return (
                    <div key={tx.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/20 transition-colors">
                      <div className="col-span-2 md:col-span-2 flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full hidden sm:flex items-center justify-center ${
                          isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {isPositive ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <span className="font-medium text-sm capitalize">{tx.type}</span>
                      </div>
                      <div className="col-span-5 md:col-span-4">
                        <p className="text-sm truncate">{tx.description}</p>
                        <div className="md:hidden text-xs text-muted-foreground mt-1">
                          {format(new Date(tx.createdAt), "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="hidden md:block md:col-span-2 text-sm text-muted-foreground">
                        {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                      </div>
                      <div className="col-span-5 md:col-span-4 flex flex-col items-end">
                        <span className={`font-bold text-sm ${isPositive ? 'text-green-500' : 'text-foreground'}`}>
                          {isPositive ? '+' : '-'}{settings?.currencySymbol || "₦"}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          Bal: {settings?.currencySymbol || "₦"}{tx.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Wallet className="h-10 w-10 mx-auto mb-4 opacity-20" />
                <p>No transactions found.</p>
              </div>
            )}
          </div>
          
          {txData && txData.totalPages > 1 && (
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
                Page {page} of {txData.totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.min(txData.totalPages, p + 1))}
                disabled={page === txData.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
