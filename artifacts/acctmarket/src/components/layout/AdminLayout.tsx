import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { useGetSettings, useLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Tags, 
  ShoppingCart, 
  CreditCard, 
  LifeBuoy, 
  Settings,
  BarChart3,
  LogOut,
  Shield,
  Search,
  Store
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, setToken } = useAuth();
  const [location] = useLocation();
  const logout = useLogout();
  const { data: settings } = useGetSettings();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setToken(null);
      }
    });
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/deposits", label: "Deposits", icon: CreditCard },
    { href: "/admin/support", label: "Support Tickets", icon: LifeBuoy },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full dark">
        {/* Force dark mode for admin panel */}
        <Sidebar variant="sidebar" collapsible="icon" className="border-r-border/20 bg-sidebar">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/20">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-xl text-primary w-full overflow-hidden">
              <Shield className="h-6 w-6 shrink-0" />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                Admin Panel
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <div className="px-4 py-4 group-data-[collapsible=icon]:hidden">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search menu..." 
                  className="pl-9 h-9 bg-background/50 border-border/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href || (location.startsWith(item.href) && item.href !== "/admin")}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-border/20 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Storefront">
                  <Link href="/" className="text-muted-foreground hover:text-foreground">
                    <Store className="h-4 w-4" />
                    <span>View Storefront</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
        
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-background text-foreground dark">
          <header className="h-16 flex items-center justify-between px-4 border-b border-border/20 bg-card sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="font-semibold text-lg hidden sm:block">
                {navItems.find(item => location === item.href || (location.startsWith(item.href) && item.href !== "/admin"))?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground hidden sm:block">
                Logged in as <span className="font-medium text-foreground">{user?.username}</span>
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
