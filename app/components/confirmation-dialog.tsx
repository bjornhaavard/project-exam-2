"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert.dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  children: React.ReactNode;
  onConfirm: () => void | Promise<void>;
}

export default function ConfirmationDialog({ title, description, confirmText = "Confirm", cancelText = "Cancel", variant = "destructive", children, onConfirm }: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when the dialog opens
  useEffect(() => {
    if (open && cancelRef.current) {
      setTimeout(() => {
        cancelRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="border-2 border-gray-300 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel ref={cancelRef} disabled={isLoading} className="text-base font-medium">
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant={variant} onClick={handleConfirm} disabled={isLoading} className="text-base font-medium" aria-label={`${confirmText} - ${title}`}>
                {isLoading ? "Processing..." : confirmText}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
