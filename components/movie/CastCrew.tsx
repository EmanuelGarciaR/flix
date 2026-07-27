import * as React from "react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

interface CastCrewProps {
  cast: any[];
  tmdb: any;
}

export function CastCrew({ cast, tmdb }: CastCrewProps) {
  if (!cast || cast.length === 0) return null;

  // Show top 12 cast members
  const displayCast = cast.slice(0, 12);

  return (
    <div className="px-4 md:px-12 flex flex-col gap-4 border-t border-surface-bright/30 pt-6">
      <h3 className="text-headline-sm text-on-background">Cast</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-surface-bright scrollbar-track-transparent">
        {displayCast.map((actor) => {
          const avatarUrl = tmdb.image(actor.profile_path, "w185");

          return (
            <div
              key={actor.id || actor.cast_id}
              className="w-[100px] md:w-[120px] shrink-0 flex flex-col gap-2 text-center"
            >
              {/* Profile Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-full border border-surface-bright/40 bg-surface-container shadow-md">
                <ImageWithFallback
                  src={avatarUrl || ""}
                  alt={actor.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100px, 120px"
                />
              </div>

              {/* Name */}
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-on-background truncate">
                  {actor.name}
                </p>
                <p className="text-[10px] text-muted truncate mt-0.5">
                  {actor.character}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
