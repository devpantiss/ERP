// src/components/ImpactInAction.jsx
import React from "react";

const CARDS = [
  {
    id: 1,
    image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/MicroEnt-making-masks-777x744-1.jpg",
    title: "Deshpande Foundation India’s Micro-entrepreneurship",
    excerpt:
      "program Covid-19 efforts delivers 15,000 face masks to Zilla Parishad offices",
  },
  {
    id: 2,
    image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/EforAll-Covid-Webinars-777x745-1.jpg",
    title: "EforAll quickly addresses alumni and startup needs",
    excerpt:
      "during Covid-19 crisis with online resources, webinars and online shopping directory of startups",
  },
  {
    id: 3,
    image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/DDQIC-Spread-Challenge-777x744-1.jpg",
    title: "DDQIC partners with Kingston mayor",
    excerpt:
      "to encourage teams to tackle Covid-19 with the Spread Innovation Challenge",
  },
  {
    id: 4,
    image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-skilling.jpg",
    title: "Deshpande Skilling's",
    excerpt:
      "experiential training programs have impacted over 14,000 youth and placed over 95% in organized sector jobs",
  },
  {
    id: 5,
    image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/GDC-8th-Cohort-779x645jpg.jpg",
    title: "I-NCUBATE program launches 75 teams",
    excerpt:
      "Over 400 entrepreneurs have been trained in 8 cohorts since the I-NCUBATE program was launched in India",
  },
  {
    id: 6,
    image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/pond-deshpande-center-noulabs.jpg",
    title: "Pond Deshpande Center’s NouLAB’s",
    excerpt:
      "unique approach has brought together over 50 diverse organizations in 16 social innovation labs to address complex societal issues",
  },
];

function ImpactCard({ item }) {
  return (
    <article className="relative group overflow-hidden rounded-sm shadow-sm h-[260px] md:h-[300px]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${item.image})` }}
      />

      {/* Global tint */}
      <div className="absolute inset-0 bg-black/25"></div>

      {/* Hover panel */}
      <div
        className="
        absolute inset-0 bg-[#143b73] text-white 
        translate-x-full group-hover:translate-x-0 
        transition-all duration-500 ease-out p-6 flex flex-col justify-center"
      >
        <h3 className="text-xl font-bold">{item.title}</h3>
        <p className="mt-3 text-sm opacity-90 leading-relaxed">{item.excerpt}</p>
      </div>
    </article>
  );
}

export default function ImpactInAction() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-700">Impact in Action</h2>
        </div>

        {/* Grid — 3 top, 3 bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card) => (
            <ImpactCard key={card.id} item={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
