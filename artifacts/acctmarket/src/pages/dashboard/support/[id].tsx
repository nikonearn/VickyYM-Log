import React, { useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetTicket, useReplyTicket, getGetTicketQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
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

export default function SupportDetail() {
  const [, params] = useRoute("/dashboard/support/:id");
  const ticketId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: ticket, isLoading } = useGetTicket(ticketId, {
    query: {
      enabled: !!ticketId
    }
  });
  const replyTicket = useReplyTicket();

  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      message: "",
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const onSubmit = (values: z.infer<typeof replySchema>) => {
    replyTicket.mutate(
      { ticketId, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTicketQueryKey(ticketId) });
          form.reset();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error?.data?.error || "Could not send reply.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'answered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'closed': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-10 w-2/3 mb-2" />
        </div>
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="flex-1 p-6 space-y-6">
            <Skeleton className="h-24 w-3/4" />
            <Skeleton className="h-24 w-3/4 ml-auto" />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!ticket) return null;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/dashboard/support" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight break-words">{ticket.subject}</h1>
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

      <Card className="flex flex-col h-[calc(100vh-14rem)] min-h-[500px] border-primary/10">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/20">
          {ticket.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${msg.isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 ${
                msg.isAdmin ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}>
                {msg.isAdmin ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              
              <div className={`flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{msg.isAdmin ? 'Support Staff' : 'You'}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.isAdmin 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-card border shadow-sm rounded-tl-sm'
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        
        <CardFooter className="p-4 border-t bg-card">
          {ticket.status === 'closed' ? (
            <div className="w-full text-center p-4 text-muted-foreground border border-dashed rounded-lg">
              This ticket is closed and cannot be replied to.
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
                          placeholder="Type your reply..." 
                          className="min-h-[60px] resize-none" 
                          {...field} 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (form.getValues('message').trim()) {
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
                  disabled={replyTicket.isPending || !form.formState.isDirty}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </Form>
          )}
        </CardFooter>
      </Card>
    </DashboardLayout>
  );
}
