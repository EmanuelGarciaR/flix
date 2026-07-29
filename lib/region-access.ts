import { createClient } from '@/lib/supabase/server';

/**
 * USAGE EXAMPLE (For Mux token-generation code):
 * 
 * import { getUserRegion, isMovieAvailableInRegion, isDemoModeActive } from '@/lib/region-access';
 * 
 * export async function generateMuxToken(req: Request) {
 *   const { searchParams } = new URL(req.url);
 *   const tmdbId = Number(searchParams.get('tmdbId'));
 *   const userId = "current-user-id"; // get from auth context
 * 
 *   // 1. Check if demo mode is active via explicit signal
 *   const demoMode = isDemoModeActive(searchParams);
 * 
 *   // 2. Only enforce region check if demo mode is NOT active
 *   if (!demoMode) {
 *     const region = await getUserRegion(userId);
 *     const isAvailable = await isMovieAvailableInRegion(tmdbId, region);
 *     
 *     if (!isAvailable) {
 *       return new Response("Not available in your region", { status: 403 });
 *     }
 *   }
 * 
 *   // 3. Proceed with generating token...
 * }
 */

/**
 * Returns the user's current region from their profile.
 * Defaults to 'US' if no region is set or profile is not found.
 */
export async function getUserRegion(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('region')
    .eq('id', userId)
    .single();

  return data?.region || 'US';
}

/**
 * Looks up playable_content by tmdb_id and checks if the given region
 * is in available_regions. Returns false if the tmdb_id isn't found.
 */
export async function isMovieAvailableInRegion(tmdbId: number, region: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('playable_content')
    .select('available_regions')
    .eq('tmdb_id', tmdbId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return data.available_regions.includes(region);
}

/**
 * Checks for the explicit demoMode=all query param signal.
 */
export function isDemoModeActive(searchParams: URLSearchParams | Record<string, string>): boolean {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get('demoMode') === 'all';
  }
  return searchParams?.demoMode === 'all';
}
