# FLIX - IMPLEMENTATION PLAN (Hybrid: TMDB + Mux + Supabase)
## Target: Working Demo by Thursday (4 Days)

---

## 🎯 SCOPE FOR THURSDAY (MVP)

| Feature | Source | Status |
|---------|--------|--------|
| Auth (Email/Google + Profile) | Supabase | ✅ Done |
| Home Page (Trending, Popular, Top Rated rows) | TMDB API | 🔄 Day 1-2 |
| Movie/Series Detail Page | TMDB API | 🔄 Day 2 |
| Search (Multi: movie + tv) | TMDB API | 🔄 Day 2 |
| Video Playback (Adaptive HLS, Resume) | Mux Player | 🔄 Day 1 |
| Continue Watching Row | Supabase watch_history + Mux | 🔄 Day 2 |
| My List (Add/Remove) | Supabase my_list | 🔄 Day 3 |
| Regional Content Filtering | TMDB watch/providers | 🔄 Day 3 |
| Profile Region Selection | Supabase profiles.region | 🔄 Day 3 |

**NOT in Thursday scope:** Admin CMS, Custom content DB, Recommendations ML, Payments, Multi-profile, TV apps.

---

## 🔐 API CREDENTIALS NEEDED (Create TODAY)

### 1. Supabase (Already Have)
| Credential | Where to Get |
|------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Settings → API **(Server only!)** |

### 2. TMDB (The Movie Database) - **Create Today**
```
1. Go to: https://www.themoviedb.org/settings/api
2. Login → "Create" → "Developer" → Fill form
3. Copy: API Key (v3 auth) = TMDB_API_KEY
4. Optional: Read Access Token (v4 auth) = TMDB_READ_ACCESS_TOKEN
```
**Rate Limits:** 40 req/10s (IP-based), 1000/day for development

### 3. Mux (Video Hosting + Player) - **Create Today**
```
1. Go to: https://dashboard.mux.com/signup
2. Create account → Verify email
3. Settings → Access Tokens → "Create Token"
   - Name: "Flix Production"
   - Permissions: "Mux Video: Read/Write"
4. Copy: Token ID = MUX_TOKEN_ID
   Copy: Token Secret = MUX_TOKEN_SECRET
5. Settings → Playback Domains → Note your domain (e.g., stream.mux.com)
6. Settings → Signing Keys → "Generate Signing Key" (for signed URLs)
   - Copy: Signing Key ID = MUX_SIGNING_KEY_ID
   - Copy: Private Key = MUX_SIGNING_KEY_PRIVATE (PEM format)
```
**Free Tier:** 500 min streaming, 50 GB storage, 100 live hours

### 4. Vercel (Deployment) - **Create Today**
```
1. Go to: https://vercel.com/signup
2. Connect GitHub → Import this repo
3. Add Environment Variables (see .env.production below)
4. Deploy
```

---

## 📁 ENVIRONMENT FILES

### `.env.local` (Development)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://iajcbrjkfofteqeqyzwe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# TMDB
TMDB_API_KEY=your_tmdb_v3_key
TMDB_READ_ACCESS_TOKEN=your_tmdb_v4_token
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# Mux
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
MUX_SIGNING_KEY_ID=your_signing_key_id
MUX_SIGNING_KEY_PRIVATE="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
NEXT_PUBLIC_MUX_PLAYBACK_DOMAIN=stream.mux.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### `.env.production` (Vercel)
```env
# Same as above but:
NEXT_PUBLIC_APP_URL=https://flix-yourname.vercel.app
# Add in Vercel Dashboard → Settings → Environment Variables
```

---

## 🗄️ DATABASE MIGRATIONS (Run Before Day 1)

```bash
# 1. Link Supabase (if not done)
npx supabase link --project-ref iajcbrjkfofteqeqyzwe

# 2. Create migration files in supabase/migrations/
```

