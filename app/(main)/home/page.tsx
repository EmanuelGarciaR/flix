import { tmdb } from '@/lib/tmdb';
import { getActiveProfile } from '@/lib/auth';
import { ContentRow } from '@/components/home/ContentRow';
import { HeroSection } from '@/components/home/HeroSection';
import { ContinueWatchingRow } from '@/components/home/ContinueWatchingRow';
import { getContinueWatching } from '@/app/actions/watch-history';

export default async function HomePage() {
  const profile = await getActiveProfile();
  const region = profile?.region || 'US';

  // Parallel fetches
  const [trending, popularMovies, popularTV, topRated, continueWatching] = await Promise.all([
    tmdb.trending('all', 'week'),
    tmdb.popular('movie', 1, region),
    tmdb.popular('tv', 1, region),
    tmdb.topRated('movie', 1, region),
    profile ? getContinueWatching(profile.id) : Promise.resolve([]),
  ]);

  // Get hero from trending first movie
  const hero = trending.results?.find((r: any) => r.media_type === 'movie' && r.backdrop_path) || 
               trending.results?.[0];

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
        <ContinueWatchingRow items={continueWatching} />
      )}

      <ContentRow
        title="Trending This Week"
        items={trending.results?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />

      <ContentRow
        title="Popular Movies"
        items={popularMovies.results?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />

      <ContentRow
        title="Popular TV Shows"
        items={popularTV.results?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />

      <ContentRow
        title="Top Rated Movies"
        items={topRated.results?.slice(0, 15) || []}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />
    </div>
  );
}
