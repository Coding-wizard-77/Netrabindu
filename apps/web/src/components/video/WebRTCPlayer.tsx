import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface WebRTCPlayerProps {
  webrtcUrl: string;
  sessionToken?: string;
  autoplay?: boolean;
  className?: string;
  onFallbackToHLS?: () => void;
}

export const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({
  webrtcUrl,
  sessionToken,
  autoplay = true,
  className = 'w-full h-full object-cover',
  onFallbackToHLS,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let peerConnection: RTCPeerConnection | null = null;

    async function initWebRTC() {
      try {
        setError(null);
        peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        peerConnection.addTransceiver('video', { direction: 'recvonly' });
        peerConnection.addTransceiver('audio', { direction: 'recvonly' });

        peerConnection.ontrack = (event) => {
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
          }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // MediaMTX WHEP handshake
        const res = await fetch(webrtcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp',
            ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
          },
          body: offer.sdp,
        });

        if (!res.ok) {
          throw new Error(`WebRTC WHEP error: ${res.statusText}`);
        }

        const answerSdp = await res.text();
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({ type: 'answer', sdp: answerSdp })
        );
      } catch (err: any) {
        console.warn('WebRTC failed, falling back to HLS:', err);
        setError(err.message || 'WebRTC Negotiation Failed');
        if (onFallbackToHLS) onFallbackToHLS();
      }
    }

    if (webrtcUrl) {
      initWebRTC();
    }

    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [webrtcUrl, sessionToken, onFallbackToHLS]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
        <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-xs text-slate-300 font-mono">WebRTC Negotiation Failed</p>
        <button
          onClick={onFallbackToHLS}
          className="mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-xs font-mono flex items-center gap-1.5"
        >
          <RefreshCw className="w-3 h-3" /> Switch to HLS
        </button>
      </div>
    );
  }

  return <video ref={videoRef} autoPlay={autoplay} muted playsInline className={className} />;
};
