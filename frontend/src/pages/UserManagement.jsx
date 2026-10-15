
import { useEffect, useState } from "react";
import { Search, RefreshCw, UserRoundCheck, UserRoundX } from "lucide-react";
import api from "../services/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (search.trim()) params.q = search.trim();
      if (role) params.role = role;
      if (status) params.status = status;

      const response = await api.get("/admin/users", { params });
      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [role, status]);

  async function handleSearch(event) {
    event.preventDefault();
    await loadUsers();
  }

  async function toggleStatus(user) {
    const nextStatus = !user.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } ${user.name}?`
    );

    if (!confirmed) return;

    setBusyId(user._id);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/admin/users/${user._id}/status`,
        { isActive: nextStatus }
      );

      setMessage(response.data.message);
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update account status."
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">User Management</h2>
          <p className="text-secondary mb-0">
            Search accounts and manage access to CampusHire.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <form
            className="row g-3 align-items-end"
            onSubmit={handleSearch}
          >
            <div className="col-12 col-md-5">
              <label className="form-label">Search users</label>
              <input
                className="form-control"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Enter name or email"
              />
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="">All roles</option>
                <option value="ADMIN">Admin</option>
                <option value="STUDENT">Student</option>
                <option value="RECRUITER">Recruiter</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label">Account status</label>
              <select
                className="form-select"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-12 col-md-2">
              <button
                className="btn btn-primary w-100"
                type="submit"
                disabled={loading}
              >
                <Search size={16} className="me-2" />
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between">
          <h5 className="mb-0">Registered Accounts</h5>
          <span className="badge text-bg-secondary">
            {users.length} users
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-5 text-secondary"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="fw-semibold">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge text-bg-light border">
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.isActive
                            ? "text-bg-success"
                            : "text-bg-danger"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>
                  
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
