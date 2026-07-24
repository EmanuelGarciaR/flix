import { Button } from "@/components/ui/Button"
import { MovieCard } from "@/components/ui/MovieCard"
import { Play, Plus, ThumbsUp, ThumbsDown, Share2 } from "lucide-react"
import Link from "next/link"

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero Poster / Backdrop */}
      <section className="relative h-[50vh] w-full md:h-[70vh]">
        <div className="absolute inset-0 bg-surface-container-high" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </section>

      {/* Details Container */}
      <div className="relative -mt-32 px-4 md:-mt-48 md:px-12">
        <div className="flex flex-col md:flex-row md:gap-12">
          {/* Poster (Desktop) / Hidden on mobile */}
          <div className="hidden shrink-0 md:block">
            <div className="h-[450px] w-[300px] overflow-hidden rounded-lg bg-surface-container shadow-2xl">
              {/* Image would go here */}
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-display-lg-mobile md:text-display-lg mb-2 text-on-background">
                Movie Title {id}
              </h1>
              <div className="flex items-center gap-2 text-label-caps text-muted">
                <span>2024</span>
                <span>•</span>
                <span>R</span>
                <span>•</span>
                <span>2h 15m</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link href={`/watch/${id}`}>
                <Button size="lg" className="w-full gap-2 md:w-auto">
                  <Play fill="currentColor" size={20} />
                  Play
                </Button>
              </Link>
              <Button variant="secondary" size="icon">
                <Plus size={20} />
              </Button>
              <Button variant="secondary" size="icon">
                <ThumbsUp size={20} />
              </Button>
              <Button variant="secondary" size="icon">
                <ThumbsDown size={20} />
              </Button>
              <Button variant="secondary" size="icon">
                <Share2 size={20} />
              </Button>
            </div>

            <div className="mt-4">
              <h3 className="text-body-lg mb-2 font-semibold text-on-background">Synopsis</h3>
              <p className="text-body-sm max-w-3xl text-on-background/80 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <p className="text-body-sm text-muted">
                <strong className="text-on-background">Starring:</strong> Actor One, Actor Two, Actor Three
              </p>
              <p className="text-body-sm text-muted">
                <strong className="text-on-background">Director:</strong> Director Name
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Titles */}
      <section className="mt-8 px-4 md:px-12">
        <h2 className="text-headline-sm mb-4 border-l-4 border-primary pl-3 text-on-background">Similar Titles</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MovieCard
              key={i}
              title={`Similar Movie ${i}`}
              className="w-[140px] shrink-0 md:w-[200px]"
            />
          ))}
        </div>
      </section>
    </div>
  )
}
