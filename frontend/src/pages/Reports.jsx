
import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  ClipboardList,
  Users,
  CalendarDays,
} from "lucide-react";

import api from "../services/api";

const reports = [
  {
    id: "applications",
    title: "Applications Report",
    description:
      "Download student applications, company names, eligibility, and application statuses.",
    filename: "campushire-applications.csv",
    icon: ClipboardList,
  },
  {
    id: "screening",
    title: "Screening Report",
    description:
      "Download academic details, coding scores, eligibility results, and screening reasons.",
    filename: "campushire-screening-report.csv",
    icon: Users,
  },
  {
    id: "interviews",
    title: "Interview Report",
    description:
      "Download candidate names, interview rounds, schedules, modes, and statuses.",
    filename: "campushire-interview-report.csv",
    icon: CalendarDays,
  },
];

export default function Reports() {
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function downloadReport(report) {
    setDownloading(report.id);
    setError("");
    setMessage("");

    try {
      const response = await api.get(`/reports/${report.id}`, {
        responseType: "blob",
      });

      const contentType =
        response.headers?.["content-type"] || "";

      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        const result = JSON.parse(text);

        throw new Error(
          result.message || "Unable to generate this report."
        );
      }

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = report.filename;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);

      setMessage(`${report.title} downloaded successfully.`);
    } catch (err) {
      let errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to download report.";

      if (err.response?.data instanceof Blob) {
        try {
          const body = JSON.parse(
            await err.response.data.text()
          );
          errorMessage = body.message || errorMessage;
        } catch {
          // Keep the fallback error message.
        }
      }

      setError(errorMessage);
    } finally {
      setDownloading("");
    }
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Placement Reports</h2>
        <p className="text-secondary mb-0">
          Export CampusHire placement data to CSV for Excel and reporting.
        </p>
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

      <div className="row g-4">
        {reports.map((report) => {
          const Icon = report.icon;
          const isDownloading = downloading === report.id;

          return (
            <div className="col-12 col-lg-4" key={report.id}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4 d-flex flex-column">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success mb-4"
                    style={{ width: 56, height: 56 }}
                  >
                    <Icon size={28} />
                  </div>

                  <h5 className="fw-bold mb-2">{report.title}</h5>

                  <p className="text-secondary flex-grow-1">
                    {report.description}
                  </p>

                  <div className="small text-secondary mb-3">
                    <FileSpreadsheet
                      size={15}
                      className="me-2"
                    />
                    CSV format · Excel compatible
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    disabled={Boolean(downloading)}
                    onClick={() => downloadReport(report)}
                  >
                    <Download size={17} className="me-2" />
                    {isDownloading
                      ? "Preparing download..."
                      : "Download CSV"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="alert alert-info mt-4 mb-0">
        Recruiters can export data for their own placement drives. Admins can
        export platform-wide reports. Files contain the data available in
        CampusHire when the report is generated.
      </div>
    </div>
  );
}
