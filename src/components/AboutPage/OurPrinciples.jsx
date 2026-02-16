// src/components/OurPrinciples.jsx
import React from "react";

/**
 * OurPrinciples
 *
 * Responsive 2-column layout:
 * - Left: checklist of principles with check icons
 * - Right: light panel with 3x2 icons and captions
 *
 * Replace icon SVGs or captions as needed.
 */

const principles = [
  { id: 1, title: "Co-creation", desc: "Work with the people to create solutions" },
  { id: 2, title: "Contextual", desc: "Respond to local conditions and needs" },
  { id: 3, title: "Community Supported", desc: "Look for enthusiastic support as proof of value" },
  { id: 4, title: "Capacity Building", desc: "Strengthen beneficiaries to absorb and sustain solutions" },
  { id: 5, title: "Collaborative", desc: "Partner and learn from best in class" },
  { id: 6, title: "Cost-Effective", desc: "Aim to control costs and scale" },
];

// Simple inline SVG icons for the right-side grid — swap with real assets if you have them
const principleIcons = {
  cocreation: (
    <svg viewBox="0 0 24 24" className="w-14 h-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 17c1-2 4-3 5-3s4 1 5 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  contextual: (
    <svg viewBox="0 0 24 24" className="w-14 h-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8h10M7 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  supported: (
    <svg viewBox="0 0 24 24" className="w-14 h-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 20v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  capacity: (
    <svg viewBox="0 0 24 24" className="w-14 h-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 10h8M8 14h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  collaborative: (
    <svg viewBox="0 0 24 24" className="w-14 h-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M4 20a6 6 0 0116 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  cost: (
    <svg viewBox="0 0 24 24" className="w-14 h-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9 10h6M9 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function OurPrinciples() {
  return (
    <section className="w-full py-12 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left column - checklist */}
          <div className="lg:col-span-6">
            {/* header small accents */}
            <div className="flex items-center gap-3 mb-4">
              <span className="block h-[3px] w-10 bg-[#174c8f]"></span>
              <span className="block h-[3px] w-10 bg-[#f36b0a]"></span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6">Our Principles</h2>

            <ul className="space-y-4">
              {principles.map((p) => (
                <li key={p.id} className="flex gap-4 items-start">
                  {/* check icon */}
                  <div className="mt-1">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  <div>
                    <div className="text-base font-semibold text-gray-700">{p.title} <span className="font-normal text-gray-500">– {p.desc}</span></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column - icons grid */}
          <div className="lg:col-span-6">
            <div className="bg-[#f1f6fb] rounded-md p-8">
              <div className="grid grid-cols-3 gap-y-6 gap-x-4 place-items-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-[#174c8f]">{principleIcons.cocreation}</div>
                  <div className="text-sm font-medium text-gray-700">Cocreation</div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="text-[#174c8f]">{principleIcons.contextual}</div>
                  <div className="text-sm font-medium text-gray-700">Contextual</div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="text-[#174c8f]">{principleIcons.supported}</div>
                  <div className="text-sm font-medium text-gray-700">Community Supported</div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="text-[#174c8f]">{principleIcons.capacity}</div>
                  <div className="text-sm font-medium text-gray-700">Capacity Building</div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="text-[#174c8f]">{principleIcons.collaborative}</div>
                  <div className="text-sm font-medium text-gray-700">Collaborative</div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="text-[#174c8f]">{principleIcons.cost}</div>
                  <div className="text-sm font-medium text-gray-700">Cost Effective</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </section>
  );
}