**Migration 1: `20260726000001_watch_history.sql`**
```sql
create table if not exists watch_history (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  tmdb_id bigint not null,                    -- TMDB movie/TV ID
  media_type text not null check (media_type in ('movie', 'tv')),
  season_number int,                          -- null for movies
  episode_number int,                         -- null for movies
  episode_tmdb_id bigint,                     -- TMDB episode ID
  progress_seconds int default 0,
  duration_seconds int,
  completed boolean default false,
  completed_at timestamptz,
  mux_playback_id text,                       -- For resume
  device text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (profile_id, tmdb_id, media_type, season_number, episode_number)
);

create index idx_watch_history_profile_updated on watch_history(profile_id, updated_at desc);
create index idx_watch_history_continue on watch_history(profile_id, completed, updated_at desc) 
  where completed = false and progress_seconds > 0;

alter table watch_history enable row level security;
create policy "Users can view own watch history" on watch_history for select using (auth.uid() = user_id);
create policy "Users can insert own watch history" on watch_history for insert with check (auth.uid() = user_id);
create policy "Users can update own watch history" on watch_history for update using (auth.uid() = user_id);
```

**Migration 2: `20260726000002_my_list.sql`**
```sql
create table if not exists my_list (
  id bigserial primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  tmdb_id bigint not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  added_at timestamptz default now(),
  unique (profile_id, tmdb_id, media_type)
);

alter table my_list enable row level security;
create policy "Users can manage own list" on my_list for all using (auth.uid() = (select user_id from profiles where id = profile_id));
```

**Migration 3: `20260726000003_profiles_region.sql`**
```sql
-- Extend existing profiles table
alter table profiles add column if not exists region text default 'US';
alter table profiles add column if not exists language text default 'en';
alter table profiles add column if not exists maturity_rating text default 'TV-MA';
alter table profiles add column if not exists is_kids boolean default false;
alter table profiles add column if not exists avatar_url text;

-- Update RLS to include new columns
-- (existing policies already cover all columns)
```

**Apply Migrations:**
```bash
npx supabase db push
```

---

## 📦 NEW DEPENDENCIES (Install Day 1)

```bash
npm i @mux/playback-react @mux/mux-node date-fns
npm i -D @types/node
```

---

## 📂 FILE STRUCTURE TO CREATE

