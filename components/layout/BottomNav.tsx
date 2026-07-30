"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Bookmark, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/LanguageProvider"

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { name: t("home"), href: "/home", icon: Home },
    { name: t("browse"), href: "/browse", icon: Compass },
    { name: t("myList"), href: "/my-list", icon: Bookmark },
    { name: t("profile"), href: "/profile", icon: User },
  ]

  return (
    <nav className={cn("fixed bottom-0 left-0 right-0 z-50 border-t border-surface bg-background/90 pb-safe pt-2 backdrop-blur-md md:hidden", className)}>
      <div className="flex items-center justify-around px-2 pb-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 text-muted transition-colors hover:text-on-background",
                isActive && "text-primary hover:text-primary"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
