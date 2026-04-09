import { useRef, useState, useEffect, useCallback } from "react";
import Peer from "peerjs";
import {
  Video, VideoOff, Mic, MicOff, Copy, Check, Radio,
  Users, Clock, StopCircle, Play, Wifi, WifiOff,
  Maximize, Shield, Camera, Signal, Activity, Eye,
  Settings, ChevronRight, Zap, Globe, Lock, AlertCircle
} from "lucide-react";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

const SESSION_INFO = {
  trainer: "Aditya Sahu",
  center: "Angul Training Center",
  batch: "BATCH-101",
  trade: "Electrical",
};

export default function TrainerLiveFeedHost({ embedded = false }) {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const callsRef = useRef([]);
  const canvasRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [signalStrength, setSignalStrength] = useState(4);
  const [bitrate, setBitrate] = useState("2.4");
  const [logs, setLogs] = useState([]);
  const startTimeRef = useRef(null);

  const addLog = (msg, type = "info") => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour12: false });
    setLogs(prev => [{time, msg, type}, ...prev].slice(0, 8));
  };

  useEffect(() => {
    if (status !== "live") return;
    startTimeRef.current = Date.now();
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      // Simulate bitrate fluctuation
      setBitrate((2.2 + Math.random() * 0.6).toFixed(1));
      setSignalStrength(Math.random() > 0.15 ? 4 : 3);
    }, 1000);
    return () => clearInterval(iv);
  }, [status]);

  const fmtTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? String(h).padStart(2, "0") + ":" : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const startSession = useCallback(async () => {
    try {
      setStatus("initializing");
      setError(null);
      addLog("Requesting camera & microphone access...", "info");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      addLog("Camera initialized successfully", "success");
      setStatus("connecting");
      addLog("Connecting to peer network...", "info");

      const peer = new Peer({ config: ICE_CONFIG, debug: 1 });
      peerRef.current = peer;

      peer.on("open", (id) => {
        setSessionId(id);
        setStatus("live");
        addLog("Stream is now live", "success");
      });

      peer.on("call", (call) => {
        if (streamRef.current) call.answer(streamRef.current);
        callsRef.current = [...callsRef.current, call];
        setViewerCount((c) => c + 1);
        addLog("New viewer joined", "viewer");

        call.on("close", () => {
          callsRef.current = callsRef.current.filter((c) => c !== call);
          setViewerCount((c) => Math.max(0, c - 1));
          addLog("A viewer disconnected", "info");
        });
        call.on("error", () => {
          callsRef.current = callsRef.current.filter((c) => c !== call);
          setViewerCount((c) => Math.max(0, c - 1));
        });
      });

      peer.on("error", (err) => {
        setError(err.message);
        setStatus("error");
        addLog(`Error: ${err.message}`, "error");
      });
    } catch (err) {
      setError("Camera/microphone permission denied.");
      setStatus("error");
      addLog("Camera access denied", "error");
    }
  }, []);

  const stopSession = useCallback(() => {
    callsRef.current.forEach((c) => { try { c.close(); } catch (_) {} });
    callsRef.current = [];
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    streamRef.current = null;
    peerRef.current = null;
    setSessionId(null);
    setViewerCount(0);
    setStatus("ended");
    setElapsed(0);
    addLog("Session ended by host", "info");
  }, []);

  const toggleMic = () => {
    const audio = streamRef.current?.getAudioTracks()[0];
    if (audio) {
      audio.enabled = !audio.enabled;
      setIsMuted(!audio.enabled);
      addLog(audio.enabled ? "Microphone unmuted" : "Microphone muted", "info");
    }
  };

  const toggleCam = () => {
    const video = streamRef.current?.getVideoTracks()[0];
    if (video) {
      video.enabled = !video.enabled;
      setIsCamOff(!video.enabled);
      addLog(video.enabled ? "Camera enabled" : "Camera disabled", "info");
    }
  };

  const shareLink = sessionId ? `${window.location.origin}/live/${sessionId}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    addLog("Share link copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const isLive = status === "live";

  return (
    <div className={`${embedded ? "h-full rounded-xl" : "min-h-screen"} bg-[#030712] text-white relative overflow-hidden flex flex-col`}>
      
      {/* Background Ambient Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-sky-900/20 blur-[100px]" />
      </div>
      
      {/* Import fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        .glass { 
          background: rgba(17, 25, 40, 0.45); 
          border: 1px solid rgba(255, 255, 255, 0.08); 
          backdrop-filter: blur(16px); 
          box-shadow: 0 4px 24px -1px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        .glass:hover {
          border-color: rgba(56, 189, 248, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.3);
        }
        .glass-strong { 
          background: rgba(15, 23, 42, 0.75); 
          border: 1px solid rgba(255,255,255,0.12); 
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37);
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes waveform {
          0%, 100% { height: 4px; }
          50% { height: 20px; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .live-pulse::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #ef4444;
          animation: pulse-ring 1.5s ease-out infinite;
        }
        .bar { animation: waveform 0.8s ease-in-out infinite; }
        .log-entry { animation: slide-up 0.3s ease; }
        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(34,211,153,0.4), transparent);
          animation: scan 3s linear infinite;
        }
      `}</style>

      {/* Top Navigation */}
      {!embedded && (
        <nav className="flex items-center justify-between px-8 py-4 border-b border-white/[0.08] relative z-10" style={{background: 'rgba(3,7,18,0.7)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0}}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #22d3ee, #6366f1)'}}>
            <Radio size={16} className="text-white" />
          </div>
          <div>
            <span >StreamDesk</span>
            <span className="ml-2 text-[10px] text-white/30 tracking-widest uppercase">Host Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full" style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)'}}>
              <div className="relative w-2 h-2">
                <div className="live-pulse w-2 h-2 bg-red-500 rounded-full relative" />
              </div>
              <span className="text-red-400 font-semibold text-xs tracking-widest">BROADCASTING</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs text-white/40">
            <Lock size={11} />
            <span>Secure P2P</span>
          </div>
        </div>
      </nav>
      )}

      <div className={`max-w-[1400px] mx-auto w-full px-4 md:px-8 ${embedded ? 'py-4 flex-1' : 'py-8'} relative z-10 overflow-y-auto`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* LEFT: Video + Controls — 8 cols */}
          <div className="col-span-8 space-y-4">

            {/* Video Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]" style={{aspectRatio: '16/9', }}>
              
              {/* Scan line effect when live */}
              {isLive && <div className="scan-line" />}

              <video
                ref={videoRef}
                autoPlay playsInline muted
                className="w-full h-full object-cover"
              />

              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-400/60 rounded-tl-sm" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400/60 rounded-tr-sm" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400/60 rounded-bl-sm" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-400/60 rounded-br-sm" />

              {/* Top HUD */}
              {isLive && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{background: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(10px)'}}>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-[11px] font-bold tracking-widest">LIVE</span>
                  </div>
                </div>
              )}

              {/* Stats HUD bottom */}
              {isLive && (
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)'}}>
                    <Eye size={13} className="text-white/60" />
                    <span className="text-white text-sm font-semibold">{viewerCount}</span>
                    <span className="text-white/40 text-xs">watching</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)'}}>
                    <div className="flex items-center gap-1.5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-0.5 rounded-full transition-all duration-300 ${i < signalStrength ? 'bg-emerald-400' : 'bg-white/20'}`}
                          style={{height: `${(i+1)*4 + 4}px`}} />
                      ))}
                    </div>
                    <span className="text-white/60 text-xs font-mono">{bitrate} Mbps</span>
                  </div>
                </div>
              )}

              {/* Audio waveform indicator */}
              {isLive && !isMuted && (
                <div className="absolute top-6 right-6 flex items-center gap-1 px-2 py-1.5 rounded-lg" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)'}}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bar w-0.5 bg-emerald-400 rounded-full" style={{height: '4px', animationDelay: `${i * 0.1}s`}} />
                  ))}
                </div>
              )}

              {/* Camera off overlay */}
              {isCamOff && isLive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{background: 'rgba(9,9,11,0.92)'}}>
                  <VideoOff size={40} className="text-white/20 mb-3" />
                  <p className="text-white/30 text-sm">Camera paused</p>
                </div>
              )}

              {/* Pre-live states */}
              {!isLive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5" style={{background: 'rgba(9,9,11,0.88)'}}>
                  {(status === "idle" || status === "ended") && (
                    <>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(34,211,153,0.15), rgba(99,102,241,0.15))', border: '1px solid rgba(34,211,153,0.2)'}}>
                        <Camera size={28} className="text-emerald-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold text-lg mb-1">{status === "ended" ? "Session Ended" : "Ready to Go Live"}</p>
                        <p className="text-white/30 text-sm">Configure your stream and click Start</p>
                      </div>
                    </>
                  )}
                  {status === "error" && (
                    <>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)'}}>
                        <AlertCircle size={28} className="text-red-400" />
                      </div>
                      <p className="text-red-400 text-sm text-center max-w-xs">{error}</p>
                    </>
                  )}
                  {(status === "initializing" || status === "connecting") && (
                    <>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)'}}>
                        <Signal size={28} className="text-indigo-400 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-medium mb-1">{status === "initializing" ? "Initializing camera..." : "Connecting to network..."}</p>
                        <div className="flex justify-center gap-1 mt-2">
                          {[0,1,2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: `${i*150}ms`}} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {status !== "live" ? (
                  <button
                    onClick={startSession}
                    disabled={status === "initializing" || status === "connecting"}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
                    style={{background: 'linear-gradient(135deg, #22d3ee, #6366f1)', color: '#fff', boxShadow: '0 8px 32px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'}}
                  >
                    <Play size={16} fill="white" />
                    Start Broadcasting
                  </button>
                ) : (
                  <button
                    onClick={stopSession}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171'}}
                  >
                    <StopCircle size={16} />
                    End Stream
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Timer */}
                {isLive && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass mr-2">
                    <Clock size={13} className="text-white/40" />
                    <span  className="text-white text-sm">{fmtTime(elapsed)}</span>
                  </div>
                )}

                <button
                  onClick={toggleMic}
                  disabled={!isLive}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                  style={{
                    background: isMuted ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                    border: isMuted ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    color: isMuted ? '#f87171' : 'rgba(255,255,255,0.6)'
                  }}
                >
                  {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                <button
                  onClick={toggleCam}
                  disabled={!isLive}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                  style={{
                    background: isCamOff ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                    border: isCamOff ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    color: isCamOff ? '#f87171' : 'rgba(255,255,255,0.6)'
                  }}
                >
                  {isCamOff ? <VideoOff size={16} /> : <Video size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL — 4 cols */}
          <div className="overflow-y-auto col-span-4 space-y-4">

            {/* Live Stats */}
            <div className="glass rounded-2xl p-5">
              <p className="text-[11px] text-white/30 uppercase tracking-widest mb-4">Stream Metrics</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Viewers", value: viewerCount, icon: <Eye size={14} />, color: "#22d3ee" },
                  { label: "Duration", value: fmtTime(elapsed), icon: <Clock size={14} />, color: "#a78bfa", mono: true },
                  { label: "Bitrate", value: isLive ? `${bitrate}M` : "—", icon: <Activity size={14} />, color: "#34d399" },
                  { label: "Quality", value: isLive ? "720p" : "—", icon: <Zap size={14} />, color: "#fb923c" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-xl" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                    <div className="flex items-center gap-1.5 mb-2" style={{color: stat.color}}>
                      {stat.icon}
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-white font-semibold text-lg" >{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Info */}
            <div className="glass rounded-2xl p-5">
              <p className="text-[11px] text-white/30 uppercase tracking-widest mb-4">Session Info</p>
              <div className="space-y-3">
                {[
                  { label: "Host", value: SESSION_INFO.trainer },
                  { label: "Center", value: SESSION_INFO.center },
                  { label: "Batch", value: SESSION_INFO.batch },
                  { label: "Trade", value: SESSION_INFO.trade },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-white/30 text-sm">{item.label}</span>
                    <span className="text-white/80 text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Section */}
        <div className="space-y-6 mt-6">

            {/* Share Link */}
            {sessionId && (
              <div className="rounded-2xl p-5" style={{background: 'rgba(34,211,153,0.05)', border: '1px solid rgba(34,211,153,0.15)'}}>
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={14} className="text-emerald-400" />
                  <p className="text-[11px] text-emerald-400/70 uppercase tracking-widest">Share Link</p>
                </div>
                <div className="p-3 rounded-xl mb-3" style={{background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)'}}>
                  <p className="text-emerald-400/80 text-[11px] break-all leading-relaxed" >
                    {shareLink}
                  </p>
                </div>
                <button
                  onClick={copyLink}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: copied ? 'rgba(34,211,153,0.15)' : 'rgba(34,211,153,0.9)',
                    color: copied ? '#34d399' : '#000',
                    border: copied ? '1px solid rgba(34,211,153,0.3)' : 'none'
                  }}
                >
                  {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Invite Link</>}
                </button>
              </div>
            )}

            {/* Activity Log */}
            <div className="glass rounded-2xl p-5">
              <p className="text-[11px] text-white/30 uppercase tracking-widest mb-4">Activity Log</p>
              {logs.length === 0 ? (
                <p className="text-white/20 text-sm">Waiting for events...</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-hidden">
                  {logs.map((log, i) => (
                    <div key={i} className="log-entry flex items-start gap-2">
                      <span  className="text-white/20 mt-0.5 shrink-0">{log.time}</span>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        log.type === 'success' ? 'bg-emerald-400' :
                        log.type === 'error' ? 'bg-red-400' :
                        log.type === 'viewer' ? 'bg-cyan-400' : 'bg-white/20'
                      }`} />
                      <span className="text-white/50 text-xs leading-relaxed">{log.msg}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}