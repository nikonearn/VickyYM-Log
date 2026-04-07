import React from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetSettings } from "@workspace/api-client-react";

export default function Terms() {
  const { data: settings } = useGetSettings();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Terms of Service</h1>
        
        {settings?.termsText ? (
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {settings.termsText.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this marketplace, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold text-foreground">2. Description of Service</h2>
            <p>
              {settings?.siteName || "AcctMarket"} provides a platform for the purchasing of digital assets, specifically social media and digital account credentials. We do not claim ownership of the platforms these accounts belong to.
            </p>

            <h2 className="text-2xl font-bold text-foreground">3. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              Upon purchasing an account, it is your responsibility to secure it by changing the password and recovery details immediately.
            </p>

            <h2 className="text-2xl font-bold text-foreground">4. Refund Policy</h2>
            <p>
              All sales are final. We guarantee that accounts are functional at the exact moment of delivery. If an account is non-functional upon immediate delivery, you must contact support within 1 hour for a replacement. We are not responsible for accounts that get banned or locked after you have successfully logged into them, as we cannot control how you use the accounts.
            </p>

            <h2 className="text-2xl font-bold text-foreground">5. Deposits</h2>
            <p>
              Funds deposited into your wallet are non-refundable and can only be used to purchase items on the marketplace.
            </p>

            <h2 className="text-2xl font-bold text-foreground">6. Prohibited Activities</h2>
            <p>
              You agree not to use the purchased accounts for any illegal activities, spam, harassment, or activities that violate the terms of service of the respective platforms.
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
