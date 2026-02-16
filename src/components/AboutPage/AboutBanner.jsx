// src/components/AboutBanner.jsx
import React from "react";

/**
 * AboutBanner
 *
 * Props:
 *  - image: background image URL (defaults to uploaded file path used in this conversation)
 *  - title: main heading text
 *  - overlayClipPct: controls diagonal slant (optional)
 *
 * Notes:
 *  - For production move the image into `public/` and pass `/images/your.jpg` (or update default).
 *  - clipPath polygon values are tuned to match the provided design; change overlayClipPct to adjust slant.
 */
export default function AboutBanner({
  image = "https://www.deshpandefoundation.org/wp-content/uploads/2023/05/deshpande-foundation-innovation-for-scalable-impact-banner.jpg",
  title = "Innovation for\nScalable Impact",
  overlayClipPct = { top: 58, bottom: 44 }, // top X%, bottom X% used in polygon
}) {
  const { top, bottom } = overlayClipPct;
  const clip = `polygon(0 0, ${top}% 0, ${bottom}% 100%, 0% 100%)`;

  return (
    <section className="w-full">
      <div className="relative overflow-hidden h-[340px] md:h-[420px] lg:h-[520px]">
        {/* Background image (covers full area) */}
        <div
          className="absolute inset-0 bg-cover bg-right bg-no-repeat"
          style={{
            backgroundImage: `url("${image}")`,
            // keep the background fixed effect off here for consistent behavior — enable if you want parallax
            backgroundPosition: "center right",
          }}
          aria-hidden="true"
        />

        {/* Blue diagonal overlay on top of the background */}
        <div
          className="absolute inset-0 z-10 flex items-center"
          style={{
            // clip-path creates the diagonal panel on the left
            clipPath: clip,
            background: "rgba(11,66,120,0.92)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 w-full">
            <div className="w-full md:w-2/3 lg:w-1/2">
              {/* Title */}
              {/* Use whitespace-pre-wrap to allow newline in default title */}
              <h1 className="text-white font-extrabold leading-tight text-3xl md:text-5xl lg:text-6xl whitespace-pre-wrap">
                {title}
              </h1>
            </div>
          </div>
        </div>

        {/* If you want a faint separator between overlay and image, add a subtle right edge shadow */}
        <div
          className="pointer-events-none absolute inset-y-0 right-[calc(100%-44%)] w-0 z-20"
          style={{
            boxShadow: "-40px 0 40px rgba(0,0,0,0.2)",
            transform: `translateX(-2px)`,
          }}
        />
      </div>
    </section>
  );
}
