// Canvas layout — 4x2 grid of iOS screens with flow arrows + motion spec

const CANVAS = {
  bg: '#ECECEE',
  ink: '#18181B',
  ink2: '#52525B',
  ink3: '#8A8A92',
  line: '#D4D4D8',
  orange: '#F85A3E',
  surface: '#FFFFFF',
};

function ScreenCard({ index, title, transition, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '0 4px' }}>
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
          fontSize: 11, fontWeight: 600, color: CANVAS.orange, letterSpacing: 1,
        }}>{String(index).padStart(2, '0')}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: CANVAS.ink, letterSpacing: -0.2 }}>{title}</div>
      </div>
      {/* Phone */}
      <div style={{ position: 'relative' }}>{children}</div>
      {/* Transition chip */}
      {transition && (
        <div style={{
          alignSelf: 'flex-start',
          padding: '6px 10px', borderRadius: 6,
          background: CANVAS.surface, border: `1px solid ${CANVAS.line}`,
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
          fontSize: 10, color: CANVAS.ink2, letterSpacing: 0.2,
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <span style={{ color: CANVAS.orange, fontWeight: 700 }}>→</span>
          {transition}
        </div>
      )}
    </div>
  );
}

// Arrow SVG between screens. Relative to the canvas container.
function FlowArrow({ from, to, curve = 0, dashed = false, label }) {
  // from/to in canvas coords
  const { x: x1, y: y1 } = from;
  const { x: x2, y: y2 } = to;
  const mx = (x1 + x2) / 2 + curve;
  const my = (y1 + y2) / 2;
  const path = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  return (
    <>
      <path d={path} fill="none" stroke={CANVAS.orange}
        strokeWidth="2" strokeLinecap="round"
        strokeDasharray={dashed ? '5 6' : 'none'}
        opacity={0.85}
        markerEnd="url(#arrowhead)" />
      {label && (
        <g transform={`translate(${mx}, ${my})`}>
          <rect x={-label.length * 3.2 - 8} y={-10} width={label.length * 6.4 + 16} height={20} rx={4}
            fill="#FFFFFF" stroke={CANVAS.line} strokeWidth="1" />
          <text x={0} y={4} textAnchor="middle"
            fontFamily="ui-monospace, SF Mono, Menlo, monospace"
            fontSize="10" fill={CANVAS.ink2} fontWeight="500">{label}</text>
        </g>
      )}
    </>
  );
}

function MotionSpec() {
  const items = [
    ['screen.slide', 'spring · damping 20 · stiffness 180'],
    ['splash → value', 'crossfade + scale 0.95→1.0 · 300ms'],
    ['content.stagger', '50ms between · 350ms each · ease-out'],
    ['cta.glow', 'pulse · 1800ms · auto-reverse'],
    ['dots.active', 'morph width · 200ms spring'],
    ['check.draw', 'stroke path · 450ms · then burst particles'],
  ];
  return (
    <div style={{
      background: CANVAS.surface, border: `1px solid ${CANVAS.line}`,
      borderRadius: 16, padding: 22, width: 340,
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: 6, background: CANVAS.orange }} />
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
          fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
          textTransform: 'uppercase', color: CANVAS.ink,
        }}>Motion spec</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              fontSize: 11, color: CANVAS.orange, fontWeight: 600,
            }}>{k}</div>
            <div style={{ fontSize: 12, color: CANVAS.ink2, letterSpacing: -0.1 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendCard() {
  return (
    <div style={{
      background: CANVAS.surface, border: `1px solid ${CANVAS.line}`,
      borderRadius: 16, padding: 22, width: 340,
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: 6, background: CANVAS.orange }} />
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
          fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
          textTransform: 'uppercase', color: CANVAS.ink,
        }}>Palette</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          ['#F85A3E', 'Orange — single accent, CTAs'],
          ['#18181B', 'Ink — primary text'],
          ['#52525B', 'Ink 2 — body'],
          ['#A1A1AA', 'Ink 3 — tertiary'],
          ['#F4F4F5', 'Canvas — screen bg'],
          ['#FFFFFF', 'Surface — cards, inputs'],
        ].map(([c, l], i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: c, border: `1px solid ${CANVAS.line}` }} />
            <div style={{ fontSize: 12, color: CANVAS.ink2, letterSpacing: -0.1 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: CANVAS.line, margin: '4px 0' }} />
      <div style={{ fontSize: 11, color: CANVAS.ink3, lineHeight: 1.5 }}>
        Inter throughout · 22px card radius · pill (9999) buttons · 340×736 device frame
      </div>
    </div>
  );
}

