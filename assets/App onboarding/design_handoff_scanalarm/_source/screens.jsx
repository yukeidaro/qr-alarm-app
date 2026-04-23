// ScanAlarm onboarding — 8 iOS screens
// Palette: neutral greys + single orange accent. Inter only.

const C = {
  // Phone canvas
  bg: '#F4F4F5',          // warm-neutral page bg
  surface: '#FFFFFF',
  surfaceAlt: '#F8F8F9',
  line: '#E5E5E7',
  lineSoft: '#EDEDEF',

  // Text
  ink: '#18181B',
  ink2: '#52525B',
  ink3: '#A1A1AA',
  ink4: '#D4D4D8',

  // Accent — single orange
  orange: '#F85A3E',
  orangeDim: '#FDE9E4',
  orangeInk: '#7A2512',
  orangeGlow: 'rgba(248,90,62,0.22)',
};

// ─── small UI atoms ──────────────────────────────────────────
function Dots({ i = 0, n = 4, active = C.orange, inactive = C.ink4 }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: n }).map((_, k) => (
        <div key={k} style={{
          height: 6,
          width: k === i ? 22 : 6,
          borderRadius: 6,
          background: k === i ? active : inactive,
          transition: 'all 200ms',
        }} />
      ))}
    </div>
  );
}

function PillCTA({ children, style = {}, ghost = false, glow = false }) {
  if (ghost) {
    return (
      <div style={{
        height: 56, borderRadius: 9999, background: 'transparent',
        border: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17, fontWeight: 600, color: C.ink, letterSpacing: -0.2,
        ...style,
      }}>{children}</div>
    );
  }
  return (
    <div style={{
      height: 56, borderRadius: 9999, background: C.orange,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: -0.2,
      boxShadow: glow
        ? `0 12px 32px ${C.orangeGlow}, 0 0 0 6px rgba(248,90,62,0.08)`
        : `0 6px 16px ${C.orangeGlow}`,
      ...style,
    }}>{children}</div>
  );
}

function PhoneShell({ children, dark = false }) {
  // Custom shell — not iOS frame — because we want edge-to-edge canvas + footer CTA area.
  return (
    <IOSDevice dark={dark} width={340} height={736}>
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: dark ? '#0E0E10' : C.bg,
        paddingTop: 54, // status bar
      }}>
        {children}
      </div>
    </IOSDevice>
  );
}

