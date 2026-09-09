import { useEffect, useMemo, useState, useRef } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import * as leaveApi from "../api/leaveApi";
import { Banner } from "../components/ui";

import "./LeaveCalendarPage.css";

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDayType(type) {
  if (type === "FIRST_HALF") {
    return "First Half";
  }

  if (type === "SECOND_HALF") {
    return "Second Half";
  }

  return "Full Day";
}

function getLeaveClass(type) {
  const value = (type || "").toLowerCase();

  if (value.includes("casual")) {
    return "leave-casual";
  }

  if (value.includes("unpaid")) {
    return "leave-unpaid";
  }

  if (value.includes("sick")) {
    return "leave-sick";
  }

  if (value.includes("earned")) {
    return "leave-earned";
  }

  return "leave-other";
}

function getStatusClass(status) {
  const value = status?.toLowerCase();

  if (value === "approved") {
    return "status-approved";
  }

  if (value === "pending") {
    return "status-pending";
  }

  return "status-rejected";
}

export default function LeaveCalendarPage() {
  const { token } = useAuth();

  // FullCalendar reference
  const calendarRef = useRef(null);

  // Month title shown in top navigation
  const [calendarTitle, setCalendarTitle] = useState("");

  const [leaves, setLeaves] = useState([]);

  const [error, setError] = useState("");

  const [selectedLeave, setSelectedLeave] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const [selectedLeaveType, setSelectedLeaveType] = useState("all");

  const [selectedEmployee, setSelectedEmployee] = useState("all");

  const [statusFilters, setStatusFilters] = useState({
    approved: true,
    pending: true,
    rejected: true,
  });

  // =========================
  // LOAD CALENDAR LEAVES
  // =========================

  useEffect(() => {
    leaveApi
      .getCalendarLeaves(token)
      .then((data) => {
        setLeaves(data || []);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [token]);

  // =========================
  // FILTER OPTIONS
  // =========================

  const departments = useMemo(() => {
    return [
      ...new Set(leaves.map((leave) => leave.department_name).filter(Boolean)),
    ];
  }, [leaves]);

  const leaveTypes = useMemo(() => {
    return [
      ...new Set(leaves.map((leave) => leave.leave_type_name).filter(Boolean)),
    ];
  }, [leaves]);

  const employees = useMemo(() => {
    return [
      ...new Set(leaves.map((leave) => leave.applicant_name).filter(Boolean)),
    ];
  }, [leaves]);

  // =========================
  // FILTER LEAVES
  // =========================

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const status = leave.status?.toLowerCase();

      // Status filter
      if (!statusFilters[status]) {
        return false;
      }

      // Department filter
      if (
        selectedDepartment !== "all" &&
        leave.department_name !== selectedDepartment
      ) {
        return false;
      }

      // Leave type filter
      if (
        selectedLeaveType !== "all" &&
        leave.leave_type_name !== selectedLeaveType
      ) {
        return false;
      }

      // Employee filter
      if (
        selectedEmployee !== "all" &&
        leave.applicant_name !== selectedEmployee
      ) {
        return false;
      }

      return true;
    });
  }, [
    leaves,
    statusFilters,
    selectedDepartment,
    selectedLeaveType,
    selectedEmployee,
  ]);

  // =========================
  // FULLCALENDAR EVENTS
  // =========================

  const events = useMemo(() => {
    return filteredLeaves.map((leave) => {
      const startDate = leave.start_date?.slice(0, 10);

      const endDate = leave.end_date?.slice(0, 10);

      // FullCalendar end date is exclusive
      const end = new Date(`${endDate}T00:00:00`);

      end.setDate(end.getDate() + 1);

      return {
        id: String(leave.id),

        title: `${leave.applicant_name} · ${leave.leave_type_name}`,

        start: startDate,

        end: end.toISOString().slice(0, 10),

        classNames: [
          getLeaveClass(leave.leave_type_name),
          getStatusClass(leave.status),
        ],

        extendedProps: {
          leave,
        },
      };
    });
  }, [filteredLeaves]);

  // =========================
  // LEAVES ON SELECTED DATE
  // =========================

  const selectedDateLeaves = useMemo(() => {
    return filteredLeaves.filter((leave) => {
      const start = leave.start_date?.slice(0, 10);

      const end = leave.end_date?.slice(0, 10);

      return selectedDate >= start && selectedDate <= end;
    });
  }, [filteredLeaves, selectedDate]);

  // =========================
  // CURRENT MONTH LEAVES
  // =========================

  const currentMonthLeaves = useMemo(() => {
    const calendarApi = calendarRef.current?.getApi();

    if (!calendarApi) {
      return filteredLeaves;
    }

    const currentDate = calendarApi.getDate();

    const month = currentDate.getMonth();

    const year = currentDate.getFullYear();

    return filteredLeaves.filter((leave) => {
      if (!leave.start_date) {
        return false;
      }

      const startDate = new Date(`${leave.start_date.slice(0, 10)}T00:00:00`);

      return startDate.getMonth() === month && startDate.getFullYear() === year;
    });
  }, [filteredLeaves, calendarTitle]);

  // =========================
  // SUMMARY COUNTS
  // =========================

  const approvedCount = currentMonthLeaves.filter(
    (leave) => leave.status?.toLowerCase() === "approved",
  ).length;

  const pendingCount = currentMonthLeaves.filter(
    (leave) => leave.status?.toLowerCase() === "pending",
  ).length;

  const rejectedCount = currentMonthLeaves.filter(
    (leave) => leave.status?.toLowerCase() === "rejected",
  ).length;

  const employeeCount = new Set(
    currentMonthLeaves.map((leave) => leave.employee_id),
  ).size;

  // =========================
  // STATUS FILTER
  // =========================

  function toggleStatus(status) {
    setStatusFilters((previous) => ({
      ...previous,
      [status]: !previous[status],
    }));
  }

  // =========================
  // EVENT CLICK
  // =========================

  function handleEventClick(info) {
    const leave = info.event.extendedProps.leave;

    setSelectedLeave(leave);

    setSelectedDate(info.event.startStr.slice(0, 10));
  }

  // =========================
  // DATE CLICK
  // =========================

  function handleDateClick(info) {
    setSelectedDate(info.dateStr);

    setSelectedLeave(null);
  }

  // =========================
  // CALENDAR NAVIGATION
  // =========================

  const handlePreviousMonth = () => {
    const calendarApi = calendarRef.current?.getApi();

    if (calendarApi) {
      calendarApi.prev();
    }
  };

  const handleNextMonth = () => {
    const calendarApi = calendarRef.current?.getApi();

    if (calendarApi) {
      calendarApi.next();
    }
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();

    if (calendarApi) {
      calendarApi.today();
    }
  };

  // =========================
  // UPDATE MONTH TITLE
  // =========================

  const handleDatesSet = (dateInfo) => {
    setCalendarTitle(dateInfo.view.title);
  };

  // =========================
  // CUSTOM EVENT DESIGN
  // =========================

  function eventContent(info) {
    const leave = info.event.extendedProps.leave;

    return (
      <div className="calendar-event-content">
        <span className="event-avatar">
          {getInitials(leave.applicant_name)}
        </span>

        <span className="event-text">
          {leave.applicant_name} · {leave.leave_type_name}
        </span>
      </div>
    );
  }

  return (
    <div className="leave-calendar-page">
      {/* ================= HEADER ================= */}

      <div className="calendar-page-header">
        <div className="calendar-heading">
          <div className="calendar-heading-icon">
            <CalendarDays size={25} />
          </div>

          <div>
            <h2>Leave Calendar</h2>

            <p>View and manage employee leaves by date.</p>
          </div>
        </div>

        {/* NAVIGATION */}

        <div className="calendar-navigation">
          <button type="button" onClick={handleToday} className="today-button">
            Go to Today
          </button>

          <button
            type="button"
            onClick={handlePreviousMonth}
            className="nav-button"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="month-display">
            <CalendarDays size={18} />

            <span>{calendarTitle}</span>

            <ChevronDown size={17} />
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="nav-button"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mt-5">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}

      {!error && (
        <div className="calendar-main-grid">
          {/* ================= LEFT SECTION ================= */}

          <div className="calendar-left-section">
            {/* FILTERS */}

            <div className="calendar-filters">
              {/* DEPARTMENT */}

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>

                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>

              {/* LEAVE TYPE */}

              <select
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
              >
                <option value="all">All Leave Types</option>

                {leaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* EMPLOYEE */}

              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="all">All Employees</option>

                {employees.map((employee) => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>

              {/* STATUS FILTERS */}

              <div className="status-filters">
                <label className="approved-filter">
                  <input
                    type="checkbox"
                    checked={statusFilters.approved}
                    onChange={() => toggleStatus("approved")}
                  />
                  Approved
                </label>

                <label className="pending-filter">
                  <input
                    type="checkbox"
                    checked={statusFilters.pending}
                    onChange={() => toggleStatus("pending")}
                  />
                  Pending
                </label>

                {/* <label className="rejected-filter">
                  <input
                    type="checkbox"
                    checked={statusFilters.rejected}
                    onChange={() => toggleStatus("rejected")}
                  />
                  Rejected
                </label> */}
              </div>
            </div>

            {/* ================= CALENDAR ================= */}

            <div className="calendar-wrapper">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={false}
                events={events}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                eventContent={eventContent}
                datesSet={handleDatesSet}
                dayMaxEvents={3}
                moreLinkText={(number) => `+${number} more`}
                fixedWeekCount={false}
                height="auto"
              />
            </div>

            {/* ================= LEGEND ================= */}

            <div className="calendar-legend">
              <div>
                <span className="legend-dot casual-dot" />
                Casual Leave
              </div>

              <div>
                <span className="legend-dot unpaid-dot" />
                Unpaid Leave
              </div>

              <div>
                <span className="legend-dot sick-dot" />
                Sick Leave
              </div>

              <div>
                <span className="legend-dot earned-dot" />
                Earned Leave
              </div>

              <div>
                <span className="legend-dot other-dot" />
                Other Leave
              </div>
            </div>
          </div>

          {/* ================= RIGHT SECTION ================= */}

          <div className="calendar-right-section">
            {/* ================= LEAVE DETAILS ================= */}

            <div className="side-card">
              <div className="selected-date-title">
                <CalendarDays size={22} />

                <h3>{formatDate(selectedDate)}</h3>
              </div>

              {selectedLeave ? (
                <>
                  <div className="employee-card">
                    <div className="large-avatar">
                      {getInitials(selectedLeave.applicant_name)}
                    </div>

                    <div>
                      <h4>{selectedLeave.applicant_name}</h4>

                      <p>{selectedLeave.leave_type_name}</p>
                    </div>

                    <span
                      className={`leave-status ${getStatusClass(
                        selectedLeave.status,
                      )}`}
                    >
                      {selectedLeave.status}
                    </span>
                  </div>

                  <div className="leave-information">
                    <div>
                      <span>Start Date</span>

                      <strong>
                        {formatDate(selectedLeave.start_date)}

                        {" · "}

                        {formatDayType(selectedLeave.start_day_type)}
                      </strong>
                    </div>

                    <div>
                      <span>End Date</span>

                      <strong>
                        {formatDate(selectedLeave.end_date)}

                        {" · "}

                        {formatDayType(selectedLeave.end_day_type)}
                      </strong>
                    </div>

                    <div>
                      <span>Total Days</span>

                      <strong>
                        {selectedLeave.total_days} Day
                        {selectedLeave.total_days > 1 ? "s" : ""}
                      </strong>
                    </div>

                    <div>
                      <span>Reason</span>

                      <strong>{selectedLeave.reason || "-"}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <p className="no-selection">
                  Click a leave event to view complete details.
                </p>
              )}
            </div>

            {/* ================= TEAM ON LEAVE ================= */}

            <div className="side-card team-leave-card">
              <h3>Team on Leave</h3>

              <p className="team-date">{formatDate(selectedDate)}</p>

              {selectedDateLeaves.length === 0 ? (
                <p className="no-team-leave">No employees on leave.</p>
              ) : (
                selectedDateLeaves.map((leave) => (
                  <div className="team-member" key={leave.id}>
                    <div className="small-avatar">
                      {getInitials(leave.applicant_name)}
                    </div>

                    <div className="team-member-info">
                      <strong>{leave.applicant_name}</strong>

                      <span>
                        {leave.leave_type_name}
                        {" · "}
                        {leave.total_days} Day
                        {leave.total_days > 1 ? "s" : ""}
                      </span>
                    </div>

                    <span
                      className={`leave-status small-status ${getStatusClass(
                        leave.status,
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUMMARY ================= */}

      <div className="calendar-summary">
        {/* TOTAL EMPLOYEES */}

        <div className="summary-card">
          <div className="summary-icon employees-icon">
            <Users size={24} />
          </div>

          <div>
            <strong>{employeeCount}</strong>

            <span>Total Employees on Leave</span>
          </div>
        </div>

        {/* APPROVED */}

        <div className="summary-card">
          <div className="summary-icon approved-icon">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <strong>{approvedCount}</strong>

            <span>Approved Leaves</span>
          </div>
        </div>

        {/* PENDING */}

        <div className="summary-card">
          <div className="summary-icon pending-icon">
            <Clock3 size={24} />
          </div>

          <div>
            <strong>{pendingCount}</strong>

            <span>Pending Leaves</span>
          </div>
        </div>

        {/* REJECTED */}

        {/* <div className="summary-card">
          <div className="summary-icon rejected-icon">
            <XCircle size={24} />
          </div>

          <div>
            <strong>{rejectedCount}</strong>

            <span>Rejected Leaves</span>
          </div>
        </div> */}
      </div>
    </div>
  );
}
