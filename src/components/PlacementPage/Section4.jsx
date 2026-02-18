import { Star, Plus } from "lucide-react";
import { useState } from "react";

/* ===================== STUDENT DATA ===================== */

const studentReviewsInitial = [
  {
    name: "Rahul Kumar",
    rating: 4,
    comment: "Placement support was excellent and transparent.",
    time: "1 month ago",
  },
  {
    name: "Neha Singh",
    rating: 5,
    comment: "Mock interviews helped me gain confidence.",
    time: "3 weeks ago",
  },
  {
    name: "Sourav Das",
    rating: 4,
    comment: "Training quality was industry aligned.",
    time: "2 months ago",
  },
  {
    name: "Anjali Verma",
    rating: 5,
    comment: "Placement officer was very supportive.",
    time: "1 week ago",
  },
  {
    name: "Ramesh Patel",
    rating: 4,
    comment: "Good company exposure and career guidance.",
    time: "2 weeks ago",
  },
  {
    name: "Priya Sharma",
    rating: 5,
    comment: "Interview preparation sessions were helpful.",
    time: "1 month ago",
  },
  {
    name: "Amit Yadav",
    rating: 4,
    comment: "Smooth placement coordination process.",
    time: "2 months ago",
  },
  {
    name: "Kiran Gupta",
    rating: 5,
    comment: "Excellent career counseling support.",
    time: "3 weeks ago",
  },
  {
    name: "Vikas Mishra",
    rating: 4,
    comment: "Companies offered were good.",
    time: "1 month ago",
  },
  {
    name: "Sneha Reddy",
    rating: 5,
    comment: "Very professional placement team.",
    time: "2 weeks ago",
  },
  {
    name: "Pooja Das",
    rating: 4,
    comment: "Training and placement alignment was strong.",
    time: "1 month ago",
  },
  {
    name: "Arjun Roy",
    rating: 5,
    comment: "Got placed within 2 weeks after course.",
    time: "5 days ago",
  },
];

/* ===================== INDUSTRY DATA ===================== */

const industryReviewsInitial = [
  {
    name: "Amit Sharma",
    company: "Tata Steel",
    rating: 5,
    comment: "Candidates were industry-ready with strong fundamentals.",
    time: "2 weeks ago",
  },
  {
    name: "Priya Menon",
    company: "L&T Construction",
    rating: 4,
    comment: "Good technical skills among trainees.",
    time: "1 month ago",
  },
  {
    name: "Rohit Verma",
    company: "JSW Steel",
    rating: 5,
    comment: "Very professional coordination from placement team.",
    time: "3 weeks ago",
  },
  {
    name: "Kunal Sinha",
    company: "Tata Power",
    rating: 4,
    comment: "Candidates had strong safety awareness.",
    time: "1 month ago",
  },
  {
    name: "Anita Desai",
    company: "Adani Power",
    rating: 5,
    comment: "Training institute maintains quality standards.",
    time: "2 weeks ago",
  },
  {
    name: "Rajesh Kumar",
    company: "Vedanta Aluminium",
    rating: 4,
    comment: "Good job readiness among trainees.",
    time: "3 weeks ago",
  },
  {
    name: "Sanjay Mishra",
    company: "NTPC",
    rating: 5,
    comment: "Highly disciplined candidates.",
    time: "1 month ago",
  },
  {
    name: "Deepak Sharma",
    company: "Reliance Industries",
    rating: 4,
    comment: "Strong practical exposure provided.",
    time: "2 months ago",
  },
  {
    name: "Nisha Kapoor",
    company: "Infosys",
    rating: 5,
    comment: "Communication skills were impressive.",
    time: "1 week ago",
  },
  {
    name: "Pankaj Singh",
    company: "Wipro",
    rating: 4,
    comment: "Candidates adapted quickly to work culture.",
    time: "2 weeks ago",
  },
  {
    name: "Manoj Patel",
    company: "Aditya Birla Group",
    rating: 5,
    comment: "Excellent collaboration with institute.",
    time: "1 month ago",
  },
  {
    name: "Sneha Joshi",
    company: "Hindalco",
    rating: 4,
    comment: "Good technical foundation among students.",
    time: "3 weeks ago",
  },
];

/* ===================== COMPONENT ===================== */

