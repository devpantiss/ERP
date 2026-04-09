// src/components/PromoBanner.jsx
import React from "react";

/**
 * PromoBanner
 *
 * Props:
 *  - image: background image URL (default uses the uploaded file path from this session)
 *  - titleLines: array of strings (each line shown; use strings to allow line breaks)
 *  - className: optional wrapper className
 *
 * Notes:
 *  - background-attachment: fixed is applied only on md+ (desktop) to avoid iOS issues.
 *  - Replace default image path with a file in your public folder for production (e.g. "/images/promo.jpg").
 */
export default function PromoBanner({
  image = "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-home-quote.jpg",
  titleLines = [
    "An idea does not have an impact",
    "unless it is directed at some burning",
    "problem in the world",
  ],
  className = "",
}) {
  return (
    <section className={`w-full ${className}`}>
      <div className="relative overflow-hidden">
        {/* Desktop/parallax background (visible on md+) */}
        <div
          className="hidden md:block absolute inset-0 h-[50vh] bg-cover bg-right bg-no-repeat"
          style={{
            backgroundImage: `url("${image}")`,
            backgroundAttachment: "fixed", // parallax on desktop
            backgroundPosition: "right center",
          }}
          aria-hidden="true"
        />

        {/* Mobile fallback background (visible on small screens) */}
        <div
          className="md:hidden absolute inset-0 bg-cover h-[50vh] bg-right bg-no-repeat"
          style={{
            backgroundImage: `url("${image}")`,
            backgroundPosition: "right center",
          }}
          aria-hidden="true"
        />

        {/* dark overlay to ensure text contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* Content container */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-28">
          <div className="max-w-2xl">
            {/* Decorative small lines */}
            <div className="flex items-center gap-3 mb-6">
              <span className="block h-[2px] w-8 bg-white/80"></span>
              <span className="block h-[2px] w-8 bg-white/60"></span>
            </div>

            {/* Title */}
            <h1 className="text-white font-extrabold text-3xl md:text-5xl lg:text-3xl leading-tight">
              {titleLines.map((line, i) => {
                // Emphasize certain words visually by wrapping them in <strong>.
                // You can customize rules here or pass full JSX if needed.
                const emphasise = (str) =>
                  str
                    .split(/(idea|impact|burning|problem|world)/gi)
                    .map((part, idx) =>
                      /^(idea|impact|burning|problem|world)$/i.test(part) ? (
                        <strong key={idx} className="font-extrabold">
                          {part}
                        </strong>
                      ) : (
                        <span key={idx}>{part}</span>
                      )
                    );

                return (
                  <div key={i} className={i === 0 ? "" : "mt-1"}>
                    <span className="block">{emphasise(line)}</span>
                  </div>
                );
              })}
            </h1>

            {/* optional CTA slot (uncomment to use) */}
            {/* <div className="mt-8">
              <a className="inline-block bg-orange-600 text-white px-6 py-3 font-semibold transform -skew-x-6">
                <span className="skew-x-6">Learn More</span>
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
