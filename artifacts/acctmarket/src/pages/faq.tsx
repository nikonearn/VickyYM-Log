import React from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetSettings } from "@workspace/api-client-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Faq() {
  const { data: settings } = useGetSettings();

  const defaultFaqs = [
    {
      question: "How do I purchase an account?",
      answer: "First, you need to create an account on our platform and deposit funds into your wallet using the available payment methods. Once your balance is loaded, simply browse the marketplace, select the account you want, and click 'Purchase'. The account details will be instantly delivered to your dashboard."
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery is instant! As soon as your purchase is confirmed, the account credentials (logs) are automatically added to your 'My Orders' section in the dashboard."
    },
    {
      question: "What does 'Fresh', 'Aged', and 'Verified' mean?",
      answer: "Fresh accounts are newly created. Aged accounts were created months or years ago and typically have better standing with platform algorithms. Verified accounts come with phone or email verification completed. Premium accounts are high-tier accounts often with history, followers, or special features."
    },
    {
      question: "What if the account I bought doesn't work?",
      answer: "We guarantee that all accounts work at the time of purchase. If you experience an issue immediately after purchase, please open a Support Ticket from your dashboard with the order details, and our team will assist you or provide a replacement according to our terms."
    },
    {
      question: "How can I deposit funds?",
      answer: "Go to your Dashboard, navigate to 'Deposit', enter the amount you wish to add, and you will be securely redirected to our payment processor (Paystack) to complete the transaction. Your balance will be updated automatically."
    }
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Frequently Asked Questions</h1>
        
        {settings?.faqText ? (
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {settings.faqText.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {defaultFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-lg">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </PublicLayout>
  );
}
