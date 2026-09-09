import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  UserCog,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  createDepartment,
  deleteDepartment,
  deactivateDepartment,
  getDepartments,
  reactivateDepartment,
  renameDepartment,
  setDepartmentManager,
} from "../api/departmentApi";
import { Banner, PrimaryButton, TextInput } from "../components/ui";

function departmentStatus(status) {
  return status === "inactive"
    ? "bg-[#F0F1F7] text-[#5B6485]"
    : "bg-[#E6F5EC] text-[#1F7A4D]";
}

export default function DepartmentsPage() {
  const { token, user } = useAuth();
  const owner = user.role === "owner";
  const [departments, setDepartments] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [managerId, setManagerId] = useState({});

  const load = useCallback(async () => {
    setError("");
    try {
      setDepartments(await getDepartments(token));
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      await createDepartment(token, newName.trim());
      setNewName("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function startEdit(dept) {
    setEditingId(dept.id);
    setEditName(dept.name);
    setError("");
  }

  async function saveEdit(id) {
    if (!editName.trim()) return;
    setBusyId(id);
    setError("");
    try {
      await renameDepartment(token, id, editName.trim());
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleStatus(dept) {
    setBusyId(dept.id);
    setError("");
    try {
      if (dept.status === "inactive")
        await reactivateDepartment(token, dept.id);
      else await deactivateDepartment(token, dept.id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function assignManager(id) {
    const value = managerId[id];
    if (!value) return;
    setBusyId(id);
    setError("");
    try {
      await setDepartmentManager(token, id, Number(value));
      setManagerId((prev) => ({ ...prev, [id]: "" }));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function removeDepartment(dept) {
    if (
      !window.confirm(
        `Permanently delete department "${dept.name}"? This cannot be undone.`,
      )
    )
      return;
    setBusyId(dept.id);
    setError("");
    try {
      await deleteDepartment(token, dept.id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-[22px] text-[#1E2761]">Departments</h2>
          <p className="mt-1 text-sm text-[#5B6485]">
            Create, rename, manage status, and configure department ownership.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E3E7F5]">
          <Building2 className="h-5 w-5 text-[#1E2761]" />
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="mt-5 rounded-2xl bg-white border border-[#E3E7F5] shadow-sm p-4 flex gap-3"
      >
        <TextInput
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New department name"
          required
        />
        <PrimaryButton type="submit" loading={creating} className="shrink-0">
          <Plus className="h-4 w-4" />
          Create department
        </PrimaryButton>
      </form>

      {departments === null && !error && (
        <p className="mt-5 text-sm text-[#5B6485]">Loading…</p>
      )}
      {departments?.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-[#D9DEF0] bg-white p-8 text-center text-sm text-[#5B6485]">
          No departments yet.
        </div>
      )}

      {departments?.length > 0 && (
        <div className="mt-5 space-y-3">
          {departments.map((dept) => {
            const busy = busyId === dept.id;
            return (
              <div
                key={dept.id}
                className="rounded-2xl bg-white border border-[#E3E7F5] shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {editingId === dept.id ? (
                      <div className="flex gap-2">
                        <TextInput
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => saveEdit(dept.id)}
                          className="rounded-lg bg-[#1F7A4D] px-3 text-white disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-[#D9DEF0] px-3 text-[#5B6485] disabled:opacity-60"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#1E2761]">
                            {dept.name}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${departmentStatus(dept.status)}`}
                          >
                            {dept.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] text-[#8A91B4]">
                          Department ID: {dept.id} · Manager ID:{" "}
                          {dept.manager_id ?? "Not assigned"}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => startEdit(dept)}
                      title="Rename"
                      className="rounded-lg p-2 text-[#5B6485] hover:bg-[#F4F6FC] disabled:opacity-50"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleStatus(dept)}
                      title={
                        dept.status === "inactive" ? "Reactivate" : "Deactivate"
                      }
                      className="rounded-lg p-2 text-[#5B6485] hover:bg-[#F4F6FC] disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : dept.status === "inactive" ? (
                        <RotateCcw className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                    {owner && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removeDepartment(dept)}
                        title="Delete"
                        className="rounded-lg p-2 text-[#B23B3B] hover:bg-[#FBEAEA] disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {owner && (
                  <div className="mt-4 border-t border-[#EEF1FA] pt-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <UserCog className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AA2C7]" />
                        <TextInput
                          className="pl-9"
                          type="number"
                          min="1"
                          value={managerId[dept.id] || ""}
                          onChange={(e) =>
                            setManagerId((prev) => ({
                              ...prev,
                              [dept.id]: e.target.value,
                            }))
                          }
                          placeholder="Manager employee ID"
                        />
                      </div>
                      <PrimaryButton
                        type="button"
                        disabled={!managerId[dept.id]}
                        loading={busy}
                        onClick={() => assignManager(dept.id)}
                      >
                        Assign manager
                      </PrimaryButton>
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#8A91B4]">
                      Owner-only. Enter the employee ID of the person who should
                      manage this department.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
