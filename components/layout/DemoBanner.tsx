'use client';

import { useDemoMode } from '@/lib/demo-client';

export function DemoBanner() {
  const { isDemo, toggle } = useDemoMode();

  return (
    <div className="flex flex-col items-center">
      {/* Banner */}
      {isDemo && (
        <div className="w-full bg-cyan-600 text-white text-xs font-bold py-1 text-center tracking-widest z-50 shadow-md uppercase">
          DEMO MODE — Region restrictions disabled
        </div>
      )}
      
      {/* Pill Toggle */}
      <div className="flex items-center gap-1 bg-surface-container border border-surface-bright/40 rounded-full p-1 mt-3 mb-1 shadow-sm mx-auto text-xs font-medium z-50">
        <button
          onClick={() => toggle(false)}
          className={`px-3 py-1 rounded-full transition-colors ${
            !isDemo ? 'bg-primary text-on-primary shadow' : 'text-muted hover:text-on-background'
          }`}
        >
          Region-Restricted
        </button>
        <button
          onClick={() => toggle(true)}
          className={`px-3 py-1 rounded-full transition-colors ${
            isDemo ? 'bg-cyan-600 text-white shadow' : 'text-muted hover:text-on-background'
          }`}
        >
          Show All Content (Demo)
        </button>
      </div>
    </div>
  );
}
