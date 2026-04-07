import { z } from "zod";

export const ticketStatusSchema = z.enum([
  "open",
  "in_progress",
  "resolved",
  "closed",
]);
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const ticketPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

export const createTicketRequestSchema = z.object({
  organizationId: z.string().min(1),
  title: z.string().min(4).max(140),
  description: z.string().min(10).max(5000),
  category: z.string().min(2).max(64),
  priority: ticketPrioritySchema.default("medium"),
});
export type CreateTicketRequest = z.infer<typeof createTicketRequestSchema>;

export const createTicketCommentRequestSchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().min(1).max(5000),
  internalOnly: z.boolean().default(false),
});
export type CreateTicketCommentRequest = z.infer<
  typeof createTicketCommentRequestSchema
>;
