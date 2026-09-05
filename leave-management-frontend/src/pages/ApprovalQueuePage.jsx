import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as leaveApi from "../api/leaveApi";
import { Banner, StatusBadge } from "../components/ui";

export default function ApprovalQueuePage() {
  const { token } = useAuth();
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [remarks, setRemarks] = useState({});
  const load = useCallback(() => {
    setError("");
    leaveApi
      .getPendingApplications(token)
      .then(setPending)
      .catch((e) => setError(e.message));
  }, [token]);
  useEffect(() => {
    load();
  }, [load]);
  async function decide(id, action) {
    setBusyId(id);
    setError("");
    try {
      await leaveApi.decideLeaveApplication(token, id, {
        action,
        remarks: remarks[id] || "",
      });
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }
  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-[22px] text-[#1E2761]">Approval queue</h2>
      {error && (
        <div className="mt-4">
          <Banner tone="error">{error}</Banner>
        </div>
      )}
      {pending === null && !error && (
        <p className="mt-4 text-sm text-[#5B6485]">Loading…</p>
      )}
      {pending?.length === 0 && (
        <p className="mt-4 text-sm text-[#5B6485]">
          Nothing waiting on your decision.
        </p>
      )}
      {pending?.length > 0 && (
        <div className="mt-5 space-y-3">
          {pending.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-[#E3E7F5] bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1E2761]">
                    {app.applicant_name}
                  </p>
                  <p className="text-[12px] text-[#8A91B4]">
                    {app.leave_type_name} · {app.start_date} → {app.end_date} ·{" "}
                    {app.total_days} day(s)
                  </p>
                  {app.reason && (
                    <p className="mt-1.5 text-[13px] text-[#33395C]">
                      "{app.reason}"
                    </p>
                  )}
                </div>
                <StatusBadge status={app.status} />
              </div>
              <input
                type="text"
                placeholder="Optional remarks"
                value={remarks[app.id] || ""}
                onChange={(e) =>
                  setRemarks((p) => ({ ...p, [app.id]: e.target.value }))
                }
                className="mt-3 w-full rounded-lg border border-[#D9DEF0] px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#6C8CFF]/40"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busyId === app.id}
                  onClick={() => decide(app.id, "approved")}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1F7A4D] px-3 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === app.id}
                  onClick={() => decide(app.id, "rejected")}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#B23B3B] px-3 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
