
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Users } from "lucide-react";
import api from "../services/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await api.get("/students");
        setStudents(response.data.students);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load student records."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const query = search.toLowerCase();

    return [
      student.name,
      student.email,
      student.studentId,
      student.profile?.department
    ].some(value => value?.toLowerCase().includes(query));
  });

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-icon">CH</div>
          <div>
            <strong>CampusHire</strong>
            <div className="text-secondary small">Student Directory</div>
          </div>
        </div>

        <Link to="/dashboard" className="btn btn-outline-secondary">
          <ArrowLeft size={16} className="me-2" />
          Dashboard
        </Link>
      </header>

      <main className="dashboard-content">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="feature-icon mb-0">
            <Users size={24} />
          </div>
          <div>
            <h1 className="h3 mb-1">Student Management</h1>
            <p className="text-secondary mb-0">
              View registered students and their academic details.
            </p>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="feature-card">
              <p>Total registered students</p>
              <h2>{students.length}</h2>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="feature-card">
              <p>Completed profiles</p>
              <h2>
                {students.filter(student => student.profile).length}
              </h2>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="feature-card">
              <p>Incomplete profiles</p>
              <h2>
                {students.filter(student => !student.profile).length}
              </h2>
            </div>
          </div>
        </div>

        <div className="profile-form">
          <div className="input-group mb-4">
            <span className="input-group-text">
              <Search size={18} />
            </span>
            <input
              className="form-control"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search by name, email, student ID or department"
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <p>Loading students...</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Department</th>
                    <th>CGPA</th>
                    <th>Active backlogs</th>
                    <th>Profile</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student._id}>
                      <td>
                        <strong>{student.name}</strong>
                        <div className="text-secondary small">
                          {student.email}
                        </div>
                      </td>

                      <td>{student.studentId || "—"}</td>
                      <td>{student.profile?.department || "—"}</td>
                      <td>{student.profile?.cgpa ?? "—"}</td>
                      <td>{student.profile?.activeBacklogs ?? "—"}</td>

                      <td>
                        {student.profile ? (
                          <span className="badge text-bg-success">
                            Completed
                          </span>
                        ) : (
                          <span className="badge text-bg-warning">
                            Incomplete
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
