import { redirect } from "next/navigation";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getActiveProfile } from "@/lib/auth";
import { updateProfileSettings } from "@/app/actions/profile";
import { revalidatePath } from "next/cache";
import Link from "next/link";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
];

const maturityRatings = [
  { code: "G", description: "G - General Audiences" },
  { code: "PG", description: "PG - Parental Guidance Suggested" },
  { code: "PG-13", description: "PG-13 - Parents Strongly Cautioned" },
  { code: "R", description: "R - Restricted" },
  { code: "NC-17", description: "NC-17 - Adults Only" },
  { code: "TV-MA", description: "TV-MA - Mature Audience Only (Default)" },
];

export default async function SettingsPage() {
  const profile = await getActiveProfile();
  if (!profile) {
    redirect("/login");
  }

  const currentLanguage = profile.language || "en";
  const currentMaturity = profile.maturity_rating || "TV-MA";
  const currentIsKids = !!profile.is_kids;

  async function saveSettings(formData: FormData) {
    "use server";
    const language = formData.get("language") as string;
    const maturityRating = formData.get("maturity_rating") as string;
    const isKids = formData.get("is_kids") === "on";

    await updateProfileSettings({
      language,
      maturityRating,
      isKids,
    });

    revalidatePath("/settings");
    revalidatePath("/profile");
    redirect("/profile");
  }

  return (
    <div className="flex flex-col px-4 py-6 md:px-12 md:py-10 mx-auto max-w-2xl w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="text-muted hover:text-on-background transition-colors">
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">
          Settings
        </h1>
      </div>

      <form action={saveSettings} className="flex flex-col gap-6 bg-surface-container p-6 rounded-lg border border-surface-bright/20 shadow-md">
        {/* Language */}
        <div className="flex flex-col gap-2">
          <label htmlFor="language" className="text-body-lg font-semibold text-on-background">
            Preferred Language
          </label>
          <select
            id="language"
            name="language"
            defaultValue={currentLanguage}
            className="h-12 px-4 rounded border border-surface-bright bg-surface-container-high text-body-sm text-on-surface focus:border-primary focus:outline-none cursor-pointer w-full"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Maturity Rating */}
        <div className="flex flex-col gap-2">
          <label htmlFor="maturity_rating" className="text-body-lg font-semibold text-on-background">
            Maturity Rating Filter
          </label>
          <select
            id="maturity_rating"
            name="maturity_rating"
            defaultValue={currentMaturity}
            className="h-12 px-4 rounded border border-surface-bright bg-surface-container-high text-body-sm text-on-surface focus:border-primary focus:outline-none cursor-pointer w-full"
          >
            {maturityRatings.map((m) => (
              <option key={m.code} value={m.code}>
                {m.description}
              </option>
            ))}
          </select>
        </div>

        {/* Kids Mode Toggle */}
        <div className="flex items-center justify-between p-4 rounded bg-surface-container-high border border-surface-bright/20 mt-2">
          <div className="flex flex-col gap-1 pr-4">
            <span className="text-body-md font-semibold text-on-background">Kids Profile</span>
            <p className="text-xs text-muted">Restricts visibility to child-friendly content and ratings.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_kids"
              defaultChecked={currentIsKids}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-bright peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <Button type="submit" size="lg" className="flex-1 sm:flex-initial">
            Save Preferences
          </Button>
          <Link href="/profile" className="flex-1 sm:flex-initial text-center">
            <Button type="button" variant="secondary" size="lg" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
