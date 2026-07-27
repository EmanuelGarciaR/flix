const BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const KEY = process.env.TMDB_API_KEY || 'ffefb8a1d835920bd5152230950e867e';
const IMG = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set('api_key', KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);
  return res.json();
}

export const tmdb = {
  // Trending
  trending: (mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') =>
    fetchTMDB(`/trending/${mediaType}/${timeWindow}`, { language: 'en-US' }),

  // Popular
  popular: (mediaType: 'movie' | 'tv', page = 1) =>
    fetchTMDB(`/${mediaType}/popular`, { language: 'en-US', page: page.toString() }),

  // Top Rated
  topRated: (mediaType: 'movie' | 'tv', page = 1) =>
    fetchTMDB(`/${mediaType}/top_rated`, { language: 'en-US', page: page.toString() }),

  // Discover with filters
  discover: (params: Record<string, string>) =>
    fetchTMDB('/discover/movie', { ...params, language: 'en-US', sort_by: 'popularity.desc' }),

  // Discover TV
  discoverTV: (params: Record<string, string>) =>
    fetchTMDB('/discover/tv', { ...params, language: 'en-US', sort_by: 'popularity.desc' }),

  // Search
  search: (query: string, page = 1) =>
    fetchTMDB('/search/multi', { query, language: 'en-US', page: page.toString(), include_adult: 'false' }),

  // Details
  movieDetails: (id: number) =>
    fetchTMDB(`/movie/${id}`, { language: 'en-US', append_to_response: 'credits,videos,watch/providers,recommendations' }),
  
  tvDetails: (id: number) =>
    fetchTMDB(`/tv/${id}`, { language: 'en-US', append_to_response: 'credits,videos,watch/providers,recommendations,aggregate_credits' }),

  // Season/Episode
  seasonDetails: (tvId: number, seasonNumber: number) =>
    fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`, { language: 'en-US' }),

  // Providers (Regional)
  providers: (mediaType: 'movie' | 'tv', id: number) =>
    fetchTMDB(`/${mediaType}/${id}/watch/providers`, {}),

  // Images
  image: (path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') =>
    path ? `${IMG}/${size}${path}` : null,

  backdrop: (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280') =>
    path ? `${IMG}/${size}${path}` : null,
};
