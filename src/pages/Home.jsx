import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, UserCog, Lock, Mouse } from "lucide-react";
import Lenis from "lenis";

/* ===================== CONFIG ===================== */

const ROLES = ["Super Admin", "Admin", "Mobilizer", "Trainer", "Placement Officer"];
const ROLE_ROUTES = {
  "Super Admin": "/super-admin", Admin: "/admin", Mobilizer: "/mobilizer/dashboard",
  Trainer: "/trainer", "Placement Officer": "/placement-officer",
};
const DUMMY_ID = "kovon";
const DUMMY_PASSWORD = "1234";
const ROLE_COLORS = {
  "Super Admin": { primary: "#ef4444", orb: "bg-red-500/20" },
  Mobilizer: { primary: "#facc15", orb: "bg-yellow-400/20" },
  Trainer: { primary: "#34d399", orb: "bg-emerald-400/20" },
  Admin: { primary: "#7f0fffff", orb: "bg-violet-600/20" },
  "Placement Officer": { primary: "#22d3ee", orb: "bg-cyan-400/20" },
  default: { primary: "#ef4444", orb: "bg-red-500/20" },
};

/* Tunnel ring images */
const RINGS = [
  { z: 0,    img: "/images/mine/scene1.png", label: "Surface Operations" },
  { z: 2000, img: "/images/mine/scene2.png", label: "Tunnel Network" },
  { z: 4000, img: "/images/mine/scene3.png", label: "Extraction Zone" },
  { z: 6000, img: "/images/mine/scene4.png", label: "Deep Core" },
];

const TOTAL_Z = 7500;

/* Phase text overlays for cinematic storytelling */
const PHASE_TEXT = [
  "Skill Development Infrastructure",
  "Training India's Blue Collar Workforce",
  "Mining • Construction • Shipping • Logistics",
  "",
];

/* Helpers */
function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* Generate dust particles — increased count with varied types */
function makeDust(count) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const type = i < count * 0.6 ? "dust" : i < count * 0.85 ? "ember" : "spark";
    arr.push({
      id: i,
      type,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * TOTAL_Z,
      size: type === "dust" ? 1.5 + Math.random() * 3
           : type === "ember" ? 2 + Math.random() * 2.5
           : 1 + Math.random() * 1.5,
      opacity: type === "dust" ? 0.15 + Math.random() * 0.35
              : type === "ember" ? 0.4 + Math.random() * 0.5
              : 0.7 + Math.random() * 0.3,
      drift: 8 + Math.random() * 16,
      speed: type === "dust" ? 4 + Math.random() * 8
            : type === "ember" ? 3 + Math.random() * 5
            : 1 + Math.random() * 2,
      color: type === "dust" ? "rgba(245,200,120,0.8)"
            : type === "ember" ? "rgba(255,140,40,0.9)"
            : "rgba(255,230,160,1)",
      depthAppear: type === "dust" ? 0 : type === "ember" ? 0.45 : 0.5,
    });
  }
  return arr;
}

/* Deterministic camera shake using sine waves */
function getShake(progress, intensity) {
  const t = progress * 200;
  const x = Math.sin(t * 1.1) * 0.5 + Math.sin(t * 2.3) * 0.3 + Math.sin(t * 4.7) * 0.2;
  const y = Math.cos(t * 1.3) * 0.4 + Math.cos(t * 3.1) * 0.3 + Math.sin(t * 5.3) * 0.15;
  return { x: x * intensity, y: y * intensity };
}

/* ===================== MAIN ===================== */

