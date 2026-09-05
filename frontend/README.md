# SA EHRS Frontend Prototype

This frontend is a prototype demonstration for the Unified Electronic Health Record (EHR) project.

## Included demo flows

### Patient portal
- Dashboard
- Patient profile
- Medical history
- Laboratory results
- Appointments
- Prescriptions
- Medical scans
- Privacy & Access
- Approve/reject external-system access requests
- Revoke approved access

### External healthcare system
- Integration dashboard
- Search/request patient access using national ID
- Request independent read/write permissions
- View authorised records only after patient approval

## Prototype behaviour

The access-request flow is simulated with browser `localStorage` so that it can be demonstrated without the backend being connected.

A useful demo sequence is:

1. Sign in as **External System**.
2. Go to **Patient Access**.
3. Submit a read/write access request.
4. Sign out.
5. Sign in as **Patient**.
6. Open **Privacy & Access**.
7. Approve the request.
8. Sign out.
9. Sign in as **External System** again.
10. Open **Authorised Records** to demonstrate that access is now available.
11. Return to the Patient portal and revoke access to demonstrate the permission lifecycle.

## Run

From the frontend directory:

```bash
npm install
npm run dev
```

The project uses React + TypeScript + Vite and the existing `react-icons` dependency.

The existing SA EHRS logo and navy/blue healthcare colour scheme have been retained.
