"use client";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { workspaceSchemas, type WorkspacePart } from "./studio-workspace-contract";
// Restore before saving. Serialize writes to prevent an older snapshot winning a race.
export function useStudioAutosave<P extends WorkspacePart>(part:P,state:unknown,restore:(value:z.output<(typeof workspaceSchemas)[P]>)=>void){
 const [ready,setReady]=useState(false),[message,setMessage]=useState("Restoring saved workspace…");
 const restoreRef=useRef(restore);restoreRef.current=restore;
 const last=useRef("");const chain=useRef(Promise.resolve());const mounted=useRef(true);
 const serialized=JSON.stringify(state);
 const current=useRef(serialized);current.current=serialized;
 useEffect(()=>{mounted.current=true;const initial=current.current;const controller=new AbortController();
  fetch(`/api/studio-workspace?part=${part}`,{cache:"no-store",signal:controller.signal}).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error);if(data.state!==null){const parsed=workspaceSchemas[part].parse(data.state);last.current=JSON.stringify(parsed);if(current.current===initial)restoreRef.current(parsed as z.output<(typeof workspaceSchemas)[P]>);}if(mounted.current){setReady(true);setMessage("Workspace restored.");}}).catch(cause=>{if(!controller.signal.aborted&&mounted.current)setMessage(cause instanceof Error?cause.message:"Saved workspace could not be restored.");});
  return()=>{mounted.current=false;controller.abort();};
 },[part]);
 useEffect(()=>{if(!ready||serialized===last.current)return;const timer=setTimeout(()=>{
  if(mounted.current)setMessage("Saving to admin workspace…");
  chain.current=chain.current.catch(()=>{}).then(async()=>{try{const response=await fetch("/api/studio-workspace",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({part,state:JSON.parse(serialized)})});const data=await response.json();if(!response.ok)throw Error(data.error);last.current=serialized;if(mounted.current)setMessage("Saved to admin workspace.");}catch(cause){if(mounted.current)setMessage(cause instanceof Error?cause.message:"Autosave could not finish; your current work is intact.");}});
 },650);return()=>clearTimeout(timer);},[ready,serialized,part]);
 return message;
}
