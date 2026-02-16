// src/components/NewsSection.jsx
import React from "react";

/**
 * NewsSection
 * - Left: large featured post (image, title, meta, excerpt, CTA)
 * - Right: stacked smaller posts with thumbnail, title, CTA
 *
 * Note: featuredImage uses the uploaded local path so it previews here.
 * Replace with /images/... when moving to production.
 */

const FEATURED_IMAGE = "/mnt/data/Screenshot 2025-11-25 at 2.26.15 PM.png";

const rightPosts = [
  {
    id: 1,
    date: "December 8, 2020",
    title: "EarlySpark Katha Kalarava (Stories) – Broadcasting education to the last mile",
    excerpt: "Digital divide is prevalent globally. In...",
    thumb: "https://www.deshpandefoundation.org/wp-content/uploads/2020/12/EarlySpark-Dec2020-300x200.jpg",
  },
  {
    id: 2,
    date: "April 24, 2020",
    title: "Deshpande Foundation Harnesses Resources to Support Covid-19 Crisis Efforts",
    excerpt: "The Deshpande Foundation and its partner...",
    thumb: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/DF-India-Covid-Response-300x120.jpg",
  },
  {
    id: 3,
    date: "April 20, 2020",
    title: "EforAll addresses needs of alumni and startups during Covid-19 crisis",
    excerpt: "While moving its programming and accelerators...",
    thumb: "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/EforAll-Covid-Response-23Apr20-300x123.jpg",
  },
];

function RightPost({ post }) {
  return (
    <article className="bg-gray-50 border border-gray-100 p-5 mb-6">
      <div className="flex gap-4">
        <img
          src={post.thumb}
          alt={post.title}
          className="w-20 h-16 object-cover shrink-0 rounded"
        />
        <div className="flex-1">
          <div className="text-xs text-blue-800 font-semibold">{post.date}</div>
          <h4 className="mt-2 text-sm md:text-base font-semibold text-gray-800 leading-snug">
            {post.title}
          </h4>
          <p className="mt-2 text-xs text-gray-600">{post.excerpt}</p>

          <div className="mt-3">
            <a
              className="inline-block bg-orange-600 text-white text-xs font-semibold px-4 py-2 transform -skew-x-6"
              href="#"
            >
              <span className="skew-x-6">READ MORE</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function NewsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* header */}
        <div className="text-center flex flex-col justify-center items-center mb-12">
        <img
            src="https://www.deshpandefoundation.org/wp-content/uploads/2022/12/Deshpande-foundation-favicon.png" /* <- uploaded file path used as url */
            alt="logo"
            className="h-12 w-auto mb-4"
            // style={{ filter: "brightness(0) invert(1)" }}
          />
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-700">News & Updates</h2>
        </div>

        {/* layout: 2 columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: featured (span 2 cols on md) */}
          <div className="md:col-span-2">
            <article className="space-y-6">
              <div className="w-full rounded overflow-hidden">
                <img
                  src="https://www.deshpandefoundation.org/wp-content/uploads/2022/01/Symposium-Annct-.jpg"
                  alt="Featured news"
                  className="w-full h-56 md:h-72 lg:h-80 object-cover"
                />
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-800 leading-tight">
                  VentureWell Enters Agreement to Manage the Deshpande Symposium
                </h3>

                <div className="mt-3 text-sm">
                  <span className="text-blue-700 font-semibold">January 27, 2022</span>
                  <span className="text-gray-500"> — No Comments</span>
                </div>

                <p className="mt-4 text-gray-600 max-w-3xl">
                  Lowell Ma, Jan 27, 2022 – The Deshpande Symposium, founded in 2012 by the Deshpande Foundation and the University of ...
                </p>

                <div className="mt-6">
                  <a
                    className="inline-block bg-orange-600 text-white px-5 py-3 font-semibold transform -skew-x-6"
                    href="#"
                  >
                    <span className="skew-x-6">READ MORE</span>
                  </a>
                </div>
              </div>
            </article>
          </div>

          {/* Right: stacked posts */}
          <div>
            {rightPosts.map((p) => (
              <RightPost key={p.id} post={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
