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
    <svg class="icon-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle class="icon-ring" cx="60" cy="60" r="54" fill="none" stroke="#000000" stroke-width="2.5"/>
      <path class="icon-mark" d="M38 62 L54 78 L84 44" fill="none" stroke="#000000" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const errorIcon = `
    <svg class="icon-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle class="icon-ring" cx="60" cy="60" r="54" fill="none" stroke="#000000" stroke-width="2.5"/>
      <line class="icon-line icon-line-1" x1="42" y1="42" x2="78" y2="78" stroke="#000000" stroke-width="5" stroke-linecap="round"/>
      <line class="icon-line icon-line-2" x1="78" y1="42" x2="42" y2="78" stroke="#000000" stroke-width="5" stroke-linecap="round"/>
    </svg>`;

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
    html, body { height: 100%; }
    body {
      margin: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #000000;
      background: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 20px;
      overflow: hidden;
      position: relative;
      letter-spacing: -0.005em;
      -webkit-font-smoothing: antialiased;
    }

    .grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
      -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
      pointer-events: none;
    }

    main {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 480px;
      text-align: center;
    }

    .icon-wrap {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0.85);
      animation: iconIn 0.55s cubic-bezier(.2,1.2,.3,1) 0.1s forwards;
    }
    @keyframes iconIn { to { opacity: 1; transform: scale(1); } }

    .icon-wrap::before {
      content: "";
      position: absolute;
      inset: -16px;
      border-radius: 50%;
      border: 1px dashed rgba(0,0,0,0.18);
      animation: rotate 22s linear infinite;
    }
    @keyframes rotate { to { transform: rotate(360deg); } }

    .icon-wrap::after {
      content: "";
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      background: rgba(0,0,0,0.06);
      transform: scale(0.6);
      animation: ${isSuccess ? 'pulseRing 2.4s ease-out 0.4s 2' : 'none'};
    }
    @keyframes pulseRing {
      0%   { transform: scale(0.7); opacity: 0.55; }
      80%  { transform: scale(1.5); opacity: 0; }
      100% { transform: scale(1.5); opacity: 0; }
    }

    .icon-svg { width: 84px; height: 84px; display: block; position: relative; z-index: 1; }
    .icon-ring { stroke-dasharray: 340; stroke-dashoffset: 340; animation: drawRing 0.7s ease-out 0.3s forwards; }
    .icon-mark { stroke-dasharray: 90; stroke-dashoffset: 90; animation: drawMark 0.45s ease-out 0.85s forwards; }
    .icon-line { stroke-dasharray: 60; stroke-dashoffset: 60; }
    .icon-line-1 { animation: drawMark 0.3s ease-out 0.85s forwards; }
    .icon-line-2 { animation: drawMark 0.3s ease-out 1.1s forwards; }
    @keyframes drawRing { to { stroke-dashoffset: 0; } }
    @keyframes drawMark { to { stroke-dashoffset: 0; } }

    .eyebrow {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #000000;
      margin: 0 0 18px;
      padding: 6px 12px;
      border: 1px solid #000000;
      border-radius: 999px;
      opacity: 0;
      transform: translateY(6px);
      animation: fadeUp 0.5s ease-out 1.0s forwards;
    }
    h1 {
      font-size: 38px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin: 0 0 16px;
      color: #000000;
      opacity: 0;
      transform: translateY(8px);
      animation: fadeUp 0.55s ease-out 1.12s forwards;
    }
    p.lead {
      font-size: 16px;
      line-height: 1.6;
      color: #555555;
      margin: 0 auto;
      max-width: 380px;
      opacity: 0;
      transform: translateY(8px);
      animation: fadeUp 0.55s ease-out 1.25s forwards;
    }
    @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

    .rule {
      width: 48px;
      height: 1px;
      background: #000000;
      margin: 36px auto 22px;
      opacity: 0;
      transform: scaleX(0);
      transform-origin: center;
      animation: ruleIn 0.5s ease-out 1.4s forwards;
    }
    @keyframes ruleIn { to { opacity: 1; transform: scaleX(1); } }

    .footer-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 12px;
      color: #777777;
      opacity: 0;
      animation: fadeUp 0.5s ease-out 1.5s forwards;
    }
    .footer-row .dot {
      display: inline-block;
      width: 6px; height: 6px;
      border-radius: 999px;
      background: #000000;
      animation: blink 1.8s ease-in-out infinite;
    }
    @keyframes blink {
      0%,100% { opacity: 0.35; }
      50%     { opacity: 1; }
    }

    .brand {
      margin-top: 22px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #000000;
      opacity: 0;
      animation: fadeUp 0.5s ease-out 1.65s forwards;
    }
    .brand .sep { display: inline-block; margin: 0 8px; color: #aaaaaa; font-weight: 400; }
    .brand .muted { color: #999999; font-weight: 500; }

    ${
      !isSuccess
        ? `
    main { animation: shake 0.45s ease-in-out 1.2s; }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25%     { transform: translateX(-6px); }
      50%     { transform: translateX(6px); }
      75%     { transform: translateX(-3px); }
    }
    `
        : ''
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; }
      main, .icon-wrap, .eyebrow, h1, p.lead, .rule, .footer-row, .brand {
        opacity: 1 !important; transform: none !important;
      }
      .icon-ring, .icon-mark, .icon-line { stroke-dashoffset: 0 !important; }
    }
    @media (max-width: 480px) {
      h1 { font-size: 30px; }
      .icon-wrap, .icon-svg { width: 100px; height: 100px; }
      .icon-svg { width: 72px; height: 72px; }
    }
  </style>
</head>
<body>
  <div class="grid"></div>
  <main role="status" aria-live="polite">
    <div class="icon-wrap">${isSuccess ? successIcon : errorIcon}</div>
    <span class="eyebrow">${escapeHtml(eyebrow)}</span>
    <h1>${escapeHtml(heading)}</h1>
    <p class="lead">${escapeHtml(message)}</p>
    <div class="rule"></div>
    <div class="footer-row">
      <span class="dot"></span>
      <span>${
        isSuccess
          ? 'You can close this tab and return to the app.'
          : 'Request a new email and try again.'
      }</span>
    </div>
    <div class="brand">OTP Mailer <span class="sep">/</span> <span class="muted">Verified securely</span></div>
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
    eyebrow: 'Verified',
    heading: 'Your email is verified',
    message:
      "Thanks for confirming. We've let the app know, so you can head back and continue where you left off.",
    status: 'success',
  });
}

export function renderVerifyError(message: string): string {
  return renderVerifyPage({
    title: 'Verification failed',
    eyebrow: 'Failed',
    heading: "We couldn't verify this link",
    message,
    status: 'error',
  });
}
