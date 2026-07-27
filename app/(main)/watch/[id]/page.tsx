import { getActiveProfile } from '@/lib/auth';
import { MuxPlayerComponent } from '@/components/player/MuxPlayer';
import { createClient } from '@/lib/supabase/server';
import { tmdb } from '@/lib/tmdb';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>; // id corresponds to Mux playbackId
  searchParams: Promise<{ tmdbId: string; type: string; season?: string; episode?: string }>;
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { id: playbackId } = await params;
  const { tmdbId, type, season, episode } = await searchParams;
  
  const profile = await getActiveProfile();
  if (!profile) {
    redirect('/login');
  }

  if (!tmdbId || !type) {
    redirect('/home');
  }

  // Fetch initial resume progress from watch_history
  const supabase = await createClient();
  const isTv = type === 'tv';
  const seasonNum = season ? Number(season) : null;
  const epNum = episode ? Number(episode) : null;

  let query = supabase
    .from('watch_history')
    .select('progress_seconds')
    .eq('profile_id', profile.id)
    .eq('tmdb_id', Number(tmdbId))
    .eq('media_type', type);

  if (isTv) {
    query = query.eq('season_number', seasonNum).eq('episode_number', epNum);
  } else {
    // For movies, season and episode are null in unique index
    query = query.is('season_number', null).is('episode_number', null);
  }

  const { data: watchHistory } = await query.maybeSingle();
  const initialTime = watchHistory?.progress_seconds || 0;

  // Fetch title and poster path for metadata
  let title = "Video";
  let posterPath = "";

  try {
    if (isTv) {
      const show = await tmdb.tvDetails(Number(tmdbId));
      title = show.name || "TV Show";
      posterPath = show.poster_path || "";
      if (seasonNum !== null && epNum !== null) {
        title = `${title} (S${seasonNum}:E${epNum})`;
      }
    } else {
      const movie = await tmdb.movieDetails(Number(tmdbId));
      title = movie.title || "Movie";
      posterPath = movie.poster_path || "";
    }
  } catch (err) {
    console.error("Error fetching watch details:", err);
  }

  // Back button url
  const backUrl = isTv
    ? `/tv/${tmdbId}${season ? `?season=${season}` : ""}`
    : `/movie/${tmdbId}`;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      {playbackId.startsWith('youtube:') ? (
        <div className="relative w-full h-full">
          <iframe
            src={`https://www.youtube.com/embed/${playbackId.replace('youtube:', '')}?autoplay=1&fs=1&controls=1`}
            allow="autoplay; fullscreen; encrypted-media"
            className="w-full h-full"
            style={{ border: 0 }}
          />
          <Link
            href={backUrl}
            className="absolute top-6 left-6 z-50 p-3 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-colors"
            title="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
        </div>
      ) : (
        <MuxPlayerComponent
          playbackId={playbackId}
          profileId={profile.id}
          tmdbId={Number(tmdbId)}
          mediaType={type as 'movie' | 'tv'}
          title={title}
          posterPath={posterPath}
          seasonNumber={seasonNum !== null ? seasonNum : undefined}
          episodeNumber={epNum !== null ? epNum : undefined}
          initialTime={initialTime}
          backUrl={backUrl}
        />
      )}
    </div>
  );
}
