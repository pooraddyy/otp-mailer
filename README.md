<div align="center">

# 📬 OTP Mailer

**Two ways to verify an email — send a code, or send a one-click magic-link button. Pick one.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-FF5722)

</div>

---

## ✨ What is this?

A tiny, self-contained backend that does **email verification** for any web or mobile app. You hit one endpoint, the user gets a beautifully-formatted email, you tell us they're verified, done.

It supports **two completely separate flows** so you can pick whichever fits your UX:

| Flow | What's in the email | How user verifies | When to use |
| --- | --- | --- | --- |
| 🔢 **Code mode** | A 6-digit OTP code (only) | Types the code into your form | Classic OTP UX, mobile apps, signup forms |
| 🔘 **Link mode** | A "Verify my email" button (only) | Clicks the button → lands on a beautiful confirmation page | One-tap verification, magic-link flows, slick onboarding |

The two flows are independent. The code-only email **never** contains the verify button, and the link-only email **never** contains the OTP code.

---

## 🚀 Why this fork is different

| Improvement | What it means for you |
| --- | --- |
| ✂️ **Two distinct flows, two distinct endpoints** | `POST /api/otp/generate` sends only the code. `POST /api/otp/send-link` sends only the button. No mixing, no leaking. |
| 🔁 **Env-driven expiry text** | The "expires in N minutes" line in every email is read from `OTP_VALIDITY_PERIOD_MINUTES`. Change one env var → email updates. **No more hardcoded `120 minutes`.** |
| 🔐 **Secure magic-link token** | Each link carries a random 32-byte token. Single-use. Marked verified server-side on click. |
| 📡 **Status polling endpoint** | `GET /api/otp/status/:requestId` lets your frontend know the moment the user clicks the email link — so you can auto-advance the UI without a refresh. |
| 🎨 **Animated success page** | When the user clicks the magic link they land on a polished page with an animated checkmark, soft gradient backdrop, and confetti sparkles. Mobile-ready. |
| ☁️ **First-class Vercel support** | Includes `api/index.ts` serverless entry, `vercel.json`, `vercel-build` script, and a sane `.vercelignore`. Deploy in 2 minutes. |
| 🧹 **Cleaned codebase** | Smaller surface area, clear module boundaries (`app.ts` vs `index.ts`), fully type-checked, zero comments noise. |

---

## 📦 Tech

- **Runtime:** Node.js 18+
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose ODM)
- **Email:** Nodemailer (Gmail SMTP out of the box, swap to any SMTP with a tiny tweak)
- **Language:** TypeScript

---

## 🏁 Run it locally

```bash
git clone https://github.com/pooraddyy/otp-mailer.git
cd otp-mailer
npm install

cp sample.env .env
# Fill in MONGODB_URI, GMAIL_USER, GMAIL_PASS, OTP_VALIDITY_PERIOD_MINUTES, OTP_SIZE

npm run dev
# -> http://localhost:5001
```

Quick smoke test:

```bash
# Code-only email
curl -X POST http://localhost:5001/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","organization":"My App"}'

# Link-only email
curl -X POST http://localhost:5001/api/otp/send-link \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","organization":"My App"}'
```

---

## ☁️ Deploy on Vercel

1. **Push this repo to GitHub.**
2. Go to <https://vercel.com/new> and import the repo.
   - Framework preset → **Other**
   - Build command → leave default (Vercel runs `vercel-build` → `tsc`)
   - Output directory → blank
3. Add environment variables (project settings → **Environment Variables**) — see the table below.
4. Hit **Deploy**.

