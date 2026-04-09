import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";
import {
  Radio, WifiOff, RefreshCw, Volume2, VolumeX,
  Maximize, Clock, Shield, AlertTriangle, Signal,
  Eye, Activity, Minimize, Settings, ChevronDown,
  Wifi, Lock, Globe
} from "lucide-react";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

export default function TrainerLiveFeedViewer() {
  const { sessionId } = useParams();
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showVolume, setShowVolume] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState("HD");
  const [buffering, setBuffering] = useState(false);
  const startTimeRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const [signalBars, setSignalBars] = useState(4);

  useEffect(() => {
    if (status !== "live") return;
    startTimeRef.current = Date.now();
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      setSignalBars(Math.random() > 0.1 ? 4 : 3);
    }, 1000);
    return () => clearInterval(iv);
  }, [status]);

  const fmtTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? String(h).padStart(2, "0") + ":" : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const connect = useCallback(async () => {
    if (!sessionId) return;
    setStatus("connecting");
    setError(null);
    setElapsed(0);

    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch (_) {}
      peerRef.current = null;
    }

    // Get a real local stream with BOTH audio+video tracks (disabled so nothing is sent).
    // This ensures the SDP offer contains both m=audio and m=video lines,
    // which is required for WebRTC to negotiate receiving both from the host.
    let localStream = null;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.getTracks().forEach((t) => { t.enabled = false; });
    } catch (e) {
      console.warn("Full getUserMedia failed, trying audio only:", e);
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.getTracks().forEach((t) => { t.enabled = false; });
      } catch (e2) {
        console.warn("Audio-only failed, using AudioContext fallback:", e2);
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioCtx();
          const dest = ctx.createMediaStreamDestination();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          gain.gain.value = 0;
          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          localStream = dest.stream;
        } catch (_) {
          localStream = new MediaStream();
        }
      }
    }

    const peer = new Peer({ config: ICE_CONFIG, debug: 1 });
    peerRef.current = peer;

    peer.on("open", () => {
      const call = peer.call(sessionId, localStream);

      if (!call) {
        localStream?.getTracks().forEach((t) => t.stop());
        setError("Could not connect to the live session. It may have ended.");
        setStatus("error");
        return;
      }

      call.on("stream", (remoteStream) => {
        // Stop local tracks now — only needed them for SDP negotiation
        localStream?.getTracks().forEach((t) => t.stop());

        console.log("Remote tracks:", remoteStream.getTracks().map((t) => `${t.kind}(${t.readyState})`));

        if (videoRef.current) {
          videoRef.current.srcObject = remoteStream;
          videoRef.current.muted = false;
          videoRef.current.volume = 1.0;
          videoRef.current.play().catch((e) => console.warn("Autoplay blocked:", e));
        }
        setStatus("live");
        setBuffering(false);
      });

      call.on("close", () => {
        localStream?.getTracks().forEach((t) => t.stop());
        setStatus("disconnected");
      });

      call.on("error", (err) => {
        console.error("Call error:", err);
        localStream?.getTracks().forEach((t) => t.stop());
        setError("Connection lost. The trainer may have ended the session.");
        setStatus("disconnected");
      });
    });

    peer.on("error", (err) => {
      localStream?.getTracks().forEach((t) => t.stop());
      if (err.type === "peer-unavailable") {
        setError("This live session is not available. The host may have ended the stream.");
      } else {
        setError(err.message || "Connection error");
      }
      setStatus("error");
    });

    peer.on("disconnected", () => setStatus("disconnected"));
  }, [sessionId]);

  useEffect(() => {
    connect();
    return () => {
      if (peerRef.current) { try { peerRef.current.destroy(); } catch (_) {} }
    };
  }, [connect]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimerRef.current);
    if (status === "live") {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3500);
    }
  }, [status]);

  useEffect(() => {
    if (status === "live") resetControlsTimer();
    return () => clearTimeout(controlsTimerRef.current);
  }, [status, resetControlsTimer]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVolume = (e) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val / 100;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const goFullscreen = () => {
    const el = wrapperRef.current;
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const isLive = status === "live";

  return (
    <div
      
      className="flex flex-col relative overflow-hidden"
    >
      {/* Background Ambient Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/15 blur-[120px]" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity:0 } to { opacity:1 } }
        @keyframes slide-up { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 40px rgba(239,68,68,0.6); }
        }
        @keyframes connecting-rotate {
          to { transform: rotate(360deg); }
        }

        .live-badge { animation: glow-pulse 2s ease-in-out infinite; }
        .scan-line {
          position: absolute; left:0; right:0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(34,211,153,0.3) 30%, rgba(34,211,153,0.6) 50%, rgba(34,211,153,0.3) 70%, transparent 100%);
          animation: scan 4s linear infinite;
          pointer-events: none;
        }
        .controls-fade {
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .controls-hidden {
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
        }
        .volume-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px; height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        .glass-dark { 
          background: rgba(0,0,0,0.7); 
          backdrop-filter: blur(16px); 
          -webkit-backdrop-filter: blur(16px);
        }
        .connecting-ring {
          border: 2px solid rgba(99,102,241,0.2);
          border-top-color: #6366f1;
          border-right-color: #22d3ee;
          animation: connecting-rotate 1.2s linear infinite;
        }
      `}</style>

      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-6 py-3.5 shrink-0 relative z-10"
        style={{background: 'rgba(3,7,18,0.7)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)'}}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #22d3ee, #6366f1)'}}>
            <Radio size={14} className="text-white" />
          </div>
          <div>
            <span >StreamDesk</span>
            <span className="ml-2 text-[9px] text-white/25 tracking-widest uppercase">Live Viewer</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full live-badge" style={{background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)'}}>
              <div className="relative w-2 h-2 shrink-0">
                <div className="absolute inset-0 bg-red-500 rounded-full" />
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" style={{animationDuration: '1.5s'}} />
              </div>
              <span className="text-red-400 text-[11px] font-bold tracking-widest">LIVE</span>
            </div>
          )}
          {status === "connecting" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)'}}>
              <RefreshCw size={11} className="text-indigo-400 animate-spin" />
              <span className="text-indigo-400 text-[11px] font-medium">Connecting</span>
            </div>
          )}
          {(status === "disconnected" || status === "error") && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)'}}>
              <WifiOff size={11} className="text-orange-400" />
              <span className="text-orange-400 text-[11px] font-medium">Offline</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-white/25" style={{border: '1px solid rgba(255,255,255,0.06)'}}>
            <Lock size={10} />
            <span>E2E Encrypted</span>
          </div>

          {isLive && (
            <div className="flex items-center gap-2 text-xs" style={{color: 'rgba(255,255,255,0.3)'}}>
              <Clock size={12} />
              <span >{fmtTime(elapsed)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center relative z-10" style={{background: 'transparent', minHeight: 0}}>
        <div
          ref={wrapperRef}
          className="relative w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          style={{maxWidth: isFullscreen ? '100vw' : '100%', aspectRatio: '16/9', }}
          onMouseMove={resetControlsTimer}
          onMouseLeave={() => status === "live" && setShowControls(false)}
        >
          {/* Scan line on live */}
          {isLive && <div className="scan-line" />}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            style={{ display: 'block'}}
          />

          {/* Corner decorations */}
          {isLive && (
            <>
              <div className="absolute top-5 left-5 w-6 h-6 pointer-events-none" style={{borderTop: '1.5px solid rgba(34,211,153,0.5)', borderLeft: '1.5px solid rgba(34,211,153,0.5)', borderRadius: '2px 0 0 0'}} />
              <div className="absolute top-5 right-5 w-6 h-6 pointer-events-none" style={{borderTop: '1.5px solid rgba(34,211,153,0.5)', borderRight: '1.5px solid rgba(34,211,153,0.5)', borderRadius: '0 2px 0 0'}} />
              <div className="absolute bottom-16 left-5 w-6 h-6 pointer-events-none" style={{borderBottom: '1.5px solid rgba(34,211,153,0.5)', borderLeft: '1.5px solid rgba(34,211,153,0.5)', borderRadius: '0 0 0 2px'}} />
              <div className="absolute bottom-16 right-5 w-6 h-6 pointer-events-none" style={{borderBottom: '1.5px solid rgba(34,211,153,0.5)', borderRight: '1.5px solid rgba(34,211,153,0.5)', borderRadius: '0 0 2px 0'}} />
            </>
          )}

          {/* LIVE badge top-left */}
          {isLive && (
            <div className={`absolute top-5 left-1/2 -translate-x-1/2 controls-fade ${showControls ? '' : 'controls-hidden'}`}>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{background: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(8px)'}}>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-white text-[11px] font-bold tracking-widest">LIVE</span>
              </div>
            </div>
          )}

          {/* Signal strength - top right when live */}
          {isLive && (
            <div className={`absolute top-5 right-5 controls-fade ${showControls ? '' : 'controls-hidden'}`}>
              <div className="flex items-end gap-0.5 px-2.5 py-1.5 rounded-lg glass-dark">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-sm transition-all duration-500"
                    style={{
                      height: `${(i+1)*4+4}px`,
                      background: i < signalBars ? 'rgba(34,211,153,0.9)' : 'rgba(255,255,255,0.15)'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ---- Connecting Overlay ---- */}
          {status === "connecting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6" style={{background: 'rgba(3,7,18,0.92)', animation: 'fade-in 0.4s ease'}}>
              <div className="relative">
                <div className="w-20 h-20 rounded-full connecting-ring" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Radio size={24} style={{color: '#6366f1'}} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-lg mb-2">Joining live stream</p>
                <p className="text-white/30 text-sm">Establishing secure peer-to-peer connection</p>
                <div className="flex justify-center gap-1.5 mt-4">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: `${i*120}ms`, animationDuration: '0.8s'}} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)'}}>
                <Lock size={11} className="text-white/30" />
                <span className="text-white/30 text-xs">End-to-end encrypted</span>
              </div>
            </div>
          )}

          {/* ---- Error / Disconnected Overlay ---- */}
          {(status === "disconnected" || status === "error") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6" style={{background: 'rgba(3,7,18,0.93)', animation: 'fade-in 0.4s ease'}}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{
                background: status === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                border: status === 'error' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.08)'
              }}>
                {status === "error"
                  ? <AlertTriangle size={32} className="text-red-400" />
                  : <WifiOff size={32} className="text-white/30" />}
              </div>
              <div className="text-center max-w-sm px-4">
                <p className="text-white font-semibold text-xl mb-3">
                  {status === "error" ? "Stream Unavailable" : "Stream Ended"}
                </p>
                <p className="text-white/35 text-sm leading-relaxed">
                  {error || "The live session has ended or the connection was interrupted."}
                </p>
              </div>
              <button
                onClick={connect}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{background: 'linear-gradient(135deg, #22d3ee, #6366f1)', color: '#fff', boxShadow: '0 8px 32px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'}}
              >
                <RefreshCw size={15} />
                Try Reconnecting
              </button>
            </div>
          )}

          {/* ---- Controls Bar (bottom gradient) ---- */}
          {isLive && (
            <div
              className={`absolute bottom-0 left-0 right-0 controls-fade ${showControls ? '' : 'controls-hidden'}`}
              style={{background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', paddingTop: '60px'}}
            >
              <div className="flex items-center justify-between px-5 pb-4">
                {/* Left: Session ID */}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/40 text-xs" >
                    {sessionId?.slice(0, 12)}...
                  </span>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-2">
                  {/* Volume */}
                  <div
                    className="relative flex items-center gap-2"
                    onMouseEnter={() => setShowVolume(true)}
                    onMouseLeave={() => setShowVolume(false)}
                  >
                    {showVolume && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-dark" style={{animation: 'fade-in 0.2s ease'}}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={handleVolume}
                          className="volume-slider w-20"
                          style={{
                            background: `linear-gradient(to right, rgba(255,255,255,0.8) ${volume}%, rgba(255,255,255,0.15) ${volume}%)`
                          }}
                        />
                        <span className="text-white/50 text-xs w-7 text-right" >{volume}%</span>
                      </div>
                    )}
                    <button
                      onClick={toggleMute}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all glass-dark"
                      style={{border: '1px solid rgba(255,255,255,0.1)', color: isMuted ? '#f87171' : 'rgba(255,255,255,0.7)'}}
                    >
                      {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={goFullscreen}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all glass-dark"
                    style={{border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)'}}
                  >
                    {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="shrink-0 px-6 py-3 flex items-center justify-between relative z-10" style={{background: 'rgba(3,7,18,0.7)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)'}}>
        <div className="flex items-center gap-5 text-xs" style={{color: 'rgba(255,255,255,0.25)'}}>
          <span className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-white/15'}`} />
            {isLive ? 'Connected' : 'Not connected'}
          </span>
          <span style={{color: 'rgba(255,255,255,0.1)'}}>•</span>
          <span>PSU ERP — Angul Training Center</span>
          <span style={{color: 'rgba(255,255,255,0.1)'}}>•</span>
          <span>BATCH-101 · Electrical</span>
        </div>

        <div className="flex items-center gap-4 text-xs" style={{color: 'rgba(255,255,255,0.25)'}}>
          {isLive && (
            <>
              <span className="flex items-center gap-1.5">
                <Activity size={11} />
                <span >{fmtTime(elapsed)}</span>
              </span>
              <span style={{color: 'rgba(255,255,255,0.1)'}}>•</span>
              <span>720p HD</span>
            </>
          )}
          <span className="flex items-center gap-1.5">
            <Lock size={10} />
            Secure P2P
          </span>
        </div>
      </div>
    </div>
  );
}