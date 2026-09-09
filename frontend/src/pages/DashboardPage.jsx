import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, FileClock, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as leaveApi from "../api/leaveApi";
import * as compOffApi from "../api/compOffApi";
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


function HistoryTable({ rows, isCompOff, managerView }) {
  if (!rows?.length) {
    return (
      <p className="p-5 text-sm text-[#8A91B4]">
        No history found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12px]">

        <thead className="bg-[#F7F8FD] text-[#6D7597]">
          <tr>

            {/* Employee column only for Manager/Owner */}

            {managerView && (
              <th className="px-4 py-3 font-semibold">
                Employee
              </th>
            )}


            {/* COMP-OFF HEADERS */}

            {isCompOff ? (
              <>
                <th className="px-4 py-3 font-semibold">
                  Work Date
                </th>

                <th className="px-4 py-3 font-semibold">
                  Reason
                </th>
              </>
            ) : (
              <>
                {/* LEAVE HEADERS */}

                <th className="px-4 py-3 font-semibold">
                  Leave Type
                </th>

                <th className="px-4 py-3 font-semibold">
                  Start Date
                </th>

                <th className="px-4 py-3 font-semibold">
                  Start Type
                </th>

                <th className="px-4 py-3 font-semibold">
                  End Date
                </th>

                <th className="px-4 py-3 font-semibold">
                  End Type
                </th>

                <th className="px-4 py-3 font-semibold">
                  Total Days
                </th>
              </>
            )}

            <th className="px-4 py-3 font-semibold">
              Status
            </th>

          </tr>
        </thead>


        <tbody className="divide-y divide-[#EEF1FA]">

          {rows.map((row) => (

            <tr key={row.id}>

              {/* EMPLOYEE */}

              {managerView && (
                <td className="px-4 py-3 font-medium text-[#1E2761]">
                  {row.employee_name || row.applicant_name}
                </td>
              )}


              {/* COMP-OFF ROW */}

              {isCompOff ? (
                <>
                  <td className="px-4 py-3 text-[#33395C]">
                    {row.work_date?.slice(0, 10)}
                  </td>

                  <td className="px-4 py-3 text-[#5B6485]">
                    {row.reason}
                  </td>
                </>
              ) : (
                <>
                  {/* LEAVE TYPE */}

                  <td className="px-4 py-3 font-medium text-[#33395C]">
                    {row.leave_type_name}
                  </td>


                  {/* START DATE */}

                  <td className="px-4 py-3 text-[#5B6485]">
                    {row.start_date?.slice(0, 10)}
                  </td>


                  {/* START TYPE */}

                  <td className="px-4 py-3 text-[#5B6485]">
                    {formatDayType(row.start_day_type)}
                  </td>


                  {/* END DATE */}

                  <td className="px-4 py-3 text-[#5B6485]">
                    {row.end_date?.slice(0, 10)}
                  </td>


                  {/* END TYPE */}

                  <td className="px-4 py-3 text-[#5B6485]">
                    {formatDayType(row.end_day_type)}
                  </td>


                  {/* TOTAL DAYS */}

                  <td className="px-4 py-3 font-medium text-[#1E2761]">
                    {row.total_days}
                  </td>
                </>
              )}


              {/* STATUS */}

              <td className="px-4 py-3">
                <StatusBadge status={row.status} />
              </td>

            </tr>

          ))}

        </tbody>

      </table>
    </div>
  );
}



function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#E3E7F5] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[#6D7597]">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#1E2761]">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const managerView = user.role === "manager" || user.role === "owner";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      try {
        if (managerView) {
          const [leaves, compOffs, pendingLeaves, pendingCompOffs] =
            await Promise.all([
              leaveApi.getTeamApplications(token),
              compOffApi.getTeamCompOffHistory(token),
              leaveApi.getPendingApplications(token),
              compOffApi.getPendingCompOffs(token),
            ]);
          setData({ leaves, compOffs, pendingLeaves, pendingCompOffs });
        } else {
          const [leaves, compOffs] = await Promise.all([
            leaveApi.getMyApplications(token),
            compOffApi.getMyCompOffHistory(token),
          ]);
          setData({ leaves, compOffs, pendingLeaves: [], pendingCompOffs: [] });
        }
      } catch (e) {
        setError(e.message);
      }
    };
    load();
  }, [token, managerView]);
  if (error)
    return (
      <div className="max-w-6xl">
        <Banner tone="error">{error}</Banner>
      </div>
    );
  if (!data)
    return <p className="text-sm text-[#5B6485]">Loading dashboard…</p>;
  const all = [...data.leaves, ...data.compOffs];
  return (
    <div className="max-w-6xl">
      <h2 className="font-serif text-[24px] text-[#1E2761]">Dashboard</h2>
      <p className="mt-1 text-sm text-[#5B6485]">
        {managerView
          ? "Your employees' leave and Comp-Off history"
          : "Your leave and Comp-Off history"}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Stat
          icon={FileClock}
          label={managerView ? "Team records" : "My records"}
          value={all.length}
        />
        <Stat
          icon={Clock3}
          label="Pending"
          value={all.filter((x) => x.status === "pending").length}
        />
        <Stat
          icon={CheckCircle2}
          label="Approved"
          value={all.filter((x) => x.status === "approved").length}
        />
        <Stat
          icon={XCircle}
          label="Rejected"
          value={all.filter((x) => x.status === "rejected").length}
        />
      </div>
      {managerView &&
        (data.pendingLeaves.length || data.pendingCompOffs.length) > 0 && (
          <div className="mt-6 rounded-2xl border border-[#E3E7F5] bg-white shadow-sm">
            <div className="border-b border-[#EEF1FA] px-5 py-4">
              <h3 className="text-sm font-semibold text-[#1E2761]">
                Pending approvals
              </h3>
            </div>
            <HistoryTable
              rows={data.pendingLeaves}
              managerView
              isCompOff={false}
            />
            <HistoryTable rows={data.pendingCompOffs} managerView isCompOff />
          </div>
        )}
      <div className="mt-6 rounded-2xl border border-[#E3E7F5] bg-white shadow-sm">
        <div className="border-b border-[#EEF1FA] px-5 py-4">
          <h3 className="text-sm font-semibold text-[#1E2761]">
            Leave History
          </h3>
        </div>
        <HistoryTable
          rows={data.leaves}
          managerView={managerView}
          isCompOff={false}
        />
      </div>
      <div className="mt-6 rounded-2xl border border-[#E3E7F5] bg-white shadow-sm">
        <div className="border-b border-[#EEF1FA] px-5 py-4">
          <h3 className="text-sm font-semibold text-[#1E2761]">
            Comp-Off History
          </h3>
        </div>
        <HistoryTable
          rows={data.compOffs}
          managerView={managerView}
          isCompOff
        />
      </div>
    </div>
  );
}
