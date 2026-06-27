# SkillSphere — Auth Flow Test Checklist

> Run this checklist after first-time setup. Make sure both backend (`port 5000`)
> and frontend (`port 5173`) are running before starting.

---

## 0. Pre-flight Setup

```bash
# Terminal 1 — Backend
cd server
node server.js
# Should print: "Server running in development mode on port 5000"

# Terminal 2 — Seed admin (first time only)
cd server
npm run seed:admin
# Should print: "Admin created successfully!"

# Terminal 3 — Frontend
cd client
npm run dev
# Should print: "Local: http://localhost:5173"
```

---

## 1. Normal Registration + Login (Client)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Go to `http://localhost:5173/register` | Registration page loads |
| 2 | Click **Client** role card | Card highlights with indigo border |
| 3 | Fill: Name=`Test Client`, Email=`testclient@test.com`, Password=`Test@123` | Form fills |
| 4 | Click **Register Account** | "Account Created!" screen with countdown |
| 5 | Wait ~4 seconds | Auto-redirects to `/login` |
| 6 | Check backend terminal for verification URL | URL printed in console |
| 7 | Visit the `/verify-email/:token` URL from console | Returns `"Email verified successfully"` |
| 8 | Login at `/login` with `testclient@test.com` / `Test@123` | Redirects to `/client/dashboard` |
| 9 | Check Redux DevTools → `auth` slice | Should have `user` object + `token` |

---

## 2. Admin Login (after running seed)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Run `cd server && npm run seed:admin` | Prints "Admin created successfully!" |
| 2 | Go to `http://localhost:5173/login` | Login page with indigo info box |
| 3 | Click the indigo **Demo Admin Login** info box | Auto-fills email + password fields |
| 4 | Click **Log In** | Redirects to `/admin/dashboard` |
| 5 | Check sidebar | Shows admin menu items (Users, Gigs, etc.) |
| 6 | Manually type: Email=`admin@skillsphere.com`, Password=`Admin@123` | Works the same way |

---

## 3. Google OAuth Test (requires Google Client ID in .env)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Ensure `.env` has `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` set | Both env files updated |
| 2 | Restart backend + frontend after adding env vars | Env vars loaded |
| 3 | Go to `http://localhost:5173/login` | Google button appears |
| 4 | Click **Continue with Google** | Real Google popup/redirect opens |
| 5 | Select your Google account | — |
| 6 | Redirects to dashboard based on role | `/client/dashboard` for new users |
| 7 | Check MongoDB → user with `isGoogleAuth: true` | User created |

**Google Client ID:** `211331421235-vrqjt1dlbutsg3ku3j1928pv7r25m04t.apps.googleusercontent.com`

> If Google OAuth popup doesn't open, verify that `http://localhost:5173` is added
> to "Authorised JavaScript origins" in Google Cloud Console.

---

## 4. Protected Routes Test

| # | Action | Expected Redirect |
|---|--------|-------------------|
| 1 | Logout → clear localStorage → visit `/client/dashboard` | → `/login` |
| 2 | Logout → visit `/admin/dashboard` | → `/login` |
| 3 | Login as **client** → visit `/admin/dashboard` | → `/client/dashboard` |
| 4 | Login as **freelancer** → visit `/admin/dashboard` | → `/freelancer/dashboard` |
| 5 | Login as **admin** → visit `/client/dashboard` | → `/admin/dashboard` |
| 6 | Login as **admin** → visit `/freelancer/dashboard` | → `/admin/dashboard` |

---

## 5. Already Logged-In Redirect Test

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Login as admin | In `/admin/dashboard` |
| 2 | Navigate to `http://localhost:5173/login` | Immediately redirects to `/admin/dashboard` |
| 3 | Navigate to `http://localhost:5173/register` | Immediately redirects to `/admin/dashboard` |

---

## 6. Logout Test

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Logout from any dashboard | Redirects to `/login` |
| 2 | Check `localStorage` in DevTools | `token` and `user` keys removed |
| 3 | Click browser Back button | Stays on `/login` (replace: true prevents going back) |
| 4 | Try typing `/client/dashboard` in URL | Redirects to `/login` (unauthenticated) |

---

## 7. Password Requirements

Passwords must be **at least 6 characters**. Recommended format: `Test@123`

---

## Summary of Credentials

| Role | Email | Password | Created By |
|------|-------|----------|------------|
| Admin | admin@skillsphere.com | Admin@123 | `npm run seed:admin` |
| Client | testclient@test.com | Test@123 | Manual registration |
| Freelancer | (your email) | (your password) | Manual registration |
| Google User | (Google account email) | N/A | Google OAuth |
