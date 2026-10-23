
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Users,
  Video,
  MapPin,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

const emptyForm = {
  driveId: "",
  roundName: "Technical Interview",
  mode: "ONLINE",
  location: "",
  meetingLink: "",
  startsAt: "",
  endsAt: "",
  slotMinutes: 20,
};

function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function InterviewScheduling() {
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [schedule, setSchedule] = useState({ batches: [], slots: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadDrives() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/drives");
      const items = Array.isArray(response.data)
        ? response.data
        : response.data.drives || [];

      setDrives(items);

      if (!form.driveId && items.length) {
        setForm((previous) => ({
          ...previous,
          driveId: String(items[0]._id),
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load drives.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSchedule(driveId) {
    if (!driveId) {
      setSchedule({ batches: [], slots: [] });
      return;
    }

    try {
      const response = await api.get(`/interviews/drives/${driveId}`);
      setSchedule({
        batches: response.data.batches || [],
        slots: response.data.slots || [],
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load interview schedules."
      );
    }
  }

  useEffect(() => {
    loadDrives();
  }, []);

  useEffect(() => {
    if (form.driveId) loadSchedule(form.driveId);
  }, [form.driveId]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  
async function handleSubmit(event) {
  event.preventDefault();
  setError("");
  setMessage("");

  if (!form.startsAt || !form.endsAt) {
    setError("Please select both start and end date/time.");
    return;
  }

  const startDate = new Date(form.startsAt);
  const endDate = new Date(form.endsAt);
  const now = new Date();

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    setError("Please enter valid start and end dates.");
    return;
  }

  if (startDate <= now) {
    setError("Start time must be in the future. Please select a later time.");
    return;
  }

  if (endDate <= startDate) {
    setError("End time must be after the start time.");
    return;
  }

  setSaving(true);

  try {
    const payload = {
      roundName: form.roundName.trim(),
      mode: form.mode,
      location: form.mode === "OFFLINE" ? form.location.trim() : "",
      meetingLink: form.mode === "ONLINE" ? form.meetingLink.trim() : "",
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      slotMinutes: Number(form.slotMinutes),
    };

    const response = await api.post(
      `/interviews/drives/${form.driveId}/batches`,
      payload
    );

    setMessage(
      `${response.data.message} ${response.data.scheduledCount} candidate(s) scheduled.`
    );

    await loadSchedule(form.driveId);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Could not create interview batch."
    );
  } finally {
    setSaving(false);
  }
}


  if (loading) {
    return <div className="container py-5">Loading placement drives...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Interview Scheduling</h2>
          <p className="text-secondary mb-0">
            Create batches and assign interview slots to shortlisted candidates.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={() => loadSchedule(form.driveId)}
          disabled={!form.driveId}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Create interview batch</h5>
        </div>

        <div className="card-body">
          {drives.length === 0 ? (
            <p className="text-secondary mb-0">
              No placement drives are available to schedule.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Placement drive</label>
                  <select
                    className="form-select"
                    name="driveId"
                    value={form.driveId}
                    onChange={updateField}
                    required
                  >
                    {drives.map((drive) => (
                      <option key={drive._id} value={drive._id}>
                        {drive.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Interview round</label>
                  <input
                    className="form-control"
                    name="roundName"
                    value={form.roundName}
                    onChange={updateField}
                    placeholder="Technical Interview"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Mode</label>
                  <select
                    className="form-select"
                    name="mode"
                    value={form.mode}
                    onChange={updateField}
                  >
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>

                {form.mode === "ONLINE" ? (
                  <div className="col-md-8">
                    <label className="form-label">Meeting link</label>
                    <input
                      type="url"
                      className="form-control"
                      name="meetingLink"
                      value={form.meetingLink}
                      onChange={updateField}
                      placeholder="https://..."
                      required
                    />
                  </div>
                ) : (
                  <div className="col-md-8">
                    <label className="form-label">Interview location</label>
                    <input
                      className="form-control"
                      name="location"
                      value={form.location}
                      onChange={updateField}
                      placeholder="Office address or campus building"
                      required
                    />
                  </div>
                )}

                <div className="col-md-4">
                  <label className="form-label">Start date and time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="startsAt"
                    value={form.startsAt}
                    onChange={updateField}
                    min={new Date(Date.now() + 60000)
                      .toISOString()
                      .slice(0, 16)}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">End date and time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="endsAt"
                    value={form.endsAt}
                    onChange={updateField}
                    min={form.startsAt || undefined}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Minutes per candidate</label>
                  <select
                    className="form-select"
                    name="slotMinutes"
                    value={form.slotMinutes}
                    onChange={updateField}
                  >
                    {[10, 15, 20, 30, 45, 60].map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} minutes
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <div className="alert alert-info mb-0">
                    Only candidates already marked SHORTLISTED will be
                    scheduled. Each candidate receives one consecutive slot.
                    The system rejects a batch if any selected candidate has
                    an overlapping scheduled interview.
                  </div>
                </div>

                <div className="col-12">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={saving || !form.driveId}
                  >
                    <CalendarDays size={17} className="me-2" />
                    {saving ? "Scheduling..." : "Schedule Interviews"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Scheduled candidates</h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Candidate</th>
                <th>Interview round</th>
                <th>Date and time</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {schedule.slots.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-secondary">
                    No interview slots scheduled for this drive.
                  </td>
                </tr>
              ) : (
                schedule.slots.map((slot) => (
                  <tr key={slot._id}>
                    <td>
                      <div className="fw-semibold">
                        {slot.student?.name || "Candidate"}
                      </div>
                      <small className="text-secondary">
                        {slot.student?.email || "—"}
                      </small>
                    </td>

                    <td>{slot.roundName}</td>

                    <td>
                      <div>{formatDateTime(slot.startsAt)}</div>
                      <small className="text-secondary">
                        Ends {formatDateTime(slot.endsAt)}
                      </small>
                    </td>

                    <td>
                      {slot.batch?.mode === "ONLINE" ? (
                        <span>
                          <Video size={15} className="me-1" />
                          Online
                        </span>
                      ) : (
                        <span>
                          <MapPin size={15} className="me-1" />
                          Offline
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          slot.status === "SCHEDULED"
                            ? "text-bg-primary"
                            : slot.status === "COMPLETED"
                              ? "text-bg-success"
                              : "text-bg-secondary"
                        }`}
                      >
                        {slot.status}
                      </span>
                    </td>

                    <td>
                      {slot.status === "SCHEDULED" && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() =>
                              updateSlotStatus(slot._id, "COMPLETED")
                            }
                          >
                            Complete
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              updateSlotStatus(slot._id, "CANCELLED")
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
