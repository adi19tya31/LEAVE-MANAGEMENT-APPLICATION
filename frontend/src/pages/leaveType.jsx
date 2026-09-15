import React, { useState, useEffect, useCallback } from "react";
const API_BASE_URL = "/api/leave-types";

function authHeaders() {
  const token = localStorage.getItem("token"); // adjust to however you store it
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = body?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return body;
}

const emptyForm = { name: "", maxDaysPerYear: "" };

export default function LeaveTypeManagement() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchNotice, setSearchNotice] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // -------------------- Load all (findAll) --------------------
  const fetchLeaveTypes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(API_BASE_URL);
      setLeaveTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load leave types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes]);

  // -------------------- Search by name (findByName) --------------------
  // Your GET /search?name= returns a single leave type, or 404 if none
  // matches — not an array — so this shows at most one result.
  async function handleSearch(e) {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) {
      clearSearch();
      return;
    }

    setSearching(true);
    setError("");
    setSearchNotice("");
    try {
      const result = await apiRequest(
        `${API_BASE_URL}/search?name=${encodeURIComponent(term)}`
      );
      setLeaveTypes(result ? [result] : []);
      setSearchActive(true);
    } catch (err) {
      if (err.status === 404) {
        setLeaveTypes([]);
        setSearchActive(true);
        setSearchNotice(`No leave type found matching "${term}".`);
      } else {
        setError(err.message || "Search failed.");
      }
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setSearchTerm("");
    setSearchActive(false);
    setSearchNotice("");
    fetchLeaveTypes();
  }

  // -------------------- Form handling --------------------
  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(leaveType) {
    setForm({
      name: leaveType.name || "",
      maxDaysPerYear: leaveType.max_days_per_year ?? "",
    });
    setEditingId(leaveType.id);
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // -------------------- Create / Update --------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Leave type name is required.");
      return;
    }
    if (form.maxDaysPerYear === "" || Number(form.maxDaysPerYear) < 0) {
      setFormError("Max days per year must be a valid number.");
      return;
    }

    // Body keys match your controller's expected camelCase shape.
    const payload = {
      name: form.name.trim(),
      maxDaysPerYear: Number(form.maxDaysPerYear),
    };

    setSaving(true);
    try {
      if (editingId) {
        const updated = await apiRequest(`${API_BASE_URL}/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setLeaveTypes((prev) =>
          prev.map((lt) => (lt.id === editingId ? updated : lt))
        );
      } else {
        const created = await apiRequest(API_BASE_URL, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setLeaveTypes((prev) => [...prev, created]);
      }
      closeForm();
    } catch (err) {
      setFormError(err.message || "Failed to save leave type.");
    } finally {
      setSaving(false);
    }
  }

  // -------------------- Delete --------------------
  async function handleDelete(id) {
    if (!window.confirm("Delete this leave type? This cannot be undone.")) {
      return;
    }
    setError("");
    try {
      await apiRequest(`${API_BASE_URL}/${id}`, { method: "DELETE" });
      setLeaveTypes((prev) => prev.filter((lt) => lt.id !== id));
    } catch (err) {
      // Your backend returns 409 if the leave type is still referenced by
      // existing leave applications — surface that message as-is.
      setError(err.message || "Failed to delete leave type.");
    }
  }

  // -------------------- Render --------------------
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Leave Types
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage the leave categories employees can apply for.
            </p>
          </div>
          <button
            onClick={openAddForm}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add Leave Type
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by exact name…"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {searching ? "Searching…" : "Search"}
          </button>
          {searchActive && (
            <button
              type="button"
              onClick={clearSearch}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 px-2"
            >
              Clear
            </button>
          )}
        </form>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {searchNotice && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm px-4 py-3">
            {searchNotice}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Loading leave types…
            </div>
          ) : leaveTypes.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              {searchActive
                ? "No results."
                : 'No leave types yet. Click "Add Leave Type" to create one.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Max Days / Year</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveTypes.map((lt) => (
                  <tr key={lt.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{lt.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {lt.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {lt.max_days_per_year}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEditForm(lt)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(lt.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {editingId ? "Edit Leave Type" : "Add Leave Type"}
            </h2>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Sick Leave"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Max Days Per Year
                </label>
                <input
                  type="number"
                  name="maxDaysPerYear"
                  value={form.maxDaysPerYear}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 12"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}