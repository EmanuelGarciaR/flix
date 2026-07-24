import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export interface MovieCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  metadata?: string
  imageUrl?: string
  progress?: number // 0 to 100 for continue watching
}

export function MovieCard({
  className,
  title,
  metadata,
  imageUrl,
  progress,
  ...props
}: MovieCardProps) {
  return (
    <div
      className={cn(
        "group relative flex cursor-pointer flex-col gap-2 rounded transition-transform hover:scale-[1.02]",
        className
      )}
      {...props}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded bg-surface-container hover:shadow-[0_0_15px_rgba(229,9,20,0.2)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-variant text-muted">
            No Image
          </div>
        )}
        
        {/* Progress Bar for Continue Watching */}
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface/50">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="flex flex-col">
        <h3 className="truncate text-body-sm font-semibold text-on-background">
          {title}
        </h3>
        {metadata && (
          <p className="truncate text-label-caps text-muted">
            {metadata}
          </p>
        )}
      </div>
    </div>
  )
}
