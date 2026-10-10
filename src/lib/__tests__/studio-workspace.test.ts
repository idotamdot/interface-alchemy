// @vitest-environment node
import { beforeEach,expect,test,vi } from "vitest";
import {GET,PUT} from "@/app/api/studio-workspace/route";
import {prisma} from "../prisma";
vi.mock("../prisma",()=>({prisma:{studioWorkspacePart:{findUnique:vi.fn(),upsert:vi.fn()}}}));
beforeEach(()=>vi.clearAllMocks());
test("restores a shared draft without sign-in",async()=>{
 vi.mocked(prisma.studioWorkspacePart.findUnique).mockResolvedValue({state:{input:"Amber glass"}} as never);
 const response=await GET(new Request("https://studio.test/api/studio-workspace?part=chat-draft"));
 expect(await response.json()).toEqual({state:{input:"Amber glass"}});
});
test("saves validated drafts and rejects incomplete snapshots",async()=>{
 const request=(state:unknown)=>new Request("https://studio.test/api/studio-workspace",{method:"PUT",body:JSON.stringify({part:"chat-draft",state})});
 expect((await PUT(request({input:"Warm cards"}))).status).toBe(200);
 expect(prisma.studioWorkspacePart.upsert).toHaveBeenCalledTimes(1);
 expect((await PUT(request({input:42}))).status).toBe(400);
 expect(prisma.studioWorkspacePart.upsert).toHaveBeenCalledTimes(1);
});
test("database failure reports recovery without replacing stored work",async()=>{
 vi.mocked(prisma.studioWorkspacePart.findUnique).mockRejectedValue(Error("database"));
 expect((await GET(new Request("https://studio.test/api/studio-workspace?part=chat-draft"))).status).toBe(503);
 expect(prisma.studioWorkspacePart.upsert).not.toHaveBeenCalled();
});
