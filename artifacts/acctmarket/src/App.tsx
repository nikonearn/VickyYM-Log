import React from "react";
import { App } from "../../App"; // just a placeholder since we export default from App
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth";
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

      {/* Dashboard Routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/orders" component={Orders} />
      <Route path="/dashboard/wallet" component={Wallet} />
      <Route path="/dashboard/deposit" component={Deposit} />
      <Route path="/dashboard/profile" component={Profile} />
      <Route path="/dashboard/support" component={Support} />
      <Route path="/dashboard/support/:id" component={SupportDetail} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/users/:id" component={AdminUserDetail} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/products/new" component={AdminProductNew} />
      <Route path="/admin/products/:id/edit" component={AdminProductEdit} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/deposits" component={AdminDeposits} />
      <Route path="/admin/support" component={AdminSupport} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/reports" component={AdminReports} />

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
