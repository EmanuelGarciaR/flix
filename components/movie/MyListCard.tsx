'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Info, Loader2, MoreVertical, Share2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { removeFromMyList } from '@/app/actions/my-list';
import { shareContent } from '@/lib/utils';

interface MyListCardProps {
  id: string;
  href: string;
  title: string;
  metadata: string;
  overview?: string;
  imageUrl?: string;
}

export function MyListCard({ id, href, title, metadata, overview, imageUrl }: MyListCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  async function handleRemove() {
    if (removing) return;

    setRemoving(true);
    try {
      await removeFromMyList(id);
    } catch (error) {
      console.error('Error removing from my list:', error);
      setRemoving(false);
    }
  }

  async function handleShare() {
    const url = new URL(href, window.location.origin).toString();
    await shareContent(title, url, () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }


  return (
    <>
      <article className={removing ? 'opacity-50' : undefined}>
        <div className="flex gap-3 rounded-md p-1 transition-colors hover:bg-surface-container-low">
          <Link href={href} className="relative h-28 w-40 shrink-0 overflow-hidden rounded-sm bg-surface-container sm:h-32 sm:w-52">
            <ImageWithFallback
              src={imageUrl || ''}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 160px, 208px"
            />
          </Link>

          <div className="min-w-0 flex-1 self-center">
            <Link href={href} className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-background">
              <h2 className="line-clamp-2 text-body-lg font-semibold text-on-background">{title}</h2>
              {metadata && <p className="mt-1 text-body-sm text-muted">{metadata}</p>}
            </Link>
          </div>

          <button
            type="button"
            aria-label={`Opciones para ${title}`}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-9 shrink-0 items-center justify-center self-center rounded-full text-on-background transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-background"
          >
            <MoreVertical size={22} aria-hidden="true" />
          </button>
        </div>
      </article>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/65 p-0 sm:items-center sm:justify-center sm:p-6" role="presentation" onMouseDown={() => setMenuOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`my-list-title-${id}`}
            className="w-full rounded-t-xl bg-surface px-6 pb-8 pt-3 shadow-2xl sm:max-w-lg sm:rounded-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-7 h-1 w-12 rounded-full bg-on-background/60" />
            <h2 id={`my-list-title-${id}`} className="text-headline-sm text-on-background">{title}</h2>
            {overview && <p className="mt-6 text-body-lg text-on-background/80">{overview}</p>}

            <div className="mt-7 flex flex-col gap-1">
              <button type="button" onClick={handleRemove} disabled={removing} className="flex min-h-12 items-center gap-4 rounded-md px-1 text-left text-body-lg text-on-background hover:bg-surface-container-high disabled:opacity-60">
                {removing ? <Loader2 size={23} className="animate-spin" /> : <Check size={23} />}
                Quitar de Mi lista
              </button>
              <button type="button" onClick={handleShare} className="flex min-h-12 items-center gap-4 rounded-md px-1 text-left text-body-lg text-on-background hover:bg-surface-container-high">
                <Share2 size={23} />
                {copied ? 'Enlace copiado' : 'Compartir'}
              </button>
              <Link href={href} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center gap-4 rounded-md px-1 text-body-lg text-on-background hover:bg-surface-container-high">
                <Info size={23} />
                Más información
              </Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
