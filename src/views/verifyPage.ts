interface RenderOptions {
  title: string;
  heading: string;
  message: string;
  status: 'success' | 'error';
}

function renderVerifyPage(opts: RenderOptions): string {
  const { title, heading, message, status } = opts;
  const isSuccess = status === 'success';

  const successIcon = `
    <svg class="check-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle class="check-ring" cx="50" cy="50" r="44" fill="none" stroke="url(#g1)" stroke-width="4"/>
      <path class="check-mark" d="M30 52 L45 67 L72 38" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#22c55e"/>
          <stop offset="100%" stop-color="#0ea5e9"/>
        </linearGradient>
      </defs>
    </svg>`;

  const errorIcon = `
    <svg class="cross-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle class="cross-ring" cx="50" cy="50" r="44" fill="none" stroke="url(#g2)" stroke-width="4"/>
      <line class="cross-line cross-line-1" x1="34" y1="34" x2="66" y2="66" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line class="cross-line cross-line-2" x1="66" y1="34" x2="34" y2="66" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#f97316"/>
        </linearGradient>
      </defs>
    </svg>`;

  const sparkles = isSuccess
    ? Array.from({ length: 14 })
        .map((_, i) => `<span class="sparkle s${i + 1}"></span>`)
        .join('')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    :root {
      --bg-1: ${isSuccess ? '#eef9f3' : '#fef2f2'};
      --bg-2: ${isSuccess ? '#e0f2fe' : '#fff7ed'};
      --bg-3: ${isSuccess ? '#f5f3ff' : '#fef3c7'};
      --accent: ${isSuccess ? '#10b981' : '#ef4444'};
      --accent-soft: ${isSuccess ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)'};
      --ink: #0f172a;
      --ink-soft: #475569;
    }
    html, body { height: 100%; }
    body {
      margin: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: var(--ink);
      background: var(--bg-1);
      background-image:
        radial-gradient(at 20% 15%, var(--bg-2) 0, transparent 55%),
        radial-gradient(at 80% 85%, var(--bg-3) 0, transparent 50%),
        radial-gradient(at 50% 50%, var(--bg-1) 0, transparent 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow: hidden;
      position: relative;
    }

    .bg-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.5;
      pointer-events: none;
      animation: float 12s ease-in-out infinite;
    }
    .bg-blob.b1 { width: 320px; height: 320px; background: var(--accent-soft); top: -80px; left: -80px; }
    .bg-blob.b2 { width: 280px; height: 280px; background: var(--accent-soft); bottom: -100px; right: -60px; animation-delay: -6s; }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50%      { transform: translate(20px, -20px) scale(1.05); }
    }

    .card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 460px;
      background: rgba(255,255,255,0.85);
      backdrop-filter: saturate(160%) blur(14px);
      -webkit-backdrop-filter: saturate(160%) blur(14px);
      border: 1px solid rgba(255,255,255,0.7);
      border-radius: 24px;
      padding: 44px 36px 36px;
      text-align: center;
      box-shadow:
        0 1px 0 rgba(255,255,255,0.9) inset,
        0 30px 60px -20px rgba(15, 23, 42, 0.18),
        0 10px 20px -10px rgba(15, 23, 42, 0.12);
      opacity: 0;
      transform: translateY(14px) scale(0.98);
      animation: cardIn 0.7s cubic-bezier(.2,.9,.25,1) 0.05s forwards;
    }
    @keyframes cardIn {
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .icon-wrap {
      position: relative;
      width: 112px;
      height: 112px;
      margin: 0 auto 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-wrap::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--accent);
      opacity: 0.12;
      transform: scale(0.6);
      animation: pulseRing 2.4s ease-out infinite;
    }
    .icon-wrap::after {
      content: "";
      position: absolute;
      inset: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), ${isSuccess ? '#0ea5e9' : '#f97316'});
      opacity: 0.9;
      transform: scale(0.4);
      animation: badgePop 0.55s cubic-bezier(.2,1.4,.3,1) 0.15s forwards;
    }
    @keyframes pulseRing {
      0%   { transform: scale(0.7); opacity: 0.35; }
      80%  { transform: scale(1.25); opacity: 0; }
      100% { transform: scale(1.25); opacity: 0; }
    }
    @keyframes badgePop {
      to { transform: scale(1); }
    }

    .check-svg, .cross-svg {
      position: relative;
      z-index: 2;
      width: 64px;
      height: 64px;
    }

    .check-ring {
      stroke-dasharray: 277;
      stroke-dashoffset: 277;
      transform-origin: 50% 50%;
      animation: drawRing 0.8s ease-out 0.2s forwards;
    }
    .check-mark {
      stroke-dasharray: 80;
      stroke-dashoffset: 80;
      animation: drawCheck 0.5s ease-out 0.7s forwards;
    }
    .cross-ring {
      stroke-dasharray: 277;
      stroke-dashoffset: 277;
      animation: drawRing 0.8s ease-out 0.2s forwards;
    }
    .cross-line { stroke-dasharray: 50; stroke-dashoffset: 50; }
    .cross-line-1 { animation: drawLine 0.32s ease-out 0.65s forwards; }
    .cross-line-2 { animation: drawLine 0.32s ease-out 0.95s forwards; }

    @keyframes drawRing { to { stroke-dashoffset: 0; } }
    @keyframes drawCheck { to { stroke-dashoffset: 0; } }
    @keyframes drawLine { to { stroke-dashoffset: 0; } }

    h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 10px;
      opacity: 0;
      transform: translateY(8px);
      animation: fadeUp 0.5s ease-out 0.55s forwards;
    }
    p.lead {
      font-size: 15px;
      line-height: 1.6;
      color: var(--ink-soft);
      margin: 0 auto 24px;
      max-width: 340px;
      opacity: 0;
      transform: translateY(8px);
      animation: fadeUp 0.5s ease-out 0.7s forwards;
    }
    @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

    .divider {
      height: 1px;
      width: 100%;
      background: linear-gradient(to right, transparent, rgba(15,23,42,0.08), transparent);
      margin: 18px 0 18px;
    }

    .hint {
      font-size: 12.5px;
      color: var(--ink-soft);
      opacity: 0;
      animation: fadeUp 0.5s ease-out 0.9s forwards;
    }
    .hint .dot {
      display: inline-block;
      width: 6px; height: 6px;
      background: var(--accent);
      border-radius: 999px;
      margin-right: 6px;
      vertical-align: middle;
      animation: blink 1.6s ease-in-out infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 0.35; transform: scale(0.8); }
      50%      { opacity: 1;    transform: scale(1.1); }
    }

    .brand {
      margin-top: 22px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #94a3b8;
      opacity: 0;
      animation: fadeUp 0.5s ease-out 1s forwards;
    }

    .sparkle {
      position: absolute;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--accent);
      opacity: 0;
      pointer-events: none;
    }
    ${
      isSuccess
        ? `
    .sparkle { animation: sparkleBurst 1.1s ease-out 0.45s forwards; }
    .s1  { top: 18%; left: 22%; --tx: -60px; --ty: -40px; background: #22c55e; }
    .s2  { top: 16%; left: 78%; --tx:  60px; --ty: -50px; background: #0ea5e9; }
    .s3  { top: 70%; left: 18%; --tx: -70px; --ty:  50px; background: #a855f7; }
    .s4  { top: 72%; left: 80%; --tx:  70px; --ty:  60px; background: #f59e0b; }
    .s5  { top: 30%; left: 50%; --tx:   0px; --ty: -80px; background: #10b981; width: 6px; height: 6px; }
    .s6  { top: 50%; left: 12%; --tx: -90px; --ty:   0px; background: #06b6d4; width: 6px; height: 6px; }
    .s7  { top: 50%; left: 88%; --tx:  90px; --ty:   0px; background: #ec4899; width: 6px; height: 6px; }
    .s8  { top: 84%; left: 50%; --tx:   0px; --ty:  80px; background: #6366f1; width: 6px; height: 6px; }
    .s9  { top: 24%; left: 36%; --tx: -45px; --ty: -55px; background: #14b8a6; width: 5px; height: 5px; }
    .s10 { top: 24%; left: 64%; --tx:  45px; --ty: -55px; background: #84cc16; width: 5px; height: 5px; }
    .s11 { top: 76%; left: 36%; --tx: -45px; --ty:  55px; background: #0ea5e9; width: 5px; height: 5px; }
    .s12 { top: 76%; left: 64%; --tx:  45px; --ty:  55px; background: #f43f5e; width: 5px; height: 5px; }
    .s13 { top: 8%;  left: 50%; --tx:   0px; --ty: -60px; background: #22c55e; width: 5px; height: 5px; }
    .s14 { top: 92%; left: 50%; --tx:   0px; --ty:  60px; background: #06b6d4; width: 5px; height: 5px; }
    @keyframes sparkleBurst {
      0%   { transform: translate(0, 0) scale(0); opacity: 0; }
      30%  { opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
    }
    `
        : `
    .card { animation: cardIn 0.7s cubic-bezier(.2,.9,.25,1) 0.05s forwards, shake 0.5s ease-in-out 0.85s; }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
    `
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .card { opacity: 1; transform: none; }
      h1, p.lead, .hint, .brand { opacity: 1; transform: none; }
      .check-ring, .check-mark, .cross-ring, .cross-line { stroke-dashoffset: 0; }
      .icon-wrap::after { transform: scale(1); }
    }

    @media (max-width: 480px) {
      .card { padding: 36px 24px 28px; border-radius: 20px; }
      h1 { font-size: 22px; }
      .icon-wrap { width: 96px; height: 96px; }
      .check-svg, .cross-svg { width: 56px; height: 56px; }
    }
  </style>
</head>
<body>
  <div class="bg-blob b1"></div>
  <div class="bg-blob b2"></div>

  <main class="card" role="status" aria-live="polite">
    <div class="icon-wrap">
      ${isSuccess ? successIcon : errorIcon}
      ${sparkles}
    </div>
    <h1>${escapeHtml(heading)}</h1>
    <p class="lead">${escapeHtml(message)}</p>
    <div class="divider"></div>
    <p class="hint"><span class="dot"></span>${
      isSuccess
        ? 'You can safely close this tab and return to the app.'
        : 'Please request a new verification email and try again.'
    }</p>
    <div class="brand">Secured by OTP Email Service</div>
  </main>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderVerifySuccess(_email: string): string {
  return renderVerifyPage({
    title: 'Email verified',
    heading: 'Email verified successfully',
    message:
      'Thanks for confirming your email address. Your verification is complete and the app has been notified.',
    status: 'success',
  });
}

export function renderVerifyError(message: string): string {
  return renderVerifyPage({
    title: 'Verification failed',
    heading: 'Verification failed',
    message,
    status: 'error',
  });
}
