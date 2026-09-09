// Inclusive day count: applying from Mon to Wed is 3 days, not 2.
export function diffDaysInclusive(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const ms = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function countLeaveDays(
  startDate: string,
  endDate: string,
  holidayDates: string[],
): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const holidays = new Set(holidayDates.map((date) => date.slice(0, 10)));
  let count = 0;

  for (
    const date = new Date(start);
    date <= end;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const day = date.getUTCDay();
    const dateString = date.toISOString().slice(0, 10);
    if (day !== 0 && !holidays.has(dateString)) count += 1;
  }

  return count;
}

export function currentYear(): number {
  return new Date().getFullYear();
}
