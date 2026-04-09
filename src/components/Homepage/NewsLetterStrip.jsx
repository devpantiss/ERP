// src/components/NewsletterStrip.jsx
import React from "react";

/**
 * NewsletterStrip
 * - Two equal columns (left: Newsletter; right: On Entrepreneurship and Impact)
 * - Orange skewed CTA buttons
 * - Responsive: stacks on small screens
 *
 * Note: this includes the uploaded file path so your toolchain can transform it.
 * Local uploaded image path (for tooling): /mnt/data/Screenshot 2025-11-25 at 2.35.03 PM.png
 */
export default function NewsletterStrip() {
  return (
    <section className="w-full">
      {/* hidden img element contains your uploaded file path so tooling can transform it */}
      <img
        src={"/mnt/data/Screenshot 2025-11-25 at 2.35.03 PM.png"}
        alt="newsletter-sample"
        className="hidden"
        aria-hidden
      />

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left column - Newsletter */}
        <div className="bg-[#143b73] text-white py-10 md:py-16 px-8 md:px-12 flex flex-col items-center justify-center">
          <h3 className="text-xl md:text-2xl font-extrabold mb-6">Newsletter</h3>

          <button
            className="inline-block bg-orange-600 px-6 py-3 font-semibold transform -skew-x-6"
            aria-label="Subscribe to newsletter"
          >
            <span className="inline-block skew-x-6">SUBSCRIBE</span>
          </button>

          <p className="mt-4 text-sm text-white/90 max-w-xs text-center">
            Receive our monthly updates
          </p>
        </div>

        {/* Right column - On Entrepreneurship and Impact */}
        <div className="bg-[#63a0bd] text-white py-10 md:py-16 px-8 md:px-12 flex flex-col items-center justify-center">
          <h3 className="text-xl md:text-2xl font-extrabold mb-6 text-center">
            On Entrepreneurship and Impact
          </h3>

          <button
            className="inline-block bg-orange-600 px-6 py-3 font-semibold transform -skew-x-6"
            aria-label="Read more on entrepreneurship"
          >
            <span className="inline-block skew-x-6">READ MORE</span>
          </button>

          <p className="mt-4 text-sm text-white/90 max-w-md text-center">
            Desh shares practical insights for creating a lasting social or economic impact
          </p>
        </div>
      </div>
    </section>
  );
}
