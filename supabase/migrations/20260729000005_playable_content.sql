create table if not exists public.playable_content (
  tmdb_id bigint primary key,
  mux_playback_id text not null,
  mux_asset_id text,
  available_regions text[] default '{}'::text[]
);

alter table public.playable_content enable row level security;

create policy "Playable content is viewable by everyone." on public.playable_content for select using (true);

alter table public.profiles add column if not exists region_source text default 'auto' check (region_source in ('auto', 'manual'));