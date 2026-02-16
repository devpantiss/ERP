// src/components/ApproachSection.jsx
import React from "react";

/**
 * ApproachSection
 *
 * Renders a title and a list of alternating image + text rows.
 *
 * Replace the image URLs in `items` with your production image paths (e.g., /images/...).
 */

const items = [
  {
    id: 1,
    title: "There are two types of societies...",
    subtitle:
      "The world has come a long way in addressing the major issues we faced in the past. We have eradicated smallpox, lifted millions out of poverty, and increased life expectancy around the globe. Yet we are still faced with many challenges around the world.",
    body: `Income and wealth disparity has significantly increased in the current century. While two billion of the world's population enjoy a middle class or better existence with adequate resources and disposable income to cover their needs, over 5 billion have scant livelihoods and are still struggling to meet the many daily challenges. Despite its economic success, the US, like India, has pockets of underserved populations that are still struggling to achieve the American dream. Addressing the challenges of these two different segments require distinctly different approaches.`,
    image:
      "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-foundation-types-of-societies.jpg", // replace with /public/images/...
  },
  {
    id: 2,
    title: "For people with\n disposable income...",
    subtitle:
      "To address the opportunities for people with disposable income, one needs to lead with innovation, identify unique ideas, approaches and products and ensure that they will satisfy their needs.",
    body: `The solutions need to be uniquely innovative in highly competitive markets. The Deshpande Foundation approach for this segment brings together deep innovation with understanding the relevance of the idea for the intended audience to create economic or social impact.`,
    image:
      "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-foundation-innovation-relevance-impact.jpg",
  },
  {
    id: 3,
    title: "For people with\n low disposable income...",
    subtitle:
      "On the other hand, in communities with low disposable income, it is more important to have a deep understanding of the social issue and the community needs.",
    body: `Here the Deshpande Foundation approach is to first develop an appreciation of the issue and the community and only then introduce appropriate innovation to create socially impactful solutions.`,
    image:
      "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-foundation-relevance-innovation-impact.jpg",
  },
];

function AccentLines() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="block h-[3px] w-10 bg-[#174c8f]"></span>
      <span className="block h-[3px] w-10 bg-[#f36b0a]"></span>
    </div>
  );
}

export default function ApproachSection() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">

        {/* Section Title */}
        <div className="text-center flex flex-col justify-center items-center mb-12">
          <AccentLines />
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">Our Approach</h2>
        </div>

        {/* Rows */}
        <div className="space-y-10">
          {items.map((item, idx) => {
            const isEven = idx % 2 === 1; // alternate: even-indexed items show text on left
            return (
              <div
                key={item.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Image column */}
                <div
                  className={`
                    lg:col-span-6
                    ${isEven ? "lg:order-1" : "lg:order-0"}
                  `}
                >
                  <div className="bg-gray-100 h-64 md:h-80 lg:h-96 rounded-sm overflow-hidden flex items-center justify-center">
                    {/* image as background for cropping */}
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${item.image}")` }}
                      role="img"
                      aria-label={item.title}
                    />
                  </div>
                </div>

                {/* Text column */}
                <div
                  className={`
                    lg:col-span-6
                    flex flex-col justify-center
                    ${isEven ? "lg:order-0 lg:pl-12" : "lg:order-1 lg:pr-12"}
                    lg:py-6
                  `}
                >
                  <AccentLines />
                  <h3 className="text-2xl md:text-3xl font-extrabold text-gray-800 leading-tight mb-4 whitespace-pre-line">
                    {item.title}
                  </h3>

                  <p className="text-gray-500 italic mb-4 max-w-xl">{item.subtitle}</p>

                  {/* body with emphasis: we keep markup simple and allow <strong> in text */}
                  <p className="text-gray-600 leading-relaxed text-base">
                    {/* highlight some phrases in bold/orange using simple heuristics:
                        if you want exact control, put <strong> tags in item.body strings */}
                    {item.body.split(/\n\n/).map((para, i) => (
                      <span className="block mb-4" key={i}>
                        {/* simple replacement of keywords — if you need precise control, pass JSX instead */}
                        {renderWithEmphasis(para)}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * renderWithEmphasis(str)
 * A small helper to bold/colour certain phrases that appear in your samples.
 * It looks for a few keywords and wraps them in <strong className="text-gray-800"> or orange highlight.
 *
 * If you prefer full control, pass JSX for item.body and return it unmodified.
 */
function renderWithEmphasis(text) {
  // Define phrases to make bold (and some to color orange)
  const orangePhrases = ["disposable income", "low disposable income"];
  const boldPhrases = ["two billion", "over 5 billion", "distinctly different approaches", "deep innovation", "relevance"];

  // Escape for regex, build combined regex
  const all = [...orangePhrases, ...boldPhrases].map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (all.length === 0) return text;
  const regex = new RegExp(`(${all.join("|")})`, "gi");

  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!regex.test(part)) {
      // plain text
      return <span key={i}>{part}</span>;
    }
    // reset regex.lastIndex for safe repeated use
    regex.lastIndex = 0;
    // check which group it matches (case-insensitive)
    const lower = part.toLowerCase();
    if (orangePhrases.some((p) => lower.includes(p.toLowerCase()))) {
      return (
        <strong key={i} className="font-extrabold text-orange-600">
          {part}
        </strong>
      );
    }
    // default bold
    return (
      <strong key={i} className="font-semibold text-gray-800">
        {part}
      </strong>
    );
  });
}