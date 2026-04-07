import React, { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListTickets, useCreateTicket, getListTicketsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { LifeBuoy, Plus, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const ticketSchema = z.object({
  subject: z.string().min(5, { message: "Subject is required (min 5 characters)" }),
  message: z.string().min(10, { message: "Message is required (min 10 characters)" }),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

export default function Support() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: tickets, isLoading } = useListTickets();
  const createTicket = useCreateTicket();

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      message: "",
      priority: "normal",
    },
  });

  const onSubmit = (values: z.infer<typeof ticketSchema>) => {
    createTicket.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
          setIsDialogOpen(false);
          form.reset();
          toast({
            title: "Ticket Created",
            description: "Your support ticket has been submitted.",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error?.data?.error || "Could not create ticket.",
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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'text-zinc-500';
      case 'normal': return 'text-blue-500';
      case 'high': return 'text-orange-500';
      case 'urgent': return 'text-red-500 font-bold';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">Need help? Open a ticket to contact our team.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue below. We aim to respond within 24 hours.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Issue with Order #1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please provide as much detail as possible..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createTicket.isPending}>
                    {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm text-muted-foreground">
              <div className="col-span-2">Ticket ID</div>
              <div className="col-span-5">Subject</div>
              <div className="hidden md:block col-span-2">Updated</div>
              <div className="col-span-3 md:col-span-3 text-right">Status / Priority</div>
            </div>
            
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : tickets && tickets.length > 0 ? (
              <div className="divide-y">
                {tickets.map((ticket) => (
                  <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`}>
                    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/20 transition-colors cursor-pointer group">
                      <div className="col-span-2 font-mono text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        #{ticket.id}
                      </div>
                      <div className="col-span-5">
                        <p className="font-medium text-sm truncate">{ticket.subject}</p>
                        <div className="md:hidden text-xs text-muted-foreground mt-1">
                          {format(new Date(ticket.updatedAt), "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="hidden md:block col-span-2 text-sm text-muted-foreground">
                        {format(new Date(ticket.updatedAt), "MMM d, yyyy")}
                      </div>
                      <div className="col-span-3 md:col-span-3 flex flex-col items-end gap-1">
                        <Badge variant="outline" className={getStatusColor(ticket.status)}>
                          {ticket.status.toUpperCase()}
                        </Badge>
                        <span className={`text-xs uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <LifeBuoy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-foreground mb-1">No tickets yet</h3>
                <p>You haven't opened any support tickets.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Create your first ticket
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
