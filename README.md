<div align="center">

# 📬 OTP Email Service

**Drop-in OTP email verification with a secure magic link — built for any web or mobile app.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-FF5722)

</div>

---

## ✨ What you get

A small, self-contained service that does **one job extremely well**:

1. **Send** a beautifully styled email with a numeric / alphanumeric / alphabet OTP.
2. **Verify** the user — either by the typed code **or** by a single secure click on a **Verify my email** button in the email.
3. **Tell your app** when the user clicked the link, via a status endpoint your frontend can poll.

It's plain Node.js + Express on top of MongoDB, ships as a single Vercel serverless function, and works as a backend for any web app, mobile app, or website.

---

## 🚀 Why this fork is different

| Improvement | What it means for you |
| --- | --- |
| 🔁 **Env-driven expiry text** | The "expires in N minutes" line in the email is read from `OTP_VALIDITY_PERIOD_MINUTES`. Change one env var → email updates. **No more hardcoded `120 minutes`.** |
| 🔘 **Verify button in email** | Every OTP email now includes a polished **Verify my email** button alongside the code. |
| 🔐 **Secure magic-link flow** | Each link carries an unguessable 32-byte token. Clicking it lands the user on a built-in success page and marks the OTP request as verified server-side. |
| 📡 **Status polling endpoint** | `GET /api/otp/status/:requestId` lets your frontend know the moment the user clicks the email link — so you can auto-advance the UI. |
| ☁️ **First-class Vercel support** | Includes `api/index.ts` serverless entry, `vercel.json`, `vercel-build` script, and a sane `.vercelignore`. Deploy in 2 minutes. |
| 🧹 **Cleaned up codebase** | Smaller surface area, clearer module boundaries (`app.ts` vs `index.ts`), and friendlier docs. |

---

## 📦 Tech

- **Runtime:** Node.js 18+
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose ODM)
- **Email:** Nodemailer (Gmail SMTP out of the box, any SMTP with a tiny tweak)
- **Language:** TypeScript

---

## 🏁 Run it locally

```bash
git clone https://github.com/pooraddyy/otp-mailer.git
cd otp-mailer
npm install

cp .env.example .env
# Fill in MONGODB_URI, GMAIL_USER, GMAIL_PASS, etc.

npm run dev
# -> http://localhost:5001
```

Try it:

```bash
curl -X POST http://localhost:5001/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","organization":"My App"}'
```

You should receive an email with the **6-digit code** and a **Verify my email** button.

---

## ☁️ Deploy on Vercel

1. **Push this repo to GitHub.**
2. Go to <https://vercel.com/new> and import the repo.
   - Framework preset → **Other**
   - Build command → leave default (Vercel runs `vercel-build` → `tsc`)
   - Output directory → blank
