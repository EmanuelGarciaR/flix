"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface SeasonSelectorProps {
  seasons: any[];
  currentSeason: number;
}

export function SeasonSelector({
  seasons,
  currentSeason,
}: SeasonSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!seasons || seasons.length === 0) return null;

  // Filter out specials (usually season_number = 0) unless they want it,
  // but standard shows have seasons 1, 2...
  const filteredSeasons = seasons.filter(s => s.season_number > 0);
  const displaySeasons = filteredSeasons.length > 0 ? filteredSeasons : seasons;

  const handleSeasonChange = (seasonNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", seasonNumber.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="px-4 md:px-12 flex items-center gap-4 border-t border-surface-bright/30 pt-6">
      <label htmlFor="season-select" className="text-body-lg font-semibold text-on-background">
        Episodes
      </label>
      <div className="relative">
        <select
          id="season-select"
          value={currentSeason}
          onChange={(e) => handleSeasonChange(Number(e.target.value))}
          className="appearance-none h-10 pl-4 pr-10 rounded border border-surface-bright bg-surface-container text-body-sm text-on-surface focus:border-primary focus:outline-none cursor-pointer"
        >
          {displaySeasons.map((s) => (
            <option key={s.id} value={s.season_number}>
              {s.name || `Season ${s.season_number}`} ({s.episode_count} Episodes)
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
      </div>
    </div>
  );
}
