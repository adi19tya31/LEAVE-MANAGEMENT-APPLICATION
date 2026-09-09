import { useCallback, useEffect, useState } from "react";
import { Calendar, Clock, Info, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as leaveApi from "../api/leaveApi";
import { getPublicHolidays } from "../api/holidayApi";
import { getChargeableLeaveDays } from "../utils/leaveDays";
import {
  Banner,
  Field,
  PrimaryButton,
  StatusBadge,
  TextInput,
} from "../components/ui";

export default function ApplyLeavePage() {
  const { token } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaveTypeId, setLeaveTypeId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDayType, setStartDayType] = useState("FULL_DAY");
  const [endDayType, setEndDayType] = useState("FULL_DAY");
  const [reason, setReason] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const loadData = useCallback(async () => {
    setLoadError("");
    try {
      const [types, bals] = await Promise.all([
        leaveApi.getLeaveTypes(token),
        leaveApi.getMyBalances(token),
      ]);
      const configuredHolidays = await getPublicHolidays(token).catch(() => []);
      setLeaveTypes(types);
      setBalances(bals);
      setHolidays(configuredHolidays);
      setLeaveTypeId((current) => current ?? types[0]?.id ?? null);
    } catch (e) {
      setLoadError(e.message);
    }
  }, [token]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  const selectedBalance = balances.find((b) => b.leave_type_id === leaveTypeId);
  const chargeableDays = getChargeableLeaveDays(
    startDate,
    endDate,
    holidays,
    startDayType,
    endDayType,
  );
  async function submit(e) {
    e.preventDefault();
    setSubmitError("");
    if (chargeableDays === 0) {
      setSubmitError("The selected range contains no working days.");
      return;
    }
    setSubmitting(true);
    try {
      setResult(
        await leaveApi.submitLeaveApplication(token, {
          leaveTypeId,
          startDate,
          endDate,
          startDayType,
          endDayType,
          reason,
        }),
      );
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  }
  function reset() {
    setStartDate("");
    setEndDate("");

    setStartDayType("FULL_DAY");
    setEndDayType("FULL_DAY");

    setReason("");
    setResult(null);
    setSubmitError("");

    loadData();
  }
  if (result)
    return (
      <div className="max-w-lg">
        <div className="rounded-2xl bg-white border border-[#E3E7F5] shadow-sm p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FBF3DF]">
              <Clock className="h-5 w-5 text-[#B8860B]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1E2761]">
                Application submitted
              </p>
              <p className="text-[13px] text-[#5B6485]">
                Submitted {new Date(result.submittedOn).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-[#E3E7F5] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#FBF3DF]">
              <span className="text-[13px] font-medium text-[#B8860B]">
                Current status
              </span>
              <StatusBadge status={result.status} />
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#EEF1FA] border-t border-[#EEF1FA]">
              <div className="px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-[#9AA2C7]">
                  Days applied
                </p>
                <p className="mt-0.5 text-sm font-medium text-[#1E2761]">
                  {result.appliedDays}
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-[#9AA2C7]">
                  Remaining (before decision)
                </p>
                <p className="mt-0.5 text-sm font-medium text-[#1E2761]">
                  {result.remainingLeaves}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-[#8A91B4]">
            Sent to your reporting manager for review. Balance updates once it's
            approved.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 w-full rounded-lg border border-[#D9DEF0] px-4 py-2.5 text-sm font-medium text-[#1E2761] hover:bg-[#F4F6FC]"
          >
            Submit another application
          </button>
        </div>
      </div>
    );
  return (
    <div className="w-auto">
      <h2 className="font-serif text-[22px] text-[#1E2761]">Apply for leave</h2>
      <p className="mt-1 text-sm text-[#5B6485]">
        Pick a leave type, dates, and a short reason.
      </p>
      {loadError && (
        <div className="mt-4">
          <Banner tone="error">{loadError}</Banner>
        </div>
      )}
      {leaveTypes.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {leaveTypes.map((t) => {
            const bal = balances.find((b) => b.leave_type_id === t.id);
            const left = bal ? bal.remaining_days : t.max_days_per_year;
            const total = bal ? bal.allocated_days : t.max_days_per_year;
            const pct =
              total > 0 ? Math.max(0, Math.min(100, (left / total) * 100)) : 0;
            const active = t.id === leaveTypeId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setLeaveTypeId(t.id)}
                className={`text-left rounded-xl border px-3 py-3 transition-colors ${active ? "border-[#1E2761] bg-white shadow-sm" : "border-[#E3E7F5] bg-white/60 hover:border-[#C7CFEC]"}`}
              >
                <span className="text-[11px] font-semibold text-[#1E2761]">
                  {t.name}
                </span>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#EEF1FA] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#6C8CFF]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[13px] text-[#1E2761]">
                  <span className="font-semibold">{left}</span>
                  <span className="text-[#8A91B4]"> / {total} left</span>
                </p>
              </button>
            );
          })}
        </div>
      )}
      <form
        onSubmit={submit}
        className="mt-5 rounded-2xl bg-white border border-[#E3E7F5] shadow-sm p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date">
            <div className="relative">
              <TextInput
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AA2C7]" />
            </div>
          </Field>

          <Field label="End date">
            <div className="relative">
              <TextInput
                type="date"
                required
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AA2C7]" />
            </div>
          </Field>

          <Field label="Leave starts from">
            <select
              value={startDayType}
              onChange={(e) => setStartDayType(e.target.value)}
              className="w-full rounded-lg border border-[#D9DEF0] px-3 py-2.5 text-sm text-[#1E2761] outline-none focus:ring-2 focus:ring-[#6C8CFF]/40"
            >
              <option value="FULL_DAY">Full Day</option>
              <option value="FIRST_HALF">First Half</option>
              <option value="SECOND_HALF">Second Half</option>
            </select>
          </Field>

          <Field label="Leave ends on">
            <select
              value={endDayType}
              onChange={(e) => setEndDayType(e.target.value)}
              className="w-full rounded-lg border border-[#D9DEF0] px-3 py-2.5 text-sm text-[#1E2761] outline-none focus:ring-2 focus:ring-[#6C8CFF]/40"
            >
              <option value="FULL_DAY">Full Day</option>
              <option value="FIRST_HALF">First Half</option>
              <option value="SECOND_HALF">Second Half</option>
            </select>
          </Field>
        </div>
        {selectedBalance && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#F4F6FC] px-3 py-2 text-[13px] text-[#33395C]">
            <Info className="h-3.5 w-3.5 text-[#6C8CFF] shrink-0" />
            <span>
              {selectedBalance.remaining_days} day(s) currently available for{" "}
              {selectedBalance.leave_type_name}
            </span>
          </div>
        )}
        {startDate && endDate && (
          <div className="mt-3 rounded-lg bg-[#E6F5EC] px-3 py-2 text-[13px] text-[#1F7A4D]">
            <span className="font-medium">
              {chargeableDays} chargeable day(s).
            </span>{" "}
            Leave starts from{" "}
            <span className="font-medium">
              {startDayType === "FULL_DAY"
                ? "Full Day"
                : startDayType === "FIRST_HALF"
                  ? "First Half"
                  : "Second Half"}
            </span>{" "}
            and ends on{" "}
            <span className="font-medium">
              {endDayType === "FULL_DAY"
                ? "Full Day"
                : endDayType === "FIRST_HALF"
                  ? "First Half"
                  : "Second Half"}
            </span>
            . Sundays and configured public holidays are excluded.
          </div>
        )}
        <div className="mt-4">
          <Field label="Reason">
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Family function out of town"
              className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-[#1E2761] placeholder:text-[#AEB4D1] outline-none focus:ring-2 focus:ring-[#6C8CFF]/40 border-[#D9DEF0]"
            />
          </Field>
        </div>
        {submitError && (
          <div className="mt-4">
            <Banner tone="error">{submitError}</Banner>
          </div>
        )}
        <PrimaryButton
          type="submit"
          loading={submitting}
          className="mt-5 w-full"
        >
          <Send className="h-3.5 w-3.5" />
          Submit application
        </PrimaryButton>
      </form>
    </div>
  );
}
