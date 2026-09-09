import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as compOffApi from "../api/compOffApi";
import { Banner, StatusBadge } from "../components/ui";
export default function CompOffApprovalPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [remarks, setRemarks] = useState({});
  const load = () =>
    compOffApi
      .getPendingCompOffs(token)
      .then(setRows)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [token]);
  async function decide(id, action) {
    setBusy(id);
    setError("");
    try {
      await compOffApi.decideCompOff(token, id, {
        action,
        remarks: remarks[id] || "",
      });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="max-w-5xl">
      <h2 className="font-serif text-[22px] text-[#1E2761]">
        Comp-Off approvals
      </h2>
      <p className="mt-1 text-sm text-[#5B6485]">
        Review Comp-Off requests from your employees.
      </p>
      {error && (
        <div className="mt-4">
          <Banner tone="error">{error}</Banner>
        </div>
      )}
      {rows?.length ? (
        <div className="mt-5 space-y-3">
          {rows.map((x) => (
            <div
              key={x.id}
              className="rounded-xl border border-[#E3E7F5] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#1E2761]">
                    {x.employee_name}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6D7597]">
                    Worked: {x.work_date}
                  </p>
                  <p className="mt-1.5 text-[13px] text-[#33395C]">
                    {x.reason}
                  </p>
                </div>
                <StatusBadge status={x.status} />
              </div>
              <input
                value={remarks[x.id] || ""}
                onChange={(e) =>
                  setRemarks((p) => ({ ...p, [x.id]: e.target.value }))
                }
                placeholder="Optional remarks"
                className="mt-3 w-full rounded-lg border border-[#D9DEF0] px-3 py-2 text-[13px]"
              />
              <div className="mt-3 flex gap-2">
                <button
                  disabled={busy === x.id}
                  onClick={() => decide(x.id, "approved")}
                  className="flex-1 rounded-lg bg-[#1F7A4D] px-3 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
                >
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                  Approve
                </button>
                <button
                  disabled={busy === x.id}
                  onClick={() => decide(x.id, "rejected")}
                  className="flex-1 rounded-lg bg-[#B23B3B] px-3 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
                >
                  <XCircle className="mr-1 inline h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        rows && (
          <p className="mt-5 rounded-xl border border-dashed border-[#D9DEF0] bg-white p-8 text-center text-sm text-[#6D7597]">
            No pending Comp-Off requests.
          </p>
        )
      )}
    </div>
  );
}
