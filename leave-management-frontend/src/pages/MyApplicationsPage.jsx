import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as leaveApi from "../api/leaveApi";
import { Banner, StatusBadge } from "../components/ui";

export default function MyApplicationsPage() {
  const { token } = useAuth();
  const [apps, setApps] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    leaveApi
      .getMyApplications(token)
      .then(setApps)
      .catch((e) => setError(e.message));
  }, [token]);
  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-[22px] text-[#1E2761]">My applications</h2>
      {error && (
        <div className="mt-4">
          <Banner tone="error">{error}</Banner>
        </div>
      )}
      {apps === null && !error && (
        <p className="mt-4 text-sm text-[#5B6485]">Loading…</p>
      )}
      {apps && apps.length === 0 && (
        <p className="mt-4 text-sm text-[#5B6485]">No applications yet.</p>
      )}
      {apps?.length > 0 && (
        <div className="mt-5 rounded-xl border border-[#E3E7F5] bg-white divide-y divide-[#EEF1FA] overflow-hidden">
          {apps.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-[#1E2761]">
                  {a.leave_type_name}
                </p>
                <p className="text-[12px] text-[#8A91B4]">
                  {a.start_date} → {a.end_date} · {a.total_days} day(s)
                </p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
