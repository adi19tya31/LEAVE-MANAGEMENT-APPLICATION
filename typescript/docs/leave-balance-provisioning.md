# Leave balance provisioning

## Confirmed allocation policy

The approved annual entitlement for each regular leave type is the live
`leave_types.max_days_per_year` value. Once User Management confirms that the
authenticated employee has Leave Management access, the existing `/api/auth/me`
flow provisions missing balances for that central employee ID and the current
calendar year. Employees with access are provisioned on their next application
load, including employees who were already authorized before this feature.

## Safety rules

- Employee identity is the central employee ID; no local employee lookup is
  used.
- Provisioning is triggered only from the authenticated `/api/auth/me` flow.
  It is never triggered by a balance GET or leave application submission.
- Only a missing `(employee_id, leave_type_id, year)` row may be inserted.
  Existing `allocated_days`, `used_days`, and historical records are not
  changed.
- New balances use the leave type's approved `max_days_per_year`, with
  `used_days = 0`. Comp-Off continues to use its separate balance flow.
- Provisioning failures are logged and do not fail the authenticated `/me`
  response. A later `/api/auth/me` request retries missing rows safely.
- Existing history for local IDs 3–10 is never updated or deleted. If a
  central ID 3–10 has a balance row in the current calendar year, automatic
  provisioning is paused for that employee because the row's ownership cannot
  be inferred without verified identity mapping.

## Existing employee initialization

This repository has no User Management access-granted callback or API that
lets an owner verify another employee's access. Existing authorized employees
are therefore initialized on their next authenticated `/api/auth/me` request;
the application does not accept an owner-supplied arbitrary employee ID.