// Progress + bottom CTA area shared by value props
function BottomArea({ step, total = 4, cta = 'Continue', skip = true }) {
  return (
    <div style={{ padding: '16px 24px 34px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Dots i={step} n={total} />
      </div>
      <PillCTA>{cta}</PillCTA>
      {skip && (
        <div style={{ textAlign: 'center', fontSize: 14, color: C.ink3, fontWeight: 500 }}>Skip</div>
      )}
    </div>
  );
}

// ─── 1. Splash ───────────────────────────────────────────────
function SplashScreen() {
  const [logoVar, setLogoVar] = React.useState(window.__splashLogo || 0);

  // 4 logo variations — each combines clock + QR in a simple way
  const logos = [
    // V1: Clock circle with 3 QR finder squares inside
    () => (
      <svg width="70" height="70" viewBox="0 0 62 62" fill="none">
        <circle cx="31" cy="31" r="29" stroke="#fff" strokeWidth="2.5"/>
        <path d="M31 17v14l8 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Top-left QR finder */}
        <rect x="9" y="9" width="13" height="13" rx="2" stroke="#fff" strokeWidth="1.8"/>
        <rect x="12" y="12" width="7" height="7" rx="1" fill="#fff"/>
        {/* Top-right QR finder */}
        <rect x="40" y="9" width="13" height="13" rx="2" stroke="#fff" strokeWidth="1.8"/>
        <rect x="43" y="12" width="7" height="7" rx="1" fill="#fff"/>
        {/* Bottom-left QR finder */}
        <rect x="9" y="40" width="13" height="13" rx="2" stroke="#fff" strokeWidth="1.8"/>
        <rect x="12" y="43" width="7" height="7" rx="1" fill="#fff"/>
      </svg>
    ),
    // V2: Rounded square split — left half clock, right half QR grid
    () => (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        {/* clock half */}
        <circle cx="20" cy="28" r="14" stroke="#fff" strokeWidth="2.5"/>
        <path d="M20 18v10l6 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
        {/* QR half */}
        <rect x="36" y="14" width="8" height="8" rx="1.5" stroke="#fff" strokeWidth="2"/>
        <rect x="38.5" y="16.5" width="3" height="3" rx="0.5" fill="#fff"/>
        <rect x="36" y="34" width="8" height="8" rx="1.5" stroke="#fff" strokeWidth="2"/>
        <rect x="38.5" y="36.5" width="3" height="3" rx="0.5" fill="#fff"/>
        <rect x="48" y="14" width="3" height="3" fill="#fff" rx="0.5"/>
        <rect x="48" y="20" width="3" height="3" fill="#fff" rx="0.5"/>
        <rect x="45" y="26" width="3" height="3" fill="#fff" rx="0.5"/>
        <rect x="48" y="39" width="3" height="3" fill="#fff" rx="0.5"/>
      </svg>
    ),
    // V3: QR code outline with clock hands in center
    () => (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        {/* QR frame corners */}
        <rect x="4" y="4" width="14" height="14" rx="3" stroke="#fff" strokeWidth="2.5"/>
        <rect x="7" y="7" width="8" height="8" rx="1.5" fill="#fff"/>
        <rect x="38" y="4" width="14" height="14" rx="3" stroke="#fff" strokeWidth="2.5"/>
        <rect x="41" y="7" width="8" height="8" rx="1.5" fill="#fff"/>
        <rect x="4" y="38" width="14" height="14" rx="3" stroke="#fff" strokeWidth="2.5"/>
        <rect x="7" y="41" width="8" height="8" rx="1.5" fill="#fff"/>
        {/* clock in center */}
        <circle cx="28" cy="28" r="10" stroke="#fff" strokeWidth="2"/>
        <path d="M28 22v6l4 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    // V4: Alarm bell silhouette with QR viewfinder
    () => (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        {/* bell */}
        <path d="M28 6a14 14 0 00-14 14v10l-4 6h36l-4-6V20A14 14 0 0028 6z" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M22 40a6 6 0 0012 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
        {/* QR viewfinder brackets in center of bell */}
        <path d="M21 22v-3h3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        <path d="M35 22v-3h-3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        <path d="M21 32v3h3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        <path d="M35 32v3h-3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        {/* tiny QR dots inside */}
        <rect x="25" y="24" width="3" height="3" fill="#fff" rx="0.5"/>
        <rect x="29" y="28" width="3" height="3" fill="#fff" rx="0.5"/>
        <rect x="25" y="28" width="2" height="2" fill="#fff" rx="0.5"/>
      </svg>
    ),
  ];

  return (
    <PhoneShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        {/* App icon */}
        <div style={{
          width: 96, height: 96, borderRadius: 22,
          background: C.orange,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 18px 40px ${C.orangeGlow}, 0 0 0 8px rgba(248,90,62,0.06)`,
        }}>
          {logos[logoVar]()}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, color: C.ink }}>ScanAlarm</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.ink3, marginTop: 6, letterSpacing: 0.2 }}>Wake up. For real.</div>
        </div>
        {/* Logo variant selector removed */}
      </div>
      <div style={{ padding: '0 24px 48px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: 6,
              background: i === 1 ? C.orange : C.ink4,
            }} />
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}

// ─── 2. Value prop 1 — Wake up for real (animated) ──────────
// Looping 8s animation:
//   Phase 1 (0–45%): alarm rings → person slaps snooze → zzz back to sleep → ✕
//   Phase 2 (50–95%): alarm rings → person gets OUT of bed → walks to QR → scans → ✓
function ValueProp1() {
  return (
    <PhoneShell>
      <style>{`
        @keyframes vp1-scene1 {
          0%   { opacity: 1; }
          44%  { opacity: 1; }
          48%  { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes vp1-scene2 {
          0%   { opacity: 0; }
          48%  { opacity: 0; }
          52%  { opacity: 1; }
          96%  { opacity: 1; }
          100% { opacity: 0; }
        }
        /* Scene 1 animations */
        @keyframes vp1-alarm-shake {
          0%  { transform: rotate(0); }
          8%  { transform: rotate(-15deg); }
          12% { transform: rotate(15deg); }
          16% { transform: rotate(-15deg); }
          20% { transform: rotate(15deg); }
          24% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
        @keyframes vp1-slap {
          0%, 24% { opacity: 0; transform: translateY(-18px) rotate(-20deg); }
          30%     { opacity: 1; transform: translateY(0) rotate(0); }
          34%     { opacity: 1; transform: translateY(3px) rotate(5deg); }
          40%     { opacity: 0; transform: translateY(-8px) rotate(-10deg); }
          100%    { opacity: 0; }
        }
        @keyframes vp1-zzz {
          0%, 38% { opacity: 0; transform: translateY(4px); }
          46%     { opacity: 1; transform: translateY(0); }
          100%    { opacity: 1; transform: translateY(-4px); }
        }
        @keyframes vp1-x-badge {
          0%, 36% { opacity: 0; transform: scale(0); }
          42%     { opacity: 1; transform: scale(1.15); }
          46%     { transform: scale(1); }
          100%    { opacity: 1; transform: scale(1); }
        }
        /* Scene 2 animations */
        @keyframes vp1-blanket-off {
          0%, 14% { transform: scaleX(1); opacity: 1; }
          28%     { transform: scaleX(0.3); opacity: 0.3; }
          100%    { transform: scaleX(0.3); opacity: 0.3; }
        }
        @keyframes vp1-stand {
          0%, 14%  { transform: translateX(0) translateY(0); opacity: 1; }
          28%      { transform: translateX(20px) translateY(-50px); opacity: 1; }
          34%      { transform: translateX(20px) translateY(-50px); opacity: 1; }
          36%      { opacity: 0; }
          100%     { opacity: 0; }
        }
        @keyframes vp1-walker {
          0%, 30%  { opacity: 0; transform: translateX(-30px); }
          38%      { opacity: 1; transform: translateX(0); }
          62%      { opacity: 1; transform: translateX(90px); }
          68%      { opacity: 1; transform: translateX(90px); }
          100%     { opacity: 1; transform: translateX(90px); }
        }
        @keyframes vp1-leg-l {
          0%   { transform: rotate(-18deg); }
          50%  { transform: rotate(18deg); }
          100% { transform: rotate(-18deg); }
        }
        @keyframes vp1-leg-r {
          0%   { transform: rotate(18deg); }
          50%  { transform: rotate(-18deg); }
          100% { transform: rotate(18deg); }
        }
        @keyframes vp1-qr-appear {
          0%, 50%  { opacity: 0; transform: scale(0.8); }
          60%      { opacity: 1; transform: scale(1); }
          100%     { opacity: 1; transform: scale(1); }
        }
        @keyframes vp1-scan-flash {
          0%, 64%  { opacity: 0; }
          68%      { opacity: 1; }
          72%      { opacity: 0.3; }
          76%      { opacity: 1; }
          80%      { opacity: 0; }
          100%     { opacity: 0; }
        }
        @keyframes vp1-ok-badge {
          0%, 70% { opacity: 0; transform: scale(0); }
          78%     { opacity: 1; transform: scale(1.15); }
          84%     { transform: scale(1); }
          100%    { opacity: 1; transform: scale(1); }
        }
        .vp1-s1 { animation: vp1-scene1 8s ease-in-out infinite; }
        .vp1-s2 { animation: vp1-scene2 8s ease-in-out infinite; }
      `}</style>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, margin: '24px 24px 0', borderRadius: 22,
          background: C.surface, border: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>

          {/* ─── Scene 1: Snooze → ✕ ─── */}
          <div className="vp1-s1" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 220, height: 130 }}>
              {/* Bed frame */}
              <div style={{ position: 'absolute', bottom: 0, left: 20, right: 20, height: 36, borderRadius: '6px 6px 0 0', background: '#E8E6E3' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 16, width: 6, height: 48, borderRadius: 3, background: C.ink4 }} />
              <div style={{ position: 'absolute', bottom: 0, right: 16, width: 6, height: 38, borderRadius: 3, background: C.ink4 }} />
              {/* Pillow */}
              <div style={{ position: 'absolute', bottom: 32, left: 28, width: 34, height: 16, borderRadius: 8, background: '#fff', border: `1px solid ${C.line}` }} />
              {/* Person (head + blanket) */}
              <div style={{ position: 'absolute', bottom: 34, left: 30, width: 22, height: 22, borderRadius: '50%', background: C.ink3 }} />
              <div style={{ position: 'absolute', bottom: 28, left: 48, right: 28, height: 22, borderRadius: 10, background: C.ink4 }} />
              {/* Alarm shaking */}
              <div style={{ position: 'absolute', top: 10, right: 16, animation: 'vp1-alarm-shake 8s ease-in-out infinite', transformOrigin: 'bottom center' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 12px ${C.orangeGlow}` }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff' }}>
                    <div style={{ width: 2, height: 8, background: C.ink, margin: '2px auto 0', borderRadius: 1 }} />
                  </div>
                </div>
              </div>
              {/* Hand slapping */}
              <div style={{ position: 'absolute', top: 6, right: 40, animation: 'vp1-slap 8s ease-in-out infinite' }}>
                <svg width="24" height="18" viewBox="0 0 24 18" fill={C.ink3}><path d="M2 12c0-3 2-6 6-8l8-2c2 0 4 1 5 3l1 4c0 2-1 3-3 3H6c-2 0-4-1-4-3z"/></svg>
              </div>
              {/* Zzz floating */}
              <div style={{ position: 'absolute', top: 4, left: 20, animation: 'vp1-zzz 8s ease-in-out infinite' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: C.ink3, letterSpacing: 3, fontStyle: 'italic' }}>zzz</span>
              </div>
              {/* ✕ badge */}
              <div style={{ position: 'absolute', top: -6, right: -4, animation: 'vp1-x-badge 8s ease-in-out infinite' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#E54040', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(229,64,64,0.35)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13" stroke="#fff" strokeWidth="2.8" strokeLinecap="round"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Scene 2: Leave room → open door → scan QR → ✓ ─── */}
          <div className="vp1-s2" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 240, height: 150 }}>
              {/* Room wall + door */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: C.ink4 }} />
              {/* Door frame */}
              <div style={{
                position: 'absolute', bottom: 2, left: 80, width: 60, height: 110,
                border: `2px solid ${C.ink4}`, borderBottom: 'none', borderRadius: '4px 4px 0 0',
                background: 'rgba(255,255,255,0.6)',
              }}>
                {/* door handle */}
                <div style={{ position: 'absolute', top: 55, right: 8, width: 6, height: 6, borderRadius: '50%', background: C.ink3 }} />
                {/* QR on door */}
                <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', animation: 'vp1-qr-appear 8s ease-in-out infinite' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 4, background: '#fff', border: `1.5px solid ${C.line}`, padding: 4, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gridTemplateRows: 'repeat(5,1fr)', gap: 1 }}>
                    {[1,1,1,0,1, 1,0,1,0,0, 1,1,1,0,1, 0,0,0,1,0, 1,0,1,1,1].map((v,i) => (
                      <div key={i} style={{ background: v ? C.ink : 'transparent', borderRadius: 0.5 }} />
                    ))}
                  </div>
                  {/* scan flash */}
                  <div style={{ position: 'absolute', inset: -2, borderRadius: 6, border: `2px solid ${C.orange}`, animation: 'vp1-scan-flash 8s ease-in-out infinite', boxShadow: `0 0 10px ${C.orangeGlow}` }} />
                </div>
              </div>
              {/* Wall lines */}
              <div style={{ position: 'absolute', bottom: 2, left: 0, width: 80, height: 110, borderRight: `1px solid ${C.line}` }} />
              <div style={{ position: 'absolute', bottom: 2, right: 0, width: 100, height: 110, borderLeft: `1px solid ${C.line}` }} />

              {/* Walking person with phone — moves toward door */}
              <div style={{ position: 'absolute', bottom: 6, left: 10, animation: 'vp1-walker 8s ease-in-out infinite' }}>
                {/* Head */}
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.ink, margin: '0 auto' }} />
                {/* Body */}
                <div style={{ width: 12, height: 22, borderRadius: 5, background: C.ink, margin: '2px auto 0', position: 'relative' }}>
                  {/* Arm + phone */}
                  <div style={{ position: 'absolute', top: 2, right: -14 }}>
                    <div style={{ width: 8, height: 3, background: C.ink, borderRadius: 1.5 }} />
                    <div style={{ position: 'absolute', top: -5, right: -8, width: 9, height: 14, borderRadius: 2, background: C.ink, border: '1px solid #fff' }}>
                      <div style={{ width: 5, height: 7, margin: '2px auto', borderRadius: 1, background: C.orange, opacity: 0.8 }} />
                    </div>
                  </div>
                </div>
                {/* Legs */}
                <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 1 }}>
                  <div style={{ width: 4, height: 18, borderRadius: 2, background: C.ink, transformOrigin: 'top center', animation: 'vp1-leg-l 0.5s ease-in-out infinite' }} />
                  <div style={{ width: 4, height: 18, borderRadius: 2, background: C.ink, transformOrigin: 'top center', animation: 'vp1-leg-r 0.5s ease-in-out infinite' }} />
                </div>
              </div>

              {/* ✓ badge */}
              <div style={{ position: 'absolute', top: -4, right: 30, animation: 'vp1-ok-badge 8s ease-in-out infinite' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#27A862', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(39,168,98,0.35)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8l3.5 3.5L13 5" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* copy */}
        <div style={{ padding: '28px 28px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, color: C.ink, lineHeight: 1.15 }}>Wake up.<br/>For real.</div>
          <div style={{ fontSize: 15, color: C.ink2, marginTop: 12, lineHeight: 1.45, letterSpacing: -0.1 }}>
            No more serial snoozing. ScanAlarm makes sure you&rsquo;re actually out of bed.
          </div>
        </div>
      </div>
      <BottomArea step={0} />
    </PhoneShell>
  );
}

// ─── 3. Value prop 2 — Scan QR to dismiss ────────────────────
function ValueProp2() {
  // Looping scan → complete animation. 4s cycle.
  return (
    <PhoneShell>
      <style>{`
        @keyframes sa-scanline {
          0%   { top: 10%; opacity: 0; }
          8%   { opacity: 1; }
          70%  { top: 90%; opacity: 1; }
          75%  { top: 90%; opacity: 0; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes sa-check-appear {
          0%, 72%  { opacity: 0; transform: scale(0.6); }
          78%      { opacity: 1; transform: scale(1.12); }
          85%      { transform: scale(1); }
          95%      { opacity: 1; transform: scale(1); }
          100%     { opacity: 0; transform: scale(1); }
        }
        @keyframes sa-ring {
          0%, 72%  { opacity: 0; transform: scale(0.6); }
          78%      { opacity: 0.8; transform: scale(1); }
          100%     { opacity: 0; transform: scale(2.2); }
        }
        @keyframes sa-code-fade {
          0%, 70%  { opacity: 1; }
          80%      { opacity: 0.15; }
          95%      { opacity: 0.15; }
          100%     { opacity: 1; }
        }
        @keyframes sa-bracket-pulse {
          0%, 70%, 100% { border-color: #F85A3E; }
          78%, 90%      { border-color: #27A862; }
        }
        .sa-scan-anim { animation: sa-scanline 4s ease-in-out infinite; }
        .sa-check-anim { animation: sa-check-appear 4s ease-in-out infinite; }
        .sa-ring-anim { animation: sa-ring 4s ease-out infinite; }
        .sa-code-anim { animation: sa-code-fade 4s ease-in-out infinite; }
        .sa-bracket-anim { animation: sa-bracket-pulse 4s ease-in-out infinite; }
      `}</style>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, margin: '24px 24px 0', borderRadius: 22,
          background: C.surface, border: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* scan frame */}
          <div style={{ position: 'relative', width: 180, height: 180 }}>
            {/* Barcode / QR that fades out when scan completes */}
            <div className="sa-code-anim" style={{
              width: '100%', height: '100%', background: '#fff',
              borderRadius: 16, padding: 18, boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column', gap: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              justifyContent: 'center',
            }}>
              {/* barcode lines */}
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 2, flex: 1 }}>
                {[3,1,2,1,4,1,2,3,1,2,1,3,1,2,4,1,2,1,3,2,1,3,1,2,1,4,1,2].map((w, i) => (
                  <div key={i} style={{
                    width: w,
                    background: i % 2 === 0 ? C.ink : 'transparent',
                    borderRadius: 0.5,
                  }} />
                ))}
              </div>
              {/* digits */}
              <div style={{
                fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                fontSize: 11, color: C.ink2, letterSpacing: 2,
                textAlign: 'center', fontVariantNumeric: 'tabular-nums',
              }}>4 901234 567894</div>
            </div>

            {/* corner brackets — pulse to green on success */}
            {[
              { top: -8, left: -8, b: [true, false, false, true] },
              { top: -8, right: -8, b: [true, true, false, false] },
              { bottom: -8, left: -8, b: [false, false, true, true] },
              { bottom: -8, right: -8, b: [false, true, true, false] },
            ].map((p, i) => (
              <div key={i} className="sa-bracket-anim" style={{
                position: 'absolute',
                top: p.top, left: p.left, right: p.right, bottom: p.bottom,
                width: 20, height: 20,
                borderTopWidth: p.b[0] ? 3 : 0,
                borderRightWidth: p.b[1] ? 3 : 0,
                borderBottomWidth: p.b[2] ? 3 : 0,
                borderLeftWidth: p.b[3] ? 3 : 0,
                borderStyle: 'solid',
                borderColor: C.orange,
                borderRadius: 3,
              }} />
            ))}

            {/* moving scan line */}
            <div className="sa-scan-anim" style={{
              position: 'absolute', left: 6, right: 6,
              height: 2, background: C.orange,
              boxShadow: `0 0 16px ${C.orange}, 0 0 4px ${C.orange}`,
              borderRadius: 2,
            }} />

            {/* success ring */}
            <div className="sa-ring-anim" style={{
              position: 'absolute', inset: 0,
              borderRadius: 16,
              border: '2px solid #27A862',
              pointerEvents: 'none',
            }} />

            {/* success check */}
            <div className="sa-check-anim" style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#27A862',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 24px rgba(39,168,98,0.35)',
              }}>
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <path d="M8 17l6 6 12-14" stroke="#fff" strokeWidth="3.4"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '28px 28px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, color: C.ink, lineHeight: 1.15 }}>Scan to dismiss</div>
          <div style={{ fontSize: 15, color: C.ink2, marginTop: 12, lineHeight: 1.45, letterSpacing: -0.1 }}>
            Any barcode works — the one on your toothpaste, cereal box, shampoo bottle, or a QR taped to the fridge. Scan it to turn the alarm off.
          </div>
        </div>
      </div>
      <BottomArea step={1} />
    </PhoneShell>
  );
}

// ─── 4. Value prop 3 — Smart routines ────────────────────────
function ValueProp3() {
  const bars = [18, 34, 52, 70, 88, 70, 52, 34, 46, 66, 52, 38, 24, 14];
  return (
    <PhoneShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, margin: '24px 24px 0', borderRadius: 22,
          background: C.surface, border: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', padding: 24,
        }}>
          {/* waveform */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 120 }}>
            {bars.map((h, i) => (
              <div key={i} style={{
                width: 8, height: `${h}%`, minHeight: 8,
                borderRadius: 4,
                background: i >= 4 && i <= 9 ? C.orange : C.ink4,
                boxShadow: i >= 4 && i <= 9 ? `0 0 8px ${C.orangeGlow}` : 'none',
              }} />
            ))}
          </div>
          {/* label overlay */}
          <div style={{
            position: 'absolute', top: 18, left: 18,
            fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: C.ink3,
            textTransform: 'uppercase',
          }}>Sleep — last 7d</div>
          <div style={{
            position: 'absolute', bottom: 18, right: 18,
            fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: C.orange,
            textTransform: 'uppercase',
          }}>Deep · 6h 42m</div>
        </div>
        <div style={{ padding: '28px 28px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, color: C.ink, lineHeight: 1.15 }}>Smart routines</div>
          <div style={{ fontSize: 15, color: C.ink2, marginTop: 12, lineHeight: 1.45, letterSpacing: -0.1 }}>
            Learns your sleep patterns and suggests better wake-up times over time.
          </div>
        </div>
      </div>
      <BottomArea step={2} />
    </PhoneShell>
  );
}

