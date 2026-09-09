export function getChargeableLeaveDays(
  startDate,
  endDate,
  holidays,
  startDayType = "FULL_DAY",
  endDayType = "FULL_DAY"
) {

  if (!startDate || !endDate) {
    return 0;
  }


  const holidaySet = new Set(
    holidays.map((holiday) =>
      holiday.holiday_date.slice(0, 10)
    )
  );


  const start = new Date(
    `${startDate}T00:00:00Z`
  );

  const end = new Date(
    `${endDate}T00:00:00Z`
  );


  /*
    Invalid date range
  */

  if (end < start) {
    return 0;
  }


  /*
    SAME DATE
  */

  if (startDate === endDate) {

    const day = start.getUTCDay();


    /*
      Sunday
    */

    if (day === 0) {
      return 0;
    }


    /*
      Public holiday
    */

    if (holidaySet.has(startDate)) {
      return 0;
    }


    /*
      Full day
    */

    if (
      startDayType === "FULL_DAY" &&
      endDayType === "FULL_DAY"
    ) {
      return 1;
    }


    /*
      First half -> Second half
      means full day
    */

    if (
      startDayType === "FIRST_HALF" &&
      endDayType === "SECOND_HALF"
    ) {
      return 1;
    }


    /*
      Second half -> First half
      invalid
    */

    if (
      startDayType === "SECOND_HALF" &&
      endDayType === "FIRST_HALF"
    ) {
      return 0;
    }


    /*
      Any valid half day
    */

    return 0.5;
  }


  /*
    MULTIPLE DAYS
  */

  let totalDays = 0;


  const currentDate = new Date(start);


  while (currentDate <= end) {

    const day =
      currentDate.getUTCDay();


    const dateString =
      currentDate
        .toISOString()
        .slice(0, 10);


    /*
      Skip Sunday
      Skip holiday
    */

    if (
      day !== 0 &&
      !holidaySet.has(dateString)
    ) {

      /*
        START DATE
      */

      if (
        dateString === startDate
      ) {

        if (
          startDayType === "FULL_DAY"
        ) {
          totalDays += 1;
        } else {
          totalDays += 0.5;
        }

      }


      /*
        END DATE
      */

      else if (
        dateString === endDate
      ) {

        if (
          endDayType === "FULL_DAY"
        ) {
          totalDays += 1;
        } else {
          totalDays += 0.5;
        }

      }


      /*
        MIDDLE DAYS
      */

      else {

        totalDays += 1;

      }

    }


    currentDate.setUTCDate(
      currentDate.getUTCDate() + 1
    );

  }


  return totalDays;
}