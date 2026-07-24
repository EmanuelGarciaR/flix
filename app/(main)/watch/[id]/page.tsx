import Link from "next/link"
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, Maximize } from "lucide-react"

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Video Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <span className="text-muted text-body-lg">Video Player Placeholder (ID: {id})</span>
      </div>

      {/* Overlay Controls */}
      <div className="absolute inset-0 flex flex-col justify-between bg-black/40 opacity-0 transition-opacity hover:opacity-100 p-6 md:p-8">
        
        {/* Top Bar */}
        <div className="flex items-center gap-4">
          <Link href={`/movie/${id}`} className="text-on-background hover:text-primary transition-colors">
            <ArrowLeft size={32} />
          </Link>
          <h2 className="text-headline-sm font-semibold text-on-background">Movie Title</h2>
        </div>

        {/* Center Play/Pause (Optional) */}
        <div className="flex items-center justify-center">
          {/* <button className="rounded-full bg-primary/20 p-6 text-primary backdrop-blur-md transition-transform hover:scale-110">
            <Play fill="currentColor" size={48} />
          </button> */}
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col gap-4">
          {/* Scrubber */}
          <div className="flex items-center gap-4">
            <span className="text-label-caps text-on-background">00:00:00</span>
            <div className="relative h-1 flex-1 cursor-pointer rounded-full bg-surface-container">
              <div className="absolute left-0 h-full w-1/3 rounded-full bg-primary"></div>
              {/* Thumb */}
              <div className="absolute left-1/3 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow"></div>
            </div>
            <span className="text-label-caps text-on-background">02:15:00</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-on-background">
              <button className="hover:text-primary transition-colors"><SkipBack size={24} fill="currentColor" /></button>
              <button className="hover:text-primary transition-colors"><Pause size={32} fill="currentColor" /></button>
              <button className="hover:text-primary transition-colors"><SkipForward size={24} fill="currentColor" /></button>
              <button className="hover:text-primary transition-colors ml-4"><Volume2 size={24} /></button>
            </div>
            
            <div className="flex items-center gap-6 text-on-background">
              <button className="hover:text-primary transition-colors"><Maximize size={24} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