```
flix/
├── lib/
│   ├── tmdb.ts              # TMDB API wrapper with caching
│   ├── mux.ts               # Mux helpers (signed URLs, upload)
│   ├── supabase/
│   │   ├── server.ts        # Server client (already exists)
│   │   └── client.ts        # Browser client (already exists)
│   ├── auth.ts              # getUser, getProfile, getActiveProfile
│   └── utils.ts             # cn(), formatTime, etc.
│
├── app/
│   ├── actions/
│   │   ├── watch-history.ts     # updateProgress, getContinueWatching
│   │   ├── my-list.ts           # add, remove, getList
│   │   ├── profile.ts           # updateRegion, getActiveProfile
│   │   └── tmdb.ts              # Server-side TMDB fetches
│   │
│   ├── (main)/
│   │   ├── layout.tsx           # Already exists
│   │   ├── home/
│   │   │   └── page.tsx         # REWRITE: TMDB trending/popular rows
│   │   ├── browse/
│   │   │   └── page.tsx         # REWRITE: TMDB discover with filters
│   │   ├── search/
│   │   │   └── page.tsx         # NEW: TMDB search + results
│   │   ├── movie/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # REWRITE: TMDB details + providers
│   │   ├── tv/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # NEW: Series detail + seasons
│   │   ├── watch/
│   │   │   └── [playbackId]/
│   │   │       └── page.tsx     # REWRITE: Mux Player + sync
│   │   ├── my-list/
│   │   │   └── page.tsx         # NEW: Supabase my_list grid
│   │   ├── profile/
│   │   │   └── page.tsx         # UPDATE: Region selector
│   │   └── settings/
│   │       └── page.tsx         # NEW: Region, language, maturity
│   │
│   ├── api/
│   │   └── webhooks/
│   │       └── mux/
│   │           └── route.ts     # Mux webhooks (asset.ready, etc.)
│   │
│   ├── globals.css              # Already exists
│   └── layout.tsx               # Already exists
│
├── components/
│   ├── player/
│   │   ├── MuxPlayer.tsx        # NEW: Wrapper for @mux/playback-react
│   │   └── VideoControls.tsx    # NEW: Custom controls (optional)
│   ├── home/
│   │   ├── ContentRow.tsx       # NEW: Horizontal scroll row
│   │   ├── ContinueWatchingRow.tsx
│   │   ├── HeroSection.tsx      # NEW: Hero with Play/Trailer
│   │   └── SkeletonRow.tsx      # NEW: Loading skeleton
│   ├── movie/
│   │   ├── ContentDetail.tsx    # NEW: Metadata, cast, actions
│   │   ├── SeasonSelector.tsx   # NEW: Dropdown for TV
│   │   ├── EpisodeList.tsx      # NEW: Episodes with progress
│   │   ├── CastCrew.tsx         # NEW: TMDB credits
│   │   └── WatchProviders.tsx   # NEW: Regional providers
│   ├── search/
│   │   ├── SearchInput.tsx      # NEW: Debounced autocomplete
│   │   └── SearchResults.tsx    # NEW: Grid results
│   ├── ui/
│   │   ├── MovieCard.tsx        # UPDATE: TMDB image URLs
│   │   ├── Button.tsx           # Already exists
│   │   ├── Skeleton.tsx         # NEW: Loading placeholders
│   │   ├── ImageWithFallback.tsx
│   │   └── EmptyState.tsx
│   └── layout/
│       ├── Header.tsx           # Already exists
│       └── BottomNav.tsx        # Already exists
│
├── scripts/
│   └── test-tmdb.ts             # Test TMDB connection
│
├── supabase/migrations/
│   ├── 20260726000001_watch_history.sql
│   ├── 20260726000002_my_list.sql
│   └── 20260726000003_profiles_region.sql
│
├── .env.local
├── .env.production
├── next.config.ts               # UPDATE: TMDB image domains
└── middleware.ts                # UPDATE: Profile cookie
```

---

## 📅 DAY-BY-DAY EXECUTION PLAN

---

### DAY 1 (Today): Video Pipeline + TMDB Core

#### Morning (2-3 hrs): Mux Setup + Watch Page
```bash
# 1. Upload test video to Mux
# Dashboard → Video → Create Asset → Upload MP4
# Copy Playback ID

# 2. Create lib/mux.ts
```

**`lib/mux.ts`**
```typescript
import Mux from '@mux/mux-node';

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function getSignedPlaybackUrl(playbackId: string, expiresIn = 3600) {
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID!;
  const privateKey = process.env.MUX_SIGNING_KEY_PRIVATE!;
  // Use mux-node or jwt to sign
  // Simplified: return `https://${process.env.NEXT_PUBLIC_MUX_PLAYBACK_DOMAIN}/${playbackId}.m3u8`
  return `https://${process.env.NEXT_PUBLIC_MUX_PLAYBACK_DOMAIN}/${playbackId}.m3u8`;
}

export async function createDirectUpload() {
  const upload = await mux.video.uploads.create({
    new_asset_settings: { playback_policy: ['public'], test: false },
    cors_origin: process.env.NEXT_PUBLIC_APP_URL,
  });
  return upload;
}
```

**`components/player/MuxPlayer.tsx`**
```tsx
'use client';
import { MuxPlayer } from '@mux/playback-react';
import { useEffect, useRef } from 'react';
import { updateWatchProgress } from '@/actions/watch-history';

interface Props {
  playbackId: string;
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  initialTime?: number;
  onEnded?: () => void;
}

