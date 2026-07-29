import { tmdb } from '@/lib/tmdb';
import { getActiveProfile, getUserRegion } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ContentRow } from '@/components/home/ContentRow';
import { HeroSection } from '@/components/home/HeroSection';
import { ContinueWatchingRow } from '@/components/home/ContinueWatchingRow';
import { getContinueWatching } from '@/app/actions/watch-history';
import { getMessages, getTmdbLanguage } from '@/lib/i18n';
import { getDemoMode } from '@/lib/demo';

export default async function HomePage() {
  const profile = await getActiveProfile();
  const region = await getUserRegion();
  const language = getTmdbLanguage(profile?.language);
  const t = getMessages(profile?.language);
  const demoMode = await getDemoMode();

  // Parallel fetches
  const supabase = await createClient();
  const [
    trending,
    popularMovies,
    popularTV,
    topRated,
    continueWatching,
    { data: playableContent }
  ] = await Promise.all([
    tmdb.trending('all', 'week', language),
    tmdb.popular('movie', 1, region, language),
    tmdb.popular('tv', 1, region, language),
    tmdb.topRated('movie', 1, region, language),
    profile ? getContinueWatching(profile.id) : Promise.resolve([]),
    supabase.from('playable_content').select('tmdb_id, available_regions')
  ]);

  // Filter TMDB results against playable_content for best-effort region gating
  const filterResults = (results: any[] = []) => {
    if (demoMode) return results;
    return results.filter((item) => {
      const dbEntry = playableContent?.find((pc) => pc.tmdb_id === item.id);
      return dbEntry && dbEntry.available_regions.includes(region);
    });
  };

  const trendingResults = filterResults(trending?.results);
  const popularMoviesResults = filterResults(popularMovies?.results);
  const popularTvResults = filterResults(popularTV?.results);
  const topRatedResults = filterResults(topRated?.results);

  // Get hero from trending first movie
  const hero = trendingResults?.find((r: any) => r.media_type === 'movie' && r.backdrop_path) ||
    trendingResults?.[0];

  return (
    <div className="flex flex-col gap-12 pb-12">
      {hero && (
        <HeroSection
          title={hero.title || hero.name}
          overview={hero.overview}
          backdropUrl={tmdb.backdrop(hero.backdrop_path, 'w1280')}
          tmdbId={hero.id}
          mediaType={hero.media_type || 'movie'}
          profileId={profile?.id}
        />
      )}

      {continueWatching && continueWatching.length > 0 && (
        <ContinueWatchingRow items={continueWatching} title={t.continueWatching} />
      )}

      <ContentRow
        title={t.trendingThisWeek}
        items={trendingResults?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />

      <ContentRow
        title={t.popularMovies}
        items={popularMoviesResults?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />

      <ContentRow
        title={t.popularTvShows}
        items={popularTvResults?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />

      <ContentRow
        title={t.topRatedMovies}
        items={topRatedResults?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />
    </div>
  );
}
