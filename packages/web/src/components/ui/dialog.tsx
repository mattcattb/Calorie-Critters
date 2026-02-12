import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { cn } from "../../lib/cn";

export const Dialog = BaseDialog;

export function DialogBackdrop({ className, ...props }: BaseDialog.Backdrop.Props) {
  return (
    <BaseDialog.Backdrop
      className={cn("fixed inset-0 z-50 bg-foreground/60", className)}
      {...props}
    />
  );
}

export function DialogPopup({ className, ...props }: BaseDialog.Popup.Props) {
  return (
    <BaseDialog.Popup
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[min(640px,calc(100%-1rem))] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border-2 border-primary/25 bg-surface p-3 shadow-sticker sm:p-4",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: BaseDialog.Title.Props) {
  return <BaseDialog.Title className={cn("section-title", className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: BaseDialog.Description.Props) {
  return (
    <BaseDialog.Description
      className={cn("micro-text text-muted-foreground", className)}
      {...props}
    />
  );
}
