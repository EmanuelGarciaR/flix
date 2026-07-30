'use client';

import { useState, useEffect } from 'react';
import { SearchInput } from '@/components/search/SearchInput';
import { SearchResults } from '@/components/search/SearchResults';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function SearchPage() {
  const { locale, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&language=${locale}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, locale]);

  return (
    <div className="px-4 py-6 md:px-12 md:py-10">
      <h1 className="text-display-lg-mobile md:text-display-lg mb-6 text-on-background">
        {t("search")}
      </h1>
      
      <div className="flex flex-col gap-2 mb-8">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={locale === "es" ? "Busca películas y series..." : locale === "pt" ? "Pesquise filmes e séries..." : "Search movies, TV shows..."}
        />
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted mt-2">
            <Loader2 size={16} className="animate-spin text-primary" />
            {locale === "es" ? "Buscando..." : locale === "pt" ? "Pesquisando..." : "Searching..."}
          </div>
        )}
      </div>

      <SearchResults items={results} query={query} />
    </div>
  );
}
