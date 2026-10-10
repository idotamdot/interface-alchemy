import { z } from "zod";
import { seerResultSchema } from "./seer-contract";
export const portfolioEntrySchema = z.object({ id: z.string(), result: seerResultSchema, visibility: z.enum(["private", "community"]), createdAt: z.string() });
export type PortfolioEntry = z.infer<typeof portfolioEntrySchema>;
export const portfolioMutationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), result: seerResultSchema }).strict(),
  z.object({ action: z.literal("donate"), id: z.string().min(1).max(100), consent: z.literal(true) }).strict(),
  z.object({ action: z.literal("withdraw"), id: z.string().min(1).max(100) }).strict(),
]);
