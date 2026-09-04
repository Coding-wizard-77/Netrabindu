import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HLSPlayerProps {
  src: string;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
  onReady?: () => void;
  onError?: (err: any) => void;
}

export const HLSPlayer: React.FC<HLSPlayerProps> = ({
  src,
  autoplay = true,
  controls = false,
  className = 'w-full h-full object-cover',
  onReady,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoplay) {
          video.play().catch((e) => console.warn('Autoplay prevented:', e));
        }
        if (onReady) onReady();
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('Fatal HLS Error:', data);
          if (onError) onError(data);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        if (autoplay) video.play();
        if (onReady) onReady();
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, autoplay, onReady, onError]);

  return <video ref={videoRef} controls={controls} muted autoPlay className={className} playsInline />;
};
