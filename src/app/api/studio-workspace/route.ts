import { prisma } from "@/lib/prisma";
import { ADMIN_WORKSPACE_ID, workspaceSchemas, type WorkspacePart } from "@/lib/studio-workspace-contract";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
export async function GET(req:Request){
 const part=new URL(req.url).searchParams.get("part") as WorkspacePart;
 if(!Object.hasOwn(workspaceSchemas,part))return Response.json({error:"Unknown workspace section."},{status:400,headers});
 try{const entry=await prisma.studioWorkspacePart.findUnique({where:{id:`${ADMIN_WORKSPACE_ID}:${part}`}});return Response.json({state:entry?workspaceSchemas[part].parse(entry.state):null},{headers});}
 catch{return Response.json({error:"Your workspace could not be restored. Saved work has not been replaced."},{status:503,headers});}
}
export async function PUT(req:Request){
 const origin=req.headers.get("origin");if(origin&&origin!==new URL(req.url).origin)return Response.json({error:"Open the studio to save work."},{status:403,headers});
 let part:WorkspacePart,state;
 try{if(Number(req.headers.get("content-length"))>12000000)throw Error();const raw=await req.text();if(new TextEncoder().encode(raw).length>12000000)throw Error();const body=JSON.parse(raw);part=body.part;if(!Object.hasOwn(workspaceSchemas,part))throw Error();state=workspaceSchemas[part].parse(body.state);}catch{return Response.json({error:"This workspace snapshot could not be saved. Your current work is intact."},{status:400,headers});}
 try{await prisma.studioWorkspacePart.upsert({where:{id:`${ADMIN_WORKSPACE_ID}:${part}`},create:{id:`${ADMIN_WORKSPACE_ID}:${part}`,state},update:{state}});return Response.json({saved:true},{headers});}
 catch{return Response.json({error:"Autosave could not finish. Your current work is still open; retry before reloading."},{status:503,headers});}
}
