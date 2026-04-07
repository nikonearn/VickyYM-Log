import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useInitiateDeposit, useVerifyDeposit, useGetSettings, useListDeposits } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const depositSchema = z.object({
  amount: z.coerce.number().min(100, { message: "Minimum deposit is 100" }),
});

export default function DepositPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: settings } = useGetSettings();
  const initiateDeposit = useInitiateDeposit();
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { data: depositsData } = useListDeposits({
    query: {
      queryKey: ["deposits"]
    }
  });

  const form = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 1000,
    },
  });

  // Check for reference in URL to verify deposit
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    
    if (reference && !isVerifying) {
      setIsVerifying(true);
      // We do manual fetch here instead of using the hook directly to handle the redirect nicely
      const verify = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/deposits/verify/${reference}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            toast({
              title: "Deposit Successful",
              description: "Your wallet has been credited.",
            });
          } else {
            const err = await response.json();
            toast({
              title: "Verification Failed",
              description: err.error || "Could not verify deposit",
              variant: "destructive"
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Something went wrong verifying your deposit",
            variant: "destructive"
          });
        } finally {
          setIsVerifying(false);
          setLocation("/dashboard/wallet");
        }
      };
      
      verify();
    }
  }, [toast, setLocation, isVerifying]);

  const onSubmit = (values: z.infer<typeof depositSchema>) => {
    // Current URL as callback
    const callbackUrl = window.location.origin + "/dashboard/deposit";
    
    initiateDeposit.mutate(
      { data: { amount: values.amount, callbackUrl } },
      {
        onSuccess: (data) => {
          if (data.authorizationUrl) {
            window.location.href = data.authorizationUrl;
          } else {
            toast({
              title: "Error",
              description: "Did not receive authorization URL",
              variant: "destructive"
            });
          }
        },
        onError: (error: any) => {
          toast({
            title: "Failed to initiate deposit",
            description: error?.data?.error || "Please try again later.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (isVerifying) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-bold">Verifying Deposit...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we confirm your payment.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
        <p className="text-muted-foreground">Add money to your wallet to purchase accounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card className="shadow-md border-primary/20">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Fund Your Wallet
              </CardTitle>
              <CardDescription>
                Secure payments powered by Paystack
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ({settings?.currency || 'NGN'})</FormLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            {settings?.currencySymbol || '₦'}
                          </span>
                          <FormControl>
                            <Input placeholder="1000" type="number" className="pl-8 text-lg font-medium" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[1000, 5000, 10000].map(amt => (
                      <Button 
                        key={amt} 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => form.setValue('amount', amt)}
                      >
                        +{settings?.currencySymbol || '₦'}{amt.toLocaleString()}
                      </Button>
                    ))}
                  </div>

                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">Secure Payment</p>
                      <p className="text-muted-foreground">Your transaction is processed securely. Funds are credited instantly upon success.</p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-bold" 
                    disabled={initiateDeposit.isPending}
                  >
                    {initiateDeposit.isPending ? "Processing..." : `Pay ${settings?.currencySymbol || '₦'}${form.watch('amount').toLocaleString()}`}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              {depositsData?.deposits && depositsData.deposits.length > 0 ? (
                <div className="space-y-4">
                  {depositsData.deposits.slice(0, 5).map(deposit => (
                    <div key={deposit.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                      <div>
                        <p className="font-semibold text-sm">
                          {settings?.currencySymbol || '₦'}{deposit.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          Ref: {deposit.reference.substring(0, 8)}...
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant="outline" 
                          className={
                            deposit.status === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            deposit.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          }
                        >
                          {deposit.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(deposit.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                  <p>No deposit history found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
