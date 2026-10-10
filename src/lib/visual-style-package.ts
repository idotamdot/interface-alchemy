import { z } from "zod";
import { checkPalette, directionSchema, type SeerDirection } from "./seer-contract";

export const visualStylePackageSchema = z.object({
 format:z.literal("screen-seer-visual/v1"),
 exportedAt:z.string().datetime(),
 source:z.literal("interface-alchemy"),
 direction:directionSchema,
 review:z.object({paletteChecked:z.literal(true),renderedAccessibilityVerified:z.literal(false),implementationVerified:z.literal(false)}),
}).strict().superRefine((value,ctx)=>{
 for(const check of checkPalette(value.direction.palette)) if(check.ratio<check.minimum) ctx.addIssue({code:"custom",message:check.pair+" has insufficient contrast"});
});
export type VisualStylePackage=z.infer<typeof visualStylePackageSchema>;
export function createVisualStylePackage(direction:SeerDirection):VisualStylePackage {
 return visualStylePackageSchema.parse({format:"screen-seer-visual/v1",exportedAt:new Date().toISOString(),source:"interface-alchemy",direction,review:{paletteChecked:true,renderedAccessibilityVerified:false,implementationVerified:false}});
}
