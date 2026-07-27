import { tmdb } from "@/lib/tmdb";
import { MovieCard } from "@/components/ui/MovieCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ genre?: string }>;
}

const genres = [
  { id: 'all', name: 'All' },
  { id: '28', name: 'Action' },
  { id: '35', name: 'Comedy' },
  { id: '18', name: 'Drama' },
  { id: '878', name: 'Sci-Fi' },
  { id: '53', name: 'Thriller' },
  { id: '27', name: 'Horror' },
  { id: '99', name: 'Documentary' },
];

export default async function BrowsePage({ searchParams }: Props) {
  const { genre = 'all' } = await searchParams;

  let results = [];
  try {
    if (genre === 'all') {
      const data = await tmdb.popular('movie', 1);
      results = data.results || [];
    } else {
      const data = await tmdb.discover({ with_genres: genre });
      results = data.results || [];
    }
  } catch (err) {
    console.error("Error fetching discover data:", err);
  }

  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-12 md:py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">
          Browse
        </h1>
      </div>

      {/* Categories Row */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-surface-bright scrollbar-track-transparent">
        {genres.map((g) => {
          const isActive = genre === g.id;
          const href = `/browse${g.id === 'all' ? '' : `?genre=${g.id}`}`;

          return (
            <Link key={g.id} href={href} className="shrink-0">
              <Button
                variant={isActive ? "primary" : "secondary"}
                size="sm"
                className="pointer-events-none" // handled by link wrapper
              >
                {g.name}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {results.map((item: any) => {
          const itemTitle = item.title || item.name || "Untitled";
          const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
          const id = item.id;
          
          const year = item.release_date || item.first_air_date
            ? new Date(item.release_date || item.first_air_date).getFullYear().toString()
            : "";
          const rating = item.vote_average ? `${item.vote_average.toFixed(1)} ★` : "";
          const metadata = [year, rating].filter(Boolean).join(" | ");

          const imageUrl = tmdb.image(item.poster_path, "w342");

          return (
            <Link key={`${mediaType}-${id}`} href={`/${mediaType}/${id}`}>
              <MovieCard
                title={itemTitle}
                metadata={metadata}
                imageUrl={imageUrl || undefined}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
