import { z } from "zod";
export const artStyles = ["Geometric", "Hand illustrated", "Painterly", "Pixel art", "Metallic", "Paper cut"] as const;
export const brandingRequestSchema = z.object({
  description: z.string().trim().min(3).max(3000),
  style: z.enum(artStyles),
  kind: z.enum(["artwork", "icon"]),
  count: z.number().int().min(1).max(3).default(1),
}).strict();
export const brandingResultSchema = z.object({
  images: z.array(z.object({ id: z.string(), image: z.string().max(1800000).regex(/^data:image\/webp;base64,[A-Za-z0-9+/]+=*$/), description: z.string().max(3000), style: z.enum(artStyles), kind: z.enum(["artwork", "icon"]) })).min(1).max(3),
});
export type BrandImage = z.infer<typeof brandingResultSchema>["images"][number];