export function MuxPlayerComponent({
  playbackId,
  profileId,
  tmdbId,
  mediaType,
  seasonNumber,
  episodeNumber,
  initialTime = 0,
  onEnded,
}: Props) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const heartbeatRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (initialTime > 0) {
      player.currentTime = initialTime;
    }

    const sendHeartbeat = async () => {
      if (!player.paused && !player.ended) {
        await updateWatchProgress({
          profileId,
          tmdbId,
          mediaType,
          seasonNumber,
          episodeNumber,
          progressSeconds: Math.floor(player.currentTime),
          durationSeconds: Math.floor(player.duration),
        });
      }
    };

    heartbeatRef.current = setInterval(sendHeartbeat, 15000);
    player.addEventListener('ended', () => {
      updateWatchProgress({
        profileId,
        tmdbId,
        mediaType,
        seasonNumber,
        episodeNumber,
        progressSeconds: Math.floor(player.duration),
        durationSeconds: Math.floor(player.duration),
      });
      onEnded?.();
    });

    return () => {
      clearInterval(heartbeatRef.current);
      sendHeartbeat();
    };
  }, [profileId, tmdbId, mediaType, seasonNumber, episodeNumber, initialTime, onEnded]);

  return (
    <MuxPlayer
      ref={playerRef}
      playback-id={playbackId}
      metadata={{
        video_title: `TMDB:${tmdbId}`,
        video_type: mediaType,
        video_series_season: seasonNumber?.toString(),
        video_series_episode: episodeNumber?.toString(),
      }}
      stream-type="on-demand"
      default-muted={false}
      auto-play
      style={{ width: '100%', height: '100%' }}
    />
  );
}
```

**`app/(main)/watch/[playbackId]/page.tsx`** (Server Component)
```tsx
import { getActiveProfile } from '@/lib/auth';
import { MuxPlayerComponent } from '@/components/player/MuxPlayer';
import { getSignedPlaybackUrl } from '@/lib/mux';

interface Props {
  params: Promise<{ playbackId: string }>;
  searchParams: Promise<{ tmdbId: string; type: string; season?: string; episode?: string }>;
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { playbackId } = await params;
  const { tmdbId, type, season, episode } = await searchParams;
  const profile = await getActiveProfile();
  
  if (!profile) return <div>Loading...</div>;

  const signedUrl = await getSignedPlaybackUrl(playbackId);
  const initialTime = 0; // TODO: fetch from watch_history

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <MuxPlayerComponent
        playbackId={playbackId}
        profileId={profile.id}
        tmdbId={Number(tmdbId)}
        mediaType={type as 'movie' | 'tv'}
        seasonNumber={season ? Number(season) : undefined}
        episodeNumber={episode ? Number(episode) : undefined}
        initialTime
        onEnded={() => { /* next episode logic */ }}
      />
    </div>
  );
}
```

#### Afternoon (2-3 hrs): TMDB Wrapper + Home Page

**`lib/tmdb.ts`**
```typescript
const BASE = process.env.TMDB_BASE_URL!;
const KEY = process.env.TMDB_API_KEY!;
const IMG = process.env.TMDB_IMAGE_BASE_URL!;

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
```

**`app/(main)/home/page.tsx`** (Server Component - REWRITE)
```tsx
import { tmdb } from '@/lib/tmdb';
import { getActiveProfile } from '@/lib/auth';
import { ContentRow } from '@/components/home/ContentRow';
import { HeroSection } from '@/components/home/HeroSection';
import { ContinueWatchingRow } from '@/components/home/ContinueWatchingRow';
import { getContinueWatching } from '@/actions/watch-history';