// ─── Main canvas ─────────────────────────────────────────────
function ScanAlarmCanvas() {
  // Phone dims for arrow math
  const W = 340;   // phone width
  const H = 736;   // phone height
  const GX = 120;  // horizontal gutter
  const GY = 180;  // vertical gutter (room for transition chips)
  const COLS = 4;

  const screens = [
    { c: <SplashScreen />, title: 'Splash', tr: 'Crossfade + scale · 300ms' },
    { c: <ValueProp1 />,   title: 'Value · Wake up',   tr: 'Horizontal slide · spring' },
    { c: <ValueProp2 />,   title: 'Value · Scan QR',   tr: 'Push forward · spring · 320ms' },
    { c: <PermissionsScreen />, title: 'Permissions',  tr: 'Slide-up bounce · friction 8' },
    { c: <FirstAlarmScreen />,  title: 'First alarm',  tr: 'Push forward · spring' },
    { c: <ReadyScreen />,  title: 'Ready',             tr: '— exits to Home' },
  ];

  // Compute arrows: go across the row, wrap to next row
  const cellW = W + GX;
  const cellH = H + GY;

  // Header zone height (screen number + title + spacing to phone top)
  const headerH = 14 + 14;      // label row height + gap above phone
  const phoneTopOffset = headerH; // where phone starts within its cell
  const chipY = phoneTopOffset + H + 14;   // where transition chip approx sits

  // Arrow endpoints: right edge of phone to left edge of next phone, mid-height
  const arrows = [];
  for (let i = 0; i < screens.length - 1; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const nextRow = Math.floor((i + 1) / COLS);
    const nextCol = (i + 1) % COLS;

    const startX = col * cellW + W;
    const startY = row * cellH + phoneTopOffset + H / 2;
    const endX = nextCol * cellW;
    const endY = nextRow * cellH + phoneTopOffset + H / 2;

    if (row === nextRow) {
      arrows.push({
        from: { x: startX + 4, y: startY },
        to: { x: endX - 8, y: endY },
        curve: 0, dashed: false,
      });
    } else {
      // Wrap from end of row 0 to start of row 1: down-and-around curve
      // From right side of last cell in row, curve down under and to left side of first in next row.
      arrows.push({
        from: { x: startX + 4, y: startY },
        to: { x: endX - 8, y: endY },
        curve: 0,
        dashed: true,
        wrap: true,
      });
    }
  }

  const canvasW = COLS * cellW - GX + 80;
  const canvasH = 2 * cellH - GY + headerH + 60;

  return (
    <div style={{
      background: CANVAS.bg,
      minHeight: '100vh',
      padding: '60px 60px 80px',
      fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
      color: CANVAS.ink,
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Title block */}
      <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
        <div>
          <div style={{
            fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            fontSize: 11, fontWeight: 600, color: CANVAS.orange,
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10,
          }}>ScanAlarm · iOS onboarding</div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.1 }}>
            Signup &amp; first-run flow
          </div>
          <div style={{ fontSize: 16, color: CANVAS.ink2, marginTop: 10, maxWidth: 620, lineHeight: 1.5 }}>
            Six screens from cold launch to the first alarm armed — no account required.
            Grey neutrals with a single orange accent ({CANVAS.orange}) — no secondary colors earn their keep here.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontSize: 11, color: CANVAS.ink3, letterSpacing: 0.5 }}>
          <div>v1 · 26.04</div>
          <div style={{ width: 1, background: CANVAS.line }} />
          <div>6 screens · 5 transitions</div>
        </div>
      </div>

      {/* Grid + arrows */}
      <div style={{ position: 'relative', width: canvasW }}>
        {/* SVG overlay for arrows */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }}
          width={canvasW} height={canvasH}
          viewBox={`0 0 ${canvasW} ${canvasH}`}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10"
              refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M1,1 L9,5 L1,9 L3,5 z" fill={CANVAS.orange} />
            </marker>
          </defs>
          {arrows.map((a, i) => {
            if (a.wrap) {
              // Wrap arrow: from top-right of last in row → down → back to far-left of next row
              const x1 = a.from.x, y1 = a.from.y;
              const x2 = a.to.x, y2 = a.to.y;
              const downY = y1 + H / 2 + 40;
              const path = `M ${x1} ${y1} L ${x1 + 40} ${y1} L ${x1 + 40} ${downY} L ${x2 - 40} ${downY} L ${x2 - 40} ${y2} L ${x2} ${y2}`;
              return (
                <g key={i}>
                  <path d={path} fill="none" stroke={CANVAS.orange}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="5 6" opacity={0.7}
                    markerEnd="url(#arrowhead)" />
                  <g transform={`translate(${(x1 + x2) / 2 + 20}, ${downY - 14})`}>
                    <rect x={-82} y={-11} width={164} height={22} rx={4}
                      fill="#FFFFFF" stroke={CANVAS.line} strokeWidth="1" />
                    <text x={0} y={4} textAnchor="middle"
                      fontFamily="ui-monospace, SF Mono, Menlo, monospace"
                      fontSize="10" fill={CANVAS.ink2} fontWeight="500">
                      row break · push forward
                    </text>
                  </g>
                </g>
              );
            }
            return <FlowArrow key={i} {...a} />;
          })}
        </svg>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${W}px)`,
          columnGap: GX,
          rowGap: GY - 40,
          position: 'relative', zIndex: 1,
        }}>
          {screens.map((s, i) => (
            <ScreenCard key={i} index={i + 1} title={s.title} transition={s.tr}>
              {s.c}
            </ScreenCard>
          ))}
        </div>
      </div>

      {/* Bottom specs row */}
      <div style={{
        marginTop: 80, display: 'flex', gap: 24, flexWrap: 'wrap',
      }}>
        <MotionSpec />
        <LegendCard />
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 60, paddingTop: 24, borderTop: `1px solid ${CANVAS.line}`,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        fontSize: 11, color: CANVAS.ink3, letterSpacing: 0.5,
      }}>
        <div>ScanAlarm · onboarding v1</div>
        <div>Designed for iPhone · 390 × 844 · scaled to 340 × 736</div>
      </div>
    </div>
  );
}

Object.assign(window, { ScanAlarmCanvas });
