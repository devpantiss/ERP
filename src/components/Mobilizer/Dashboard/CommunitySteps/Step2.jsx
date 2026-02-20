import { useEffect } from "react";

export default function Step2Location({
  value = {},
  update,
  onValidChange,
}) {
  const { location = "" } = value;

  useEffect(() => {
    onValidChange(Boolean(location));
  }, [location]);

  return (
    <div className="max-w-xl">

      <label className="block text-sm text-slate-400 mb-2">
        Event Location (Place Name)
      </label>

      <input
        value={location}
        onChange={(e) => update("location", e.target.value)}
        placeholder="e.g. Community Hall, Binjharpur"
        className="w-full px-4 py-2 rounded-lg
        bg-[#020617] border border-yellow-400/30
        focus:border-yellow-400 outline-none"
      />

      <p className="text-xs text-slate-500 mt-2">
        Enter the venue or place where the programme will be conducted.
      </p>

    </div>
  );
}