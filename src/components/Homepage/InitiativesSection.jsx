// src/components/InitiativesSection.jsx
import React from "react";

/**
 * InitiativeCard - single card
 * Props:
 *  - title, location, image
 */
function InitiativeCard({ title, location, image }) {
  return (
    <article className="relative overflow-hidden h-[300px] rounded-sm shadow-sm group">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url("${image}")` }}
        role="img"
        aria-label={title}
      />

      {/* dark overlay to match screenshot */}
      <div className="absolute inset-0 bg-blue-900/70"></div>

      {/* content */}
      <div className="relative z-10 p-6 md:p-8 lg:p-10 h-full flex flex-col justify-between">
        <div>
          <h3 className="text-white text-xl md:text-2xl font-extrabold leading-snug">
            {title}
          </h3>
          <p className="mt-2 text-white/90 text-sm md:text-base">{location}</p>
        </div>

        {/* CTA bottom-left */}
        <div className="mt-6">
          <a
            className="inline-block bg-orange-600 text-white px-4 py-2 text-xs md:text-sm font-semibold transform -skew-x-6 hover:bg-orange-700"
            href="#"
            aria-label={`Read more about ${title}`}
          >
            <span className="inline-block skew-x-6">READ MORE</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export default function InitiativesSection() {
  // Using the uploaded local image as placeholder for all cards — replace with per-card images.
  const placeholder = "/mnt/data/Screenshot 2025-11-24 at 6.47.48 PM.png";

  const items = [
    { id: 1, title: "Deshpande Foundation India", location: "Hubballi, Karnataka, India", image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-foundation-india.jpg" },
    { id: 2, title: "Entrepreneurship for All", location: "Lowell, MA, USA", image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-foundation-entrepreneurship-for-all.jpg" },
    { id: 3, title: "MIT Deshpande Center", location: "Cambridge, MA, USA", image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/mit-deshpande-center.jpg" },
    { id: 4, title: "Gopalakrishnan Deshpande Center", location: "IIT Madras, India", image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/gopalakrishnan-deshpande-center.jpg" },
    { id: 5, title: "Dunin–Deshpande Queen's Innovation Center", location: "Queens University, Canada", image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/dunin-deshpande-queens-innovation-center.jpg" },
    { id: 6, title: "Pond Deshpande Center", location: "University of New Brunswick, Canada", image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/pond-deshpande-center.jpg" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* header */}
        <div className="text-center mb-12">
          <img
            src="https://www.deshpandefoundation.org/wp-content/uploads/2022/12/Deshpande-foundation-favicon.png"
            alt="Deshpande logo placeholder"
            className="mx-auto h-12 w-auto mb-4" /* optional — hide if you don't want the screenshot here */
            style={{ display: "flex" }}
          />
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-700">Our Global Initiatives</h2>
        </div>

        {/* cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <InitiativeCard key={it.id} title={it.title} location={it.location} image={it.image} />
          ))}
        </div>
      </div>
    </section>
  );
}
