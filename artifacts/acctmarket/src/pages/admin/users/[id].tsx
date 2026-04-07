import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminUser, useUpdateAdminUser, useGetSettings, getGetAdminUserQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Wallet, ArrowUpRight, ArrowDownRight, Save } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminUserDetail() {
  const [, params] = useRoute("/admin/users/:id");
  const userId = params?.id ? parseInt(params.id) : 0;
  const { data: settings } = useGetSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [balanceAdjustment, setBalanceAdjustment] = useState<string>("");
  const [adjustType, setAdjustType] = useState<"add" | "subtract">("add");
  
  const { data: user, isLoading } = useGetAdminUser(userId, {
    query: {
      enabled: !!userId
    }
  });

  const updateUser = useUpdateAdminUser();

  const handleAdjustBalance = () => {
    if (!balanceAdjustment || isNaN(Number(balanceAdjustment))) {
      toast({ title: "Error", description: "Invalid amount", variant: "destructive" });
      return;
    }

    const amount = Number(balanceAdjustment);
    const adjustValue = adjustType === "add" ? amount : -amount;

    updateUser.mutate(
      { id: userId, data: { adjustBalance: adjustValue } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAdminUserQueryKey(userId) });
          setBalanceAdjustment("");
          toast({ title: "Balance updated", description: "User wallet balance has been adjusted." });
        },
        onError: (err: any) => toast({ title: "Error", description: err?.data?.error || "Could not update balance.", variant: "destructive" })
      }
    );
  };

  if (isLoading) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;
  if (!user) return <AdminLayout><div className="p-8">User not found</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link href="/admin/users" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{user.username}</h1>
          <div className="flex gap-2">
            {user.isAdmin && <Badge>Admin</Badge>}
            {user.isBanned && <Badge variant="destructive">Banned</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> User Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                <p className="font-medium mt-1">{user.fullName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Email</span>
                <p className="font-medium mt-1">{user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Joined</span>
                <p className="font-medium mt-1">{format(new Date(user.createdAt), "MMMM d, yyyy")}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
                <p className="font-medium mt-1">{user.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" /> Wallet</CardTitle>
            <CardDescription>Current balance: {settings?.currencySymbol || "₦"}{user.balance.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg flex items-center justify-between border">
              <span className="font-medium">Total Deposited</span>
              <span className="font-bold text-green-500">{settings?.currencySymbol || "₦"}{user.totalDeposited.toLocaleString()}</span>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h4 className="font-semibold text-sm">Manual Adjustment</h4>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={adjustType === "add" ? "default" : "outline"} 
                  className={adjustType === "add" ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setAdjustType("add")}
                >
                  <ArrowDownRight className="h-4 w-4 mr-1" /> Add
                </Button>
                <Button 
                  type="button" 
                  variant={adjustType === "subtract" ? "default" : "outline"}
                  className={adjustType === "subtract" ? "bg-red-600 hover:bg-red-700" : ""}
                  onClick={() => setAdjustType("subtract")}
                >
                  <ArrowUpRight className="h-4 w-4 mr-1" /> Sub
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="1000" 
                    value={balanceAdjustment}
                    onChange={(e) => setBalanceAdjustment(e.target.value)}
                  />
                  <Button onClick={handleAdjustBalance} disabled={updateUser.isPending || !balanceAdjustment}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
