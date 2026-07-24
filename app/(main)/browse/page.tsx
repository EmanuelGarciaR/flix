import { Search, Filter } from "lucide-react"
import { MovieCard } from "@/components/ui/MovieCard"
import { Button } from "@/components/ui/Button"

export default function BrowsePage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-12 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">Browse</h1>
        
        <div className="flex w-full gap-2 md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search movies, TV shows..." 
              className="h-10 w-full rounded border border-surface-bright bg-surface-container pl-10 pr-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          <Button variant="secondary" size="icon" className="shrink-0">
            <Filter size={18} />
          </Button>
        </div>
      </div>

      {/* Categories Row */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["All", "Action", "Sci-Fi", "Drama", "Comedy", "Thriller", "Horror", "Documentary"].map((category) => (
          <Button key={category} variant={category === "All" ? "primary" : "secondary"} size="sm" className="shrink-0">
            {category}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 24 }).map((_, i) => (
          <MovieCard
            key={i}
            title={`Browse Result ${i + 1}`}
            metadata="2024 | PG-13"
          />
        ))}
      </div>
    </div>
  )
}
