import React, { useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListAdminUsers, useUpdateAdminUser, useGetSettings, getListAdminUsersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, Ban, ShieldCheck, Edit } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-mobile"; // Reusing this hook for simplicity, assuming we can adapt it or write a simple timeout

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: settings } = useGetSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Custom simple debounce
  const [debouncedSearch, setDebouncedSearch] = useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useListAdminUsers({
    query: {
      queryKey: ["admin-users", { page, search: debouncedSearch }]
    },
    page,
    search: debouncedSearch || undefined
  });

  const updateUser = useUpdateAdminUser();

  const toggleBanStatus = (id: number, currentStatus: boolean) => {
    updateUser.mutate(
      { id, data: { isBanned: !currentStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
          toast({ title: "User updated", description: `User has been ${!currentStatus ? 'banned' : 'unbanned'}.` });
        },
        onError: () => toast({ title: "Error", description: "Could not update user.", variant: "destructive" })
      }
    );
  };

  const toggleAdminStatus = (id: number, currentStatus: boolean) => {
    updateUser.mutate(
      { id, data: { isAdmin: !currentStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
          toast({ title: "User updated", description: `Admin privileges ${!currentStatus ? 'granted' : 'revoked'}.` });
        },
        onError: () => toast({ title: "Error", description: "Could not update user.", variant: "destructive" })
      }
    );
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage customer accounts and staff.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Orders / Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Loading users...</TableCell>
                </TableRow>
              ) : data?.users && data.users.length > 0 ? (
                data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {settings?.currencySymbol || "₦"}{user.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>{user.totalOrders} orders</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.isAdmin && <Badge variant="default" className="bg-primary text-primary-foreground">Admin</Badge>}
                        {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                        {!user.isAdmin && !user.isBanned && <Badge variant="outline">User</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit & Adjust Balance
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleAdminStatus(user.id, user.isAdmin)}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toggleBanStatus(user.id, user.isBanned)}
                            className={user.isBanned ? "text-green-500 focus:text-green-500" : "text-destructive focus:text-destructive"}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {user.isBanned ? "Unban User" : "Ban User"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">No users found.</TableCell>
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
