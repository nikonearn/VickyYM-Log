import React, { useRef, useEffect, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminReplyTicket } from "@workspace/api-client-react";
import { useAuth } from "@/context/auth";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, User, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const replySchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty" }),
});

interface TicketMessage {
  id: number;
  ticketId: number;
  userId: number;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

interface TicketWithMessages {
  id: number;
  userId: number;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export default function AdminSupportDetail() {
  const [, params] = useRoute("/admin/support/:id");
  const ticketId = params?.id ? parseInt(params.id) : 0;
  const { token } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ticket, setTicket] = React.useState<TicketWithMessages | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load ticket");
      const data: TicketWithMessages = await res.json();
      setTicket(data);
    } catch {
      toast({ title: "Error", description: "Could not load ticket.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [ticketId, token]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const adminReply = useAdminReplyTicket();

  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { message: "" },
  });

  const onSubmit = (values: z.infer<typeof replySchema>) => {
    adminReply.mutate(
      { id: ticketId, data: { message: values.message } },
      {
        onSuccess: () => {
          form.reset();
          fetchTicket();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error?.data?.error || "Could not send reply.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "answered": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "closed": return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="mb-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-10 w-2/3 mb-2" />
        </div>
        <Card className="h-[600px] flex flex-col">
          <CardContent className="flex-1 p-6 space-y-6">
            <Skeleton className="h-24 w-3/4" />
            <Skeleton className="h-24 w-3/4 ml-auto" />
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  if (!ticket) return <AdminLayout><div className="p-8 text-muted-foreground">Ticket not found.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link href="/admin/support" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight break-words">{ticket.subject}</h1>
            <p className="text-sm text-muted-foreground mt-1">User #{ticket.userId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(ticket.status)}>
              {ticket.status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="uppercase font-mono">
              #{ticket.id}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="flex flex-col h-[calc(100vh-16rem)] min-h-[500px] border-primary/10">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/20">
          {ticket.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.isAdmin ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 ${
                msg.isAdmin ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}>
                {msg.isAdmin ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={`flex flex-col ${msg.isAdmin ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{msg.isAdmin ? "Admin (You)" : `User #${msg.userId}`}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.isAdmin
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border shadow-sm rounded-tl-sm"
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="p-4 border-t bg-card">
          {ticket.status === "closed" ? (
            <div className="w-full text-center p-4 text-muted-foreground border border-dashed rounded-lg">
              This ticket is closed.
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex gap-3">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder="Type your admin reply..."
                          className="min-h-[60px] resize-none"
                          {...field}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              if (form.getValues("message").trim()) {
                                form.handleSubmit(onSubmit)();
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-[60px] w-[60px] shrink-0"
                  disabled={adminReply.isPending || !form.formState.isDirty}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </Form>
          )}
        </CardFooter>
      </Card>
    </AdminLayout>
  );
}
