import { createClient } from '@/lib/supabase/server';
import { getActiveProfile } from '@/lib/auth';

export type PlayableContent = {
  id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  mux_playback_id?: string;
  available_regions: string[];
  created_at: string;
};

export async function getUserRegion(): Promise<string> {
  const profile = await getActiveProfile();
  return profile?.region || 'US';
}

export function isDemoModeActive(
  searchParams: { [key: string]: string | string[] | undefined } | null
): boolean {
  if (!searchParams) return false;
  return searchParams.demoMode === 'all';
}

export async function getPlayableMoviesForRegion(region: string): Promise<PlayableContent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('playable_content')
    .select('*')
    .contains('available_regions', [region]);

  if (error) {
    console.error('Error fetching playable content for region:', error);
    return [];
  }
  return (data || []) as PlayableContent[];
}

export async function isTitlePlayableInRegion(tmdbId: number, region: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('playable_content')
    .select('id')
    .eq('tmdb_id', tmdbId)
    .contains('available_regions', [region])
    .maybeSingle();

  if (error) {
    console.error('Error checking title playability:', error);
    return false;
  }
  return !!data;
}
