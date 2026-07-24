import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Abstract Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/5 blur-[80px]" />
      </div>
      
      <div className="relative z-10 w-full max-w-md rounded-xl bg-surface p-8 shadow-2xl shadow-black/50">
        <div className="mb-8 text-center">
          <Link href="/home" className="text-display-lg font-bold tracking-tighter text-primary">
            FLIX
          </Link>
          <p className="text-body-sm mt-2 text-muted">Sign in to continue</p>
        </div>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-label-caps text-on-surface">Email</label>
            <input 
              id="email"
              type="email" 
              placeholder="name@example.com"
              className="h-12 w-full rounded border border-surface-bright bg-surface-container px-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-label-caps text-on-surface">Password</label>
              <a href="#" className="text-label-caps text-muted hover:text-primary">Forgot?</a>
            </div>
            <input 
              id="password"
              type="password" 
              placeholder="••••••••"
              className="h-12 w-full rounded border border-surface-bright bg-surface-container px-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <Button type="button" size="lg" className="mt-4 w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-muted">
          Don't have an account? <a href="#" className="text-primary hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  )
}
