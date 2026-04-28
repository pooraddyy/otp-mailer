interface RenderOptions {
  title: string;
  eyebrow: string;
  heading: string;
  message: string;
  status: 'success' | 'error';
}

function renderVerifyPage(opts: RenderOptions): string {
  const { title, eyebrow, heading, message, status } = opts;
  const isSuccess = status === 'success';

  const successIcon = `
    <svg class="check-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle class="check-ring" cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="3.5"/>
      <path class="check-mark" d="M30 52 L45 67 L72 38" fill="none" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const errorIcon = `
    <svg class="cross-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle class="cross-ring" cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="3.5"/>
      <line class="cross-line cross-line-1" x1="34" y1="34" x2="66" y2="66" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/>
      <line class="cross-line cross-line-2" x1="66" y1="34" x2="34" y2="66" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/>
    </svg>`;

  const sparkles = isSuccess
    ? Array.from({ length: 8 })
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
      --grad-start: ${isSuccess ? '#0f766e' : '#9f1239'};
      --grad-end:   ${isSuccess ? '#0ea5e9' : '#f97316'};
      --bg:         #f6f7f9;
      --card:       #ffffff;
      --ink:        #0b1220;
      --ink-soft:   #5b6577;
      --line:       #eaecef;
    }
    html, body { height: 100%; }
    body {
      margin: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: var(--ink);
      background: var(--bg);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 20px;
      overflow: hidden;
      position: relative;
      letter-spacing: -0.005em;
    }

    .ambient {
      position: absolute;
      inset: -10% -10% auto -10%;
      height: 55%;
      background: radial-gradient(ellipse at top, rgba(15,118,110,0.10), transparent 60%);
      pointer-events: none;
    }
    body.is-error .ambient {
      background: radial-gradient(ellipse at top, rgba(159,18,57,0.10), transparent 60%);
    }

    .card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 460px;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 56px 40px 36px;
      text-align: center;
      box-shadow:
        0 1px 0 rgba(255,255,255,0.6) inset,
        0 30px 80px -30px rgba(11, 18, 32, 0.18),
        0 8px 24px -10px rgba(11, 18, 32, 0.08);
      opacity: 0;
      transform: translateY(10px);
      animation: cardIn 0.6s cubic-bezier(.2,.9,.25,1) 0.05s forwards;
    }
    @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }

    .badge-wrap {
      position: relative;
      width: 96px;
      height: 96px;
      margin: 0 auto 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .badge-wrap::before {
      content: "";
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      background: ${isSuccess ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'};
      transform: scale(0.6);
      animation: pulseRing 2.6s ease-out infinite;
    }
    .badge {
      position: relative;
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--grad-start), var(--grad-end));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 18px 36px -16px ${isSuccess ? 'rgba(15,118,110,0.55)' : 'rgba(159,18,57,0.55)'},
        inset 0 1px 0 rgba(255,255,255,0.4);
      transform: scale(0.6);
      animation: badgePop 0.6s cubic-bezier(.2,1.4,.3,1) 0.18s forwards;
    }
    @keyframes pulseRing {
      0%   { transform: scale(0.7); opacity: 0.6; }
      80%  { transform: scale(1.15); opacity: 0; }
      100% { transform: scale(1.15); opacity: 0; }
    }
    @keyframes badgePop { to { transform: scale(1); } }

    .check-svg, .cross-svg { width: 56px; height: 56px; display: block; }
    .check-ring { stroke-dasharray: 277; stroke-dashoffset: 277; animation: drawRing 0.7s ease-out 0.25s forwards; }
    .check-mark { stroke-dasharray: 80; stroke-dashoffset: 80; animation: drawCheck 0.45s ease-out 0.7s forwards; }
    .cross-ring { stroke-dasharray: 277; stroke-dashoffset: 277; animation: drawRing 0.7s ease-out 0.25s forwards; }
    .cross-line { stroke-dasharray: 50; stroke-dashoffset: 50; }
    .cross-line-1 { animation: drawLine 0.3s ease-out 0.65s forwards; }
    .cross-line-2 { animation: drawLine 0.3s ease-out 0.9s forwards; }
    @keyframes drawRing  { to { stroke-dashoffset: 0; } }
    @keyframes drawCheck { to { stroke-dashoffset: 0; } }
    @keyframes drawLine  { to { stroke-dashoffset: 0; } }

    .eyebrow {
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: ${isSuccess ? '#0f766e' : '#b91c1c'};
      margin: 0 0 10px;
      opacity: 0;
      animation: fadeUp 0.5s ease-out 0.55s forwards;
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.25;
      margin: 0 0 12px;
      color: var(--ink);
      opacity: 0; transform: translateY(6px);
      animation: fadeUp 0.5s ease-out 0.65s forwards;
    }
    p.lead {
      font-size: 15px;
      line-height: 1.65;
      color: var(--ink-soft);
      margin: 0 auto;
      max-width: 360px;
      opacity: 0; transform: translateY(6px);
      animation: fadeUp 0.5s ease-out 0.78s forwards;
    }
    @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

    .divider {
      height: 1px;
      width: 100%;
      background: var(--line);
      margin: 32px 0 18px;
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 12px;
      color: #8a93a3;
      opacity: 0;
      animation: fadeUp 0.5s ease-out 0.95s forwards;
    }
    .footer .dot {
      display: inline-block;
      width: 6px; height: 6px;
      border-radius: 999px;
      background: ${isSuccess ? '#10b981' : '#ef4444'};
      box-shadow: 0 0 0 4px ${isSuccess ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'};
      animation: blink 2s ease-in-out infinite;
    }
    @keyframes blink {
      0%,100% { opacity: 0.55; }
      50%     { opacity: 1; }
    }

    .brand {
      margin-top: 18px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #b3b9c4;
      opacity: 0;
      animation: fadeUp 0.5s ease-out 1.05s forwards;
    }

    .sparkle {
      position: absolute;
      width: 6px; height: 6px;
      border-radius: 50%;
      opacity: 0;
      pointer-events: none;
      filter: blur(0.2px);
    }
    ${
      isSuccess
        ? `
    .sparkle { animation: sparkleBurst 1.2s ease-out 0.55s forwards; }
    .s1 { top: 14%; left: 28%; --tx: -50px; --ty: -32px; background: #10b981; }
    .s2 { top: 14%; left: 72%; --tx:  50px; --ty: -32px; background: #34d399; }
    .s3 { top: 50%; left: 8%;  --tx: -70px; --ty:   0px; background: #06b6d4; width: 5px; height: 5px; }
    .s4 { top: 50%; left: 92%; --tx:  70px; --ty:   0px; background: #14b8a6; width: 5px; height: 5px; }
    .s5 { top: 86%; left: 28%; --tx: -50px; --ty:  32px; background: #0ea5e9; width: 5px; height: 5px; }
    .s6 { top: 86%; left: 72%; --tx:  50px; --ty:  32px; background: #22c55e; width: 5px; height: 5px; }
    .s7 { top: 0%;  left: 50%; --tx:   0px; --ty: -50px; background: #10b981; width: 5px; height: 5px; }
    .s8 { top: 100%;left: 50%; --tx:   0px; --ty:  50px; background: #06b6d4; width: 5px; height: 5px; }
    @keyframes sparkleBurst {
      0%   { transform: translate(0, 0) scale(0); opacity: 0; }
      30%  { opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
    }
    `
        : `
    .card { animation: cardIn 0.6s cubic-bezier(.2,.9,.25,1) 0.05s forwards, shake 0.45s ease-in-out 0.95s; }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25%     { transform: translateX(-5px); }
      50%     { transform: translateX(5px); }
      75%     { transform: translateX(-3px); }
    }
    `
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .card, h1, p.lead, .eyebrow, .footer, .brand { opacity: 1; transform: none; }
      .badge { transform: scale(1); }
      .check-ring, .check-mark, .cross-ring, .cross-line { stroke-dashoffset: 0; }
    }
    @media (max-width: 480px) {
      .card { padding: 44px 24px 28px; border-radius: 18px; }
      h1 { font-size: 22px; }
      .badge-wrap, .badge { width: 84px; height: 84px; }
      .check-svg, .cross-svg { width: 48px; height: 48px; }
    }
  </style>
</head>
<body class="${isSuccess ? 'is-success' : 'is-error'}">
  <div class="ambient"></div>
  <main class="card" role="status" aria-live="polite">
    <div class="badge-wrap">
      <div class="badge">${isSuccess ? successIcon : errorIcon}</div>
      ${sparkles}
    </div>
    <p class="eyebrow">${escapeHtml(eyebrow)}</p>
    <h1>${escapeHtml(heading)}</h1>
    <p class="lead">${escapeHtml(message)}</p>
    <div class="divider"></div>
    <div class="footer">
      <span class="dot"></span>
      <span>${
        isSuccess
          ? 'You can close this tab and return to the app.'
          : 'Request a new email and try again.'
      }</span>
    </div>
    <div class="brand">Secured by OTP Mailer</div>
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
    eyebrow: 'Verification complete',
    heading: 'Your email is verified',
    message:
      "Thanks for confirming. We've let the app know, so you can head back and continue where you left off.",
    status: 'success',
  });
}

export function renderVerifyError(message: string): string {
  return renderVerifyPage({
    title: 'Verification failed',
    eyebrow: 'Verification failed',
    heading: "We couldn't verify this link",
    message,
    status: 'error',
  });
}
