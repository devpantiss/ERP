import { useEffect } from "react";

export default function Step3Media({
  value = {},
  update,
  onValidChange,
}) {
    useEffect(() => {
        if (typeof onValidChange === "function") {
          onValidChange(Boolean(value.photo));
        }
      }, [value.photo]);
      

  const handlePhoto = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => update("photo", reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">

      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Upload Event Photo
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handlePhoto(e.target.files[0])}
        />

        {value.photo && (
          <img
            src={value.photo}
            className="mt-4 w-72 h-44 object-cover rounded-lg border border-yellow-400/20"
          />
        )}
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Video Link (Drive / YouTube)
        </label>

        <input
          value={value.videoLink || ""}
          onChange={(e) => update("videoLink", e.target.value)}
          className="w-full px-4 py-2 rounded-lg
          bg-[#020617] border border-yellow-400/30"
        />
      </div>

    </div>
  );
}
