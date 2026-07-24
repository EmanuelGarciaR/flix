import { MovieCard } from "@/components/ui/MovieCard"
import { Button } from "@/components/ui/Button"
import { Play, Plus } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] w-full flex-col items-center justify-center md:min-h-[80vh]">
        <div className="absolute inset-0 -z-10 bg-surface-container-high" /> {/* Placeholder image background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="z-10 flex flex-col items-center justify-center p-4 text-center md:p-12">
          <div className="mb-2 text-label-caps text-primary">New Release</div>
          <h1 className="text-display-lg-mobile md:text-display-lg mb-4 max-w-lg text-balance text-on-background">
            The Darkest Hour
          </h1>
          <p className="text-body-sm md:text-body-lg mb-8 max-w-xs text-balance text-on-background/80 sm:max-w-sm md:max-w-md">
            In the shadows of a fallen city, a lone detective must unravel a mystery that connects the highest echelons of power to the deepest underworld.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="gap-2">
              <Play fill="currentColor" size={20} />
              Play Now
            </Button>
            <Button variant="secondary" size="lg" className="gap-2">
              <Plus size={20} />
              My List
            </Button>
          </div>
        </div>
      </section>

      {/* Continue Watching */}
      <section className="px-4 md:px-12">
        <h2 className="text-headline-sm mb-4">Continue Watching</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <MovieCard
            title="Neon Shadows"
            metadata="S1:E4 | 45m left"
            className="w-[140px] shrink-0 md:w-[200px]"
            progress={65}
          />
          <MovieCard
            title="The Silent Echo"
            metadata="1h 20m left"
            className="w-[140px] shrink-0 md:w-[200px]"
            progress={30}
          />
        </div>
      </section>

      {/* Trending Now */}
      <section className="px-4 md:px-12">
        <h2 className="text-headline-sm mb-4">Trending Now</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MovieCard
              key={i}
              title={`Trending Movie ${i}`}
              metadata="2024 | R | Action"
              className="w-[140px] shrink-0 md:w-[200px]"
            />
          ))}
        </div>
      </section>
    </div>
  )
}
