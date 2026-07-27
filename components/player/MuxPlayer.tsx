'use client';

import { useEffect, useRef } from 'react';
import { MuxPlayer } from '@mux/playback-react';
import { updateWatchProgress } from '@/app/actions/watch-history';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  playbackId: string;
  profileId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  initialTime?: number;
  onEnded?: () => void;
  backUrl: string;
}

export function MuxPlayerComponent({
  playbackId,
  profileId,
  tmdbId,
  mediaType,
  title,
  posterPath,
  seasonNumber,
  episodeNumber,
  initialTime = 0,
  onEnded,
  backUrl,
}: Props) {
  const playerRef = useRef<any>(null);
  const heartbeatRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (initialTime > 0) {
      player.currentTime = initialTime;
    }

    const sendHeartbeat = async () => {
      if (player && !player.paused && !player.ended) {
        try {
          await updateWatchProgress({
            profileId,
            tmdbId,
            mediaType,
            title,
            posterPath,
            seasonNumber,
            episodeNumber,
            progressSeconds: Math.floor(player.currentTime),
            durationSeconds: Math.floor(player.duration || 0),
          });
        } catch (err) {
          console.error('Error saving progress heartbeat:', err);
        }
      }
    };

    heartbeatRef.current = setInterval(sendHeartbeat, 15000);

    const handleEnded = async () => {
      try {
        await updateWatchProgress({
          profileId,
          tmdbId,
          mediaType,
          title,
          posterPath,
          seasonNumber,
          episodeNumber,
          progressSeconds: Math.floor(player.duration || 0),
          durationSeconds: Math.floor(player.duration || 0),
        });
      } catch (err) {
        console.error('Error saving progress on ended:', err);
      }
      onEnded?.();
    };

    player.addEventListener('ended', handleEnded);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      sendHeartbeat();
      if (player) {
        player.removeEventListener('ended', handleEnded);
      }
    };
  }, [profileId, tmdbId, mediaType, title, posterPath, seasonNumber, episodeNumber, initialTime, onEnded]);

  return (
    <div className="relative w-full h-full group bg-black">
      {/* Top back button visible on hover */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-4">
        <Link href={backUrl} className="text-on-background hover:text-primary transition-colors">
          <ArrowLeft size={32} />
        </Link>
        <div>
          <h2 className="text-headline-sm font-semibold text-on-background">{title}</h2>
          {(seasonNumber !== undefined && episodeNumber !== undefined) && (
            <p className="text-label-caps text-muted">S{seasonNumber}:E{episodeNumber}</p>
          )}
        </div>
      </div>

      <MuxPlayer
        ref={playerRef}
        playback-id={playbackId}
        metadata={{
          video_id: `tmdb_${tmdbId}`,
          video_title: title,
          video_type: mediaType,
          video_series_season: seasonNumber?.toString(),
          video_series_episode: episodeNumber?.toString(),
        }}
        stream-type="on-demand"
        default-muted={false}
        auto-play
        className="w-full h-full object-contain"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
