// src/components/LeadershipSection.jsx
import React from "react";

/**
 * LeadershipSection
 * - Responsive grid of leader cards (3 columns on desktop)
 * - Photo on top, info panel below with name, role and company
 * - Small blue underline accent in the info panel
 *
 * Replace image URLs with your production paths (e.g. /images/gururaj.jpg).
 */

const LEADERS = [
  {
    id: 1,
    name: "Gururaj Desh Deshpande",
    role: "Co-Founder, Deshpande Foundation",
    extra: "President & Chairman, Sparta Group LLC",
    image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/01/deshpande.jpg", // replace with /images/gururaj.jpg
  },
  {
    id: 2,
    name: "Jaishree Deshpande",
    role: "Founder, Deshpande Foundation",
    extra: "",
    image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/jaishree-pande.jpg", // replace with /images/jaishree.jpg
  },
  {
    id: 3,
    name: "Paul Grogan",
    role: "President & CEO, The Boston Foundation",
    extra: "",
    image: "https://www.deshpandefoundation.org/wp-content/uploads/2020/01/paul-grogan.jpg", // replace with /images/paul.jpg
  },
];

function AccentLines() {
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <span className="block h-[3px] w-10 bg-[#174c8f]" />
      <span className="block h-[3px] w-10 bg-[#f36b0a]" />
    </div>
  );
}

function LeaderCard({ person }) {
  return (
    <article className="w-full max-w-sm mx-auto">
      {/* Photo */}
      <div className="overflow-hidden bg-gray-100">
        <img
          src={person.image}
          alt={person.name}
          className="w-full h-56 object-cover"
        />
      </div>

      {/* Info panel */}
      <div className="bg-[#f3f1ef] p-6 text-center">
        <h3 className="text-xl md:text-2xl font-extrabold text-gray-800 leading-snug">
          {person.name}
        </h3>

        <div className="mt-2 text-sm text-gray-500 font-semibold">
          {person.role}
        </div>

        {person.extra && (
          <div className="mt-1 text-xs text-gray-500">{person.extra}</div>
        )}

        {/* small underline accent */}
        <div className="mt-4 flex justify-center">
          <span className="block h-1 w-16 bg-[#174c8f] rounded" />
        </div>
      </div>
    </article>
  );
}

export default function LeadershipSection({ leaders = LEADERS }) {
  return (
    <section className="w-full py-12 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <AccentLines />
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Our Leadership Team
        </h2>
        <p className="text-blue-800 font-semibold mt-2">BOARD</p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {leaders.map((p) => (
            <LeaderCard key={p.id} person={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
