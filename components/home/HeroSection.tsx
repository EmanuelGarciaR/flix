import * as React from "react";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MyListButton } from "@/components/movie/MyListButton";
import Link from "next/link";
import { buildWatchUrl } from "@/lib/playback";

interface HeroSectionProps {
  title: string;
  overview: string;
  backdropUrl: string | null;
  tmdbId: number;
  mediaType: "movie" | "tv";
  profileId?: string;
}

export function HeroSection({
  title,
  overview,
  backdropUrl,
  tmdbId,
  mediaType,
  profileId,
}: HeroSectionProps) {
  const playUrl = buildWatchUrl(null, { tmdbId, type: mediaType });
  const detailsUrl = `/${mediaType}/${tmdbId}`;

  return (
    <section className="relative flex min-h-[70vh] w-full flex-col justify-end pb-12 pt-24 px-4 md:min-h-[85vh] md:px-12">
      {/* Background Image / Backdrop */}
      {backdropUrl ? (
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-surface-container-high" />
      )}

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/90 via-background/20 to-transparent" />

      {/* Content Container */}
      <div className="z-10 flex flex-col items-start gap-4 max-w-2xl">
        <span className="text-label-caps text-primary tracking-widest font-bold">
          Featured {mediaType === "movie" ? "Movie" : "Series"}
        </span>
        <h1 className="text-display-lg-mobile md:text-display-lg font-bold text-on-background drop-shadow-md">
          {title}
        </h1>
        <p className="text-body-sm md:text-body-lg text-on-background/80 drop-shadow max-w-xl line-clamp-3 md:line-clamp-4 leading-relaxed">
          {overview}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mt-4 w-full sm:w-auto">
          <Link href={playUrl} className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2">
              <Play fill="currentColor" size={20} />
              Play Now
            </Button>
          </Link>
          {profileId && (
            <MyListButton
              profileId={profileId}
              tmdbId={tmdbId}
              mediaType={mediaType}
              variant="secondary"
              size="lg"
            />
          )}
          <Link href={detailsUrl} className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full gap-2 border-surface-bright bg-surface/40 backdrop-blur-md">
              <Info size={20} />
              Details
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
