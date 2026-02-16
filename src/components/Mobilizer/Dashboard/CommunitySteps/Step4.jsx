export default function EventStep4({ value }) {
    return (
      <div className="space-y-3 text-sm">
        <p><strong>Event:</strong> {value.eventName}</p>
        <p><strong>Project:</strong> {value.project}</p>
        <p><strong>GP:</strong> {value.gpName}</p>
        <p><strong>Date:</strong> {value.eventDate}</p>
  
        {value.location && (
          <>
            <p><strong>Lat:</strong> {value.location.lat}</p>
            <p><strong>Lng:</strong> {value.location.lng}</p>
          </>
        )}
  
        {value.photo && (
          <img
            src={value.photo}
            className="w-64 h-40 object-cover rounded-lg border border-yellow-400/20"
          />
        )}
  
        <p><strong>Video:</strong> {value.videoLink}</p>
      </div>
    );
  }
  