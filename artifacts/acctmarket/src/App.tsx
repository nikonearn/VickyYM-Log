import React from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/auth";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Shop from "@/pages/shop/index";
import ProductDetail from "@/pages/shop/[id]";
import Dashboard from "@/pages/dashboard/index";
import Orders from "@/pages/dashboard/orders";
import Wallet from "@/pages/dashboard/wallet";
import Deposit from "@/pages/dashboard/deposit";
import Profile from "@/pages/dashboard/profile";
import Support from "@/pages/dashboard/support/index";
import SupportDetail from "@/pages/dashboard/support/[id]";

import AdminDashboard from "@/pages/admin/index";
import AdminUsers from "@/pages/admin/users/index";
import AdminUserDetail from "@/pages/admin/users/[id]";
import AdminProducts from "@/pages/admin/products/index";
import AdminProductNew from "@/pages/admin/products/new";
import AdminProductEdit from "@/pages/admin/products/[id]/edit";
import AdminCategories from "@/pages/admin/categories/index";
import AdminOrders from "@/pages/admin/orders/index";
import AdminDeposits from "@/pages/admin/deposits/index";
import AdminSupport from "@/pages/admin/support/index";
import AdminSettings from "@/pages/admin/settings/index";
import AdminReports from "@/pages/admin/reports/index";

import About from "@/pages/about";
import Faq from "@/pages/faq";
import Terms from "@/pages/terms";
import Contact from "@/pages/contact";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!isAdmin) return <Redirect to="/dashboard" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/:id" component={ProductDetail} />
      <Route path="/about" component={About} />
      <Route path="/faq" component={Faq} />
      <Route path="/terms" component={Terms} />
      <Route path="/contact" component={Contact} />

      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/dashboard/orders">{() => <ProtectedRoute component={Orders} />}</Route>
      <Route path="/dashboard/wallet">{() => <ProtectedRoute component={Wallet} />}</Route>
      <Route path="/dashboard/deposit">{() => <ProtectedRoute component={Deposit} />}</Route>
      <Route path="/dashboard/profile">{() => <ProtectedRoute component={Profile} />}</Route>
      <Route path="/dashboard/support">{() => <ProtectedRoute component={Support} />}</Route>
      <Route path="/dashboard/support/:id">{() => <ProtectedRoute component={SupportDetail} />}</Route>

      <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
      <Route path="/admin/users">{() => <AdminRoute component={AdminUsers} />}</Route>
      <Route path="/admin/users/:id">{() => <AdminRoute component={AdminUserDetail} />}</Route>
      <Route path="/admin/products">{() => <AdminRoute component={AdminProducts} />}</Route>
      <Route path="/admin/products/new">{() => <AdminRoute component={AdminProductNew} />}</Route>
      <Route path="/admin/products/:id/edit">{() => <AdminRoute component={AdminProductEdit} />}</Route>
      <Route path="/admin/categories">{() => <AdminRoute component={AdminCategories} />}</Route>
      <Route path="/admin/orders">{() => <AdminRoute component={AdminOrders} />}</Route>
      <Route path="/admin/deposits">{() => <AdminRoute component={AdminDeposits} />}</Route>
      <Route path="/admin/support">{() => <AdminRoute component={AdminSupport} />}</Route>
      <Route path="/admin/settings">{() => <AdminRoute component={AdminSettings} />}</Route>
      <Route path="/admin/reports">{() => <AdminRoute component={AdminReports} />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function MainApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default MainApp;
