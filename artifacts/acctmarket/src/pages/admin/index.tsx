import React from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminDashboard, useGetSettings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, CreditCard, TrendingUp, LifeBuoy } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Using a simple CSS-based bar chart instead of Recharts for the admin dashboard overview
function SimpleBarChart({ data, currencySymbol }: { data: any[], currencySymbol: string }) {
  if (!data || data.length === 0) return <div>No data available</div>;
  
  const maxSales = Math.max(...data.map(d => d.totalSales));
  
  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-24 text-sm truncate font-medium">{item.categoryName}</div>
          <div className="flex-1 h-6 bg-muted/20 rounded-full overflow-hidden flex items-center">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${Math.max(2, (item.totalSales / maxSales) * 100)}%` }}
            ></div>
          </div>
          <div className="w-24 text-right text-sm">
            <div className="font-semibold">{item.totalSales} sold</div>
            <div className="text-xs text-muted-foreground">{currencySymbol}{item.totalRevenue.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();
  const { data: settings } = useGetSettings();
  const currencySymbol = settings?.currencySymbol || "₦";

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!dashboard) return null;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-card hover-elevate border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {currencySymbol}{dashboard.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{currencySymbol}{dashboard.todayRevenue.toLocaleString()} today
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.totalOrders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{dashboard.todayOrders} today
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.totalUsers.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.totalProducts.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="col-span-2 bg-card bg-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-500 flex items-center gap-2">
              <LifeBuoy className="h-4 w-4" />
              Pending Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{dashboard.pendingTickets}</div>
            <Link href="/admin/support" className="text-xs text-amber-500/80 hover:text-amber-500 hover:underline mt-2 inline-block">
              View tickets →
            </Link>
          </CardContent>
        </Card>
        
        <Card className="col-span-2 bg-card bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pending Deposits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{dashboard.pendingDeposits}</div>
            <Link href="/admin/deposits" className="text-xs text-blue-500/80 hover:text-blue-500 hover:underline mt-2 inline-block">
              Review deposits →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={dashboard.salesByCategory} currencySymbol={currencySymbol} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {dashboard.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]">{order.productName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(order.createdAt), "MMM d, HH:mm")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold text-sm">
                        {currencySymbol}{order.productPrice.toLocaleString()}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] px-1.5 py-0 h-4 ${
                          order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent orders found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
