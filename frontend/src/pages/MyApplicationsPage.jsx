import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as leaveApi from "../api/leaveApi";
import { Banner, StatusBadge } from "../components/ui";

function formatDayType(dayType) {
  switch (dayType) {
    case "FULL_DAY":
      return "Full Day";

    case "FIRST_HALF":
      return "First Half";

    case "SECOND_HALF":
      return "Second Half";

    default:
      return "Full Day";
  }
}

function getTodayLocalDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function canCancelApplication(application) {
  const today = getTodayLocalDate();
  const startDate = application.start_date?.slice(0, 10);

  const validStatus =
    application.status === "pending" ||
    application.status === "approved";

  return validStatus && startDate && startDate > today;
}

export default function MyApplicationsPage() {
  const { token } = useAuth();
  const [apps, setApps] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  async function loadApplications() {
    try {
      setError("");

      const data = await leaveApi.getMyApplications(token);

      setApps(data);
    } catch (e) {
      setError(e.message);
    }
  }

  // useEffect(() => {
  //   leaveApi
  //     .getMyApplications(token)
  //     .then(setApps)
  //     .catch((e) => setError(e.message));
  // }, [token]);
  useEffect(() => {
    loadApplications();
  }, [token]);
  async function handleCancel(application) {
    const confirmed = window.confirm(
      `Are you sure you want to cancel this ${application.leave_type_name} leave?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      setCancellingId(application.id);

      await leaveApi.cancelLeaveApplication(token, application.id);
      setSuccess("Leave application cancelled successfully.");

      await loadApplications();
    } catch (e) {
      setError(e.message);
    } finally {
      setCancellingId(null);
    }
  }
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
        <div className="mt-5 overflow-hidden rounded-xl border border-[#E3E7F5] bg-white divide-y divide-[#EEF1FA]">
          {apps.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div>
                {/* Leave Type */}

                <p className="text-sm font-medium text-[#1E2761]">
                  {a.leave_type_name}
                </p>

                {/* Start Date */}

                <p className="mt-1 text-[12px] text-[#8A91B4]">
                  Start:{" "}
                  <span className="font-medium text-[#5B6485]">
                    {a.start_date?.slice(0, 10)}
                  </span>{" "}
                  · <span>{formatDayType(a.start_day_type)}</span>
                </p>

                {/* End Date */}

                <p className="mt-1 text-[12px] text-[#8A91B4]">
                  End:{" "}
                  <span className="font-medium text-[#5B6485]">
                    {a.end_date?.slice(0, 10)}
                  </span>{" "}
                  · <span>{formatDayType(a.end_day_type)}</span>
                </p>

                {/* Total Days */}

                <p className="mt-1 text-[12px] font-medium text-[#1E2761]">
                  Total Leave: {a.total_days} day(s)
                </p>
              </div>

              {/* Status + cancle */}

              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={a.status} />
                 {canCancelApplication(a) && (
                  <button
                    type="button"
                    onClick={() => handleCancel(a)}
                    disabled={cancellingId === a.id}
                    className="rounded-lg border border-[#D9534F] px-3 py-1.5 text-[12px] font-semibold text-[#D9534F] transition hover:bg-[#FBEAEA] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancellingId === a.id
                      ? "Cancelling..."
                      : "Cancel Leave"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