export default function PlacementFeedbackSection() {

  const [activeTab, setActiveTab] = useState("industry");
  const [studentReviews, setStudentReviews] = useState(studentReviewsInitial);
  const [industryReviews, setIndustryReviews] = useState(industryReviewsInitial);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    rating: 5,
    comment: "",
  });

  const reviews =
    activeTab === "industry" ? industryReviews : studentReviews;

  const avg =
    reviews.reduce((acc, r) => acc + r.rating, 0) /
    (reviews.length || 1);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const maxCount = Math.max(...distribution.map((d) => d.count));

  function handleSubmit() {

    const newItem = {
      ...form,
      time: "Just now",
    };

    if (activeTab === "industry") {
      setIndustryReviews([newItem, ...industryReviews]);
    } else {
      setStudentReviews([newItem, ...studentReviews]);
    }

    setShowModal(false);
    setForm({ name: "", company: "", rating: 5, comment: "" });
  }

  return (
    <section className="relative mt-8 rounded-2xl p-8
      bg-[#111827] border border-cyan-400 overflow-hidden">

      {/* GRID */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34,211,238,0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34,211,238,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-semibold text-slate-100">
            Placement Feedback
          </h2>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm
            bg-cyan-400 text-black rounded-md hover:bg-cyan-300"
          >
            <Plus size={16} />
            Add Review
          </button>
        </div>

        {/* TABS */}
        <div className="flex border border-cyan-400 rounded-md overflow-hidden text-sm mb-6">
          <button
            onClick={() => setActiveTab("industry")}
            className={`px-4 py-1.5 ${
              activeTab === "industry"
                ? "bg-cyan-400 text-black"
                : "bg-white/5 text-slate-300"
            }`}
          >
            Industry Reviews
          </button>

          <button
            onClick={() => setActiveTab("student")}
            className={`px-4 py-1.5 ${
              activeTab === "student"
                ? "bg-cyan-400 text-black"
                : "bg-white/5 text-slate-300"
            }`}
          >
            Student Reviews
          </button>
        </div>

        {/* CONTENT SAME FOR BOTH */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">

          {/* ANALYTICS */}
          <div className="space-y-6">

            <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-6">

              <p className="text-sm text-slate-400">
                Average Rating
              </p>

              <div className="flex items-center gap-4 mt-2">
                <span className="text-4xl text-slate-100 font-semibold">
                  {avg.toFixed(1)}
                </span>

                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="fill-cyan-400 text-cyan-400"
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2">
                Based on {reviews.length} reviews
              </p>
            </div>

            {/* DISTRIBUTION */}
            <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-6">

              <p className="text-sm text-slate-200 mb-3">
                Rating Distribution
              </p>

              <div className="space-y-3">

                {distribution.map((d) => (
                  <div key={d.stars} className="flex items-center gap-3">

                    <span className="w-8 text-sm text-slate-300">
                      {d.stars}★
                    </span>

                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400"
                        style={{
                          width: `${(d.count / maxCount) * 100}%`,
                        }}
                      />
                    </div>

                    <span className="w-10 text-xs text-slate-400 text-right">
                      {d.count}
                    </span>

                  </div>
                ))}

              </div>
            </div>

          </div>

          {/* REVIEW LIST */}
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-6">

            <div className="space-y-4 max-h-[420px] overflow-y-auto">

              {reviews.map((r, i) => (
                <div key={i} className="border-b border-slate-700 pb-3">

                  <div className="flex justify-between">
                    <div>
                      <p className="text-slate-100 font-medium">
                        {r.name}
                      </p>

                      {activeTab === "industry" && (
                        <p className="text-xs text-slate-500">
                          {r.company}
                        </p>
                      )}
                    </div>

                    <span className="text-xs text-slate-500">
                      {r.time}
                    </span>
                  </div>

                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        size={14}
                        className="fill-cyan-400 text-cyan-400"
                      />
                    ))}
                  </div>

                  <p className="text-sm text-slate-400 mt-2">
                    {r.comment}
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
              Add {activeTab === "industry" ? "Industry" : "Student"} Review
            </h3>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full mb-3 px-3 py-2 rounded-md
              bg-[#111827] border border-slate-700 text-slate-200"
            />

            {activeTab === "industry" && (
              <input
                placeholder="Company"
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
                className="w-full mb-3 px-3 py-2 rounded-md
                bg-[#111827] border border-slate-700 text-slate-200"
              />
            )}

            <textarea
              placeholder="Feedback"
              value={form.comment}
              onChange={(e) =>
                setForm({ ...form, comment: e.target.value })
              }
              className="w-full mb-3 px-3 py-2 rounded-md
              bg-[#111827] border border-slate-700 text-slate-200"
            />

            {/* RATING */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((r) => (
                <Star
                  key={r}
                  size={22}
                  onClick={() =>
                    setForm({ ...form, rating: r })
                  }
                  className={`cursor-pointer ${
                    r <= form.rating
                      ? "fill-cyan-400 text-cyan-400"
                      : "text-slate-600"
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-cyan-400 text-black rounded-md"
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
