import * as React from "react";
import Image from "next/image";

interface WatchProvidersProps {
  providers?: {
    link?: string;
    flatrate?: any[];
    rent?: any[];
    buy?: any[];
  };
}

export function WatchProviders({ providers }: WatchProvidersProps) {
  if (!providers) return null;

  const { flatrate = [], rent = [], buy = [] } = providers;

  if (flatrate.length === 0 && rent.length === 0 && buy.length === 0) {
    return (
      <div className="px-4 md:px-12 mt-4 text-body-sm text-muted">
        No regional streaming providers available.
      </div>
    );
  }

  const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/w92";

  const renderProviderGroup = (title: string, list: any[]) => {
    if (list.length === 0) return null;

    return (
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">{title}</h4>
        <div className="flex flex-wrap gap-3">
          {list.map((provider) => (
            <div
              key={provider.provider_id}
              className="group relative flex h-10 w-10 overflow-hidden rounded bg-surface-container border border-surface-bright/30 cursor-help"
              title={provider.provider_name}
            >
              <Image
                src={`${TMDB_LOGO_BASE}${provider.logo_path}`}
                alt={provider.provider_name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 md:px-12 flex flex-col gap-6 border-t border-surface-bright/30 pt-6">
      <h3 className="text-headline-sm text-on-background">Where to Watch</h3>
      <div className="flex flex-col md:flex-row gap-6 md:gap-12">
        {renderProviderGroup("Stream", flatrate)}
        {renderProviderGroup("Rent", rent)}
        {renderProviderGroup("Buy", buy)}
      </div>
      {providers.link && (
        <a
          href={providers.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline self-start mt-2 font-medium"
        >
          Provided by JustWatch
        </a>
      )}
    </div>
  );
}
