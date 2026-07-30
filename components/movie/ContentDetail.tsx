import * as React from "react";
import { Play, ThumbsUp, Share2, Calendar, Clock, Film, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MyListButton } from "./MyListButton";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import Link from "next/link";
import { buildWatchUrl } from "@/lib/playback";

interface ContentDetailProps {
  item: any;
  mediaType: "movie" | "tv";
  providers?: any;
  tmdb: any;
  profileId?: string;
  playableContent?: { available_regions: string[], mux_playback_id: string } | null;
  userRegion?: string;
  isDemoMode?: boolean;
}

export function ContentDetail({
  item,
  mediaType,
  providers,
  tmdb,
  profileId,
  playableContent,
  userRegion,
  isDemoMode,
}: ContentDetailProps) {
  const title = item.title || item.name || "Untitled";
  const backdropUrl = tmdb.backdrop(item.backdrop_path, "original");
  const posterUrl = tmdb.image(item.poster_path, "w500");

  const releaseYear = item.release_date || item.first_air_date
    ? new Date(item.release_date || item.first_air_date).getFullYear()
    : null;

  const duration = item.runtime
    ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`
    : item.number_of_seasons
      ? `${item.number_of_seasons} Season${item.number_of_seasons > 1 ? 's' : ''}`
      : null;

  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const genres = item.genres || [];

  const youtubeVideos = (item.videos?.results || []).filter(
    (v: any) => v.site?.toLowerCase() === "youtube" && v.key
  );

  const trailer =
    youtubeVideos.find((v: any) => v.type?.toLowerCase() === "trailer" && v.official) ||
    youtubeVideos.find((v: any) => v.type?.toLowerCase() === "trailer") ||
    youtubeVideos.find((v: any) => v.type?.toLowerCase() === "teaser") ||
    youtubeVideos.find((v: any) => v.type?.toLowerCase() === "clip") ||
    youtubeVideos[0];

  // The background trailer and Play use separate YouTube player instances.
  const playUrl = buildWatchUrl(playableContent?.mux_playback_id || null, {
    tmdbId: item.id,
    type: mediaType,
    season: mediaType === "tv" ? 1 : undefined,
    episode: mediaType === "tv" ? 1 : undefined,
    demoMode: isDemoMode ? 'all' : undefined,
  });

  const isPlayable = isDemoMode
    ? !!playableContent?.mux_playback_id
    : playableContent?.available_regions?.includes(userRegion || 'US') && !!playableContent?.mux_playback_id;

  // Cast members (Top 5)
  const cast = item.credits?.cast?.slice(0, 5) || [];
  const director = item.credits?.crew?.find((c: any) => c.job === "Director")?.name ||
    item.created_by?.[0]?.name;

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Poster / Backdrop / Video */}
      <section className="relative h-[45vh] w-full md:h-[65vh] overflow-hidden bg-surface-container-high">
        {trailer ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailer.key}&modestbranding=1&playsinline=1&enablejsapi=1`}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="w-full h-full object-cover scale-[1.35] opacity-80"
              style={{ border: 0 }}
            />
          </div>
        ) : backdropUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </section>

      {/* Details Container */}
      <div className="relative -mt-32 px-4 md:-mt-48 md:px-12 z-10">
        <div className="flex flex-col md:flex-row md:gap-12 items-start">
          {/* Poster (Desktop) */}
          <div className="hidden shrink-0 md:block w-[280px] aspect-[2/3] overflow-hidden rounded-lg bg-surface-container shadow-2xl relative border border-surface-bright/40">
            <ImageWithFallback
              src={posterUrl || ""}
              alt={title}
              fill
              className="object-cover"
              sizes="280px"
            />
          </div>

          <div className="flex flex-col gap-6 flex-1 w-full">
            <div>
              <h1 className="text-display-lg-mobile md:text-display-lg font-bold text-on-background drop-shadow">
                {title}
              </h1>

              {/* Badges / Meta Info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-body-sm text-muted">
                {releaseYear && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {releaseYear}
                  </span>
                )}
                {duration && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {duration}
                  </span>
                )}
                {rating && (
                  <span className="flex items-center gap-1 text-primary-container font-semibold bg-primary/10 px-2 py-0.5 rounded text-xs">
                    <Star size={12} className="fill-primary text-primary" />
                    {rating} TMDB
                  </span>
                )}
                {item.maturity_rating && (
                  <span className="border border-muted/30 px-1.5 py-0.5 rounded text-xs font-semibold uppercase">
                    {item.maturity_rating}
                  </span>
                )}
              </div>

              {/* Genres badges */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {genres.map((g: any) => (
                    <span
                      key={g.id}
                      className="text-xs bg-surface-container-high text-on-surface px-2.5 py-1 rounded-full border border-surface-bright/30"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full">
              {isPlayable ? (
                <Link href={playUrl} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2">
                    <Play fill="currentColor" size={20} />
                    Play
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="w-full sm:w-auto gap-2" disabled>
                  Not available
                </Button>
              )}
              {profileId && (
                <MyListButton
                  profileId={profileId}
                  tmdbId={item.id}
                  mediaType={mediaType}
                  variant="secondary"
                  size="lg"
                />
              )}
              <Button variant="secondary" size="icon" title="Like">
                <ThumbsUp size={20} />
              </Button>
              <Button variant="secondary" size="icon" title="Share">
                <Share2 size={20} />
              </Button>
            </div>

            {/* Synopsis */}
            {item.overview && (
              <div className="mt-2 border-t border-surface-bright/30 pt-6">
                <h3 className="text-body-lg font-semibold text-on-background mb-2">Synopsis</h3>
                <p className="text-body-sm text-on-background/80 leading-relaxed max-w-3xl">
                  {item.overview}
                </p>
              </div>
            )}

            {/* Cast & Crew Summary */}
            <div className="flex flex-col gap-2 mt-2 border-t border-surface-bright/30 pt-6">
              {cast.length > 0 && (
                <p className="text-body-sm text-muted">
                  <strong className="text-on-background">Starring:</strong>{" "}
                  {cast.map((c: any) => c.name).join(", ")}
                </p>
              )}
              {director && (
                <p className="text-body-sm text-muted">
                  <strong className="text-on-background">Director:</strong> {director}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