export default async function HomePage() {
  const profile = await getActiveProfile();
  const region = profile?.region || 'US';

  // Parallel fetches
  const [trending, popularMovies, popularTV, topRated, continueWatching] = await Promise.all([
    tmdb.trending('all', 'week'),
    tmdb.popular('movie', 1),
    tmdb.popular('tv', 1),
    tmdb.topRated('movie', 1),
    profile ? getContinueWatching(profile.id) : Promise.resolve([]),
  ]);

  // Get hero from trending first movie
  const hero = trending.results.find((r: any) => r.media_type === 'movie' && r.backdrop_path);

  return (
    <div className="flex flex-col gap-12 pb-12">
      {hero && (
        <HeroSection
          title={hero.title || hero.name}
          overview={hero.overview}
          backdropUrl={tmdb.backdrop(hero.backdrop_path, 'w1280')}
          tmdbId={hero.id}
          mediaType={hero.media_type}
        />
      )}

      {continueWatching.length > 0 && (
        <ContinueWatchingRow items={continueWatching} />
      )}

      <ContentRow
        title="Trending This Week"
        items={trending.results.slice(0, 15)}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />

      <ContentRow
        title="Popular Movies"
        items={popularMovies.results.slice(0, 15)}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />

      <ContentRow
        title="Popular TV Shows"
        items={popularTV.results.slice(0, 15)}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />

      <ContentRow
        title="Top Rated Movies"
        items={topRated.results.slice(0, 15)}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
      />
    </div>
  );
}
```

---

### DAY 2: Movie/TV Detail + Search + Watch Integration

#### Morning: Movie Detail Page
**`app/(main)/movie/[id]/page.tsx`** (Server Component)
```tsx
import { tmdb } from '@/lib/tmdb';
import { getActiveProfile } from '@/lib/auth';
import { ContentDetail } from '@/components/movie/ContentDetail';
import { WatchProviders } from '@/components/movie/WatchProviders';
import { notFound } from 'next/navigation';

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getActiveProfile();
  const region = profile?.region || 'US';

  const [movie, providers] = await Promise.all([
    tmdb.movieDetails(Number(id)),
    tmdb.providers('movie', Number(id)),
  ]);

  if (!movie.id) notFound();

  const providersByRegion = providers.results?.[region];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <ContentDetail
        item={movie}
        mediaType="movie"
        providers={providersByRegion}
        tmdb={tmdb}
      />
      <WatchProviders providers={providersByRegion} />
    </div>
  );
}
```

#### Afternoon: TV Detail + Seasons + Search
**`app/(main)/tv/[id]/page.tsx`** (Server Component)
```tsx
import { tmdb } from '@/lib/tmdb';
import { getActiveProfile } from '@/lib/auth';
import { ContentDetail } from '@/components/movie/ContentDetail';
import { SeasonSelector } from '@/components/movie/SeasonSelector';
import { EpisodeList } from '@/components/movie/EpisodeList';
import { notFound } from 'next/navigation';

export default async function TVPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}) {
  const { id } = await params;
  const { season: seasonParam, episode: episodeParam } = await searchParams;
  const profile = await getActiveProfile();
  const region = profile?.region || 'US';

  const [tv, providers] = await Promise.all([
    tmdb.tvDetails(Number(id)),
    tmdb.providers('tv', Number(id)),
  ]);

  if (!tv.id) notFound();

  const seasonNumber = seasonParam ? Number(seasonParam) : (tv.seasons?.[0]?.season_number || 1);
  const seasonData = await tmdb.seasonDetails(Number(id), seasonNumber);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <ContentDetail
        item={tv}
        mediaType="tv"
        providers={providers.results?.[region]}
        tmdb={tmdb}
      />
      <SeasonSelector
        seasons={tv.seasons}
        currentSeason={seasonNumber}
        onChange={(s) => window.location.href = `/tv/${id}?season=${s}`}
      />
      <EpisodeList
        episodes={seasonData.episodes}
        tmdbId={Number(id)}
        seasonNumber
        profileId={profile?.id}
        tmdb={tmdb}
      />
    </div>
  );
}
```

**`app/(main)/search/page.tsx`** (Client Component)
```tsx
'use client';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { SearchResults } from '@/components/search/SearchResults';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="px-4 py-6 md:px-12">
      <h1 className="text-display-lg mb-6">Search</h1>
      <div className="relative max-w-xl mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, TV shows..."
          className="h-12 w-full rounded border border-surface-bright bg-surface-container pl-10 pr-4 text-body-sm"
        />
      </div>
      {loading && <div className="flex gap-4">Loading...</div>}
      <SearchResults items={results} query={query} />
    </div>
  );
}
```

**`app/api/search/route.ts`**
```tsx
import { tmdb } from '@/lib/tmdb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) return NextResponse.json({ results: [] });
  
  const data = await tmdb.search(q);
  return NextResponse.json(data);
}
```

---

### DAY 3: User Features + Regional + Polish

#### Morning: My List + Continue Watching Actions
**`app/actions/watch-history.ts`**
```tsx
'use server';
import { createClient } from '@/lib/supabase/server';