> 🔓 **MongoDB Atlas tip:** allow `0.0.0.0/0` under Network Access (or use Atlas' Vercel integration), otherwise the function can't reach your cluster.

---

## ⚙️ Environment variables

A copy of these lives in `sample.env` at the repo root.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | local only | Local dev port (Vercel ignores). Default `5001`. |
| `APP_BASE_URL` | no | Public URL used to build the magic link. Falls back to `https://$VERCEL_URL`, then to the request host. |
| `MONGODB_URI` | ✅ | Mongo connection string. |
| `OTP_VALIDITY_PERIOD_MINUTES` | ✅ | Validity window for both code and link. **Drives the expiry line in every email.** |
| `OTP_SIZE` | ✅ | OTP length. Recommended: `6`. |
| `GMAIL_USER` | ✅ | Sender Gmail address. |
| `GMAIL_PASS` | ✅ | Gmail [App Password](https://myaccount.google.com/apppasswords) — **not** your normal Gmail password. |
| `BLOCK_KEYWORDS_RULES` | no | Comma-separated keywords that block requests as spam (e.g. `tempmail,disposable`). |
| `ALLOWED_DOMAINS` | no | Comma-separated allow-list of email domains. Empty = allow all. |

---

## 📡 Full API reference

> Base URL: `http://localhost:5001` (local) or `https://<your-project>.vercel.app` (deployed)

### `POST /api/otp/generate` — send the **code-only** email

The email contains only the OTP code. No button, no link.

**Request body**

```json
{
  "email": "user@example.com",
  "type": "numeric",
  "organization": "My App",
  "subject": "Your verification code"
}
```

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `email` | string | — | Required. Recipient address. |
| `type` | `numeric` / `alphanumeric` / `alphabet` | `numeric` | OTP character set. |
| `organization` | string | `Verification` | Used as the brand tag at the top of the email and the "from" name. |
| `subject` | string | `Your verification code` | Email subject line. |

**Response** — `200 OK`

```json
{
  "message": "Verification code sent to your email",
  "mode": "code",
  "requestId": "8f0a2c…",
  "validityMinutes": 10
}
```

> The user now opens their inbox and types the code into your form. Verify it with **`POST /api/otp/verify`** below.

---

### `POST /api/otp/send-link` — send the **link-only** email

The email contains only a "Verify my email" button. No code shown anywhere.

**Request body**

```json
{
  "email": "user@example.com",
  "organization": "My App",
  "subject": "Verify your email"
}
```

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `email` | string | — | Required. |
| `organization` | string | `Verification` | Brand tag + "from" name. |
| `subject` | string | `Verify your email` | Email subject. |

**Response** — `200 OK`

```json
{
  "message": "Verification link sent to your email",
  "mode": "link",
  "requestId": "8f0a2c…",
  "validityMinutes": 10
}
```

> Save the `requestId`. Use it with **`GET /api/otp/status/:requestId`** to detect the moment the user clicks the button.

---

### `POST /api/otp/verify` — verify the typed code

Used together with `POST /api/otp/generate`.

```json
{ "email": "user@example.com", "otp": "123456" }
```

✅ `200`

```json
{ "message": "Email verified successfully", "verified": true }
```

❌ `400 { "error": "Invalid OTP" }` if wrong/expired. The OTP is single-use — consumed on success.

---

### `GET /api/otp/verify-link?token=…` — magic-link landing page

The endpoint the **Verify my email** button in the link-only email points at.

- Renders an animated success page on success.
- Renders an animated error page (with the reason) on failure.
- Marks the matching request as `verified: true` so your app can pick it up via the status endpoint.

You normally don't call this yourself — the user's email client does.

---

### `GET /api/otp/status/:requestId` — poll for link-mode verification

Used together with `POST /api/otp/send-link`. Lets your frontend discover whether the user clicked the magic link.

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
| `verified` | The user has clicked the magic link |
| `expired` | The validity window has elapsed |

Poll every 2 seconds while your "check your email" screen is open.

---

## 🔌 Use it from your app

CORS is enabled, so call it directly from a browser, mobile app, or another backend.

### Example A — code-only flow (classic OTP)

```js
// 1. Send the code
const res = await fetch("https://your-otp-mailer.vercel.app/api/otp/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: userEmail, organization: "My App" }),
});
// response: { message, mode: "code", requestId, validityMinutes }

// 2. User types the code into your form, you verify it:
const v = await fetch("https://your-otp-mailer.vercel.app/api/otp/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: userEmail, otp: typedCode }),
});
if (v.ok) {
  // user is verified — proceed
}
```

### Example B — link-only flow (one-click magic link)

```js
// 1. Send the verify-button email
const res = await fetch("https://your-otp-mailer.vercel.app/api/otp/send-link", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: userEmail, organization: "My App" }),
});
const { requestId } = await res.json();

// 2. Show "Check your inbox" UI, then poll:
const verified = await new Promise((resolve) => {
  const t = setInterval(async () => {
    const s = await fetch(
      `https://your-otp-mailer.vercel.app/api/otp/status/${requestId}`
    ).then((r) => r.json());
    if (s.verified) { clearInterval(t); resolve(true); }
    if (s.expired)  { clearInterval(t); resolve(false); }
  }, 2000);
});
```

You can offer both flows in your UI ("Get a code" vs "Send me a verify link") — they live on different endpoints, so they never interfere with each other.

---

## 🛡️ Spam protection

- Configurable **keyword block-list** (`BLOCK_KEYWORDS_RULES`) — instantly blocks requests containing matched terms.
- **IP + email block-list** stored in MongoDB with a 24-hour TTL.
- Per-email **regeneration cap** (max 3 attempts inside the validity window).
- In-memory **block cache** for fast denial of repeat offenders.
- Optional **domain allow-list** (`ALLOWED_DOMAINS`).

---

## 🗂️ Project layout

```
otp-mailer/
├── api/
│   └── index.ts              # Vercel serverless entrypoint
├── src/
│   ├── app.ts                # Express app factory
│   ├── index.ts              # Local dev server
│   ├── config/db.ts          # Mongoose connection (cached for serverless)
│   ├── controllers/
│   │   ├── otpController.ts          # Generate, verify, status
│   │   └── sendMailController.ts     # Two HTML templates (code-only / link-only)
│   ├── models/
│   │   ├── otpModel.ts
│   │   └── blockListModel.ts
│   ├── routes/otpRoutes.ts            # All five endpoints
│   ├── views/verifyPage.ts            # Animated success/error landing page
│   └── utils/
│       ├── baseUrl.ts
│       ├── generateOTP.ts
│       ├── logger.ts
│       └── validator.ts
├── sample.env                # Copy to .env and fill in
├── vercel.json
├── tsconfig.json
└── package.json
```

---

## ❓ FAQ

**Can I show both the code and the button in one email?**
Not from the built-in routes (and that's intentional — mixed emails confuse users). If you really need it, copy `sendMailController.ts`'s two templates into one and call `sendMail` with both `otp` and `verifyUrl`.

**Can I use a non-Gmail SMTP?**
Yes. In `src/controllers/sendMailController.ts`, replace the `nodemailer.createTransport({ service: 'gmail', … })` with a standard SMTP config (`host`, `port`, `secure`, `auth`).

**Does the OTP code expire after one wrong attempt?**
No — only on a successful verification, or when the validity window passes. Wrong attempts are counted; after 3, generation is blocked for a while.

**What happens if the user clicks the magic link twice?**
The first click marks the request verified. The second click still loads the success page (the token is still valid until expiry), but the request is already verified — your status endpoint just keeps returning `verified: true`.

---

## 📝 License

[MIT](./LICENSE) © pooraddyy
