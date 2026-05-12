import { useEffect, useRef, useState, useCallback } from "react";

import { ShieldCheck, UserCog, Lock, ChevronDown } from "lucide-react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

// ─── Fonts ───────────────────────────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("__psu_fonts")) {
  const el = document.createElement("link");
  el.id = "__psu_fonts";
  el.rel = "stylesheet";
  el.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
  document.head.appendChild(el);
}

// ─── Scene data ──────────────────────────────────────────────────────────────
const SCENES = [
  {
    path: "/Frames/scene1", frames: 300,
    label: "01 · Foundation",
    title: "BUILDING\nINDIA'S\nINDUSTRIAL\nFUTURE",
    body: "World-class vocational training for blue-collar excellence.",
    color: "#00E5FF", rgb: "0,229,255",
  },
  {
    path: "/Frames/scene2", frames: 300,
    label: "02 · Workforce",
    title: "TRAINING\nINDIA'S\nBLUE COLLAR\nWORKFORCE",
    body: "Empowering millions with certified skills and dignified employment.",
    color: "#A78BFA", rgb: "167,139,250",
  },
  {
    path: "/Frames/scene3", frames: 102,
    label: "03 · Sectors",
    title: "MINING\nCONSTRUCTION\nSHIPPING\nLOGISTICS",
    body: "Spanning India's most critical industrial sectors.",
    color: "#34D399", rgb: "52,211,153",
  },
  {
    path: "/Frames/scene4", frames: 300,
    label: "04 · Promise",
    title: "SKILLS THAT\nSHAPE\nNATIONS",
    body: "From training floors to global standards — we build careers.",
    color: "#F59E0B", rgb: "245,158,11",
  },
];
const TOTAL = SCENES.reduce((n, s) => n + s.frames, 0);