export async function updateWatchProgress({
  profileId,
  tmdbId,
  mediaType,
  seasonNumber,
  episodeNumber,
  progressSeconds,
  durationSeconds,
}: {
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  progressSeconds: number;
  durationSeconds: number;
}) {
  const supabase = await createClient();
  const completed = progressSeconds >= durationSeconds * 0.9;

  const { error } = await supabase.from('watch_history').upsert({
    profile_id: profileId,
    tmdb_id: tmdbId,
    media_type: mediaType,
    season_number: seasonNumber,
    episode_number: episodeNumber,
    progress_seconds: progressSeconds,
    duration_seconds: durationSeconds,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'profile_id,tmdb_id,media_type,season_number,episode_number'
  });

  if (error) throw error;
}

export async function getContinueWatching(profileId: string, limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('watch_history')
    .select('*')
    .eq('profile_id', profileId)
    .eq('completed', false)
    .gt('progress_seconds', 0)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
```

**`app/actions/my-list.ts`**
```tsx
'use server';
import { createClient } from '@/lib/supabase/server';

export async function toggleMyList({
  profileId,
  tmdbId,
  mediaType,
}: {
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}) {
  const supabase = await createClient();
  
  const { data: existing } = await supabase
    .from('my_list')
    .select('id')
    .eq('profile_id', profileId)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .single();

  if (existing) {
    await supabase.from('my_list').delete().eq('id', existing.id);
    return { added: false };
  } else {
    await supabase.from('my_list').insert({
      profile_id: profileId,
      tmdb_id: tmdbId,
      media_type: mediaType,
    });
    return { added: true };
  }
}

export async function getMyList(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('my_list')
    .select('*')
    .eq('profile_id', profileId)
    .order('added_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
```

#### Afternoon: Region Selector + Profile Page Update
**`app/actions/profile.ts`**
```tsx
'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function updateProfileRegion(region: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({ region })
    .eq('id', user.id);

  if (error) throw error;
  
  // Set cookie for middleware
  const response = new Response();
  response.headers.set('Set-Cookie', `user_region=${region}; Path=/; Max-Age=2592000; SameSite=Lax`);
  return { success: true };
}

export async function getActiveProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data;
}
```

**`app/(main)/profile/page.tsx`** (UPDATE - Add Region Selector)
```tsx
// Add to existing profile page:
import { updateProfileRegion } from '@/actions/profile';

const regions = [
  { code: 'US', name: 'United States' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'BR', name: 'Brazil' },
  // Add more as needed
];

// In the profile options section:
<form action={async (formData) => {
  'use server';
  await updateProfileRegion(formData.get('region') as string);
}}>
  <select name="region" defaultValue={region} className="...">
    {regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
  </select>
  <Button type="submit">Save Region</Button>
</form>
```

**`middleware.ts`** (UPDATE - Read Region Cookie)
```typescript
// In updateSession function:
const region = request.cookies.get('user_region')?.value || 'US';
const response = NextResponse.next();
response.headers.set('x-user-region', region); // For server components
return response;
```

---

### DAY 4: Polish + Deploy + Test

#### Morning: Components Polish
- [ ] `components/ui/Skeleton.tsx` - MovieCard, Row, Hero skeletons
- [ ] `components/ui/ImageWithFallback.tsx` - Blur placeholder + error fallback
- [ ] `components/home/HeroSection.tsx` - Play button → `/watch`
- [ ] `components/home/ContinueWatchingRow.tsx` - Progress bar + resume
- [ ] `components/movie/WatchProviders.tsx` - TMDB providers logos (flatrate, rent, buy)
- [ ] `components/search/SearchResults.tsx` - Grid with MovieCard
- [ ] Error boundaries (`components/ErrorBoundary.tsx`)
- [ ] Loading states (`loading.tsx` in each route)

#### Afternoon: Deploy to Vercel
```bash
# 1. Push to GitHub
git add . && git commit -m "Thursday MVP" && git push

# 2. Vercel Dashboard → Import Project
# 3. Add ALL env vars from .env.production
# 4. Deploy

# 5. Test production:
# - Signup/Login
# - Browse Home rows
# - Search
# - Movie detail → Play (Mux test video)
# - Resume video
# - Add to My List
# - Change region → refresh → verify providers change
```

#### Final Test Checklist
- [ ] Auth: Register → Login → Profile persists
- [ ] Home: 4+ rows load (Trending, Popular Movies, Popular TV, Top Rated)
- [ ] Search: Type → Results appear (debounced)
- [ ] Movie Detail: Metadata, Cast, Trailer, Providers for region
- [ ] TV Detail: Seasons dropdown → Episodes list
- [ ] Watch: Mux player loads → Play → Progress saves → Refresh → Resume
- [ ] Continue Watching: Appears on Home after watching
- [ ] My List: Add/Remove → Persists → Page shows items
- [ ] Region: Change in Profile → Providers update on detail pages
- [ ] Mobile: Bottom nav works, responsive grids
- [ ] No console errors, no hydration mismatches

---

## 🚀 QUICK START COMMANDS (Run Now)

```bash
# 1. Activate env
conda activate flix

# 2. Install new deps
npm i @mux/playback-react @mux/mux-node date-fns

# 3. Create migrations
mkdir -p supabase/migrations
# Create the 3 SQL files from above

# 4. Push migrations
npx supabase db push

# 5. Create .env.local with ALL keys (Supabase, TMDB, Mux)

# 6. Start dev
npm run dev

# 7. Test TMDB connection
npx tsx scripts/test-tmdb.ts
```

---

## 📝 TMDB TEST SCRIPT

**`scripts/test-tmdb.ts`**
```typescript
import { tmdb } from '../lib/tmdb';

async function test() {
  console.log('Testing TMDB...');
  
  const trending = await tmdb.trending('movie', 'week');
  console.log('Trending:', trending.results.length, 'results');
  console.log('First:', trending.results[0]?.title);

  const search = await tmdb.search('Inception');
  console.log('Search:', search.results.length, 'results');

  const movie = await tmdb.movieDetails(27205); // Inception
  console.log('Movie details:', movie.title, movie.genres?.map((g: any) => g.name).join(', '));
  
  const providers = await tmdb.providers('movie', 27205);
  console.log('Providers US:', Object.keys(providers.results?.US || {}));
  
  console.log('✅ TMDB working!');
}

test().catch(console.error);
```

Run: `npx tsx scripts/test-tmdb.ts`

---

## ⚠️ COMMON ISSUES & FIXES

| Issue | Fix |
|-------|-----|
| TMDB images 404 | Add `image.tmdb.org` to `next.config.ts` images.remotePatterns |
| Mux player black screen | Verify playback ID is correct, check signed URL if using signed URLs |
| Hydration mismatch | Ensure server/client render same data; use `suppressHydrationWarning` on dynamic attrs |
| Region not filtering | Check middleware sets `x-user-region` header; server components read from headers |
| Continue Watching empty | Verify `watch_history` RLS policies allow insert/select for authenticated user |
| Search slow | Add debounce (300ms), cache TMDB responses with `next: { revalidate: 3600 }` |

---

## 📞 NEED HELP?

Priority order for Thursday:
1. **Mux video playing** → Without this, no demo
2. **Home page rows from TMDB** → Core browsing
3. **Movie detail + Play button** → Full flow
4. **Continue Watching** → Killer feature
5. **Region providers** → Differentiator

Everything else can be mocked or skipped for Thursday.

**Start with Mux + TMDB connection test NOW.**