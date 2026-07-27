import * as React from "react";
import { Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import Link from "next/link";
import { buildWatchUrl } from "@/lib/playback";

interface EpisodeListProps {
  episodes: any[];
  tmdbId: number;
  seasonNumber: number;
  profileId?: string;
  tmdb: any;
}

export async function EpisodeList({
  episodes,
  tmdbId,
  seasonNumber,
  profileId,
  tmdb,
}: EpisodeListProps) {
  if (!episodes || episodes.length === 0) return null;

  // Fetch watch history progress for these episodes if profile is present
  let watchProgressMap: Record<number, number> = {};
  
  if (profileId) {
    try {
      const supabase = await createClient();
      const { data: history } = await supabase
        .from("watch_history")
        .select("episode_number, progress_seconds, duration_seconds")
        .eq("profile_id", profileId)
        .eq("tmdb_id", tmdbId)
        .eq("season_number", seasonNumber);

      if (history) {
        history.forEach((row: any) => {
          if (row.duration_seconds > 0) {
            watchProgressMap[row.episode_number] = Math.floor(
              (row.progress_seconds / row.duration_seconds) * 100
            );
          }
        });
      }
    } catch (err) {
      console.error("Error loading watch progress in EpisodeList:", err);
    }
  }

  return (
    <div className="px-4 md:px-12 flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {episodes.map((episode) => {
          const episodeProgress = watchProgressMap[episode.episode_number];
          const imgUrl = tmdb.backdrop(episode.still_path, "w780");
          const playUrl = buildWatchUrl(null, {
            tmdbId,
            type: "tv",
            season: seasonNumber,
            episode: episode.episode_number,
          });

          return (
            <Link
              key={episode.id}
              href={playUrl}
              className="group flex flex-col gap-3 rounded bg-surface-container/30 border border-surface-bright/20 p-3 hover:bg-surface-container/50 transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded bg-surface-container border border-surface-bright/35">
                <ImageWithFallback
                  src={imgUrl || ""}
                  alt={episode.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <div className="rounded-full bg-primary p-3 text-on-primary shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play fill="currentColor" size={16} />
                  </div>
                </div>

                {/* Progress bar overlay */}
                {episodeProgress !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${episodeProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-body-sm font-semibold text-on-background line-clamp-1 group-hover:text-primary transition-colors">
                    {episode.episode_number}. {episode.name}
                  </h4>
                  {episode.runtime && (
                    <span className="text-[11px] text-muted shrink-0 font-medium bg-surface-container px-1.5 py-0.5 rounded">
                      {episode.runtime}m
                    </span>
                  )}
                </div>
                {episode.overview && (
                  <p className="text-xs text-muted line-clamp-3 mt-1.5 leading-relaxed">
                    {episode.overview}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
