import { z } from "zod";

export const createEnquirySchema = z.object({
  propertyId: z.string().uuid("Invalid property id"),

  phone: z
    .string()
    .min(10, "Phone number is too short")
    .max(15, "Phone number is too long"),

  message: z.string().max(1000, "Message is too long").optional(),
});

export const updateEnquirySchema = z.object({
  status: z.enum([
    "PENDING",
    "CONTACTED",
    "NEGOTIATING",
    "CLOSED",
    "CANCELLED",
  ]),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;

export type UpdateEnquiryInput = z.infer<typeof updateEnquirySchema>;
