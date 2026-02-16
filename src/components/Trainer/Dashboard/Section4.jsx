import { Star } from "lucide-react";
import { useState } from "react";

/* ===================== INITIAL DATA ===================== */

const initialRatingSummary = {
  average: 4.8,
  totalRatings: 1680,
  distribution: [
    { stars: 5, count: 920 },
    { stars: 4, count: 520 },
    { stars: 3, count: 150 },
    { stars: 2, count: 60 },
    { stars: 1, count: 30 },
  ],
};

const initialReviews = [
  {
    name: "Sourav Mohanty",
    time: "2 months ago",
    rating: 5,
    comment:
      "Trainer explained technical concepts clearly and ensured practical understanding.",
  },
  {
    name: "Sasmita Behera",
    time: "3 weeks ago",
    rating: 4,
    comment:
      "Sessions were interactive and assessments were well structured.",
  },
];

/* ===================== COMPONENT ===================== */

export default function TrainerFeedbackFintech() {
  const [ratingSummary, setRatingSummary] =
    useState(initialRatingSummary);

  const [reviews, setReviews] = useState(initialReviews);
  const [showModal, setShowModal] = useState(false);

  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  const maxCount = Math.max(
    ...ratingSummary.distribution.map((d) => d.count)
  );

  /* ================= SUBMIT REVIEW ================= */

  function handleSubmit() {
    if (!newReview.name || !newReview.comment) return;

    const updatedDistribution = ratingSummary.distribution.map((d) =>
      d.stars === newReview.rating
        ? { ...d, count: d.count + 1 }
        : d
    );

    const newTotal = ratingSummary.totalRatings + 1;

    const totalScore =
      ratingSummary.average * ratingSummary.totalRatings +
      newReview.rating;

    const newAverage = (totalScore / newTotal).toFixed(1);

    setRatingSummary({
      average: Number(newAverage),
      totalRatings: newTotal,
      distribution: updatedDistribution,
    });

    setReviews([
      { ...newReview, time: "Just now" },
      ...reviews,
    ]);

    setShowModal(false);
    setNewReview({ name: "", rating: 5, comment: "" });
  }

  /* ===================== UI ===================== */

  return (
    <section className="relative mt-8 rounded-2xl p-8
      bg-[#111827] border border-slate-700 overflow-hidden">

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(16,185,129,0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16,185,129,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">
              Student Feedback Analytics
            </h2>
            <p className="text-sm text-slate-400">
              Training quality & learner satisfaction monitoring
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-medium
            bg-emerald-500 text-black rounded-md
            hover:bg-emerald-400 transition"
          >
            Collect Review
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-10">

          {/* ================= LEFT ================= */}
          <div className="space-y-6">

            {/* Average Rating */}
            <div className="rounded-xl border border-slate-700 bg-[#0f172a] p-6">

              <p className="text-sm text-slate-400 mb-1">
                Average Rating
              </p>

              <div className="flex items-center gap-4">
                <span className="text-4xl font-semibold text-slate-100">
                  {ratingSummary.average}
                </span>

                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="fill-emerald-500 text-emerald-500"
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-400 mt-2">
                Based on {ratingSummary.totalRatings} verified reviews
              </p>
            </div>

            {/* Distribution */}
            <div className="rounded-xl border border-slate-700 bg-[#0f172a] p-6">

              <p className="text-sm font-medium text-slate-200 mb-4">
                Rating Distribution
              </p>

              <div className="space-y-3">
                {ratingSummary.distribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <span className="w-8 text-sm text-slate-300">
                      {item.stars}★
                    </span>

                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
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

          {/* ================= RIGHT ================= */}
          <div className="rounded-xl border border-slate-700 bg-[#0f172a] p-6">

            <p className="text-sm font-medium text-slate-200 mb-4">
              Recent Reviews
            </p>

            <div className="divide-y divide-slate-700
              max-h-[360px] overflow-y-auto pr-2">

              {reviews.map((review, idx) => (
                <div key={idx} className="py-4">

                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-slate-100">
                      {review.name}
                    </p>
                    <span className="text-xs text-slate-500">
                      {review.time}
                    </span>
                  </div>

                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="fill-emerald-500 text-emerald-500"
                      />
                    ))}
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

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-6 w-full max-w-md">

            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Submit Student Review
            </h3>

            <input
              placeholder="Student Name"
              value={newReview.name}
              onChange={(e) =>
                setNewReview({ ...newReview, name: e.target.value })
              }
              className="w-full mb-3 px-3 py-2 rounded-md
              bg-[#111827] border border-slate-700 text-slate-200"
            />

            <textarea
              placeholder="Feedback..."
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              className="w-full mb-3 px-3 py-2 rounded-md
              bg-[#111827] border border-slate-700 text-slate-200"
            />

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((r) => (
                <Star
                  key={r}
                  size={22}
                  onClick={() =>
                    setNewReview({ ...newReview, rating: r })
                  }
                  className={`cursor-pointer transition ${
                    r <= newReview.rating
                      ? "fill-emerald-500 text-emerald-500"
                      : "text-slate-600"
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 rounded-md text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-emerald-500 text-black rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
