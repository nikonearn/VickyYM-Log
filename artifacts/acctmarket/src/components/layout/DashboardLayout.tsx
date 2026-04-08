import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { useGetSettings, useLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  CreditCard, 
  User as UserIcon, 
  LifeBuoy, 
  LogOut,
  Shield,
  Menu,
  Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, setToken } = useAuth();
  const [location] = useLocation();
  const logout = useLogout();
  const { data: settings } = useGetSettings();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setToken(null);
      }
    });
  };

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/shop", label: "Products", icon: Store },
    { href: "/dashboard/orders", label: "My Orders", icon: ShoppingCart },
    { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
    { href: "/dashboard/deposit", label: "Deposit", icon: CreditCard },
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
    { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="h-16 flex items-center px-4 border-b">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary w-full overflow-hidden">
              <Shield className="h-6 w-6 shrink-0" />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                {settings?.siteName || "AcctMarket"}
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <div className="px-4 py-4 mb-4 border-b group-data-[collapsible=icon]:hidden">
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <p className="font-semibold truncate">{user?.fullName || user?.username}</p>
            </div>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href || (location.startsWith(item.href) && item.href !== "/dashboard")}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {user?.isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin Panel">
                    <Link href="/admin" className="text-primary hover:text-primary">
                      <Shield className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleLogout} tooltip="Logout">
                  <button className="w-full text-destructive hover:text-destructive/90">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between px-4 border-b bg-card sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="font-semibold text-lg hidden sm:block">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-secondary/50 px-3 py-1.5 rounded-md text-sm font-medium border border-border/50">
                Balance: {settings?.currencySymbol || "₦"}{(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
