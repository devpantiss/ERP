import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   SLIDE PANEL — Zoho Projects-style right-side slide-in drawer
   ═══════════════════════════════════════════════════════════════
   Props:
     open      — boolean, controls visibility
     onClose   — callback when backdrop or X is clicked
     title     — string, panel header title (optional)
     width     — "sm" | "md" | "lg" | "xl"  (default "md")
     children  — panel body content
═══════════════════════════════════════════════════════════════ */

const WIDTH_MAP = {
  sm: "max-w-full md:max-w-sm",
  md: "max-w-full md:max-w-md",
  lg: "max-w-full md:max-w-lg",
  xl: "max-w-full md:max-w-xl",
  "2xl": "max-w-full md:max-w-2xl",
  "3xl": "max-w-full md:max-w-3xl",
  "4xl": "max-w-full md:max-w-4xl",
  "5xl": "max-w-full md:max-w-5xl",
  full: "max-w-full",
};

export default function SlidePanel({ open, onClose, title, width = "md", children }) {
  const panelRef = useRef(null);

  /* Close on Escape key */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* ─── Backdrop ─────────────────────────────── */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease]"
        onClick={onClose}
      />

      {/* ─── Panel ────────────────────────────────── */}
      <div
        ref={panelRef}
        className={`
          relative w-full ${WIDTH_MAP[width] || WIDTH_MAP.md}
          h-full bg-[#0b1220] border-l border-white/10
          shadow-[-8px_0_32px_rgba(0,0,0,0.5)]
          flex flex-col
          animate-[slideInRight_0.3s_cubic-bezier(0.16,1,0.3,1)]
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ───────────────────────────── */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] shrink-0">
            <h3 className="text-lg font-semibold text-white truncate pr-4">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Close button when no title */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* ─── Body (scrollable) ────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
