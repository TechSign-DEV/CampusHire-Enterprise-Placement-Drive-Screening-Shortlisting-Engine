
import { useEffect, useState } from "react";
import { CalendarDays, Clock, Video, MapPin } from "lucide-react";
import api from "../services/api";

function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export default function StudentInterviews() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInterviews() {
      try {
        const response = await api.get("/interviews/me");
        setSlots(response.data.slots || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load your interview schedule."
        );
      } finally {
        setLoading(false);
      }
    }

    loadInterviews();
  }, []);

  if (loading) {
    return <div className="container py-5">Loading your interviews...</div>;
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">My Interview Schedule</h2>
        <p className="text-secondary">
          Check your upcoming placement interviews and their details.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {!error && slots.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <CalendarDays size={42} className="text-secondary mb-3" />
            <h5>No interviews scheduled yet</h5>
            <p className="text-secondary mb-0">
              Once a recruiter schedules an interview for you, it will appear
              here.
            </p>
          </div>
        </div>
      )}

      <div className="row g-3">
        {slots.map((slot) => (
          <div className="col-12 col-lg-6" key={slot._id}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between gap-3 mb-3">
                  <div>
                    <h5 className="fw-bold mb-1">
                      {slot.drive?.title || "Placement Drive"}
                    </h5>
                    <div className="text-secondary">{slot.roundName}</div>
                  </div>

                  <span
                    className={`badge align-self-start ${
                      slot.status === "SCHEDULED"
                        ? "text-bg-primary"
                        : slot.status === "COMPLETED"
                          ? "text-bg-success"
                          : "text-bg-secondary"
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>

                <div className="mb-3">
                  <CalendarDays size={17} className="me-2 text-primary" />
                  {formatDateTime(slot.startsAt)}
                </div>

                <div className="mb-3">
                  <Clock size={17} className="me-2 text-primary" />
                  Ends {formatDateTime(slot.endsAt)}
                </div>

                {slot.batch?.mode === "ONLINE" ? (
                  <div className="mb-3">
                    <Video size={17} className="me-2 text-primary" />
                    Online interview
                  </div>
                ) : (
                  <div className="mb-3">
                    <MapPin size={17} className="me-2 text-primary" />
                    {slot.batch?.location || "Location to be confirmed"}
                  </div>
                )}

                {slot.status === "SCHEDULED" &&
                  slot.batch?.mode === "ONLINE" &&
                  slot.batch?.meetingLink && (
                    <a
                      href={slot.batch.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      Join Interview
                    </a>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
