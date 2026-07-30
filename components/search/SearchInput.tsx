'use client';

import * as React from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search movies, TV shows...",
}: SearchInputProps) {
  return (
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded border border-surface-bright bg-surface-container pl-10 pr-10 text-body-lg text-on-surface focus:border-primary focus:outline-none transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-on-background transition-colors p-1"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
