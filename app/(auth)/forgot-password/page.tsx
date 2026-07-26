"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Abstract Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-1/3 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-xl bg-surface p-8 shadow-2xl shadow-black/50">
        <div className="mb-8 text-center">
          <Link href="/home" className="text-display-lg font-bold tracking-tighter text-primary">
            FLIX
          </Link>
          <p className="text-body-sm mt-2 text-muted">Reset your password</p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-error/10 p-3 text-body-sm text-error border border-error/20">
            {error}
          </div>
        )}

        {success ? (
          <div className="mb-4 rounded bg-primary/10 p-4 text-center">
            <h3 className="text-headline-sm mb-2 text-on-surface">Check your email</h3>
            <p className="text-body-sm text-muted">
              We've sent you a password reset link to {email}.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded border border-on-background/20 bg-transparent px-4 text-body-sm font-semibold transition-colors hover:bg-on-background/10"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-label-caps text-on-surface">Email</label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 w-full rounded border border-surface-bright bg-surface-container px-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <Button type="submit" size="lg" className="mt-4 w-full" disabled={loading}>
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-body-sm text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
