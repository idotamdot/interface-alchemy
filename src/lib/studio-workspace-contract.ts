import { persistedProjectSchema, serializedFileSystemSchema } from "./data-schemas";
import { z } from "zod";
import { seerResultSchema } from "./seer-contract";
import { brandingResultSchema, artStyles } from "./branding-contract";
import { parseBrandPackage, type BrandPackage } from "./brand-package";
export const ADMIN_WORKSPACE_ID = "cstudioadminworkspace000001";
const kit=z.unknown().transform((value,ctx):BrandPackage|null=>{if(value===null)return null;try{return parseBrandPackage(value);}catch{ctx.addIssue({code:"custom",message:"Invalid brand kit"});return z.NEVER;}});
export const workspaceSchemas = {
 "conversation":z.object({messages:persistedProjectSchema.shape.messages}),
 "canvas-files":z.object({files:serializedFileSystemSchema}),
 "chat-draft": z.object({input:z.string().max(12000)}),
 "design-directions": z.object({styleBrief:z.string().max(12000).optional(),seerResults:z.array(seerResultSchema).max(3),seerCount:z.number().int().min(1).max(3),seerSource:z.enum(["description","pick"]),selectedDirection:z.string().max(1800),explorations:z.record(z.object({seed:z.number().int().min(0).max(4294967296),position:z.number().int().min(0).max(4)}))}),
 "branding-draft":z.object({description:z.string().max(3000),style:z.enum(artStyles),kind:z.enum(["artwork","icon"]),count:z.number().int().min(1).max(3),altText:z.string().max(500)}),
 "branding-artwork":z.object({images:brandingResultSchema.shape.images.min(0),accepted:brandingResultSchema.shape.images.element.nullable()}),
 "brand-kit":z.object({name:z.string().max(60),tagline:z.string().max(100),kit,acceptedKit:kit}),
 "studio-settings":z.object({motionPaused:z.boolean(),viewport:z.enum(["desktop","mobile"]),activeView:z.enum(["preview","code"])}),
};
export type WorkspacePart = keyof typeof workspaceSchemas;
