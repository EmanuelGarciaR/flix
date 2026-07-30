import { tmdb } from '@/lib/tmdb';
import { getActiveProfile } from '@/lib/auth';
import { ContentDetail } from '@/components/movie/ContentDetail';
import { CastCrew } from '@/components/movie/CastCrew';
import { ContentRow } from '@/components/home/ContentRow';
import { notFound } from 'next/navigation';
import { getTmdbLanguage } from '@/lib/i18n';
import { getDemoMode } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const profile = await getActiveProfile();
  const region = profile?.region || 'US';
  const language = getTmdbLanguage(profile?.language);
  const demoMode = await getDemoMode();

  let movie;
  let providers;
  try {
    [movie, providers] = await Promise.all([
      tmdb.movieDetails(Number(id), language),
      tmdb.providers('movie', Number(id)),
    ]);
  } catch (err) {
    console.error("Error loading movie detail:", err);
    notFound();
  }

  if (!movie || !movie.id) notFound();

  const supabase = await createClient();
  const { data: playableContent } = await supabase
    .from('playable_content')
    .select('available_regions, mux_playback_id')
    .eq('tmdb_id', Number(id))
    .maybeSingle();

  const providersByRegion = providers?.results?.[region];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <ContentDetail
        item={movie}
        mediaType="movie"
        providers={providersByRegion}
        tmdb={tmdb}
        profileId={profile?.id}
        playableContent={playableContent}
        userRegion={region}
        isDemoMode={demoMode}
      />
      <CastCrew cast={movie.credits?.cast || []} tmdb={tmdb} />
      {movie.recommendations?.results && movie.recommendations.results.length > 0 && (
        <ContentRow
          title="Similar Titles"
          items={movie.recommendations.results}
          getImage={(item) => tmdb.image(item.poster_path, 'w342')}
        />
      )}
    </div>
  );
}
