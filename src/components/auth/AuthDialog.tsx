"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MagicLinkForm } from "./MagicLinkForm";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="alchemy-glass overflow-hidden border-white/10 bg-[#241109]/96 p-0 text-hot-white shadow-[0_0_90px_rgba(255,196,48,0.22),0_40px_100px_rgba(0,0,0,0.5)] sm:max-w-[470px]">
        <div className="h-px bg-[linear-gradient(90deg,transparent,#8b5cf6,#e879f9,#ff963b,#e4ff68,transparent)] shadow-[0_0_18px_rgba(255,133,55,.3)]" />
        <div className="p-6 sm:p-7">
          <DialogHeader className="text-left">
            <p className="alchemy-kicker">Private studio entry</p>
            <DialogTitle className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-hot-white">
              Enter the alchemy studio
            </DialogTitle>
            <DialogDescription className="mt-2 leading-6 text-white/80">
              One secure link opens your private design workspace. No password to remember.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            <MagicLinkForm />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

