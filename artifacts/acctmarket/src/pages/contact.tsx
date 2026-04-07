import React from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetSettings } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Contact() {
  const { data: settings } = useGetSettings();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">Need help? We're here for you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Email Support</CardTitle>
              <CardDescription>Reach out to us via email</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-lg font-medium mb-4">
                {settings?.contactEmail || "support@acctmarket.com"}
              </p>
              <Button asChild variant="outline">
                <a href={`mailto:${settings?.contactEmail || "support@acctmarket.com"}`}>
                  Send Email
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Ticket System</CardTitle>
              <CardDescription>Fastest way for registered users</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-muted-foreground mb-4">
                Log in and open a support ticket for order-related issues.
              </p>
              <Button asChild>
                <Link href="/dashboard/support">
                  Open Ticket
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
