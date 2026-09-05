import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  createPublicHoliday,
  deletePublicHoliday,
  getPublicHolidays,
} from "../api/holidayApi";
import { Banner, Field, PrimaryButton, TextInput } from "../components/ui";

export default function PublicHolidaysPage() {
  const { token } = useAuth();
  const [holidays, setHolidays] = useState(null);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setHolidays(await getPublicHolidays(token));
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function addHoliday(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createPublicHoliday(token, { date, name: name.trim() });
      setDate("");
      setName("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeHoliday(holiday) {
    if (!window.confirm(`Remove public holiday "${holiday.name}"?`)) return;
    setError("");
    try {
      await deletePublicHoliday(token, holiday.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-[22px] text-[#1E2761]">
            Public holidays
          </h2>
          <p className="mt-1 text-sm text-[#5B6485]">
            Dates here are excluded from leave days, along with every Sunday.
          </p>
        </div>
        <CalendarDays className="h-6 w-6 text-[#1E2761]" />
      </div>
      {error && (
        <div className="mt-4">
          <Banner tone="error">{error}</Banner>
        </div>
      )}
      <form
        onSubmit={addHoliday}
        className="mt-5 grid gap-3 rounded-2xl border border-[#E3E7F5] bg-white p-4 shadow-sm sm:grid-cols-[1fr_1.5fr_auto] sm:items-end"
      >
        <Field label="Date">
          <TextInput
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
        <Field label="Holiday name">
          <TextInput
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. New Year's Day"
          />
        </Field>
        <PrimaryButton type="submit" loading={busy}>
          <Plus className="h-4 w-4" />
          Add holiday
        </PrimaryButton>
      </form>
      {holidays === null && !error && (
        <p className="mt-5 text-sm text-[#5B6485]">Loading...</p>
      )}
      {holidays?.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-[#D9DEF0] bg-white p-8 text-center text-sm text-[#5B6485]">
          No public holidays configured.
        </div>
      )}
      {holidays?.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#E3E7F5] bg-white shadow-sm">
          {holidays.map((holiday) => (
            <div
              key={holiday.id}
              className="flex items-center justify-between gap-4 border-b border-[#EEF1FA] px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-[#1E2761]">
                  {holiday.name}
                </p>
                <p className="text-[12px] text-[#8A91B4]">
                  {holiday.date || holiday.holiday_date}
                </p>
              </div>
              <button
                type="button"
                title="Remove holiday"
                onClick={() => removeHoliday(holiday)}
                className="rounded-lg p-2 text-[#B23B3B] hover:bg-[#FBEAEA]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
