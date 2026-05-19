import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/cn";

export const Dialog = DialogPrimitive;

export const DialogBackdrop = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-foreground/60", className)}
    {...props}
  />
));

DialogBackdrop.displayName = DialogPrimitive.Overlay.displayName;

export const DialogPopup = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Content
    ref={ref}
    className={cn(
      "fixed left-1/2 top-1/2 z-50 w-[min(640px,calc(100%-1rem))] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border-2 border-primary/25 bg-surface p-3 shadow-sticker sm:p-4",
      className,
    )}
    {...props}
  />
));

DialogPopup.displayName = DialogPrimitive.Content.displayName;

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("section-title", className)} {...props} />
));

DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("micro-text text-muted-foreground", className)}
    {...props}
  />
));

DialogDescription.displayName = DialogPrimitive.Description.displayName;
