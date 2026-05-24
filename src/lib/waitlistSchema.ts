import { z } from "zod";
import { CULTURES } from "@/data/cultures";

export const waitListSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "An email address is required.")
    .email("Please enter a valid email address.")
    .max(254, "Email is too long."),
  name: z
    .string()
    .trim()
    .max(120, "Name is too long.")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  pantheon: z
    .enum(CULTURES)
    .optional()
    .or(z.literal("").transform(() => undefined))
    .transform((v) => (v ? v : undefined)),
  background: z
    .string()
    .trim()
    .max(2000, "Background note is too long.")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type WaitListInput = z.input<typeof waitListSchema>;
export type WaitListEntry = z.output<typeof waitListSchema> & {
  receivedAt: string;
};