3. Add environment variables (project settings → **Environment Variables**):

   | Name | Value |
   | --- | --- |
   | `MONGODB_URI` | Your MongoDB Atlas URI |
   | `GMAIL_USER` | Your Gmail address |
   | `GMAIL_PASS` | A Gmail [App Password](https://myaccount.google.com/apppasswords) |
   | `OTP_VALIDITY_PERIOD_MINUTES` | e.g. `10` |
   | `OTP_SIZE` | e.g. `6` |
   | `APP_BASE_URL` | *(optional)* `https://otp.yoursite.com`. If omitted, falls back to `https://$VERCEL_URL`. |
   | `BLOCK_KEYWORDS_RULES` | *(optional)* `tempmail,disposable` |
   | `ALLOWED_DOMAINS` | *(optional)* allow-list of email domains |

4. Hit **Deploy**.

> 🔓 **MongoDB Atlas tip:** allow `0.0.0.0/0` under Network Access (or use Atlas' Vercel integration), otherwise the function can't reach your cluster.

---

## ⚙️ Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | local only | Local dev port (Vercel ignores). |
| `APP_BASE_URL` | no | Public URL used to build the magic link. Falls back to `https://$VERCEL_URL`, then to the request host. |
| `MONGODB_URI` | ✅ | Mongo connection string. |
| `OTP_VALIDITY_PERIOD_MINUTES` | ✅ | Validity window for both code and link. **Drives the expiry line in the email.** |
| `OTP_SIZE` | ✅ | OTP length. |
| `GMAIL_USER` | ✅ | Sender Gmail address. |
| `GMAIL_PASS` | ✅ | Gmail App Password. |
| `BLOCK_KEYWORDS_RULES` | no | Comma-separated keywords that block requests as spam. |
| `ALLOWED_DOMAINS` | no | Comma-separated allow-list of email domains. Empty = allow all. |

---

## 📡 API reference

> Base URL: `http://localhost:5001` (local) or `https://<your-project>.vercel.app` (deployed)

### `POST /api/otp/generate`

Generates an OTP, emails it (code **and** magic link), and returns a `requestId` you'll use for polling.

**Body**

```json
{
  "email": "user@example.com",
  "type": "numeric",
  "organization": "My App",
  "subject": "Verify your email"
}
```

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `email` | string | — | Required |
| `type` | `numeric` / `alphanumeric` / `alphabet` | `numeric` | OTP character set |
| `organization` | string | `Python Today` | Header & "from" name |
| `subject` | string | `Verification Code` | Email subject |

**Response**

```json
{
  "message": "OTP is generated and sent to your email",
  "requestId": "8f0a2c…",
  "validityMinutes": 10
}
```

---

### `POST /api/otp/verify`

Verifies via the **typed code**. Single-use — the OTP is consumed on success.

```json
{ "email": "user@example.com", "otp": "123456" }
```

✅ `200 { "message": "OTP is verified" }`

---

### `GET /api/otp/verify-link?token=…`

The endpoint the **Verify my email** button points at. Renders an HTML page (success or expired/invalid) and marks the matching OTP as `verified: true`.

You normally don't call this yourself — the user's email client does.

---

### `GET /api/otp/status/:requestId`

Lets your app discover whether the user clicked the magic link.

```json
{
  "found": true,
  "verified": true,
  "expired": false,
  "email": "user@example.com"
}
```

| Field | Meaning |
| --- | --- |
| `found` | A request with this id exists |
| `verified` | The user clicked the magic link |
| `expired` | The validity window has elapsed |

Poll every couple of seconds while your verify modal is open.

---

## 🔌 Use it from any app

CORS is enabled, so you can hit it from a browser, mobile app, or another backend.

```js
// 1. Trigger the email
const r = await fetch("https://your-otp-service.vercel.app/api/otp/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: userEmail,
    organization: "My App",
    subject: "Verify your email",
  }),
});
const { requestId } = await r.json();

// 2a. (Option A) Ask the user to type the code
await fetch("https://your-otp-service.vercel.app/api/otp/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: userEmail, otp: typedCode }),
});

// 2b. (Option B) Poll until they click the magic link
const verified = await new Promise((resolve) => {
  const t = setInterval(async () => {
    const s = await fetch(
      `https://your-otp-service.vercel.app/api/otp/status/${requestId}`,
    ).then((r) => r.json());
    if (s.verified) { clearInterval(t); resolve(true); }
    if (s.expired)  { clearInterval(t); resolve(false); }
  }, 2000);
});
```

Both verification methods work in parallel — whichever the user does first wins.

---

## 🛡️ Spam protection

- Configurable **keyword block-list** (`BLOCK_KEYWORDS_RULES`) — instantly blocks requests containing matched terms.
- **IP + email block-list** stored in MongoDB with a 24-hour TTL.
- Per-email **regeneration cap** (max 3 attempts inside the validity window).
- In-memory **block cache** for fast denial of repeat offenders.

---

## 🗂️ Project layout

```
otp-mailer/
├── api/
│   └── index.ts          # Vercel serverless entrypoint
├── src/
│   ├── app.ts            # Express app factory
│   ├── index.ts          # Local dev server
│   ├── config/db.ts      # Mongoose connection (cached)
│   ├── controllers/
│   │   ├── otpController.ts
│   │   └── sendMailController.ts
│   ├── models/
│   │   ├── otpModel.ts
│   │   └── blockListModel.ts
│   ├── routes/otpRoutes.ts
│   ├── views/verifyPage.ts   # HTML for the magic-link landing page
│   └── utils/
│       ├── baseUrl.ts
│       ├── generateOTP.ts
│       ├── logger.ts
│       └── validator.ts
├── vercel.json
├── tsconfig.json
└── package.json
```

---

## 📝 License

[MIT](./LICENSE) © pooraddyy
