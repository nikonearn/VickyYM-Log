import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListAdminOrders, useGetSettings } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [viewLogs, setViewLogs] = useState<string | null>(null);
  
  const { data: settings } = useGetSettings();

  const { data, isLoading } = useListAdminOrders({
    query: {
      queryKey: ["admin-orders", { page, status: status === "all" ? undefined : status, limit: 20 }]
    },
    page,
    status: status === "all" ? undefined : status
  });

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Orders</h1>
          <p className="text-muted-foreground">View all purchases across the platform.</p>
        </div>
        <div className="w-full md:w-48">
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
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
                <TableHead>Order ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Logs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">Loading orders...</TableCell>
                </TableRow>
              ) : data?.orders && data.orders.length > 0 ? (
                data.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">#{order.id}</TableCell>
                    <TableCell className="font-mono text-xs">User #{order.userId}</TableCell>
                    <TableCell>
                      <div className="font-medium max-w-[200px] truncate">{order.productName}</div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {settings?.currencySymbol || "₦"}{order.productPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      {order.deliveredLogs && (
                        <Button variant="ghost" size="icon" onClick={() => setViewLogs(order.deliveredLogs || "")}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">No orders found.</TableCell>
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

      <Dialog open={!!viewLogs} onOpenChange={(o) => !o && setViewLogs(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delivered Logs</DialogTitle>
          </DialogHeader>
          <div className="bg-zinc-950 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto whitespace-pre-wrap border border-zinc-800 mt-4">
            {viewLogs}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
