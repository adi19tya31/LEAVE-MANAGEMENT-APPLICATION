export function getChargeableLeaveDays(
  startDate,
  endDate,
  holidays,
  durationType = "FULL_DAY"
) {
  if (!startDate || !endDate) {
    return 0;
  }

  const holidaySet = new Set(
    holidays.map((holiday) =>
      holiday.holiday_date.slice(0, 10)
    )
  );

  if (
    durationType === "HALF_DAY_FIRST" ||
    durationType === "HALF_DAY_SECOND"
  ) {
    if (startDate !== endDate) {
      return 0;
    }

    const date = new Date(`${startDate}T00:00:00Z`);

    if (date.getUTCDay() === 0) {
      return 0;
    }

    if (holidaySet.has(startDate)) {
      return 0;
    }

    return 0.5;
  }

  let count = 0;

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  for (
    const date = new Date(start);
    date <= end;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const day = date.getUTCDay();
    const dateString = date.toISOString().slice(0, 10);

    if (day !== 0 && !holidaySet.has(dateString)) {
      count += 1;
    }
  }

  return count;
}