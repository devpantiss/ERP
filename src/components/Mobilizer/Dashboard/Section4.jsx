import { useState, useEffect } from "react";

/* ===================== DUMMY DATA ===================== */

const summary = {
  totalRevenue: 630000,
  totalWithdrawn: 320000,
};

const initialBankDetails = {
  bankName: "State Bank of India",
  accountHolder: "Gautam Samanta",
  accountNumber: "3500624153309",
  ifsc: "SBIN0001234",
  branch: "Cuttack Main Branch",
  passbookImage: "/passbook.jpeg",
};

/* ===================== COUNT UP HOOK ===================== */

function useCountUp(value, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let raf;
    const startTime = performance.now();

    function animate(time) {
      const progress = Math.min((time - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return count;
}

/* ===================== COMPONENT ===================== */

export default function Section4() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [bankDetails, setBankDetails] = useState(initialBankDetails);

  const balanceAmount =
    summary.totalRevenue - summary.totalWithdrawn;

  const animatedRevenue = useCountUp(summary.totalRevenue);
  const animatedWithdrawn = useCountUp(summary.totalWithdrawn);
  const animatedBalance = useCountUp(balanceAmount);

  function handleChange(e) {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <section className="relative mt-6 rounded-2xl p-6
      bg-[#0b0f14] border border-yellow-400 overflow-hidden">

      {/* GRID BACKGROUND */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(250,204,21,0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(250,204,21,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-slate-100 mb-6">
          Earnings & Bank Overview
        </h3>

        {/* ================= SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <StatCard
            title="Total Revenue"
            value={`₹ ${animatedRevenue.toLocaleString("en-IN")}`}
          />

          <StatCard
            title="Total Withdrawn"
            value={`₹ ${animatedWithdrawn.toLocaleString("en-IN")}`}
          />

          <StatCard
            title="Balance Amount"
            value={`₹ ${animatedBalance.toLocaleString("en-IN")}`}
          />

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#111827] border border-yellow-400/30 rounded-xl p-6
              hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]
              transition text-center"
          >
            <div className="text-yellow-400 mb-2 text-2xl">🏦</div>
            <p className="text-sm text-slate-400">Bank Account</p>
            <p className="text-base font-semibold text-yellow-400">
              View Details
            </p>
          </button>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-[#020617] border border-yellow-400/30
            rounded-2xl w-full max-w-lg p-6 text-slate-200">

            <h3 className="text-lg font-semibold mb-4">
              {editMode ? "Edit Bank Details" : "Bank Details"}
            </h3>

            {!editMode ? (
              <>
                <Detail label="Bank Name" value={bankDetails.bankName} />
                <Detail label="Account Holder" value={bankDetails.accountHolder} />
                <Detail label="Account Number" value={bankDetails.accountNumber} />
                <Detail label="IFSC Code" value={bankDetails.ifsc} />
                <Detail label="Branch" value={bankDetails.branch} />

                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-2">
                    Passbook Front Page
                  </p>
                  <img
                    src={bankDetails.passbookImage}
                    alt="Passbook"
                    className="w-[280px] rounded-lg border border-yellow-400/30 bg-white p-2"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-md bg-white/10"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 rounded-md bg-yellow-400 text-black"
                  >
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <>
                <Input label="Bank Name" name="bankName" value={bankDetails.bankName} onChange={handleChange} />
                <Input label="Account Holder" name="accountHolder" value={bankDetails.accountHolder} onChange={handleChange} />
                <Input label="Account Number" name="accountNumber" value={bankDetails.accountNumber} onChange={handleChange} />
                <Input label="IFSC Code" name="ifsc" value={bankDetails.ifsc} onChange={handleChange} />
                <Input label="Branch Name" name="branch" value={bankDetails.branch} onChange={handleChange} />

                <div className="mt-3">
                  <label className="text-sm text-slate-400">
                    Passbook Image
                  </label>
                  <input type="file" className="mt-1 text-sm text-slate-300" />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-md bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-md bg-yellow-400 text-black"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ===================== SMALL COMPONENTS ===================== */

function StatCard({ title, value }) {
  return (
    <div className="bg-[#111827] border border-yellow-400 rounded-xl p-6 text-center
      hover:shadow-[0_0_25px_rgba(250,204,21,0.1)] transition">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-100 mt-1">
        {value}
      </p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <p className="text-sm mb-2">
      <span className="text-slate-400">{label}:</span>{" "}
      <span className="text-slate-200">{value}</span>
    </p>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="mb-3">
      <label className="text-sm text-slate-400">{label}</label>
      <input
        {...props}
        className="w-full mt-1 rounded-md bg-[#111827]
        border border-yellow-400 px-3 py-2
        text-sm text-slate-200
        focus:outline-none focus:border-yellow-400"
      />
    </div>
  );
}
