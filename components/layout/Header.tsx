"use client"

import { useRef } from "react"
import Link from "next/link"
import { Search, User } from "lucide-react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger)

export function Header({ className }: { className?: string }) {
  const headerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const showAnim = gsap.from(headerRef.current, { 
      yPercent: -100,
      paused: true,
      duration: 0.3,
      ease: "power1.inOut"
    }).progress(1)
    
    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        // Only hide after scrolling down a bit (e.g. past 50px)
        if (self.progress > 0 && self.scrollY > 50) {
          self.direction === 1 ? showAnim.reverse() : showAnim.play()
        } else {
          showAnim.play()
        }
      }
    })
  }, { scope: headerRef })

  return (
    <header ref={headerRef} className={cn("sticky top-0 z-50 flex h-16 items-center justify-between bg-background/80 px-4 backdrop-blur-md md:px-12", className)}>
      <div className="flex items-center gap-8">
        <Link href="/home" className="text-headline-md font-bold tracking-tighter text-primary">
          FLIX
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/home" className="text-body-sm font-medium text-muted hover:text-on-background transition-colors">Home</Link>
          <Link href="/browse" className="text-body-sm font-medium text-muted hover:text-on-background transition-colors">Browse</Link>
          <Link href="/my-list" className="text-body-sm font-medium text-muted hover:text-on-background transition-colors">My List</Link>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-on-background transition-colors hover:text-primary">
          <Search size={20} />
          <span className="sr-only">Search</span>
        </button>
        <Link href="/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container transition-colors hover:bg-surface-bright">
          <User size={16} className="text-on-surface" />
          <span className="sr-only">Profile</span>
        </Link>
      </div>
    </header>
  )
}