// ─── 5. Sign up ──────────────────────────────────────────────
function SignUpScreen() {
  const AuthBtn = ({ icon, label, primary }) => (
    <div style={{
      height: 54, borderRadius: 9999,
      background: primary ? C.ink : C.surface,
      border: primary ? 'none' : `1px solid ${C.line}`,
      color: primary ? '#fff' : C.ink,
      display: 'flex', alignItems: 'center', padding: '0 20px',
      fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
      position: 'relative',
    }}>
      <div style={{ width: 22, height: 22, marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ flex: 1, textAlign: 'center', paddingRight: 34 }}>{label}</div>
    </div>
  );
  return (
    <PhoneShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px 0' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, color: C.ink, lineHeight: 1.15 }}>Create your<br/>account</div>
          <div style={{ fontSize: 15, color: C.ink2, marginTop: 10, letterSpacing: -0.1 }}>Sync alarms and QR codes across devices.</div>
        </div>

        {/* email input pill */}
        <div style={{ marginTop: 28 }}>
          <div style={{
            height: 56, borderRadius: 9999, background: C.surface,
            border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center',
            padding: '0 22px', fontSize: 16, color: C.ink3,
          }}>name@example.com</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <PillCTA style={{ height: 56 }}>Continue with email</PillCTA>
        </div>

        {/* divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 4px' }}>
          <div style={{ flex: 1, height: 1, background: C.line }} />
          <div style={{ fontSize: 12, color: C.ink3, fontWeight: 500, letterSpacing: 0.5 }}>OR</div>
          <div style={{ flex: 1, height: 1, background: C.line }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AuthBtn primary label="Continue with Apple" icon={
            <svg width="18" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.6 13.3c0-2.9 2.4-4.3 2.5-4.3-1.4-2-3.5-2.3-4.3-2.3-1.8-.2-3.6 1.1-4.5 1.1s-2.4-1.1-4-1c-2 0-3.9 1.2-5 3-2.1 3.7-.5 9.1 1.5 12.1 1 1.5 2.3 3.1 3.9 3.1 1.6-.1 2.2-1 4.1-1s2.5 1 4.1 1c1.7 0 2.8-1.5 3.8-3 1.2-1.7 1.7-3.4 1.7-3.5-.1 0-3.3-1.3-3.4-4.9zm-2.8-9c.9-1 1.5-2.5 1.3-4-1.3.1-2.8.9-3.7 1.9-.8.9-1.5 2.4-1.3 3.9 1.4.1 2.8-.7 3.7-1.8z"/></svg>
          } />
          <AuthBtn label="Continue with Google" icon={
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.4-.2-2.1H12v4h6c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.2-4.9 3.2-8.1z"/><path fill="#34A853" d="M12 23c3.1 0 5.7-1 7.6-2.8l-3.7-2.8c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v2.9C3.7 20.4 7.6 23 12 23z"/><path fill="#FBBC05" d="M5.6 13.8c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V6.7H1.8C1 8.3.6 10.1.6 12s.5 3.7 1.2 5.3l3.8-3.5z"/><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 2 15.1 1 12 1 7.6 1 3.7 3.6 1.8 7.3l3.8 2.9C6.5 7.4 9 5.4 12 5.4z"/></svg>
          } />
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ padding: '0 0 30px', textAlign: 'center', fontSize: 12, color: C.ink3, lineHeight: 1.5 }}>
          By continuing you agree to our <span style={{ color: C.ink2, fontWeight: 500 }}>Terms</span> &amp; <span style={{ color: C.ink2, fontWeight: 500 }}>Privacy</span>.
        </div>
      </div>
    </PhoneShell>
  );
}

// ─── 6. Permissions ──────────────────────────────────────────
function PermissionsScreen() {
  const PermCard = ({ icon, title, body, granted }) => (
    <div style={{
      background: C.surface, border: `1px solid ${C.line}`,
      borderRadius: 22, padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: C.orangeDim,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, letterSpacing: -0.2 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.ink2, marginTop: 4, lineHeight: 1.4 }}>{body}</div>
      </div>
      {/* toggle */}
      <div style={{
        width: 44, height: 26, borderRadius: 999,
        background: granted ? C.orange : C.ink4,
        position: 'relative', flexShrink: 0, marginTop: 2,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: granted ? 20 : 2,
          width: 22, height: 22, borderRadius: 22, background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.18)', transition: 'all 200ms',
        }} />
      </div>
    </div>
  );
  return (
    <PhoneShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px 0' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, color: C.ink, lineHeight: 1.15 }}>A couple<br/>permissions</div>
          <div style={{ fontSize: 15, color: C.ink2, marginTop: 10, letterSpacing: -0.1 }}>So alarms can ring and you can scan QR codes.</div>
        </div>
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PermCard
            granted
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2a6 6 0 00-6 6v4l-2 3h16l-2-3V8a6 6 0 00-6-6z" stroke={C.orange} strokeWidth="2" strokeLinejoin="round"/>
                <path d="M10 18a2 2 0 004 0" stroke={C.orange} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
            title="Notifications"
            body="Required so alarms can actually wake you up."
          />
          <PermCard
            granted
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="14" rx="3" stroke={C.orange} strokeWidth="2"/>
                <circle cx="12" cy="13" r="4" stroke={C.orange} strokeWidth="2"/>
                <path d="M8 6l2-2h4l2 2" stroke={C.orange} strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            }
            title="Camera"
            body="To scan your QR code and dismiss alarms."
          />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: '0 0 30px' }}>
          <PillCTA>Allow &amp; Continue</PillCTA>
          <div style={{ textAlign: 'center', fontSize: 14, color: C.ink3, fontWeight: 500, marginTop: 14 }}>Not now</div>
        </div>
      </div>
    </PhoneShell>
  );
}

