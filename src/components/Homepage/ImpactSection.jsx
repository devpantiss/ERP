// src/components/ImpactSection.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * CountUp: simple hook-based count-up animation (no external deps)
 * - end: target number
 * - duration: milliseconds
 * - format: function to format the displayed value (optional)
 */
function useCountUp(end, { duration = 1500, start = 0 } = {}) {
  const [value, setValue] = useState(start);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // if end is zero or negative, just set it immediately
    if (end <= 0) {
      setValue(end);
      return;
    }

    function step(ts) {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.floor(start + (end - start) * eased);
      setValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
    };
  }, [end, duration, start]);

  return value;
}

// cubic easing out for smoother animation
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// helper to format numbers with commas (1,234,567)
function formatNumber(n) {
  return n.toLocaleString();
}

/* Inline SVG icons (kept small and clean) */
const icons = {
  tractor: (
    <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 12h3l1-2h6l2 2h2l2 2v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  userGroup: (
    <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 20a6 6 0 0116 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  briefcase: (
    <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2.5" y="7" width="19" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 7V5.5a1.5 1.5 0 011.5-1.5h5a1.5 1.5 0 011.5 1.5V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  shop: (
    <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 7h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="5" y="7" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  trainer: (
    <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M5 20c1.5-3 4.5-4 7-4s5.5 1 7 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M17 12h4v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  building: (
    <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7" height="18" rx="1" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="14" y="7" width="7" height="14" rx="1" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 7h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M7 11h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
};

export default function ImpactSection() {
  // each item: icon key, label, target number
  const items = [
    { id: 1, icon: icons.tractor, value: 100000, label: "Farmers Benefitted in India" },
    { id: 2, icon: icons.userGroup, value: 18776, label: "Indian Youth Impacted" },
    { id: 3, icon: icons.briefcase, value: 48, label: "MIT Spinout Companies" },
    { id: 4, icon: icons.shop, value: 1100, label: "Businesses Launched by EforAll" },
    { id: 5, icon: icons.trainer, value: 1077, label: "Entrepreneurs Trained by GDC Incubate" },
    { id: 6, icon: icons.building, value: 152, label: "Ventures Launched by DDQIC" },
  ];

  return (
    <section className="bg-[#143b73] lg:h-[450px] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-12">
        {/* logo + title */}
        <div className="flex flex-col items-center mb-12">
          <img
            src="https://www.deshpandefoundation.org/wp-content/uploads/2020/04/globe-icon-white.png" /* <- uploaded file path used as url */
            alt="logo"
            className="h-12 w-auto mb-4"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <h2 className="text-3xl md:text-4xl font-extrabold">Our Impact</h2>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-y-10 gap-x-6 items-start">
          {items.map((it) => (
            <ImpactCard key={it.id} icon={it.icon} value={it.value} label={it.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactCard({ icon, value, label }) {
  // animate to the target value when component mounts
  const animated = useCountUp(value, { duration: 1800 });
  return (
    <div className="flex flex-col items-center text-center px-6">
      <div className="mb-4 text-white/95">{icon}</div>

      <div className="text-3xl md:text-4xl font-extrabold leading-none">
        <CountDisplay value={animated} />
      </div>

      <div className="mt-3 text-sm md:text-base text-white/90 max-w-[220px]">
        {label}
      </div>
    </div>
  );
}

// small presentational component to format and optionally show plus sign etc.
function CountDisplay({ value }) {
  return <span aria-live="polite">{formatNumber(value)}</span>;
}
