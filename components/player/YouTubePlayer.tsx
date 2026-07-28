'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { updateWatchProgress } from '@/app/actions/watch-history';

type YouTubePlayerInstance = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
};

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: () => void;
        onStateChange: (event: { data: number }) => void;
        onError: () => void;
      };
    },
  ) => YouTubePlayerInstance;
  PlayerState: { ENDED: number };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-youtube-iframe-api]');
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error('YouTube Player API did not load'));
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.youtubeIframeApi = 'true';
      script.onerror = () => reject(new Error('Unable to load the YouTube Player API'));
      document.head.appendChild(script);
    }
  });
}

interface YouTubePlayerProps {
  videoId: string;
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  initialTime?: number;
  backUrl: string;
}

export function YouTubePlayerComponent({
  videoId,
  profileId,
  tmdbId,
  mediaType,
  title,
  posterPath,
  seasonNumber,
  episodeNumber,
  initialTime = 0,
  backUrl,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let player: YouTubePlayerInstance | undefined;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    let disposed = false;

    const saveProgress = (completed = false) => {
      if (!player) return;
      const durationSeconds = Math.floor(player.getDuration());
      if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;

      void updateWatchProgress({
        profileId,
        tmdbId,
        mediaType,
        title,
        posterPath,
        playbackId: `youtube:${videoId}`,
        seasonNumber,
        episodeNumber,
        progressSeconds: completed ? durationSeconds : Math.floor(player.getCurrentTime()),
        durationSeconds,
      }).catch((error: unknown) => console.error('Error saving trailer progress:', error));
    };

    void loadYouTubeApi()
      .then((YT) => {
        if (disposed) return;
        player = new YT.Player(container, {
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (initialTime > 0) player?.seekTo(initialTime, true);
              player?.playVideo();
              heartbeat = setInterval(saveProgress, 15_000);
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.ENDED) saveProgress(true);
            },
            onError: () => setFailed(true),
          },
        });
      })
      .catch((error: unknown) => {
        console.error('Unable to initialise YouTube player:', error);
        setFailed(true);
      });

    return () => {
      if (heartbeat) clearInterval(heartbeat);
      saveProgress();
      disposed = true;
      player?.destroy();
    };
  }, [videoId, profileId, tmdbId, mediaType, title, posterPath, seasonNumber, episodeNumber, initialTime]);

  return (
    <div className="flex h-full w-full flex-col bg-black">
      <div className="flex items-center gap-3 px-4 py-3 text-on-background md:px-6">
        <Link href={backUrl} className="rounded p-2 transition-colors hover:bg-white/10" aria-label="Go back">
          <ArrowLeft size={24} />
        </Link>
        <p className="text-body-sm font-medium">{title}</p>
      </div>
      <div className="relative min-h-0 flex-1">
        <div ref={containerRef} className="h-full w-full" />
        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black p-6 text-center text-body-sm">
            <p className="text-muted max-w-md">
              This trailer cannot be embedded directly due to YouTube region or video owner playback restrictions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-primary px-5 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-90 transition-opacity"
              >
                Watch on YouTube ↗
              </a>
              <Link
                href={backUrl}
                className="rounded-full bg-surface-container-high px-5 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-bright transition-colors"
              >
                Go Back
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
