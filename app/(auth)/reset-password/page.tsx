"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/home")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md rounded-xl bg-surface p-8 shadow-2xl shadow-black/50">
        <div className="mb-8 text-center">
          <Link href="/home" className="text-display-lg font-bold tracking-tighter text-primary">
            FLIX
          </Link>
          <p className="text-body-sm mt-2 text-muted">Set new password</p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-error/10 p-3 text-body-sm text-error border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-label-caps text-on-surface">New Password</label>
            <input 
              id="password"
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 w-full rounded border border-surface-bright bg-surface-container px-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-label-caps text-on-surface">Confirm New Password</label>
            <input 
              id="confirmPassword"
              type="password" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 w-full rounded border border-surface-bright bg-surface-container px-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <Button type="submit" size="lg" className="mt-4 w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