export default function Home() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [role, setRole] = useState("Admin");
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [error, setError] = useState("");
  const [time, setTime] = useState(0);

  const theme = ROLE_COLORS[role] || ROLE_COLORS.default;
  const dust = useMemo(() => makeDust(90), []);

  /* Animation time for flickering / scan effects */
  useEffect(() => {
    let raf;
    let start = performance.now();
    function tick(now) {
      setTime((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Lenis */
  useEffect(() => {
    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: wrapperRef.current?.firstElementChild,
      duration: 2.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenis.on("scroll", ({ progress: p }) => setProgress(p));
    let raf;
    function loop(time) { lenis.raf(time); raf = requestAnimationFrame(loop); }
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (credentials.id === DUMMY_ID && credentials.password === DUMMY_PASSWORD) {
      setError(""); navigate(ROLE_ROUTES[role]);
    } else setError("Invalid ID or password");
  }, [credentials, role, navigate]);

  /* ---- Derived cinematic values ---- */
  const tunnelProgress = clamp(progress / 0.82, 0, 1);
  const cameraZ = tunnelProgress * TOTAL_Z;
  const loginT = clamp((progress - 0.82) / 0.18, 0, 1);
  const depthNum = Math.round(tunnelProgress * 500);

  /* Phase system: 0-25%, 25-50%, 50-75%, 75-100% */
  const phase = tunnelProgress < 0.25 ? 0
              : tunnelProgress < 0.50 ? 1
              : tunnelProgress < 0.75 ? 2 : 3;

  /* Per-phase local interpolation 0→1 */
  const phaseT = clamp((tunnelProgress - phase * 0.25) / 0.25, 0, 1);

  /* Camera shake — increases with depth */
  const shakeIntensity = phase === 0 ? 0
                       : phase === 1 ? lerp(0, 1.5, phaseT)
                       : phase === 2 ? lerp(1.5, 3, phaseT) : 0;
  const shake = getShake(tunnelProgress, shakeIntensity);

  /* Industrial flicker — active in Phase 1-2 */
  const flickerOpacity = (phase === 1 || phase === 2)
    ? (0.03 + 0.04 * Math.abs(Math.sin(time * 8.7)) * Math.abs(Math.cos(time * 13.3)))
    : 0;

  /* Depth fog density */
  const fogDensity = lerp(0, 0.6, tunnelProgress);

  /* Vignette tighting and color */
  const vignetteCenter = lerp(45, 10, tunnelProgress);
  const vignetteEdge = lerp(85, 45, tunnelProgress);
  const vignetteR = phase >= 2 ? lerp(0, 40, clamp((tunnelProgress - 0.5) / 0.25, 0, 1)) : 0;
  const vignetteG = 0;
  const vignetteB = 0;

  /* Phase text opacity — fade in at start, fade out at end of each phase */
  const phaseTextOpacity = phase < 3
    ? clamp(Math.sin(phaseT * Math.PI) * 1.4, 0, 1) * (1 - loginT)
    : 0;

  /* Volumetric beam rotation */
  const beamAngle = 180 + tunnelProgress * 120;
  const beamOpacity = lerp(0.12, 0.25, tunnelProgress) * (1 - loginT);

  /* Active ring label */
  const activeRing = RINGS.reduce((prev, ring, i) =>
    cameraZ >= ring.z ? i : prev, 0);

  /* Scan line position */
  const scanY = ((time * 30) % 110) - 5;

  return (
    <div ref={wrapperRef} className="tunnelHome fixed inset-0 w-full h-screen overflow-y-auto overflow-x-hidden">
      <div style={{ height: "700vh" }}>

        {/* ====== FIXED VIEWPORT ====== */}
        <div className="fixed inset-0 w-full h-screen overflow-hidden bg-transparent">

          {/* ====== 3D TUNNEL ====== */}
          <div
            className="absolute inset-0"
            style={{
              perspective: "800px",
              perspectiveOrigin: "50% 50%",
              opacity: 1 - loginT,
              transform: `translate(${shake.x}px, ${shake.y}px)`,
              willChange: "transform, opacity",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                transformStyle: "preserve-3d",
                transform: `translateZ(${cameraZ}px)`,
                willChange: "transform",
              }}
            >
              {/* Tunnel rings — each is a plane at a Z depth */}
              {RINGS.map((ring, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    width: "200vw",
                    height: "200vh",
                    left: "-50vw",
                    top: "-50vh",
                    transform: `translateZ(${-ring.z}px)`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <img
                    src={ring.img}
                    alt=""
                    className="w-full h-full object-cover"
                    loading={i < 2 ? "eager" : "lazy"}
                    style={{ filter: `brightness(${lerp(0.7 + i * 0.05, 0.3 + i * 0.03, tunnelProgress)})` }}
                  />
                  {/* Hole/viewport mask — dark border with transparent center */}
                  <div className="absolute inset-0" style={{
                    background: `radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.98) 70%)`,
                  }} />
                </div>
              ))}

              {/* Floating dust / ember / spark particles in 3D space */}
              {dust.map((p) => {
                const relZ = p.z - cameraZ;
                if (relZ < -200 || relZ > 3000) return null;
                if (tunnelProgress < p.depthAppear) return null;
                const scale = clamp(800 / (800 + relZ), 0, 3);
                const animName = p.type === "ember" ? "emberFloat"
                               : p.type === "spark" ? `sparkFlash`
                               : `dustFloat${p.id % 3}`;
                return (
                  <div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      left: `${p.x}vw`,
                      top: `${p.y}vh`,
                      background: p.color,
                      transform: `translateZ(${-p.z}px) scale(${scale})`,
                      opacity: p.opacity * clamp(1 - relZ / 2500, 0, 1),
                      animation: `${animName} ${p.speed}s ease-in-out infinite`,
                      willChange: "transform, opacity",
                      boxShadow: p.type === "ember" ? "0 0 6px rgba(255,140,40,0.6)" : p.type === "spark" ? "0 0 8px rgba(255,230,160,0.8)" : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* ====== VOLUMETRIC LIGHT BEAMS ====== */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: beamOpacity,
              background: `conic-gradient(from ${beamAngle}deg at 50% 50%, transparent 0deg, rgba(255,160,40,0.10) 15deg, transparent 35deg, rgba(239,68,68,0.06) 90deg, transparent 110deg, rgba(245,158,11,0.08) 160deg, transparent 200deg, rgba(255,120,20,0.07) 270deg, transparent 310deg, rgba(251,191,36,0.05) 340deg, transparent 360deg)`,
              animation: "raysSpin 25s linear infinite",
              willChange: "opacity",
            }}
          />
          {/* Secondary beam layer — slower, offset */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: beamOpacity * 0.6,
              background: `conic-gradient(from ${beamAngle + 60}deg at 48% 52%, transparent 0deg, rgba(255,200,80,0.06) 25deg, transparent 55deg, rgba(200,100,20,0.04) 130deg, transparent 180deg, rgba(255,150,50,0.05) 260deg, transparent 330deg)`,
              animation: "raysSpin 35s linear infinite reverse",
            }}
          />

          {/* ====== DEPTH FOG ====== */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: fogDensity * (1 - loginT),
              background: `linear-gradient(180deg, rgba(40,20,5,0.1) 0%, rgba(30,15,5,${lerp(0.1, 0.5, tunnelProgress)}) 40%, rgba(20,8,0,${lerp(0.15, 0.7, tunnelProgress)}) 70%, rgba(10,4,0,0.5) 100%)`,
              willChange: "opacity",
            }}
          />

          {/* ====== INDUSTRIAL FLICKER ====== */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: flickerOpacity * (1 - loginT),
              background: "radial-gradient(ellipse at 50% 40%, rgba(255,180,60,0.5) 0%, rgba(255,120,20,0.2) 30%, transparent 65%)",
              willChange: "opacity",
            }}
          />

          {/* ====== ENHANCED VIGNETTE ====== */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, transparent ${vignetteCenter}%, rgba(${vignetteR},${vignetteG},${vignetteB},0.95) ${vignetteEdge}%)`,
              opacity: 1 - loginT,
            }}
          />

          {/* ====== DEPTH SCAN LINES ====== */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.03 * (1 - loginT),
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
            }}
          />

          {/* ====== SWEEPING SCAN LINE ====== */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: 0,
              right: 0,
              top: `${scanY}%`,
              height: "2px",
              background: "linear-gradient(90deg, transparent 0%, rgba(255,160,40,0.15) 20%, rgba(255,160,40,0.3) 50%, rgba(255,160,40,0.15) 80%, transparent 100%)",
              opacity: 0.4 * (1 - loginT),
              boxShadow: "0 0 12px 2px rgba(255,160,40,0.1)",
            }}
          />

          {/* ====== TRANSITION BLUR OVERLAY (tunnel→login) ====== */}
          {loginT > 0 && loginT < 1 && (
            <div
              className="absolute inset-0 pointer-events-none z-15"
              style={{
                backdropFilter: `blur(${lerp(0, 8, clamp(loginT * 3, 0, 1)) * (1 - clamp((loginT - 0.5) * 2, 0, 1))}px)`,
                background: `radial-gradient(ellipse at center, rgba(2,6,23,${loginT * 0.5}) 0%, rgba(2,6,23,${loginT * 0.8}) 100%)`,
              }}
            />
          )}

          {/* ====== HUD OVERLAY ====== */}
          <div className="absolute inset-0 z-10 pointer-events-none" style={{ opacity: 1 - loginT }}>

            {/* Corner brackets — top-left */}
            <div className="absolute top-4 left-4">
              <div className="w-8 h-8 border-l-2 border-t-2 border-amber-500/20" />
            </div>
            {/* Corner brackets — top-right */}
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 border-r-2 border-t-2 border-amber-500/20" />
            </div>
            {/* Corner brackets — bottom-left */}
            <div className="absolute bottom-4 left-4">
              <div className="w-8 h-8 border-l-2 border-b-2 border-amber-500/20" />
            </div>
            {/* Corner brackets — bottom-right */}
            <div className="absolute bottom-4 right-4">
              <div className="w-8 h-8 border-r-2 border-b-2 border-amber-500/20" />
            </div>

            {/* Depth gauge */}
            <div className="absolute top-8 left-8">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-red-500/70 uppercase tracking-[0.35em]">
                  Depth Gauge
                </span>
              </div>
              <p className="text-5xl font-black text-white font-mono tabular-nums leading-none">
                {depthNum}<span className="text-sm text-slate-600 ml-1 font-sans font-bold">m</span>
              </p>
              {/* Sector indicator */}
              <div className="mt-3 flex items-center gap-2">
                <div className="w-6 h-px bg-amber-500/40" />
                <span className="text-[8px] font-bold text-amber-500/50 uppercase tracking-[0.3em]">
                  Sector {phase + 1}
                </span>
              </div>
            </div>

            {/* Layer name */}
            <div className="absolute top-8 right-8 text-right">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.35em] mb-1">Zone</p>
              <p className="text-sm font-black text-white/60">{RINGS[activeRing].label}</p>
            </div>

            {/* Phase status bar — appears in deeper phases */}
            {phase >= 1 && (
              <div className="absolute top-24 right-8 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[8px] font-bold uppercase tracking-[0.25em]"
                    style={{ color: phase >= 2 ? "rgba(239,68,68,0.6)" : "rgba(245,158,11,0.5)" }}>
                    {phase >= 2 ? "⚠ Deep Zone" : "Descending"}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${phase >= 2 ? "bg-red-500" : "bg-amber-500"}`}
                    style={{ animation: phase >= 2 ? "flicker 0.3s ease-in-out infinite" : "none" }}
                  />
                </div>
              </div>
            )}

            {/* ====== CINEMATIC PHASE TEXT OVERLAY ====== */}
            {phase < 3 && tunnelProgress > 0.02 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div style={{
                  opacity: phaseTextOpacity,
                  transform: `scale(${lerp(0.92, 1.05, phaseT)}) translateY(${lerp(20, -5, phaseT)}px)`,
                  transition: "opacity 0.3s ease-out",
                }}>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-center select-none leading-tight"
                    style={{
                      color: "rgba(255,255,255,0.08)",
                      textShadow: phase === 0
                        ? "0 0 60px rgba(255,200,100,0.15), 0 0 120px rgba(255,160,40,0.08)"
                        : phase === 1
                        ? "0 0 60px rgba(239,68,68,0.15), 0 0 120px rgba(200,80,30,0.08)"
                        : "0 0 80px rgba(239,68,68,0.2), 0 0 160px rgba(180,40,20,0.1)",
                      letterSpacing: phase === 2 ? "0.15em" : "-0.02em",
                    }}>
                    {PHASE_TEXT[phase]}
                  </h2>
                  {/* Subtitle line */}
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <div className="w-12 h-px" style={{ background: `rgba(255,160,40,${phaseTextOpacity * 0.3})` }} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em]"
                      style={{ color: `rgba(255,200,120,${phaseTextOpacity * 0.4})` }}>
                      {phase === 0 ? "Pantiss Skill University" : phase === 1 ? "National Initiative" : "Industry Sectors"}
                    </span>
                    <div className="w-12 h-px" style={{ background: `rgba(255,160,40,${phaseTextOpacity * 0.3})` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Scroll hint */}
            {progress < 0.03 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                <Mouse size={20} className="text-slate-500" />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
                  Scroll to Explore
                </span>
              </div>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <div className="w-40 h-[2px] bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                    background: phase < 2
                      ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                      : "linear-gradient(90deg, #ef4444, #dc2626)",
                  }} />
              </div>
              {/* Phase dots */}
              <div className="flex justify-between mt-2 px-1">
                {[0, 1, 2, 3].map((p) => (
                  <div key={p} className="w-1 h-1 rounded-full"
                    style={{
                      background: phase >= p ? (phase >= 2 ? "#ef4444" : "#f59e0b") : "rgba(255,255,255,0.1)",
                      boxShadow: phase === p ? `0 0 6px ${phase >= 2 ? "rgba(239,68,68,0.6)" : "rgba(245,158,11,0.6)"}` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ====== LOGIN ====== */}
          <div
            className="absolute inset-0 z-20"
            style={{
              opacity: loginT,
              pointerEvents: loginT > 0.15 ? "auto" : "none",
              transform: `scale(${lerp(1.06, 1, loginT)})`,
            }}
          >
            {/* Background: industrial orange → modern blue transition */}
            <div className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, #020617 0%, ${lerp(0, 1, loginT) > 0.5 ? "#020617" : "#0a0805"} 100%)`,
              }}
            >
              <div className={`absolute w-[700px] h-[700px] ${theme.orb} blur-[160px] rounded-full top-[-200px] left-[-200px]`}
                style={{ animation: "floatSlow 12s ease-in-out infinite" }} />
              <div className={`absolute w-[600px] h-[600px] ${theme.orb} blur-[160px] rounded-full bottom-[-150px] right-[-150px]`}
                style={{ animation: "floatSlow2 14s ease-in-out infinite" }} />
              <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[60px_60px]"
                style={{ animation: "gridMove 20s linear infinite" }} />

              {/* Power-on light sweep */}
              <div className="absolute inset-0 overflow-hidden">
                <div style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: "200px",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
                  animation: "powerSweep 4s ease-in-out infinite",
                  animationDelay: "0.5s",
                }} />
              </div>
            </div>

            <div className="relative z-10 h-full grid lg:grid-cols-2">
              {/* Brand */}
              <div className="hidden lg:flex flex-col justify-center px-20">
                <div className="max-w-lg" style={{
                  opacity: clamp((loginT - 0.3) / 0.4, 0, 1),
                  transform: `translateY(${lerp(30, 0, clamp((loginT - 0.3) / 0.5, 0, 1))}px)`,
                }}>
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck size={28} style={{ color: theme.primary }} />
                    <h1 className="text-2xl font-semibold text-white">PSU ERP</h1>
                  </div>
                  <h2 className="text-4xl font-semibold leading-tight mb-5 text-white">
                    Intelligent Skill Development
                    <span className="ml-2" style={{ color: theme.primary }}>Management System</span>
                  </h2>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Unified enterprise platform for training operations, workforce development,
                    compliance monitoring, and institutional performance analytics.
                  </p>
                  <div className="mt-10 flex gap-8 text-xs text-slate-500">
                    <span>Secure Access</span><span>Role Based Control</span><span>Enterprise Grade</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md rounded-2xl p-8 bg-[#020617]/80 backdrop-blur-xl border border-white/10 shadow-2xl"
                  style={{
                    opacity: clamp((loginT - 0.4) / 0.4, 0, 1),
                    transform: `translateY(${lerp(40, 0, clamp((loginT - 0.4) / 0.5, 0, 1))}px)`,
                  }}>
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-1 text-white">Sign in to continue</h3>
                    <p className="text-sm text-white/60">Access your role dashboard securely</p>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs text-white/60 mb-2">Role</p>
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map((r) => (
                        <button key={r} onClick={() => setRole(r)}
                          style={role === r ? { background: theme.primary, color: "#000" } : {}}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${role === r ? "" : "bg-white/5 text-white/80 hover:bg-white/10"}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Input label={`${role} ID`} icon={<UserCog size={16} />} value={credentials.id} color={theme.primary}
                      onChange={(v) => setCredentials({ ...credentials, id: v })} />
                    <Input label="Password" icon={<Lock size={16} />} type="password" value={credentials.password} color={theme.primary}
                      onChange={(v) => setCredentials({ ...credentials, password: v })} />
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <button type="submit" style={{ background: theme.primary }}
                      className="w-full py-3 rounded-lg font-semibold text-sm text-black transition hover:opacity-90">
                      Authenticate & Continue
                    </button>
                  </form>
                  <p className="mt-6 text-[11px] text-slate-500 text-center">
                    Demo credentials: <span style={{ color: theme.primary }}> kovon / 1234</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatSlow  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(40px)}  }
        @keyframes floatSlow2 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-40px)} }
        @keyframes gridMove   { 0%{transform:translate(0,0)} 100%{transform:translate(60px,60px)}  }
        @keyframes raysSpin   { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)}          }
        @keyframes dustFloat0 { 0%,100%{transform:translateX(0) translateY(0)} 50%{transform:translateX(8px) translateY(-6px)} }
        @keyframes dustFloat1 { 0%,100%{transform:translateX(0) translateY(0)} 50%{transform:translateX(-6px) translateY(8px)} }
        @keyframes dustFloat2 { 0%,100%{transform:translateX(0) translateY(0)} 50%{transform:translateX(5px) translateY(5px)} }
        @keyframes emberFloat {
          0%   { transform: translateY(0) translateX(0); opacity: 0.4; }
          25%  { transform: translateY(-8px) translateX(3px); opacity: 0.7; }
          50%  { transform: translateY(-15px) translateX(-2px); opacity: 0.9; }
          75%  { transform: translateY(-22px) translateX(4px); opacity: 0.6; }
          100% { transform: translateY(-30px) translateX(0); opacity: 0.3; }
        }
        @keyframes sparkFlash {
          0%,100% { opacity: 0.1; transform: scale(0.8); }
          15%     { opacity: 1;   transform: scale(1.5); }
          30%     { opacity: 0.3; transform: scale(1.0); }
          50%     { opacity: 0.8; transform: scale(1.3); }
          70%     { opacity: 0.1; transform: scale(0.9); }
        }
        @keyframes flicker {
          0%   { opacity: 1; }
          10%  { opacity: 0.4; }
          20%  { opacity: 1; }
          30%  { opacity: 0.7; }
          40%  { opacity: 1; }
          50%  { opacity: 0.3; }
          60%  { opacity: 0.9; }
          70%  { opacity: 1; }
          80%  { opacity: 0.5; }
          90%  { opacity: 1; }
          100% { opacity: 0.8; }
        }
        @keyframes powerSweep {
          0%   { left: -200px; }
          100% { left: 100%; }
        }
        .tunnelHome::-webkit-scrollbar { display:none; }
        .tunnelHome { scrollbar-width:none; }
      `}</style>
    </div>
  );
}

/* ===================== INPUT ===================== */
function Input({ label, icon, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-xs text-white/60 mb-1 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">{icon}</span>
        <input type={type} value={value} required onChange={(e) => onChange(e.target.value)}
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
          className="w-full pl-9 pr-3 py-3 rounded-lg bg-white/5 border text-sm text-white focus:outline-none focus:ring-2 transition" />
      </div>
    </div>
  );
}
