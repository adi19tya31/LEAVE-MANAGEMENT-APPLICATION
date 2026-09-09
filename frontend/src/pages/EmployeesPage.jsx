import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as employeeApi from "../api/employeeApi";
import { Banner } from "../components/ui";

export default function EmployeesPage() {
  const { token, user } = useAuth();

  const [employees, setEmployees] = useState(null);
  const [error, setError] = useState("");

  const isManagerOrOwner = user?.role === "manager" || user?.role === "owner";

  useEffect(() => {
    if (!isManagerOrOwner) return;

    employeeApi
      .getAllEmployees(token)
      .then(setEmployees)
      .catch((e) => setError(e.message));
  }, [token, isManagerOrOwner]);

  if (!isManagerOrOwner) {
    return (
      <Banner tone="error">
        You do not have permission to view employees.
      </Banner>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Page Header */}

      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#EEF1FF] p-2">
          <Users className="h-5 w-5 text-[#1E2761]" />
        </div>

        <div>
          <h2 className="font-serif text-[24px] text-[#1E2761]">Employees</h2>

          <p className="mt-1 text-sm text-[#5B6485]">
            View all employees in your organization.
          </p>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="mt-5">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      {/* Loading */}

      {employees === null && !error && (
        <p className="mt-5 text-sm text-[#5B6485]">Loading employees...</p>
      )}

      {/* Empty */}

      {employees?.length === 0 && (
        <p className="mt-5 text-sm text-[#8A91B4]">No employees found.</p>
      )}

      {/* Employee Table */}

      {employees?.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#E3E7F5] bg-white shadow-sm">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-[#EEF1FA] bg-[#F7F8FD] text-[#6D7597]">
              <tr>
                <th className="px-5 py-3 font-semibold">Employee</th>

                <th className="px-5 py-3 font-semibold">Employee Code</th>

                <th className="px-5 py-3 font-semibold">Email</th>

                <th className="px-5 py-3 font-semibold">Role</th>

                <th className="px-5 py-3 font-semibold">Department</th>

                <th className="px-5 py-3 font-semibold">Reporting To</th>

                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EEF1FA]">
              {employees.map((employee) => (
                <tr key={employee.Emp_id} className="hover:bg-[#FAFBFF]">
                  <td className="px-5 py-4 font-medium text-[#1E2761]">
                    {employee.name}
                  </td>

                  <td className="px-5 py-4 text-[#5B6485]">
                    {employee.employee_code || "-"}
                  </td>

                  <td className="px-5 py-4 text-[#5B6485]">{employee.email}</td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#EEF1FF] px-3 py-1 text-[11px] font-medium text-[#5367D8]">
                      {employee.role_name || "-"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-[#5B6485]">
                    {employee.department_name || "-"}
                  </td>

                  <td className="px-5 py-4 text-[#5B6485]">
                    {employee.reporting_to_name || "Not Assigned"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                        employee.status === "active"
                          ? "bg-[#E6F5EC] text-[#1F7A4D]"
                          : "bg-[#FDEBEC] text-[#C44545]"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
