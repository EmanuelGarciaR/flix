import { User, Settings, CreditCard, LogOut, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function ProfilePage() {
  return (
    <div className="flex flex-col px-4 py-6 md:px-12 md:py-10 mx-auto max-w-4xl w-full">
      <h1 className="text-display-lg-mobile md:text-display-lg mb-8 text-on-background">Profile</h1>
      
      {/* User Info Card */}
      <div className="mb-8 flex items-center gap-4 rounded-lg bg-surface-container p-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-bright">
          <User size={40} className="text-on-surface" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-headline-sm font-semibold text-on-background">Cinephile User</h2>
          <p className="text-body-sm text-muted">user@example.com</p>
          <div className="mt-2 inline-flex items-center rounded bg-primary/20 px-2 py-1 text-label-caps text-primary">
            Premium Plan
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-2">
        <h3 className="text-label-caps mb-2 text-muted">Account Settings</h3>
        
        <button className="flex w-full items-center justify-between rounded-lg bg-surface-container p-4 text-left transition-colors hover:bg-surface-bright">
          <div className="flex items-center gap-4">
            <Settings size={20} className="text-muted" />
            <span className="text-body-lg text-on-background">App Preferences</span>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </button>
        
        <button className="flex w-full items-center justify-between rounded-lg bg-surface-container p-4 text-left transition-colors hover:bg-surface-bright">
          <div className="flex items-center gap-4">
            <CreditCard size={20} className="text-muted" />
            <span className="text-body-lg text-on-background">Billing Details</span>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </button>

        <h3 className="text-label-caps mb-2 mt-6 text-muted">Region</h3>
        <div className="flex w-full items-center justify-between rounded-lg bg-surface-container p-4">
          <span className="text-body-lg text-on-background">Current Region</span>
          <span className="text-body-sm text-muted">United States</span>
        </div>

        <Button variant="secondary" className="mt-8 w-full gap-2 text-error hover:bg-error/10 hover:text-error border-error/20 md:w-auto md:self-start">
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
