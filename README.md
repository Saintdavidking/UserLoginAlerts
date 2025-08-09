# User Login Alerts (Strapi + Gmail SMTP + Twilio) with Next.js UI

This example sends an **email** (via Gmail SMTP through Strapi's email plugin) and an **SMS** (via Twilio) every time a user logs in through Strapi’s `/api/auth/local` endpoint. A minimal Next.js app is included to demonstrate login.

## What happens on login
- The Strapi auth controller is **extended** to hook into a successful login.
- On success, it gathers:
  - **User email** (from the logged-in user)
  - **Client IP address**
  - **Geolocation** (via `geoip-lite`, offline lookup)
- It then **emails** those details to a configured Gmail address and **texts** them via Twilio.

## Contents
```
UserLoginAlerts/
├─ strapi/        # Strapi server (SQLite for local dev)
│  ├─ config/
│  ├─ src/extensions/users-permissions/
│  ├─ .env.example
├─ next-app/      # Minimal Next.js login form that calls Strapi
│  ├─ pages/
│  ├─ .env.example
└─ README.md
```

---

## 1) Setup: Strapi

### Install
```bash
cd strapi
npm install
```

### Configure environment
Copy `.env.example` to `.env` and fill the values:
```bash
cp .env.example .env
```

**Required env vars:**
- `APP_KEYS`: 4 comma-separated random strings (Strapi requirement)
- `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`: random strings
- `ALERT_RECIPIENT_EMAIL`: Gmail address that should receive the alert emails
- `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASS`: Your Gmail address and an **App Password** (required for Gmail SMTP)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`: Twilio credentials and a verified sender number

> **Gmail note:** You must use a **Google App Password** (not your regular password) if your account has 2FA enabled. Create one under Google Account → Security → App Passwords.

### Run Strapi
```bash
npm run develop
```
This starts Strapi on `http://localhost:1337` by default.

---

## 2) Setup: Next.js demo app
This is just a small login form that posts to Strapi’s `/api/auth/local` endpoint.

### Install & run
```bash
cd ../next-app
npm install
cp .env.example .env.local
npm run dev
```
Open `http://localhost:3000` and log in with a Strapi user.

---

## 3) Creating a test user
Once Strapi is running, open the Admin panel at `http://localhost:1337/admin`, create an admin, then add a user under the **Users & Permissions** plugin (or register via the public `/api/auth/local/register` endpoint if you enable it).

---

## 4) Production notes
- Put Strapi behind a reverse proxy (e.g., Nginx) that forwards the correct `X-Forwarded-For` header so the server can detect the client IP.
- Make sure environment variables are set on your server.
- For Gmail SMTP from a server, ensure your outbound connections on port 465/587 are allowed by your provider.
- Twilio SMS may require verified numbers depending on your account and destination country rules.

---

## 5) Security
Keep your `.env` files private. Do not commit them to version control. Rotate credentials if leaked.

---

## 6) How it works (files to check)
- `strapi/src/extensions/users-permissions/strapi-server.js` → wraps the login controller; after success, it sends the email + SMS.
- `strapi/config/plugins.js` → configures Strapi Email (Nodemailer provider) to use Gmail SMTP.
- `next-app/pages/index.tsx` → a minimal login page calling Strapi.

