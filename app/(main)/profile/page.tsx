import { redirect } from "next/navigation";
import { User, Settings, CreditCard, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateProfileRegion } from "@/app/actions/profile";
import { revalidatePath } from "next/cache";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const regions = [
  { code: 'US', name: 'United States' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'BR', name: 'Brazil' },
];

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(user.id);
  
  // Default values if profile hasn't been created yet
  const displayName = profile?.display_name || user.email?.split('@')[0] || "User";
  const plan = profile?.plan || "free";
  const region = profile?.region || "US";

  return (
    <div className="flex flex-col px-4 py-6 md:px-12 md:py-10 mx-auto max-w-4xl w-full">
      <h1 className="text-display-lg-mobile md:text-display-lg mb-8 text-on-background">Profile</h1>
      
      {/* User Info Card */}
      <div className="mb-8 flex items-center gap-4 rounded-lg bg-surface-container p-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-bright">
          <User size={40} className="text-on-surface" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-headline-sm font-semibold text-on-background">{displayName}</h2>
          <p className="text-body-sm text-muted">{user.email}</p>
          <div className="mt-2 inline-flex items-center rounded bg-primary/20 px-2 py-1 text-label-caps text-primary uppercase">
            {plan} Plan
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

        <h3 className="text-label-caps mb-2 mt-6 text-muted">Region Settings</h3>
        <form
          action={async (formData) => {
            "use server";
            const newRegion = formData.get("region") as string;
            await updateProfileRegion(newRegion);
            revalidatePath("/profile");
          }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between rounded-lg bg-surface-container p-4 border border-surface-bright/20"
        >
          <div className="flex flex-col gap-1">
            <span className="text-body-lg text-on-background">Watch Region</span>
            <p className="text-xs text-muted">Filters TMDB content availability and regional stream providers.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              name="region"
              defaultValue={region}
              className="h-10 px-3 rounded border border-surface-bright bg-surface-container-high text-body-sm text-on-surface focus:border-primary focus:outline-none cursor-pointer w-full sm:w-40"
            >
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">Save</Button>
          </div>
        </form>

        <form action={signOut} className="mt-8">
          <Button type="submit" variant="secondary" className="w-full gap-2 text-error hover:bg-error/10 hover:text-error border-error/20 md:w-auto md:self-start">
            <LogOut size={18} />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