// ─── Auth data ───────────────────────────────────────────────────────────────
const ROLES = ["Super Admin", "Admin", "Mobilizer", "Trainer", "Placement Officer"];
const ROLE_ROUTE = {
  "Super Admin": "/super-admin", Admin: "/admin",
  Mobilizer: "/mobilizer/dashboard", Trainer: "/trainer",
  "Placement Officer": "/placement-officer",
};
const ROLE_HEX = {
  "Super Admin":       "#FF2D2D",
  Admin:               "#7C3AFF",
  Mobilizer:           "#F59E00",
  Trainer:             "#00C97A",
  "Placement Officer": "#00BBFF",
};
const ROLE_RGB = {
  "#FF2D2D": "255,45,45",
  "#7C3AFF": "124,58,255",
  "#F59E00": "245,158,0",
  "#00C97A": "0,201,122",
  "#00BBFF": "0,187,255",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getSceneIdx = (frame) => {
  let c = 0;
  for (let i = 0; i < SCENES.length; i++) {
    if (frame < c + SCENES[i].frames) return i;
    c += SCENES[i].frames;
  }
  return SCENES.length - 1;
};

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// ─── Input component ─────────────────────────────────────────────────────────
function AuthInput({ label, type = "text", icon: Icon, value, onChange, accentHex, accentRgb, onFocusChange }) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;

  return (
    <label
      style={{
        display: "block",
        position: "relative",
        borderRadius: 10,
        background: focused ? `rgba(${accentRgb},0.09)` : "rgba(255,255,255,0.04)",
        border: `1px solid ${focused ? accentHex : "rgba(255,255,255,0.1)"}`,
        cursor: "text",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
        boxShadow: focused ? `0 0 0 3px rgba(${accentRgb},0.2), 0 0 20px rgba(${accentRgb},0.15)` : "none",
      }}
    >
      {/* floating label text */}
      <span
        style={{
          position: "absolute",
          left: 44,
          top: raised ? 10 : "50%",
          transform: raised ? "none" : "translateY(-50%)",
          fontSize: raised ? 10 : 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 400,
          letterSpacing: raised ? "0.12em" : "0.02em",
          textTransform: raised ? "uppercase" : "none",
          color: focused ? accentHex : "rgba(255,255,255,0.35)",
          pointerEvents: "none",
          userSelect: "none",
          transition: "top 0.18s ease, font-size 0.18s ease, color 0.18s ease, transform 0.18s ease, letter-spacing 0.18s ease",
          zIndex: 1,
        }}
      >
        {label}
      </span>

      {/* icon */}
      <span
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: focused ? accentHex : "rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "center",
          transition: "color 0.18s",
          pointerEvents: "none",
        }}
      >
        <Icon size={16} />
      </span>

      <input
        type={type}
        value={value}
        required
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setFocused(true);
          onFocusChange?.(true);
        }}
        onBlur={() => {
          setFocused(false);
          onFocusChange?.(false);
        }}
        style={{
          display: "block",
          width: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          padding: "22px 16px 8px 44px",
          fontSize: 16,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          color: "#fff",
          letterSpacing: "0.01em",
        }}
      />

      {/* bottom accent line */}
      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: focused ? "4px" : "50%",
          right: focused ? "4px" : "50%",
          height: 1,
          background: accentHex,
          opacity: focused ? 0.7 : 0,
          borderRadius: 1,
          transition: "left 0.25s ease, right 0.25s ease, opacity 0.25s ease",
        }}
      />
    </label>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Home2() {

  // Refs
  const wrapRef      = useRef(null);
  const canvasRef    = useRef(null);
  const imagesRef    = useRef([]);
  const frameRef     = useRef({ value: 0 });
  const loginFlagRef = useRef(false);
  const loginLockedRef = useRef(false);
  const lenisRef = useRef(null);
  const scrollTweenRef = useRef(null);
  const rafLoginRef   = useRef(null);
  const rafSceneRef   = useRef(null);
  const loginTRef     = useRef(0);
  const transRef      = useRef({ active: false, t: 0, dir: 1 }); // transition state
  const rafTransRef   = useRef(null);   // RAF id for transition animation
  const prevSceneRef  = useRef(-1);     // tracks last known scene index
  const authInputFocusedRef = useRef(false);
  const viewportRef = useRef({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // State
  const [sceneIdx, setSceneIdx]   = useState(0);
  const [sceneT,   setSceneT]     = useState(1);     // 0→1 reveal on scene change
  const [loginT,   setLoginT]     = useState(0);     // 0→1 login reveal
  const [showLogin, setShowLogin] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [role,     setRole]       = useState("Admin");
  const [id,       setId]         = useState("");
  const [pw,       setPw]         = useState("");
  const [err,      setErr]        = useState("");

  const acHex = ROLE_HEX[role] || "#A78BFA";
  const acRgb = ROLE_RGB[acHex] || "167,139,250";

  // ── Login T animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (rafLoginRef.current) cancelAnimationFrame(rafLoginRef.current);
    const target = showLogin ? 1 : 0;
    const from   = loginTRef.current;
    let t0 = null;

    const tick = (now) => {
      if (!t0) t0 = now;
      const p = Math.min((now - t0) / 850, 1);
      const v = from + (target - from) * easeInOutCubic(p);
      loginTRef.current = v;
      setLoginT(v);
      if (p < 1) rafLoginRef.current = requestAnimationFrame(tick);
    };

    rafLoginRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafLoginRef.current);
  }, [showLogin]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (id === "kovon" && pw === "1234") {
      setErr("");
      // Kill all GSAP animations and Lenis before leaving —
      // prevents overflow:hidden / pinned scroll poisoning the next route.
      if (rafLoginRef.current) cancelAnimationFrame(rafLoginRef.current);
      if (rafSceneRef.current) cancelAnimationFrame(rafSceneRef.current);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.killTweensOf(frameRef.current);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      // Hard navigate — fully unmounts this component and all its side effects.
      window.location.href = ROLE_ROUTE[role];
    } else {
      setErr("Invalid credentials — try kovon / 1234");
    }
  }, [id, pw, role]);

  // ── Lenis ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({ 
      duration: 2.2, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;
    const loop  = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
    const id    = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // ── Canvas + GSAP scroll ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");

    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    let zoom = 1.0;

    // ── Canvas crossfade between scenes ────────────────────────────────────────
    // Duration for the canvas crossfade (ms). Text layer uses 600ms separately.
    // ── Scene transition: dark-crush zoom-in + snap reveal ─────────────────────
    // t: 0 = start, 0.5 = full black (pivot), 1 = new scene fully revealed
    // Phase 1 (t 0→0.5): current frame zooms in + crushes to black
    // Phase 2 (t 0.5→1): new scene rises from black + sharpens
    const TRANS_MS  = 480;  // total transition duration ms
    const easeIn3   = (t) => t * t * t;
    const easeOut3  = (t) => 1 - Math.pow(1 - t, 3);

    const drawImage = (img, scale, alpha) => {
      const { width: cw, height: ch } = canvas;
      const base = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * zoom;
      const s    = base * scale;
      const ox   = (cw - img.naturalWidth  * s) / 2;
      const oy   = (ch - img.naturalHeight * s) / 2;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.drawImage(img, ox, oy, img.naturalWidth * s, img.naturalHeight * s);
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      const fi  = Math.round(Math.max(0, Math.min(frameRef.current.value, TOTAL - 1)));
      const img = imagesRef.current[fi];
      if (!img?.complete || !img.naturalWidth) return;

      const si = getSceneIdx(fi);
      const cw = canvas.width, ch = canvas.height;

      // ── Scene boundary crossed — fire transition ───────────────────────────
      if (si !== prevSceneRef.current && prevSceneRef.current !== -1) {
        if (rafTransRef.current) cancelAnimationFrame(rafTransRef.current);
        transRef.current = { active: true, t: 0 };

        // Text layer: reset and animate in after the midpoint
        if (rafSceneRef.current) cancelAnimationFrame(rafSceneRef.current);
        setSceneT(0);

        let t0 = null;
        const animTrans = (now) => {
          if (!t0) t0 = now;
          const raw = Math.min((now - t0) / TRANS_MS, 1);
          transRef.current.t = raw;

          // Text reveal starts at midpoint (t=0.5) so it rises with the new scene
          if (raw >= 0.5) {
            const textP = (raw - 0.5) / 0.5; // 0→1 in second half
            setSceneT(easeOut3(textP));
          }

          if (raw < 1) {
            rafTransRef.current = requestAnimationFrame(animTrans);
          } else {
            transRef.current.active = false;
            if (rafSceneRef.current) cancelAnimationFrame(rafSceneRef.current);
            setSceneT(1);
          }
        };
        rafTransRef.current = requestAnimationFrame(animTrans);
      }
      prevSceneRef.current = si;

      // ── Draw ──────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, cw, ch);

      const { active, t } = transRef.current;

      if (active) {
        if (t < 0.5) {
          // Phase 1: zoom in + fade to black
          const p     = t / 0.5;                   // 0→1
          const scale = 1 + easeIn3(p) * 0.06;     // zoom in up to +6%
          const alpha = 1 - easeIn3(p);             // fade to black
          drawImage(img, scale, alpha);
          // Dark crush overlay
          ctx.fillStyle = `rgba(4,6,14,${easeIn3(p)})`;
          ctx.fillRect(0, 0, cw, ch);
        } else {
          // Phase 2: new scene punches in from black
          const p     = (t - 0.5) / 0.5;           // 0→1
          const scale = 1 + (1 - easeOut3(p)) * 0.04; // starts slightly zoomed, settles
          const alpha = easeOut3(p);                // fade in from black
          drawImage(img, scale, alpha);
          // Lift the dark crush
          ctx.fillStyle = `rgba(4,6,14,${1 - easeOut3(p)})`;
          ctx.fillRect(0, 0, cw, ch);
        }
      } else {
        // Normal draw — no transition active
        drawImage(img, 1, 1);
      }

      setSceneIdx(si);
    };

    // ── Progressive chunked image preloading ──────────────────────────────────
    const imgs = new Array(TOTAL).fill(null);
    imagesRef.current = imgs;

    const allFrames = [];
    let offset = 0;
    SCENES.forEach((sc) => {
      for (let i = 0; i < sc.frames; i++) {
        allFrames.push({ idx: offset + i, src: `${sc.path}/frame_${String(i).padStart(4, "0")}.webp` });
      }
      offset += sc.frames;
    });

    // Load first scene immediately for first paint
    const firstSceneCount = SCENES[0].frames;
    for (let i = 0; i < firstSceneCount; i++) {
      const img = new Image();
      img.src = allFrames[i].src;
      img.onload = () => { if (i === 0) { prevSceneRef.current = 0; draw(); } };
      imgs[allFrames[i].idx] = img;
    }

    // Load remaining scenes in idle batches
    const BATCH = 15;
    let cursor = firstSceneCount;
    const idleIds = [];
    const loadBatch = (deadline) => {
      while (cursor < allFrames.length && (deadline.timeRemaining() > 2 || !deadline.didTimeout)) {
        const end = Math.min(cursor + BATCH, allFrames.length);
        for (let i = cursor; i < end; i++) {
          const img = new Image();
          img.src = allFrames[i].src;
          imgs[allFrames[i].idx] = img;
        }
        cursor = end;
        if (cursor >= allFrames.length) break;
      }
      if (cursor < allFrames.length) idleIds.push(requestIdleCallback(loadBatch, { timeout: 300 }));
    };
    idleIds.push(requestIdleCallback(loadBatch, { timeout: 200 }));

    if (imgs[0]?.complete) draw();

    const fireLogin = (on) => {
      if (loginLockedRef.current && !on) return;
      if (!on && authInputFocusedRef.current) return;
      if (on === loginFlagRef.current) return;

      if (on) {
        loginLockedRef.current = true;
        lenisRef.current?.stop?.();
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        scrollTweenRef.current?.scrollTrigger?.disable(false);
      }

      loginFlagRef.current = on;
      setShowLogin(on);
    };

    // GSAP scroll scrub
    const tween = gsap.to(frameRef.current, {
      value: TOTAL - 1,
      ease: "none",
      scrollTrigger: {
        trigger:      wrap,
        start:        "top top",
        end:          "+=9000",
        scrub:        0.5,
        pin:          true,
        anticipatePin: 1,
        onUpdate: (st) => {
          zoom = 1 + st.progress * 0.03;
          setProgress(st.progress);
          draw();
          fireLogin(st.progress >= 0.92);
        },
        onLeave:     () => fireLogin(true),
        onLeaveBack: () => fireLogin(false),
      },
    });
    scrollTweenRef.current = tween;

    const onResize = () => {
      const nextViewport = { width: window.innerWidth, height: window.innerHeight };
      const widthChanged = Math.abs(nextViewport.width - viewportRef.current.width) > 2;
      const heightChanged = Math.abs(nextViewport.height - viewportRef.current.height) > 2;
      viewportRef.current = nextViewport;

      if (authInputFocusedRef.current && heightChanged && !widthChanged) return;

      setSize();
      draw();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      tween.kill();
      scrollTweenRef.current = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener("resize", onResize);
      if (rafSceneRef.current) cancelAnimationFrame(rafSceneRef.current);
      if (rafTransRef.current) cancelAnimationFrame(rafTransRef.current);
      idleIds.forEach((id) => cancelIdleCallback(id));
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scene = SCENES[sceneIdx];
  const tText = easeOutCubic(Math.max(0, sceneT));       // scene text reveal
  const tLogin = easeOutCubic(Math.max(0, (loginT - 0.2) / 0.8)); // card reveal (delayed vs backdrop)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", width: "100%", height: "100vh",  overflow: "hidden" }}
    >
      {/* ════════════════════════════════════════════════════════
          GLOBAL STYLES
      ════════════════════════════════════════════════════════ */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060810; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0c0e1a inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(7px); }
        }
        @keyframes loginGlow {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%) skewX(-20deg); }
          to   { transform: translateX(300%)  skewX(-20deg); }
        }
        @keyframes patternFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .submit-btn:hover  { transform: translateY(-2px); box-shadow: var(--btn-hover-shadow) !important; }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:hover .btn-shimmer { animation: shimmer 0.55s ease forwards; }
        .role-pill:hover { transform: translateY(-1px); filter: brightness(1.2); }
      `}</style>

      {/* ════════════════════════════════════════════════════════
          LAYER 0 — Canvas (frame animation)
      ════════════════════════════════════════════════════════ */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          width:  "100vw",
          height: "100vh",
        }}
      />

      {/* ════════════════════════════════════════════════════════
          LAYER 1 — Cinematic gradient overlays
          Sit over the canvas, below text.
          Left gradient gives text contrast WITHOUT hiding the canvas.
          The canvas bleeds through on the right ~45% of the viewport.
      ════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 1 - loginT * 0.95,
          transition: "opacity 0.6s ease",
        }}
      >
        {/* Left-side gradient — gives text area its dark background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(100deg, rgba(6,8,16,0.92) 0%, rgba(6,8,16,0.78) 20%, rgba(6,8,16,0.5) 38%, rgba(6,8,16,0.18) 52%, transparent 65%)",
          }}
        />
        {/* Bottom vignette */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "45%",
            background: "linear-gradient(to top, rgba(6,8,16,0.85) 0%, transparent 100%)",
          }}
        />
        {/* Top vignette */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "12%",
            background: "linear-gradient(to bottom, rgba(6,8,16,0.6) 0%, transparent 100%)",
          }}
        />
        {/* Scene accent glow — warm radial, bottom-left quadrant */}
        <div
          style={{
            position: "absolute",
            bottom: -200, left: -100,
            width: 700, height: 700,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${scene.rgb},0.20) 0%, transparent 58%)`,
            filter: "blur(80px)",
            transition: "background 1.2s ease",
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════
          LAYER 2 — Scroll progress bar (right edge)
      ════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          top: 0, right: 0, bottom: 0,
          width: 2,
          zIndex: 5,
          background: "rgba(255,255,255,0.05)",
          opacity: 1 - loginT,
          transition: "opacity 0.5s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: `${progress * 100}%`,
            background: scene.color,
            boxShadow: `0 0 8px ${scene.color}`,
            transition: "background 0.6s, box-shadow 0.6s",
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════
          LAYER 3 — HUD: scene counter dots (left edge, centred)
      ════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          left: 22,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          opacity: 1 - loginT,
          transition: "opacity 0.5s",
        }}
      >
        {SCENES.map((sc, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width:  i === sceneIdx ? 20 : 5,
                height: i === sceneIdx ? 2  : 5,
                borderRadius: i === sceneIdx ? 2 : "50%",
                background: i === sceneIdx ? sc.color : "rgba(255,255,255,0.2)",
                boxShadow: i === sceneIdx ? `0 0 6px ${sc.color}` : "none",
                transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
            {i === sceneIdx && (
              <span
                
              >
                {sc.label.split(" · ")[1]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════
          LAYER 4 — Cinematic text (scene title, body, label)
          Positioned: bottom-left, max ~50vw width
          Fades out as loginT rises
      ════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10,
          pointerEvents: "none",
          opacity: 1 - loginT,
          transition: "opacity 0.6s ease",
        }}
      >
        {/* Top-right: brand stamp */}
        <div
          style={{
            position: "absolute",
            top: 22, right: 28,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: tText * 0.55,
          }}
        >
          <ShieldCheck size={15} color={scene.color} style={{ transition: "color 0.6s" }} />
          <span
            
          >
            Pantiss Skill University
          </span>
          <span
            
          >
            / ERP
          </span>
        </div>

        {/* Left accent stripe */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "14%",
            height: "72%",
            width: 3,
            background: `linear-gradient(to bottom, transparent, ${scene.color}cc 20%, ${scene.color}cc 80%, transparent)`,
            opacity: tText,
            transition: "background 0.9s ease, opacity 0.5s",
          }}
        />

        {/* Main text block */}
        <div
          style={{
            position: "absolute",
            left: 52,
            bottom: 64,
            maxWidth: "min(50vw, 600px)",
          }}
        >
          {/* Scene label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
              opacity: tText,
              transform: `translateX(${(1 - tText) * -18}px)`,
              transition: "opacity 0.45s, transform 0.45s",
            }}
          >
            <div
              style={{
                width: tText * 16,
                height: 1,
                background: scene.color,
                transition: "width 0.5s ease",
              }}
            />
            <span
              
            >
              {scene.label}
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(3.5rem, 9.5vw, 8.5rem)",
              lineHeight: 0.88,
              letterSpacing: "0.02em",
              color: "#ffffff",
              whiteSpace: "pre-line",
              margin: 0,
              opacity: tText,
              transform: `translateY(${(1 - tText) * 28}px)`,
              filter: tText < 0.5 ? `blur(${(1 - tText) * 5}px)` : "none",
              textShadow: `0 0 100px rgba(${scene.rgb},0.25), 0 2px 60px rgba(0,0,0,0.9)`,
              transition: "opacity 0.5s, transform 0.5s, filter 0.4s, text-shadow 0.9s",
            }}
          >
            {scene.title}
          </h1>

          {/* Body */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.8rem, 1.3vw, 0.95rem)",
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.48)",
              fontWeight: 300,
              marginTop: 18,
              letterSpacing: "0.018em",
              maxWidth: 400,
              opacity: tText * 0.9,
              transform: `translateY(${(1 - tText) * 12}px)`,
              filter: tText < 0.6 ? `blur(${(1 - tText) * 3}px)` : "none",
              transition: "opacity 0.55s 0.1s, transform 0.55s 0.1s, filter 0.45s",
            }}
          >
            {scene.body}
          </p>

          {/* Scroll cue (scene 0 only) */}
          {sceneIdx === 0 && (
            <div
              style={{
                marginTop: 30,
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: tText * 0.4,
              }}
            >
              <div style={{ width: 16, height: 1, background: "rgba(255,255,255,0.3)" }} />
              <span
                
              >
                Scroll
              </span>
              <ChevronDown
                size={11}
                color="#fff"
                style={{ animation: "scrollBounce 2s ease-in-out infinite" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          LAYER 5 — Login panel
          Full screen takeover. zIndex > everything else.
          loginT drives all opacity/transforms.
      ════════════════════════════════════════════════════════ */}

      {/* 5a. Backdrop — plain dark fill, no blur on the canvas layer */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 20,
          background: "rgba(0,0,0,0.5)",
          opacity: loginT,
          pointerEvents: "none",
        }}
      />

      {/* 5b. Futuristic role-colored background pattern */}
      {loginT > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 21,
            pointerEvents: "none",
            opacity: loginT,
            overflow: "hidden",
          }}
        >
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* ── Base square grid 40×40 ── */}
              <pattern id="grid-sq" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={`rgba(${acRgb},0.1)`}
                  strokeWidth="0.5"
                />
              </pattern>

              {/* ── Large grid overlay 200×200 — creates bold structure lines ── */}
              <pattern id="grid-lg" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <path
                  d="M 200 0 L 0 0 0 200"
                  fill="none"
                  stroke={`rgba(${acRgb},0.18)`}
                  strokeWidth="0.8"
                />
              </pattern>

              {/* ── Crosshair at every 200px intersection ── */}
              <pattern id="crosshair" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                {/* horizontal tick */}
                <line x1="-8" y1="0" x2="8" y2="0"
                  stroke={`rgba(${acRgb},0.55)`} strokeWidth="1" />
                {/* vertical tick */}
                <line x1="0" y1="-8" x2="0" y2="8"
                  stroke={`rgba(${acRgb},0.55)`} strokeWidth="1" />
                {/* small center square */}
                <rect x="-1.5" y="-1.5" width="3" height="3"
                  fill={`rgba(${acRgb},0.6)`} />
              </pattern>

              {/* ── Isometric overlay 69.3×80 (√3/2 × 80) ── */}
              <pattern id="iso" x="0" y="0" width="69.3" height="80" patternUnits="userSpaceOnUse">
                {/* down-right diagonal */}
                <line x1="0" y1="0"   x2="69.3" y2="40"  stroke={`rgba(${acRgb},0.07)`} strokeWidth="0.4" />
                <line x1="0" y1="40"  x2="69.3" y2="80"  stroke={`rgba(${acRgb},0.07)`} strokeWidth="0.4" />
                <line x1="0" y1="-40" x2="69.3" y2="0"   stroke={`rgba(${acRgb},0.07)`} strokeWidth="0.4" />
                {/* down-left diagonal */}
                <line x1="69.3" y1="0"   x2="0" y2="40"  stroke={`rgba(${acRgb},0.07)`} strokeWidth="0.4" />
                <line x1="69.3" y1="40"  x2="0" y2="80"  stroke={`rgba(${acRgb},0.07)`} strokeWidth="0.4" />
                <line x1="69.3" y1="-40" x2="0" y2="0"   stroke={`rgba(${acRgb},0.07)`} strokeWidth="0.4" />
              </pattern>

              {/* ── Radial fade mask — dimmer at edges, brighter centre ── */}
              <radialGradient id="vigMask" cx="50%" cy="50%" r="60%">
                <stop offset="0%"   stopColor="white" stopOpacity="1" />
                <stop offset="70%"  stopColor="white" stopOpacity="0.55" />
                <stop offset="100%" stopColor="white" stopOpacity="0.1" />
              </radialGradient>
              <mask id="vignette">
                <rect width="100%" height="100%" fill="url(#vigMask)" />
              </mask>

              {/* ── Accent glow gradient ── */}
              <radialGradient id="accentGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={`rgba(${acRgb},0.12)`} />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>

            {/* Stack all layers inside vignette mask */}
            <g mask="url(#vignette)">
              {/* Layer 1 — fine square grid */}
              <rect width="100%" height="100%" fill="url(#grid-sq)" />

              {/* Layer 2 — isometric rhombus overlay */}
              <rect width="100%" height="100%" fill="url(#iso)" />

              {/* Layer 3 — bold 200px structural grid */}
              <rect width="100%" height="100%" fill="url(#grid-lg)" />

              {/* Layer 4 — crosshair markers at every 200px node */}
              <rect width="100%" height="100%" fill="url(#crosshair)" />
            </g>

            {/* Central radial accent glow — not masked, always full opacity */}
            <rect width="100%" height="100%" fill="url(#accentGlow)" />

            {/* ── Sparse accent lines: two long diagonals across full canvas ── */}
            <line x1="0" y1="100%" x2="45%" y2="0"
              stroke={`rgba(${acRgb},0.12)`} strokeWidth="0.7" />
            <line x1="100%" y1="0" x2="55%" y2="100%"
              stroke={`rgba(${acRgb},0.12)`} strokeWidth="0.7" />

            {/* ── Four corner L-brackets ── */}
            {/* top-left */}
            <path d="M 0 60 L 0 0 L 60 0"
              fill="none" stroke={`rgba(${acRgb},0.35)`} strokeWidth="1" />
            {/* top-right */}
            <path d="M calc(100% - 60) 0 L 100% 0 L 100% 60"
              fill="none" stroke={`rgba(${acRgb},0.35)`} strokeWidth="1" />
            {/* bottom-left */}
            <path d="M 0 calc(100% - 60) L 0 100% L 60 100%"
              fill="none" stroke={`rgba(${acRgb},0.35)`} strokeWidth="1" />
            {/* bottom-right */}
            <path d="M calc(100% - 60) 100% L 100% 100% L 100% calc(100% - 60)"
              fill="none" stroke={`rgba(${acRgb},0.35)`} strokeWidth="1" />

            {/* ── Scanning horizontal rule — single accent line at 38% height ── */}
            <line x1="0" y1="38%" x2="100%" y2="38%"
              stroke={`rgba(${acRgb},0.14)`} strokeWidth="0.6"
              strokeDasharray="6 3" />
            <line x1="0" y1="62%" x2="100%" y2="62%"
              stroke={`rgba(${acRgb},0.09)`} strokeWidth="0.5"
              strokeDasharray="4 6" />
          </svg>

          {/* Corner radial glows */}
          <div style={{
            position: "absolute", top: -120, left: -120,
            width: 440, height: 440, borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${acRgb},0.16) 0%, transparent 65%)`,
            filter: "blur(55px)",
            transition: "background 0.4s ease",
          }} />
          <div style={{
            position: "absolute", bottom: -120, right: -120,
            width: 440, height: 440, borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${acRgb},0.12) 0%, transparent 65%)`,
            filter: "blur(55px)",
            transition: "background 0.4s ease",
          }} />
        </div>
      )}

      {/* 5c. Top + bottom rules */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: 1,
          zIndex: 22,
          background: `linear-gradient(90deg, transparent, ${acHex} 50%, transparent)`,
          opacity: tLogin,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          height: 1,
          zIndex: 22,
          background: `linear-gradient(90deg, transparent, rgba(${acRgb},0.4) 50%, transparent)`,
          opacity: tLogin * 0.6,
        }}
      />

      {/* 5d. Ambient glow orb behind the card */}
      <div
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 600,
          borderRadius: "50%",
          zIndex: 22,
          pointerEvents: "none",
          background: `radial-gradient(circle, rgba(${acRgb},0.14) 0%, transparent 60%)`,
          filter: "blur(60px)",
          opacity: tLogin,
          animation: "loginGlow 5s ease-in-out infinite",
          transition: "background 0.5s",
        }}
      />

      {/* 5e. The actual login panel — rendered only when loginT > 0 */}
      {loginT > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            display: "flex",
            flexDirection: "column",
            pointerEvents: loginT > 0.08 ? "auto" : "none",
          }}
        >
          {/* ── Header bar ── */}
          <div
            className="hidden lg:flex"
            style={{
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 32px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              opacity: tLogin,
              transform: `translateY(${(1 - tLogin) * -10}px)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34, height: 34,
                  borderRadius: 9,
                  background: `rgba(${acRgb},0.2)`,
                  border: `1px solid rgba(${acRgb},0.6)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 14px rgba(${acRgb},0.25)`,
                  transition: "all 0.3s",
                }}
              >
                <ShieldCheck size={16} color={acHex} />
              </div>
              <div>
                <div
                  
                >
                  PSU ERP
                </div>
                <div
                  
                >
                  Secure Portal
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 28 }}>
              {["Secure Access", "Role-Based", "Enterprise"].map((tag) => (
                <span
                  key={tag}
                  
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── Centred form area ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 20px 60px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 440,
                opacity: tLogin,
                transform: `translateY(${(1 - tLogin) * 22}px)`,
              }}
            >
              {/* Card */}
              <div
                style={{
                  position: "relative",
                  background: "rgba(3, 7, 18, 0.95)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid rgba(${acRgb},0.45)`,
                  borderRadius: 16,
                  padding: "32px 32px 26px",
                  boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 40px rgba(${acRgb},0.08), 0 0 0 1px rgba(255,255,255,0.05) inset`,
                  overflow: "hidden",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
              >
                {/* card top rule */}
                <div
                  style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: 1,
                    background: `linear-gradient(90deg, transparent, ${acHex} 50%, transparent)`,
                    transition: "background 0.3s",
                  }}
                />

                {/* corner brackets */}
                {[
                  { top: 8, left: 8,  borderTop: `1.5px solid ${acHex}`, borderLeft:  `1.5px solid ${acHex}` },
                  { top: 8, right: 8, borderTop: `1.5px solid ${acHex}`, borderRight: `1.5px solid ${acHex}` },
                  { bottom: 8, left: 8,  borderBottom: `1.5px solid ${acHex}`, borderLeft:  `1.5px solid ${acHex}` },
                  { bottom: 8, right: 8, borderBottom: `1.5px solid ${acHex}`, borderRight: `1.5px solid ${acHex}` },
                ].map((s, i) => (
                  <div key={i} style={{ position: "absolute", width: 14, height: 14, ...s, transition: "border-color 0.3s" }} />
                ))}

                {/* Card heading */}
                <div style={{ textAlign: "center", marginBottom: 26 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 50, height: 50,
                      borderRadius: 14,
                      background: `rgba(${acRgb},0.18)`,
                      border: `1px solid rgba(${acRgb},0.5)`,
                      marginBottom: 14,
                      boxShadow: `0 0 20px rgba(${acRgb},0.2)`,
                      transition: "all 0.3s",
                    }}
                  >
                    <ShieldCheck size={22} color={acHex} />
                  </div>
                  <h2
                    
                  >
                    Sign In to Continue
                  </h2>
                  <p
                    
                  >
                    Choose your role, then enter credentials
                  </p>
                </div>

                {/* Role pills */}
                <div style={{ marginBottom: 20 }}>
                  <p
                    
                  >
                    Access Role
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ROLES.map((r) => {
                      const rHex = ROLE_HEX[r];
                      const rRgb = ROLE_RGB[rHex];
                      const on   = role === r;
                      return (
                        <button
                          key={r}
                          className="role-pill"
                          onClick={() => setRole(r)}
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            fontWeight: 500,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            padding: "6px 13px",
                            borderRadius: 5,
                            cursor: "pointer",
                            border: `1px solid ${on ? rHex : "rgba(255,255,255,0.08)"}`,
                            background: on ? `rgba(${rRgb},0.22)` : "rgba(255,255,255,0.04)",
                            color: on ? rHex : "rgba(255,255,255,0.4)",
                            boxShadow: on ? `0 0 18px rgba(${rRgb},0.35), inset 0 0 12px rgba(${rRgb},0.1)` : "none",
                            outline: "none",
                            transition: "all 0.18s ease",
                            textShadow: on ? `0 0 12px rgba(${rRgb},0.8)` : "none",
                          }}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    marginBottom: 20,
                    background: `linear-gradient(90deg, ${acHex}99, ${acHex}22, transparent)`,
                    transition: "background 0.3s",
                  }}
                />

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <AuthInput
                    label={`${role} ID`}
                    icon={UserCog}
                    value={id}
                    onChange={setId}
                    accentHex={acHex}
                    accentRgb={acRgb}
                    onFocusChange={(focused) => { authInputFocusedRef.current = focused; }}
                  />
                  <AuthInput
                    label="Password"
                    type="password"
                    icon={Lock}
                    value={pw}
                    onChange={setPw}
                    accentHex={acHex}
                    accentRgb={acRgb}
                    onFocusChange={(focused) => { authInputFocusedRef.current = focused; }}
                  />

                  {err && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 7,
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.22)",
                        color: "#fca5a5",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        letterSpacing: "0.02em",
                      }}
                    >
                      ⚠ {err}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className="submit-btn"
                    style={{
                      "--btn-hover-shadow": `0 16px 48px rgba(${acRgb},0.55), 0 4px 16px rgba(${acRgb},0.35)`,
                      position: "relative",
                      overflow: "hidden",
                      marginTop: 4,
                      width: "100%",
                      padding: "14px 0",
                      borderRadius: 10,
                      border: `1px solid rgba(${acRgb},0.6)`,
                      cursor: "pointer",
                      background: acHex,
                      color: "#04060e",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      boxShadow: `0 8px 32px rgba(${acRgb},0.45), 0 2px 8px rgba(${acRgb},0.3)`,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.3s",
                    }}
                  >
                    <span
                      className="btn-shimmer"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
                        transform: "translateX(-100%) skewX(-20deg)",
                        pointerEvents: "none",
                      }}
                    />
                    Authenticate &amp; Enter →
                  </button>
                </form>

                {/* Demo hint */}
                <p
                  style={{
                    marginTop: 16,
                    textAlign: "center",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    color: "rgba(255,255,255,0.15)",
                    letterSpacing: "0.04em",
                  }}
                >
                  demo:{" "}
                  <span style={{ color: acHex, opacity: 0.65 }}>kovon</span>
                  {" / "}
                  <span style={{ color: acHex, opacity: 0.65 }}>1234</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
