import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListAdminDeposits, useApproveDeposit, useGetSettings, getListAdminDepositsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDeposits() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("pending"); // default to pending for admin attention
  
  const { data: settings } = useGetSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListAdminDeposits({
    query: {
      queryKey: ["admin-deposits", { page, status: status === "all" ? undefined : status, limit: 20 }]
    },
    page,
    status: status === "all" ? undefined : status
  });

  const approve = useApproveDeposit();

  const handleApprove = (id: number) => {
    approve.mutate(
      { data: { depositId: id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminDepositsQueryKey() });
          toast({ title: "Deposit Approved", description: "Funds have been added to user wallet." });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err?.data?.error || "Failed to approve deposit.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deposits</h1>
          <p className="text-muted-foreground">Manage and approve user wallet deposits.</p>
        </div>
        <div className="w-full md:w-48">
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deposits</SelectItem>
              <SelectItem value="success">Completed</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deposit ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">Loading deposits...</TableCell>
                </TableRow>
              ) : data?.deposits && data.deposits.length > 0 ? (
                data.deposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell className="font-mono text-xs">#{deposit.id}</TableCell>
                    <TableCell className="font-mono text-xs">User #{deposit.userId}</TableCell>
                    <TableCell className="font-mono text-xs">{deposit.reference.substring(0, 12)}...</TableCell>
                    <TableCell className="font-bold text-green-500">
                      {settings?.currencySymbol || "₦"}{deposit.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(deposit.createdAt), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      {deposit.status === 'pending' && (
                        <Button size="sm" onClick={() => handleApprove(deposit.id)} disabled={approve.isPending}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">No deposits found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {data && data.totalPages > 1 && (
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
                Page {page} of {data.totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
