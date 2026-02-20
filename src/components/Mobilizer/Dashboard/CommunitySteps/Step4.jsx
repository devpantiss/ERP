export default function Step4Review({ value }) {
  return (
    <div className="space-y-4 text-sm">

      <Row label="Event Name" value={value.eventName} />
      <Row label="Project" value={value.project} />
      <Row label="Block" value={value.block} />
      <Row label="GP" value={value.gpName} />
      <Row label="Date" value={value.eventDate} />
      <Row label="Participants" value={value.participants} />
      <Row label="Location" value={value.location} />

      <div className="pt-4 border-t border-yellow-400/20 text-xs text-slate-500">
        Media upload and geo-tagging will be completed after marking the event as completed.
      </div>

    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-yellow-400/10 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-200">{value || "—"}</span>
    </div>
  );
}