import * as React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-lg bg-surface-container/30 border border-surface-bright/50 max-w-md mx-auto my-8",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-muted mb-4">
        <FolderOpen size={24} className="opacity-60" />
      </div>
      <h3 className="text-headline-sm font-semibold text-on-background mb-2">
        {title}
      </h3>
      <p className="text-body-sm text-muted mb-6">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
