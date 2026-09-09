import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as compOffApi from "../api/compOffApi";
import { Banner, StatusBadge } from "../components/ui";

export default function CompOffPage() {
  const { token } = useAuth();
  const [workDate, setWorkDate] = useState("");
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-[#1E2761]">
                    {x.work_date}
                  </p>
                  <p className="text-[12px] text-[#6D7597]">{x.reason}</p>
                </div>
                <StatusBadge status={x.status} />
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
