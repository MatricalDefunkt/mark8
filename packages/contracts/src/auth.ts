import { z } from "zod";

export const roleKeySchema = z.enum(["admin", "billing", "sales", "client"]);
export type RoleKey = z.infer<typeof roleKeySchema>;

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).nullable(),
});
export type User = z.infer<typeof userSchema>;

export const membershipSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  role: roleKeySchema,
  user: userSchema,
});
export type Membership = z.infer<typeof membershipSchema>;

export const sessionClaimsSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  organizationId: z.string().min(1),
  role: roleKeySchema,
});
export type SessionClaims = z.infer<typeof sessionClaimsSchema>;

export const signUpRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(128),
  name: z.string().min(1).max(120),
  organizationName: z.string().min(2).max(100),
});
export type SignUpRequest = z.infer<typeof signUpRequestSchema>;

export const signUpResponseSchema = z.object({
  userId: z.string().min(1),
  organizationId: z.string().min(1),
});
export type SignUpResponse = z.infer<typeof signUpResponseSchema>;
