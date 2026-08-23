"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/auth";
import { getCurrentAppUser } from "@/lib/current-user";
import { neonAuth } from "@/lib/neon-auth-server";

export async function signOut(): Promise<never> {
  await neonAuth.signOut();
  await deleteSession();
  revalidatePath("/");
  redirect("/");
}

export async function getUser() {
  try {
    return await getCurrentAppUser();
  } catch (error) {
    console.error("Get Neon Auth user error:", error);
    return null;
  }
}
