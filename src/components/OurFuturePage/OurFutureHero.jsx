// src/components/AboutIntro.jsx
import React from "react";

export default function AboutIntro() {
  return (
    <section className="w-full py-16 md:py-20">
      <div className="max-w-4xl mx-auto text-center px-6">

        {/* top colored lines */}
        <div className="flex justify-center items-center gap-3 mb-4">
          <span className="block h-[3px] w-10 bg-[#174c8f]"></span>
          <span className="block h-[3px] w-10 bg-[#f36b0a]"></span>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Deshpande Foundation
        </h2>

        {/* Subtitle */}
        <p className="mt-3 text-sm md:text-base font-semibold tracking-wide text-[#174c8f]">
          INNOVATION FOR SCALABLE IMPACT
        </p>

        {/* Description */}
        <p className="mt-6 text-gray-600 leading-relaxed text-sm md:text-base">
          The Deshpande Foundation, founded by Jaishree and Gururaj ‘Desh’ Deshpande,
          has supported sustainable, scalable social and economic impact through
          innovation and entrepreneurship in the United States, Canada,
          and India.
        </p>
      </div>
    </section>
  );
}