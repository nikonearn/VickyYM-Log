import React from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetSettings } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Lock, Zap } from "lucide-react";

export default function About() {
  const { data: settings } = useGetSettings();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6">About {settings?.siteName || "AcctMarket"}</h1>
        
        {settings?.aboutText ? (
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {settings.aboutText.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are the premier destination for high-quality, verified social media and digital accounts. 
              Our mission is to provide a secure, fast, and reliable marketplace for digital assets.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <Card className="bg-card">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Verified Quality</h3>
                  <p className="text-muted-foreground">Every account on our platform undergoes rigorous checking to ensure you get exactly what you pay for.</p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Instant Delivery</h3>
                  <p className="text-muted-foreground">No waiting. The moment your payment is confirmed, your account details are delivered to your dashboard.</p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Secure Transactions</h3>
                  <p className="text-muted-foreground">Your funds and data are protected with industry-standard encryption and secure payment gateways.</p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Dedicated Support</h3>
                  <p className="text-muted-foreground">Our support team is always ready to assist you with any issues or questions you might have.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