// ─── 7. First alarm — matching reference exactly ─────────────
function FirstAlarmScreen() {
  const hourCenter = 10;
  const minuteCenter = 34;

  // Reference: two tall oval outlines. Numbers on the OUTER edge,
  // bulging AWAY from screen center. Left oval bulges left, right bulges right.
  // Center number is huge (~64px), numbers shrink and fade toward top/bottom.
  // 8 numbers visible per column, spread along the oval.
  const COUNT = 9;

  // Vertical spread profile: y position, font size, opacity, x-outward push
  // Index 0 = top, 4 = center (selected), 8 = bottom
  const profile = (idx) => {
    const dist = Math.abs(idx - 4); // 0=center, 4=edge
    // Font sizes — much larger to fill the curve area
    const sizes = [24, 32, 44, 56, 76, 56, 44, 32, 24];
    const fs = sizes[idx];
    // Opacity
    const alphas = [0.15, 0.25, 0.40, 0.65, 1, 0.65, 0.40, 0.25, 0.15];
    const alpha = alphas[idx];
    // Position numbers along the cubic bezier curve:
    // Left curve: M 170 -100 C -60 200 -60 600 170 900
    // Right curve: M 0 -100 C 230 200 230 600 0 900
    // Map each number to a t value on the bezier (0→1)
    // 9 numbers, evenly spaced in t from ~0.12 to ~0.88
    const tValues = [0.12, 0.20, 0.28, 0.38, 0.50, 0.62, 0.72, 0.80, 0.88];
    const t = tValues[idx];
    // Cubic bezier: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
    // Left curve control points (in SVG 170x800 space, offset -100):
    // P0=(170,-100) P1=(-60,200) P2=(-60,600) P3=(170,900)
    // We compute x,y then convert to px offset from center (center = y=400 in SVG space)
    const bez = (t, p0, p1, p2, p3) => {
      const u = 1 - t;
      return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3;
    };
    // Left curve positions
    const lx = bez(t, 170, -60, -60, 170);
    const ly = bez(t, -100, 200, 600, 900);
    // Right curve positions
    const rx = bez(t, 0, 230, 230, 0);
    const ry = ly; // same y distribution
    // Convert y from SVG space (0-800, center=400) to px offset from center
    const y = (ly - 400) * (600 / 800); // scale to match our 600px tall SVG display
    // Normalize x to 0-1 range and scale to desired push amount
    const maxPush = 55; // max inward push in px (toward center)
    // Left curve x range: ~143 (edges) to ~-2.5 (center), so xLeft range: ~27 to ~172
    const xLeftRaw = 170 - lx;
    const xRightRaw = rx;
    // Normalize: at edges xLeftRaw≈27, at center≈172. Map to 0→maxPush
    const xLeftNorm = (xLeftRaw - 27) / (172 - 27); // 0 at edges, 1 at center
    const xRightNorm = (xRightRaw) / 172;
    return { fs, alpha, y, xLeft: xLeftNorm * maxPush, xRight: xRightNorm * maxPush };
  };

  // SVG-based oval outlines for precise control. Numbers positioned inside.
  const WheelColumn = ({ center, side }) => {
    const isLeft = side === 'left';

    return (
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0,
        left: isLeft ? 0 : undefined,
        right: isLeft ? undefined : 0,
        width: '50%',
        overflow: 'visible',
      }}>
        {/* Numbers — positioned along the bezier curve */}
        {Array.from({ length: COUNT }).map((_, i) => {
          const val = center + (i - 4);
          const p = profile(i);
          const isCenter = i === 4;
          // Position number along the curve — push toward center at middle height
          const xOff = isLeft ? p.xLeft : -p.xRight;

          return (
            <div key={i} style={{
              position: 'absolute',
              top: '50%',
              [isLeft ? 'left' : 'right']: 8,
              transform: `translateY(${p.y}px) translateX(${xOff}px) translateY(-50%)`,
              fontSize: p.fs,
              fontWeight: isCenter ? 700 : 400,
              color: isCenter ? C.ink : `rgba(24,24,27,${p.alpha})`,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: isCenter ? -2 : -1,
              fontFamily: '"Inter", system-ui',
              lineHeight: 1,
              textAlign: isLeft ? 'left' : 'right',
            }}>{String(val).padStart(2, '0')}</div>
          );
        })}
      </div>
    );
  };

  const ActionIcon = ({ icon, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
      <div style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.ink,
      }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, letterSpacing: -0.2 }}>{label}</div>
    </div>
  );

  return (
    <PhoneShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#D9D9DC' }}>
        {/* Wheel picker area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <WheelColumn center={hourCenter} side="left" />
          <WheelColumn center={minuteCenter} side="right" />
          {/* Two wheel-edge curves )( in center gap */}
          <svg
            viewBox="0 0 340 600"
            preserveAspectRatio="none"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              pointerEvents: 'none',
            }}
          >
            {/* ) curve: top/bottom spread wide, center comes close — bows RIGHT at center */}
            <path
              d="M 145 0 C 168 200 168 400 145 600"
              fill="none"
              stroke={C.orange}
              strokeWidth="2"
              opacity="0.65"
              vectorEffect="non-scaling-stroke"
            />
            {/* ( curve: mirror — top/bottom spread wide, center comes close — bows LEFT */}
            <path
              d="M 195 0 C 172 200 172 400 195 600"
              fill="none"
              stroke={C.orange}
              strokeWidth="2"
              opacity="0.65"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Action row — Sound / Snooze / Repeat */}
        <div style={{
          display: 'flex', padding: '20px 24px 16px', gap: 8,
          borderTop: '1px solid rgba(24,24,27,0.08)',
        }}>
          <ActionIcon label="Sound" icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18V6l10-2v12" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke={C.ink} strokeWidth="2"/>
              <circle cx="16" cy="16" r="3" stroke={C.ink} strokeWidth="2"/>
            </svg>
          } />
          <ActionIcon label="Snooze" icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="13" r="8" stroke={C.ink} strokeWidth="2"/>
              <path d="M12 9v4l3 2" stroke={C.ink} strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 5l3-2M20 5l-3-2" stroke={C.ink} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          } />
          <ActionIcon label="Repeat" icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h13l-3-3M20 17H7l3 3" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          } />
          {/* QR — required action */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, position: 'relative' }}>
            {/* Required badge */}
            <div style={{
              position: 'absolute', top: -6, right: '50%', transform: 'translateX(14px)',
              width: 8, height: 8, borderRadius: 8,
              background: C.orange,
              boxShadow: `0 0 6px ${C.orangeGlow}`,
            }}/>
            <div style={{
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.orange,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="8" height="8" rx="1.5" stroke={C.orange} strokeWidth="2"/>
                <rect x="14" y="2" width="8" height="8" rx="1.5" stroke={C.orange} strokeWidth="2"/>
                <rect x="2" y="14" width="8" height="8" rx="1.5" stroke={C.orange} strokeWidth="2"/>
                <rect x="4.5" y="4.5" width="3" height="3" rx="0.5" fill={C.orange}/>
                <rect x="16.5" y="4.5" width="3" height="3" rx="0.5" fill={C.orange}/>
                <rect x="4.5" y="16.5" width="3" height="3" rx="0.5" fill={C.orange}/>
                <rect x="16.5" y="16.5" width="2" height="2" rx="0.4" fill={C.orange}/>
                <rect x="20.5" y="16.5" width="2" height="2" rx="0.4" fill={C.orange}/>
                <rect x="16.5" y="20.5" width="2" height="2" rx="0.4" fill={C.orange}/>
              </svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, letterSpacing: -0.2 }}>コード設定</div>
          </div>
        </div>

        {/* QR required notice */}
        <div style={{ margin: '0 20px 12px', padding: '10px 14px', borderRadius: 12, background: C.orangeDim, border: `1px solid rgba(248,90,62,0.2)`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke={C.orange} strokeWidth="1.4"/>
            <path d="M7 4v3.5M7 9.5v.5" stroke={C.orange} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <div style={{ fontSize: 12, color: C.orangeInk, fontWeight: 600, flex: 1 }}>
            QRコードを設定しないとアラームは機能しません
          </div>
        </div>

        {/* Bottom bar — X / Choose time / ✓ */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '12px 22px 30px',
          gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke={C.ink2} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 500, color: C.ink2, letterSpacing: -0.1 }}>
            Choose time
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 44, background: C.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9l4 4 8-9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

// ─── 8. Ready ────────────────────────────────────────────────
function ReadyScreen() {
  return (
    <PhoneShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: 24 }}>
        {/* animated check */}
        <div style={{
          width: 108, height: 108, borderRadius: '50%',
          background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 20px 48px ${C.orangeGlow}, 0 0 0 10px rgba(248,90,62,0.08), 0 0 0 20px rgba(248,90,62,0.04)`,
          position: 'relative',
        }}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <path d="M12 26l9 9 18-20" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.6, color: C.ink, lineHeight: 1.15 }}>You&rsquo;re all set</div>
          <div style={{ fontSize: 15, color: C.ink2, marginTop: 12, lineHeight: 1.45, letterSpacing: -0.1, maxWidth: 260 }}>
            Your first alarm is ready for <span style={{ color: C.ink, fontWeight: 600 }}>tomorrow at 7:45 AM</span>. Sweet dreams.
          </div>
        </div>
      </div>
      <div style={{ padding: '0 24px 40px' }}>
        <PillCTA glow>Let&rsquo;s go →</PillCTA>
      </div>
    </PhoneShell>
  );
}

Object.assign(window, {
  SplashScreen, ValueProp1, ValueProp2, ValueProp3,
  SignUpScreen, PermissionsScreen, FirstAlarmScreen, ReadyScreen,
  PhoneShell, C,
});
