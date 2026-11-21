# Leave Management Frontend

React/Vite frontend for Leave Management. Authentication uses the existing Keycloak SSO flow; the backend resolves the employee identity, application roles, and reporting manager through User Management.

## Structure

```text
src/
├── api/
│   ├── client.js
│   ├── leaveApi.js
│   └── notificationApi.js
├── components/
│   ├── ProtectedRoute.jsx
│   └── ui.jsx
├── context/
│   └── AuthContext.jsx
├── layouts/
│   └── AppShell.jsx
├── pages/
│   ├── ApplyLeavePage.jsx
│   ├── MyApplicationsPage.jsx
│   └── ApprovalQueuePage.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Backend contract preserved

The frontend uses the central authenticated session and Leave Management business routes:

- `GET /api/auth/me`
- `GET /api/leave-types`
- `GET /api/leave-balances/me`
- `POST /api/leave-applications`
- `GET /api/leave-applications/me`
- `GET /api/leave-applications/pending`
- `PATCH /api/leave-applications/:id/decision`
- `GET /api/leave-applications/:id/status`
- Comp-Off, notification, and manager/owner business routes.
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

Employee, role, department, registration, and password management belong to User Management and Keycloak, not this frontend.
