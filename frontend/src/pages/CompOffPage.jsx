import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as compOffApi from "../api/compOffApi";
import { Banner, StatusBadge } from "../components/ui";

function workDateHasArrived(workDate) {
  const date = new Date(`${String(workDate).slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(date.getTime()) && date <= today;
}

function canCancelCompOffRequest(request) {
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  const workDate = request.work_date?.slice(0, 10);
  const appliedDate = request.applied_on?.slice(0, 10);
  const appliedTodayForToday =
    appliedDate === todayString && workDate === todayString;

  return (
    (request.status === "pending" || request.status === "approved") &&
    !request.completed_at &&
    workDate > todayString
  );
}

export default function CompOffPage() {
  const { token } = useAuth();
  const [workDate, setWorkDate] = useState("");
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const load = () =>
    compOffApi
      .getMyCompOffHistory(token)
      .then(setHistory)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [token]);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await compOffApi.applyCompOff(token, { workDate, reason });
      setWorkDate("");
      setReason("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function markAsWorked(id) {
    setWorkingId(id);
    setError("");
    try {
      await compOffApi.markCompOffAsWorked(token, id);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setWorkingId(null);
    }
  }

  async function handleCancel(request) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this Comp-Off request?",
    );

    if (!confirmed) return;

    setCancellingId(request.id);
    setError("");
    setSuccess("");

    try {
      await compOffApi.cancelCompOffRequest(token, request.id);
      setSuccess("Comp-Off request cancelled successfully.");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="max-w-5xl">
      <h2 className="font-serif text-[22px] text-[#1E2761]">Comp-Off</h2>
      <p className="mt-1 text-sm text-[#5B6485]">
        Apply for Comp-Off for work completed on a non-working day.
      </p>
      {error && (
        <div className="mt-4">
          <Banner tone="error">{error}</Banner>
        </div>
      )}
      {success && (
        <div className="mt-4">
          <Banner tone="success">{success}</Banner>
        </div>
      )}
      <form
        onSubmit={submit}
        className="mt-5 grid gap-3 rounded-2xl border border-[#E3E7F5] bg-white p-5 shadow-sm md:grid-cols-[220px_1fr_auto] md:items-end"
      >
        <label className="text-[12px] font-semibold text-[#5B6485]">
          Work date
          <input
            required
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#D9DEF0] px-3 py-2 text-sm"
          />
        </label>
        <label className="text-[12px] font-semibold text-[#5B6485]">
          Reason
          <input
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Weekend production support"
            className="mt-1.5 w-full rounded-lg border border-[#D9DEF0] px-3 py-2 text-sm"
          />
        </label>
        <button
          disabled={busy}
          className="rounded-lg bg-[#1E2761] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Apply Comp-Off"}
        </button>
      </form>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#E3E7F5] bg-white shadow-sm">
        <div className="border-b border-[#EEF1FA] px-5 py-4">
          <h3 className="text-sm font-semibold text-[#1E2761]">
            My Comp-Off History
          </h3>
        </div>
        {history?.length ? (
          <div className="divide-y divide-[#EEF1FA]">
            {history.map((x) => (
              <div
                key={x.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-[#1E2761]">
                    {x.work_date}
                  </p>
                  <p className="text-[12px] text-[#6D7597]">{x.reason}</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <StatusBadge status={x.status} />
                  {x.completed_at ? (
                    <span className="text-xs font-medium text-[#1F7A4D]">
                      Marked as worked
                    </span>
                  ) : x.status === "approved" && workDateHasArrived(x.work_date) ? (
                    <button
                      type="button"
                      disabled={workingId === x.id}
                      onClick={() => markAsWorked(x.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#1F7A4D] px-3 py-2 text-xs font-semibold text-[#1F7A4D] disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {workingId === x.id ? "Saving…" : "Mark as worked"}
                    </button>
                  ) : null}
                  {canCancelCompOffRequest(x) && (
                    <button
                      type="button"
                      disabled={cancellingId === x.id}
                      onClick={() => handleCancel(x)}
                      className="rounded-lg border border-[#D9534F] px-3 py-2 text-xs font-semibold text-[#D9534F] transition hover:bg-[#FBEAEA] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingId === x.id ? "Cancelling..." : "Cancel Comp-Off"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          history && (
            <p className="p-5 text-sm text-[#8A91B4]">
              No Comp-Off requests yet.
            </p>
          )
        )}
      </div>
    </div>
  );
}
