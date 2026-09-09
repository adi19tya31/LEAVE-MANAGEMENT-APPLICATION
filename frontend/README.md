# Leave Management Frontend

A production-style React/Vite scaffold extracted from the original single-file frontend. It keeps the existing UI and backend endpoint contract while separating responsibilities into API modules, auth context, reusable UI, layouts, and pages.

## Structure

```text
src/
├── api/
│   ├── client.js
│   ├── authApi.js
│   ├── leaveApi.js
│   ├── employeeApi.js
│   └── departmentApi.js
├── components/
│   ├── ProtectedRoute.jsx
│   └── ui.jsx
├── context/
│   └── AuthContext.jsx
├── layouts/
│   └── AppShell.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── ApplyLeavePage.jsx
│   ├── MyApplicationsPage.jsx
│   ├── ApprovalQueuePage.jsx
│   └── RegisterEmployeePage.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Backend contract preserved

The frontend calls the same routes used by the supplied backend:

- `POST /api/auth/login`
- `GET /api/leave-types`
- `GET /api/leave-balances/me`
- `POST /api/leave-applications`
- `GET /api/leave-applications/me`
- `GET /api/leave-applications/pending`
- `PATCH /api/leave-applications/:id/decision`
- `GET /api/leave-applications/:id/status`
- `POST /api/employees`
- Department endpoints are also isolated in `departmentApi.js` for future department-management pages.
- `GET /api/public-holidays` lists configured holidays.
- `POST /api/public-holidays` creates a holiday with `{ "date": "YYYY-MM-DD", "name": "..." }`.
- `DELETE /api/public-holidays/:id` removes a holiday.

Leave-day enforcement

The backend must calculate `total_days` and deduct balances using each date in the inclusive range where the day is not Sunday and the date is not in `public_holidays`. The frontend preview uses the same rule for immediate feedback, but the backend calculation is authoritative and must run when creating and approving applications.

## Run

1. Install Node.js LTS.
2. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.
3. Run `npm install`.
4. Run `npm run dev`.

The current default backend URL is `http://localhost:5000`.

## Department Management

Managers and owners can access **Departments** from the sidebar. The page uses the existing backend department endpoints for:

- listing departments
- creating departments
- renaming departments
- deactivating/reactivating departments
- owner-only manager assignment
- owner-only permanent deletion

The manager assignment field accepts an employee ID because the current backend exposes manager assignment as `PATCH /api/departments/:id/manager` with a numeric `managerId`.
