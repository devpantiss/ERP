import { Star } from "lucide-react";

/* ===================== DATA ===================== */

const ratingSummary = {
  average: 4.9,
  totalRatings: 1680,
  distribution: [
    { stars: 5, count: 320 },
    { stars: 4, count: 120 },
    { stars: 3, count: 60 },
    { stars: 2, count: 20 },
    { stars: 1, count: 10 },
  ],
};

const reviews = [
  {
    name: "Sourav Mohanty",
    time: "2 months ago",
    comment:
      "Service delivery was timely and professionally handled. Overall experience was satisfactory.",
  },
  {
    name: "Sasmita Behera",
    time: "3 weeks ago",
    comment:
      "Communication was clear and the team was responsive throughout the process.",
  },
  {
    name: "Bikash Swain",
    time: "5 months ago",
    comment:
      "The service met expectations and was completed within the promised timeframe.",
  },
  {
    name: "Ankita Jena",
    time: "1 month ago",
    comment:
      "Well-coordinated effort and courteous behaviour from the field staff.",
  },
  {
    name: "Subrat Sahoo",
    time: "6 months ago",
    comment:
      "Overall experience was smooth. Would recommend for similar requirements.",
  },
];

/* ===================== COMPONENT ===================== */

export default function CustomerFeedbackEnterprise() {
  const maxCount = Math.max(
    ...ratingSummary.distribution.map((d) => d.count)
  );

  return (
    <section
      className="relative mt-8 rounded-2xl p-8
      bg-[#0b0f14] border border-yellow-400 overflow-hidden"
    >

      {/* ===== GRID BACKGROUND (SAME AS Section1 / Section4) ===== */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]
        bg-[linear-gradient(to_right,rgba(250,204,21,0.4)_1px,transparent_1px),
            linear-gradient(to_bottom,rgba(250,204,21,0.4)_1px,transparent_1px)]
        bg-size-[28px_28px]"
      />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10">

        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-100">
            Customer Feedback
          </h2>
          <p className="text-sm text-slate-400">
            Summary of customer ratings and recent feedback
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-10">

          {/* ================= LEFT: RATING SUMMARY ================= */}
          <div className="space-y-6">

            {/* Average Rating */}
            <div className="rounded-xl border border-yellow-400/30
              bg-[#111827] p-6">

              <p className="text-sm text-slate-400 mb-1">
                Average Rating
              </p>

              <div className="flex items-center gap-3">
                <span className="text-4xl font-semibold text-slate-100">
                  {ratingSummary.average}
                </span>

                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-400 mt-2">
                Based on {ratingSummary.totalRatings} verified ratings
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="rounded-xl border border-yellow-400/30
              bg-[#111827] p-6">

              <p className="text-sm font-medium text-slate-200 mb-4">
                Rating Distribution
              </p>

              <div className="space-y-3">
                {ratingSummary.distribution.map((item) => (
                  <div
                    key={item.stars}
                    className="flex items-center gap-3"
                  >
                    <span className="w-8 text-sm text-slate-300">
                      {item.stars}★
                    </span>

                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${(item.count / maxCount) * 100}%`,
                        }}
                      />
                    </div>

                    <span className="w-12 text-sm text-slate-400 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT: REVIEWS ================= */}
          <div className="rounded-xl border border-yellow-400/30
            bg-[#111827] p-6">

            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-slate-200">
                Recent Feedback
              </p>

              <button className="text-sm text-yellow-400 hover:underline">
                View all
              </button>
            </div>

            <div className="divide-y divide-white/10
              max-h-[360px] overflow-y-auto pr-2">

              {reviews.map((review, idx) => (
                <div key={idx} className="py-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-slate-100">
                      {review.name}
                    </p>
                    <span className="text-xs text-slate-400">
                      {review.time}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
