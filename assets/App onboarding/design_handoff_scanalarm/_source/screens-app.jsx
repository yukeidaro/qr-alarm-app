// ScanAlarm — App screens: Home, Alarm Edit, Settings
// Same palette & atoms as onboarding (screens.jsx must be loaded first for C, PhoneShell, PillCTA)

// ─── Shared Tab Bar ──────────────────────────────────────────
function AppTabBar({ active = 'home' }) {
  const tabs = [
    {
      id: 'home', label: 'アラーム',
      icon: (on) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 10v3.5l2 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M5 6l2.5-2M19 6l-2.5-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'settings', label: '設定',
      icon: (on) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '10px 0 26px',
      borderTop: `1px solid ${C.lineSoft}`,
      background: 'rgba(244,244,245,0.92)',
    }}>
      {tabs.map(tab => {
        const on = tab.id === active;
        return (
          <div key={tab.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: on ? C.orange : C.ink3,
            fontSize: 10, fontWeight: on ? 700 : 500, letterSpacing: 0.2,
          }}>
            {tab.icon(on)}
            {tab.label}
          </div>
        );
      })}
    </div>
  );
}

// ─── Toggle ──────────────────────────────────────────────────
function Toggle({ on, large = false }) {
  const w = large ? 50 : 44, h = large ? 30 : 26, knob = large ? 26 : 22;
  return (
    <div style={{
      width: w, height: h, borderRadius: 999,
      background: on ? C.orange : C.ink4,
      position: 'relative', flexShrink: 0,
      transition: 'background 200ms',
    }}>
      <div style={{
        position: 'absolute', top: (h - knob) / 2,
        left: on ? w - knob - (h - knob) / 2 : (h - knob) / 2,
        width: knob, height: knob, borderRadius: knob, background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 200ms',
      }} />
    </div>
  );
}

// ─── QR Mini Icon ────────────────────────────────────────────
function QRBadge({ color = C.orange }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 999, background: `${color}18` }}>
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <rect x="0.5" y="0.5" width="3.5" height="3.5" rx="0.8" stroke={color} strokeWidth="1"/>
        <rect x="7" y="0.5" width="3.5" height="3.5" rx="0.8" stroke={color} strokeWidth="1"/>
        <rect x="0.5" y="7" width="3.5" height="3.5" rx="0.8" stroke={color} strokeWidth="1"/>
        <rect x="7.8" y="7.8" width="2" height="2" rx="0.4" fill={color}/>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.2 }}>QR</span>
    </div>
  );
}

// ─── Time-aware greeting ─────────────────────────────────────
function useGreeting(name = 'Takumi') {
  const hour = new Date().getHours();
  const pools = {
    night:        [`まだ起きてますか、${name}さん。寝る前にアラームをセットしましょう。`, `深夜ですね、${name}さん。ゆっくり休んでください。`, `夜更かしですか？しっかり寝てくださいね、${name}さん。`],
    earlyMorning: [`おはようございます、${name}さん。`, `早起きですね、${name}さん。いい一日を。`, `今日も朝から頑張りますね、${name}さん。`],
    morning:      [`おはようございます、${name}さん。`, `朝が過ぎていきますね、${name}さん。`, `今日も良い一日になりますように、${name}さん。`],
    afternoon:    [`こんにちは、${name}さん。`, `午後も頑張りましょう、${name}さん。`, `お昼はゆっくりできましたか、${name}さん。`],
    evening:      [`お疲れさまです、${name}さん。そろそろ一息つきましょう。`, `今日も一日お疲れさまでした、${name}さん。`, `こんばんは、${name}さん。明日のアラームはもう設定しましたか？`],
    lateNight:    [`遅くなりましたね、${name}さん。アラームをセットして休みましょう。`, `そろそろ寝る時間ですよ、${name}さん。`, `夜遅いですね。しっかり休んでください、${name}さん。`],
  };
  let pool;
  if      (hour < 5)  pool = pools.night;
  else if (hour < 9)  pool = pools.earlyMorning;
  else if (hour < 12) pool = pools.morning;
  else if (hour < 17) pool = pools.afternoon;
  else if (hour < 21) pool = pools.evening;
  else                pool = pools.lateNight;
  return pool[new Date().getMinutes() % pool.length];
}

// ─── 1. Home Screen ──────────────────────────────────────────
function HomeScreen() {
  const greeting = useGreeting('Takumi');
  const [alarms, setAlarms] = React.useState([
    { time: '6:30', period: 'AM', days: '月 水 金', on: true,  qr: true  },
    { time: '7:45', period: 'AM', days: '月〜金',   on: true,  qr: true  },
    { time: '9:00', period: 'AM', days: '土 日',    on: false, qr: false },
  ]);

  const toggleAlarm = (i) => {
    setAlarms(prev => prev.map((a, idx) => idx === i ? { ...a, on: !a.on } : a));
  };

  const nextAlarm = alarms.find(a => a.on);

  return (
    <PhoneShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Greeting + next alarm compact */}
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.1, color: C.ink, lineHeight: 1.35, textWrap: 'pretty', fontFamily: '"Shippori Mincho", "Georgia", serif', maxWidth: 260 }}>
            {greeting}
          </div>
          {nextAlarm && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke={C.orange} strokeWidth="1.4"/>
                <path d="M6.5 4v2.8l1.8 1.2" stroke={C.orange} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.orange }}>次のアラームまで8時間12分</span>
            </div>
          )}
        </div>

        {/* Alarm list */}
        <div style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alarms.map((a, i) => (
            <div key={i} style={{
              background: C.surface, border: `1px solid ${C.line}`,
              borderRadius: 18, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: a.on ? 1 : 0.45,
              transition: 'opacity 200ms',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1.2, color: C.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    {a.time}
                  </span>
                  <span style={{ fontSize: 13, color: C.ink3, fontWeight: 500 }}>{a.period}</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: C.ink4, fontFamily: 'ui-monospace,monospace', letterSpacing: 0.5 }}>{a.days}</span>
                </div>
                {a.qr && <div style={{ marginTop: 6 }}><QRBadge/></div>}
              </div>
              <div onClick={() => toggleAlarm(i)} style={{ cursor: 'pointer' }}>
                <Toggle on={a.on} large />
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        {/* Floating + button */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          paddingBottom: 12, position: 'relative', zIndex: 10,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 56,
            background: C.orange,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 20px ${C.orangeGlow}, 0 0 0 6px rgba(248,90,62,0.08)`,
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 3v16M3 11h16" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <AppTabBar active="home"/>
      </div>
    </PhoneShell>
  );
}

// ─── 2. Alarm Edit Screen ─────────────────────────────────────
function AlarmEditScreen() {
  // Wheel picker
  const WheelCol = ({ values, center, align }) => {
    const profile = [
      { scale: 0.60, opacity: 0.15 },
      { scale: 0.72, opacity: 0.28 },
      { scale: 0.84, opacity: 0.50 },
      { scale: 1.00, opacity: 1.00 }, // center
      { scale: 0.84, opacity: 0.50 },
      { scale: 0.72, opacity: 0.28 },
      { scale: 0.60, opacity: 0.15 },
    ];
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-end' : 'flex-start', justifyContent: 'center', gap: 0, height: 220, position: 'relative', overflow: 'hidden' }}>
        {values.map((v, i) => {
          const isCenter = i === 3;
          const p = profile[i];
          return (
            <div key={i} style={{
              fontSize: isCenter ? 62 : 62 * p.scale,
              fontWeight: 700,
              letterSpacing: -3,
              color: isCenter ? C.ink : `rgba(24,24,27,${p.opacity})`,
              lineHeight: isCenter ? 1.12 : 1.12,
              fontVariantNumeric: 'tabular-nums',
              textAlign: align === 'left' ? 'right' : 'left',
              width: '100%',
              paddingRight: align === 'left' ? 12 : 0,
              paddingLeft: align === 'right' ? 12 : 0,
              transition: 'all 150ms',
            }}>{v}</div>
          );
        })}
        {/* selection indicator — faint line */}
        <div style={{
          position: 'absolute',
          top: '50%', left: 8, right: 8,
          transform: 'translateY(-50%)',
          height: 70,
          borderTop: `1.5px solid ${C.line}`,
          borderBottom: `1.5px solid ${C.line}`,
          borderRadius: 4,
          pointerEvents: 'none',
        }}/>
      </div>
    );
  };

  const hourVals =   ['08', '09', '10', '07', '08', '09', '10'];
  const minuteVals = ['42', '43', '44', '45', '46', '47', '48'];

  const OptionRow = ({ icon, label, value, toggle, toggleOn, isLast }) => (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '15px 20px',
      borderBottom: isLast ? 'none' : `1px solid ${C.lineSoft}`,
      gap: 14,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: C.orangeDim,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: C.ink, letterSpacing: -0.2 }}>{label}</div>
      {value && <div style={{ fontSize: 14, color: C.ink3, fontWeight: 500 }}>{value}</div>}
      {toggle !== undefined && <Toggle on={toggle}/>}
      {!toggle && !value && (
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
          <path d="M1 1l5 5-5 5" stroke={C.ink4} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );

  return (
    <PhoneShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Nav */}
        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.orange, cursor: 'pointer' }}>キャンセル</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>アラームを編集</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.orange, cursor: 'pointer' }}>保存</div>
        </div>

        {/* Time wheel picker */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '0 24px',
          background: C.bg,
          borderBottom: `1px solid ${C.line}`,
          height: 240,
          position: 'relative',
        }}>
          <WheelCol values={hourVals} align="left"/>
          <div style={{ fontSize: 52, fontWeight: 700, color: C.ink, letterSpacing: -1, marginBottom: 4, flexShrink: 0, paddingBottom: 4 }}>:</div>
          <WheelCol values={minuteVals} align="right"/>

          {/* AM/PM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 18, flexShrink: 0 }}>
            {['AM', 'PM'].map((p, i) => (
              <div key={p} style={{
                padding: '8px 14px', borderRadius: 10,
                background: i === 0 ? C.ink : C.surfaceAlt,
                color: i === 0 ? '#fff' : C.ink3,
                fontSize: 15, fontWeight: 700, letterSpacing: 0.5,
              }}>{p}</div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ margin: '20px 20px 0', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, overflow: 'hidden' }}>
            <OptionRow
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke={C.orange} strokeWidth="1.6" strokeLinecap="round"/></svg>}
              label="ラベル"
              value="出社"
            />
            <OptionRow
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l2 6 2.5-3.5L10 14l2-6" stroke={C.orange} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 3h12" stroke={C.orange} strokeWidth="1.6" strokeLinecap="round"/></svg>}
              label="サウンド"
              value="Morning Bell"
            />
            <OptionRow
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke={C.orange} strokeWidth="1.5"/><path d="M8 5v3l2 1.5" stroke={C.orange} strokeWidth="1.5" strokeLinecap="round"/></svg>}
              label="スヌーズ"
              toggle={true}
            />
            <OptionRow
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M3 8h6" stroke={C.orange} strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="11" r="2.5" stroke={C.orange} strokeWidth="1.3"/></svg>}
              label="繰り返し"
              value="月〜金"
            />
            <OptionRow
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="4" height="4" rx="1" stroke={C.orange} strokeWidth="1.2"/><rect x="11" y="1" width="4" height="4" rx="1" stroke={C.orange} strokeWidth="1.2"/><rect x="1" y="11" width="4" height="4" rx="1" stroke={C.orange} strokeWidth="1.2"/><rect x="12" y="12" width="2" height="2" rx="0.5" fill={C.orange}/></svg>}
              label="QR・バーコードで解除"
              toggle={true}
              isLast
            />
          </div>

          {/* QR selection (shown when QR is on) */}
          <div style={{ margin: '16px 20px 0', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: C.ink3, textTransform: 'uppercase', marginBottom: 12 }}>解除QRコード</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['冷蔵庫', '洗面所', '玄関'].map((label, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: 12,
                  border: `2px solid ${i === 0 ? C.orange : C.line}`,
                  padding: '10px 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  background: i === 0 ? C.orangeDim : C.surfaceAlt,
                }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="2" y="2" width="8" height="8" rx="1.5" stroke={i === 0 ? C.orange : C.ink4} strokeWidth="1.5"/>
                    <rect x="18" y="2" width="8" height="8" rx="1.5" stroke={i === 0 ? C.orange : C.ink4} strokeWidth="1.5"/>
                    <rect x="2" y="18" width="8" height="8" rx="1.5" stroke={i === 0 ? C.orange : C.ink4} strokeWidth="1.5"/>
                    <rect x="4" y="4" width="4" height="4" rx="0.5" fill={i === 0 ? C.orange : C.ink4}/>
                    <rect x="20" y="4" width="4" height="4" rx="0.5" fill={i === 0 ? C.orange : C.ink4}/>
                    <rect x="4" y="20" width="4" height="4" rx="0.5" fill={i === 0 ? C.orange : C.ink4}/>
                    <rect x="18" y="18" width="3" height="3" rx="0.5" fill={i === 0 ? C.orange : C.ink4}/>
                    <rect x="23" y="18" width="3" height="3" rx="0.5" fill={i === 0 ? C.orange : C.ink4}/>
                    <rect x="18" y="23" width="3" height="3" rx="0.5" fill={i === 0 ? C.orange : C.ink4}/>
                  </svg>
                  <div style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? C.orange : C.ink3, textAlign: 'center' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 24 }}/>
        </div>
      </div>
    </PhoneShell>
  );
}

// ─── 3. Settings Screen ───────────────────────────────────────
function SettingsScreen() {
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 22 }}>
      {title && <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: C.ink3, textTransform: 'uppercase', padding: '0 6px 8px' }}>{title}</div>}
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );

  const Row = ({ iconBg, icon, label, detail, toggle, isLast }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 16px',
      borderBottom: isLast ? 'none' : `1px solid ${C.lineSoft}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: iconBg || C.orangeDim,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: C.ink, letterSpacing: -0.2 }}>{label}</div>
      {detail && <div style={{ fontSize: 14, color: C.ink3 }}>{detail}</div>}
      {toggle !== undefined
        ? <Toggle on={toggle}/>
        : <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M1 1l5 5-5 5" stroke={C.ink4} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
      }
    </div>
  );

  const ic = (color, path) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d={path} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <PhoneShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px 4px' }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8, color: C.ink }}>設定</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 0' }}>
          {/* Profile card */}
          <div style={{
            background: C.surface, border: `1px solid ${C.line}`,
            borderRadius: 18, padding: '16px 18px', marginBottom: 22,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 50,
              background: `linear-gradient(135deg, ${C.orange} 0%, #FF8C6B 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: -0.5,
            }}>T</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>Takumi</div>
            </div>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M1 1l5 5-5 5" stroke={C.ink4} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <Section title="アラーム">
            <Row
              icon={ic(C.orange, 'M2 5h12M5 9h3M8 12a4 4 0 004-4V5')}
              label="サウンド"
              detail="Morning Bell"
            />
            <Row
              icon={ic(C.orange, 'M8 2v12M4 6l4-4 4 4')}
              label="スヌーズ間隔"
              detail="5分"
            />
            <Row
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="4" height="4" rx="1" stroke={C.orange} strokeWidth="1.2"/>
                <rect x="11" y="1" width="4" height="4" rx="1" stroke={C.orange} strokeWidth="1.2"/>
                <rect x="1" y="11" width="4" height="4" rx="1" stroke={C.orange} strokeWidth="1.2"/>
                <rect x="12.5" y="12.5" width="2" height="2" rx="0.4" fill={C.orange}/>
              </svg>}
              label="QR・バーコード管理"
              isLast
            />
          </Section>

          <Section title="通知・表示">
            <Row
              iconBg="#FDE9E4"
              icon={ic('#F85A3E', 'M8 2a4 4 0 014 4v3l1.5 2.5H2.5L4 9V6a4 4 0 014-4zM6 13a2 2 0 004 0')}
              label="プッシュ通知"
              toggle={true}
            />
            <Row
              iconBg="#FDE9E4"
              icon={ic('#F85A3E', 'M8 1v14M1 8h14')}
              label="テーマ"
              detail="ライト"
              isLast={false}
            />
            <Row
              iconBg="#FDE9E4"
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="#F85A3E" strokeWidth="1.4"/><path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="#F85A3E" strokeWidth="1.4" strokeLinecap="round"/><path d="M8 13v2M5 15h6" stroke="#F85A3E" strokeWidth="1.4" strokeLinecap="round"/></svg>}
              label="デフォルトデバイス"
              detail="このiPhone"
              isLast
            />
          </Section>

          <Section title="アカウント・その他">

            <Row
              iconBg="#F5E8E8"
              icon={ic('#D94F4F', 'M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5 4.3 12.6l.7-4.1L2 5.6l4.2-.9z')}
              label="レビューを書く"
            />
            <Row
              iconBg="#E5E5E7"
              icon={ic(C.ink3, 'M8 7v4M8 4v.5M2 8a6 6 0 1012 0A6 6 0 002 8z')}
              label="ヘルプ・サポート"
            />
            <Row
              iconBg="#E5E5E7"
              icon={ic(C.ink3, 'M3 3h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zM1 6l7 4 7-4')}
              label="お問い合わせ"
              isLast
            />
          </Section>

          <div style={{ textAlign: 'center', fontSize: 11, color: C.ink4, letterSpacing: 0.5, fontFamily: 'ui-monospace,monospace', marginBottom: 16 }}>
            ScanAlarm v1.0.0 · build 42
          </div>
        </div>

        <AppTabBar active="settings"/>
      </div>
    </PhoneShell>
  );
}

// ─── Sub-screen shell (push navigation) ─────────────────────
function SubShell({ title, children }) {
  return (
    <PhoneShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.orange, fontSize: 16, fontWeight: 600 }}>
            <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
              <path d="M8 1L2 7.5 8 14" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            戻る
          </div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>{title}</div>
          <div style={{ width: 60 }}/>
        </div>
        <div style={{ flex: 1, overflow: 'auto', paddingTop: 16 }}>
          {children}
        </div>
      </div>
    </PhoneShell>
  );
}

// ─── A. Sound Picker ─────────────────────────────────────────
function SoundPickerScreen() {
  const themes = [
    {
      name: 'ナチュラル',
      sounds: [
        { name: 'Morning Bell',  desc: 'やわらかい鈴の音' },
        { name: 'Forest Dawn',   desc: '鳥のさえずり・自然音' },
        { name: 'Ocean Wave',    desc: '波の音' },
        { name: 'Rain Drops',    desc: '雨粒・穏やか' },
      ],
    },
    {
      name: 'クラシック',
      sounds: [
        { name: 'Radar',         desc: 'iOS定番' },
        { name: 'Chime',         desc: '透明感のある鐘' },
        { name: 'Xylophone',     desc: '木琴・明るい' },
      ],
    },
    {
      name: 'ミニマル',
      sounds: [
        { name: 'Pulse',         desc: '低め・一定リズム' },
        { name: 'Beep',          desc: 'シンプルな電子音' },
        { name: 'Tone',          desc: 'サイン波・クリーン' },
      ],
    },
    {
      name: 'エナジー',
      sounds: [
        { name: 'Wake Storm',    desc: 'アップテンポ・強め' },
        { name: 'Spark',         desc: '電子・勢いよく' },
        { name: 'Sunrise',       desc: '徐々に盛り上がる' },
      ],
    },
  ];

  const [selectedTheme, setSelectedTheme] = React.useState(0);
  const [selectedSound, setSelectedSound] = React.useState('Morning Bell');
  const [playing, setPlaying] = React.useState(null);

  return (
    <SubShell title="サウンド">
      {/* Volume slider */}
      <div style={{ margin: '0 20px 16px', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 6h2l4-4v12l-4-4H2V6z" stroke={C.ink3} strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
          <div style={{ flex: 1, height: 4, borderRadius: 4, background: C.line, position: 'relative' }}>
            <div style={{ width: '72%', height: '100%', borderRadius: 4, background: C.orange }}/>
            <div style={{ position: 'absolute', top: '50%', left: '72%', transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: 16, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}/>
          </div>
          <svg width="16" height="14" viewBox="0 0 18 16" fill="none">
            <path d="M2 5h2l4-4v12l-4-4H2V5z" stroke={C.ink} strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M12 4c1.5 1 2.5 2.5 2.5 4s-1 3-2.5 4" stroke={C.ink} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Theme tabs — horizontal scroll */}
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {themes.map((t, i) => (
          <div key={i} onClick={() => setSelectedTheme(i)} style={{
            padding: '8px 16px', borderRadius: 999, flexShrink: 0,
            background: i === selectedTheme ? C.ink : C.surface,
            border: `1px solid ${i === selectedTheme ? C.ink : C.line}`,
            fontSize: 13, fontWeight: 600,
            color: i === selectedTheme ? '#fff' : C.ink2,
            cursor: 'pointer',
          }}>{t.name}</div>
        ))}
      </div>

      {/* Sound list for selected theme */}
      <div style={{ margin: '0 20px', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, overflow: 'hidden' }}>
        {themes[selectedTheme].sounds.map((s, i) => {
          const isSelected = s.name === selectedSound;
          const isPlaying = playing === s.name;
          return (
            <div key={i} onClick={() => setSelectedSound(s.name)} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 14,
              borderBottom: i < themes[selectedTheme].sounds.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
              background: isSelected ? C.orangeDim : 'transparent',
              cursor: 'pointer',
            }}>
              {/* Play/pause button */}
              <div onClick={(e) => { e.stopPropagation(); setPlaying(isPlaying ? null : s.name); }} style={{
                width: 34, height: 34, borderRadius: 34,
                background: isSelected ? C.orange : C.surfaceAlt,
                border: `1px solid ${isSelected ? C.orange : C.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                cursor: 'pointer',
              }}>
                {isPlaying
                  ? <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="0.5" y="0.5" width="3" height="11" rx="1" fill={isSelected ? '#fff' : C.ink3}/><rect x="6.5" y="0.5" width="3" height="11" rx="1" fill={isSelected ? '#fff' : C.ink3}/></svg>
                  : <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M1 1l8 5-8 5V1z" fill={isSelected ? '#fff' : C.ink3}/></svg>
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: isSelected ? 700 : 500, color: C.ink, letterSpacing: -0.2 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>{s.desc}</div>
              </div>
              {isSelected && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-7" stroke={C.orange} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </SubShell>
  );
}

// ─── B. Repeat Days ──────────────────────────────────────────
function RepeatScreen() {
  const days = [
    { label: '日', en: 'Sun', on: false },
    { label: '月', en: 'Mon', on: true },
    { label: '火', en: 'Tue', on: true },
    { label: '水', en: 'Wed', on: true },
    { label: '木', en: 'Thu', on: true },
    { label: '金', en: 'Fri', on: true },
    { label: '土', en: 'Sat', on: false },
  ];
  const presets = ['毎日', '平日', '週末', 'なし'];
  const activePreset = '平日';

  return (
    <SubShell title="繰り返し">
      <div style={{ margin: '0 20px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: C.ink3, textTransform: 'uppercase', marginBottom: 10 }}>クイック設定</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {presets.map((p, i) => (
            <div key={i} style={{ flex: 1, padding: '10px 4px', borderRadius: 12, textAlign: 'center', background: p === activePreset ? C.ink : C.surface, border: `1px solid ${p === activePreset ? C.ink : C.line}`, fontSize: 13, fontWeight: 600, color: p === activePreset ? '#fff' : C.ink2 }}>{p}</div>
          ))}
        </div>
      </div>
      <div style={{ margin: '0 20px 16px', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, padding: '20px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: C.ink3, textTransform: 'uppercase', marginBottom: 16 }}>曜日を選ぶ</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
          {days.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 32, background: d.on ? C.orange : C.surfaceAlt, border: `2px solid ${d.on ? C.orange : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: d.on ? '#fff' : C.ink3, boxShadow: d.on ? `0 4px 10px ${C.orangeGlow}` : 'none' }}>{d.label}</div>
              <div style={{ fontSize: 9, color: d.on ? C.orange : C.ink4, fontWeight: 600, letterSpacing: 0.5 }}>{d.en}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ margin: '0 20px', background: C.orangeDim, border: `1px solid rgba(248,90,62,0.15)`, borderRadius: 18, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M3 6h12M3 9h8M3 12h5" stroke={C.orange} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.orangeInk }}>月・火・水・木・金</div>
          <div style={{ fontSize: 11, color: C.orange, marginTop: 2 }}>週5回 · 次は月曜日</div>
        </div>
      </div>
    </SubShell>
  );
}

// ─── C. Snooze Interval ──────────────────────────────────────
function SnoozeIntervalScreen() {
  const options = [3, 5, 10, 15];
  const selected = 5;

  return (
    <SubShell title="スヌーズ間隔">
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.5, padding: '0 4px' }}>
          スヌーズボタンを押してから、次にアラームが鳴るまでの時間です。
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {options.map((min, i) => (
            <div key={i} style={{ borderRadius: 16, background: min === selected ? C.ink : C.surface, border: `1px solid ${min === selected ? C.ink : C.line}`, padding: '18px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, color: min === selected ? '#fff' : C.ink, fontVariantNumeric: 'tabular-nums' }}>{min}</div>
                <div style={{ fontSize: 12, color: min === selected ? 'rgba(255,255,255,0.5)' : C.ink3, marginTop: 2 }}>分</div>
              </div>
              {min === selected && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" fill={C.orange}/>
                  <path d="M6 10l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </SubShell>
  );
}

// ─── D. QR Code Management ───────────────────────────────────
function QRManageScreen() {
  const codes = [
    { name: '冷蔵庫', location: 'キッチン',     alarms: 2, color: C.orange },
    { name: '洗面所', location: 'バスルーム',   alarms: 1, color: '#F85A3E' },
    { name: '玄関',   location: '玄関ドア',     alarms: 1, color: '#F85A3E' },
  ];
  const MiniQR = ({ color }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="3" y="3" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5"/>
      <rect x="23" y="3" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5"/>
      <rect x="3" y="23" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5"/>
      <rect x="5.5" y="5.5" width="5" height="5" rx="0.8" fill={color}/>
      <rect x="25.5" y="5.5" width="5" height="5" rx="0.8" fill={color}/>
      <rect x="5.5" y="25.5" width="5" height="5" rx="0.8" fill={color}/>
      <rect x="23" y="23" width="4" height="4" rx="0.8" fill={color}/>
      <rect x="29" y="23" width="4" height="4" rx="0.8" fill={color}/>
      <rect x="23" y="29" width="4" height="4" rx="0.8" fill={color}/>
    </svg>
  );

  return (
    <SubShell title="QR・バーコード管理">
      <div style={{ margin: '0 20px 16px' }}>
        <div style={{ height: 50, borderRadius: 16, border: `1.5px dashed ${C.orange}`, background: C.orangeDim, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: C.orange }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke={C.orange} strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          コードを追加
        </div>
      </div>
      <div style={{ margin: '0 20px', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, overflow: 'hidden' }}>
        {codes.map((qr, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 14, borderBottom: i < codes.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${qr.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MiniQR color={qr.color}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, letterSpacing: -0.2 }}>{qr.name}</div>
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: qr.color, background: `${qr.color}14`, padding: '3px 8px', borderRadius: 999 }}>アラーム {qr.alarms}件</span>
              </div>
            </div>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M1 1l5 5-5 5" stroke={C.ink4} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>
      <div style={{ margin: '16px 20px 0', padding: '14px 16px', borderRadius: 16, background: C.surfaceAlt, border: `1px solid ${C.line}` }}>
        <div style={{ fontSize: 12, color: C.ink3, lineHeight: 1.7 }}>
          💡 ベッドから離れた場所にあるものを登録するのがコツです。冷蔵庫・洗面所のアイテム、トイレの芳香剤のバーコードなど、起き上がって移動しないとスキャンできない場所がおすすめです。
        </div>
      </div>
    </SubShell>
  );
}

// ─── E. QR Add — Step 1: Camera Scan ────────────────────────
function QRAddScanScreen() {
  const [scanned, setScanned] = React.useState(false);

  // Auto-simulate scan after 2.5s for demo purposes
  React.useEffect(() => {
    const t = setTimeout(() => setScanned(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <PhoneShell dark>
      <style>{`
        @keyframes qradd-scan {
          0%   { top: 8%; opacity: 0; }
          8%   { opacity: 1; }
          88%  { top: 88%; opacity: 1; }
          95%  { opacity: 0; }
          100% { top: 88%; opacity: 0; }
        }
        @keyframes qradd-corner {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.4; }
        }
        @keyframes qradd-success-ring {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes qradd-check {
          0%   { stroke-dashoffset: 40; opacity: 0; }
          30%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes qradd-pulse {
          0%,100% { transform: scale(1); opacity: 0.15; }
          50%     { transform: scale(1.4); opacity: 0; }
        }
        .qradd-line { animation: qradd-scan 2.4s ease-in-out infinite; }
        .qradd-corner { animation: qradd-corner 1.2s ease-in-out infinite; }
        .qradd-ring { animation: qradd-success-ring 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .qradd-check-path { stroke-dasharray: 40; stroke-dashoffset: 40; animation: qradd-check 0.5s 0.3s ease-out forwards; }
        .qradd-pulse { animation: qradd-pulse 1.2s ease-out infinite; }
      `}</style>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0A0A0A' }}>

        {/* Nav */}
        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
              <path d="M8 1L2 7.5 8 14" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            戻る
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: -0.3 }}>コードをスキャン</div>
          <div style={{ width: 56 }}/>
        </div>

        {/* Instructions */}
        <div style={{ textAlign: 'center', padding: '16px 32px 0', fontSize: 14, color: scanned ? C.orange : 'rgba(255,255,255,0.45)', lineHeight: 1.5, fontWeight: scanned ? 700 : 400, transition: 'color 300ms' }}>
          {scanned ? 'スキャン成功！' : 'バーコードまたはQRコードを枠内に合わせてください'}
        </div>

        {/* Camera viewfinder */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }}/>

          <div style={{ position: 'relative', width: 220, height: 220, zIndex: 2 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}/>

            {/* Corner brackets — turn orange on success */}
            {[
              { top: 0, left: 0 },
              { top: 0, right: 0 },
              { bottom: 0, left: 0 },
              { bottom: 0, right: 0 },
            ].map((pos, i) => {
              const isTop = pos.top !== undefined;
              const isLeft = pos.left !== undefined;
              return (
                <div key={i} className={scanned ? undefined : 'qradd-corner'} style={{
                  position: 'absolute',
                  top: pos.top, bottom: pos.bottom,
                  left: pos.left, right: pos.right,
                  width: 28, height: 28,
                  borderTopWidth:    isTop    ? 3 : 0,
                  borderBottomWidth: !isTop   ? 3 : 0,
                  borderLeftWidth:   isLeft   ? 3 : 0,
                  borderRightWidth:  !isLeft  ? 3 : 0,
                  borderStyle: 'solid',
                  borderColor: scanned ? C.orange : C.orange,
                  borderTopLeftRadius:     (isTop && isLeft)   ? 6 : 0,
                  borderTopRightRadius:    (isTop && !isLeft)  ? 6 : 0,
                  borderBottomLeftRadius:  (!isTop && isLeft)  ? 6 : 0,
                  borderBottomRightRadius: (!isTop && !isLeft) ? 6 : 0,
                  transition: 'border-color 300ms',
                  opacity: scanned ? 1 : undefined,
                }}/>
              );
            })}

            {/* Scan line — hidden when scanned */}
            {!scanned && (
              <div className="qradd-line" style={{
                position: 'absolute', left: 6, right: 6, height: 2,
                background: C.orange,
                boxShadow: `0 0 14px ${C.orange}, 0 0 4px ${C.orange}`,
                borderRadius: 2,
              }}/>
            )}

            {/* Success overlay */}
            {scanned && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Pulse ring */}
                <div className="qradd-pulse" style={{
                  position: 'absolute',
                  width: 100, height: 100, borderRadius: '50%',
                  background: C.orange,
                }}/>
                {/* Success circle */}
                <div className="qradd-ring" style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: C.orange,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 24px ${C.orangeGlow}`,
                  position: 'relative',
                }}>
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <path className="qradd-check-path" d="M8 17l6.5 7 12-14" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom hint */}
        <div style={{ padding: '20px 24px 36px', textAlign: 'center' }}>
          {scanned ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 999,
              background: C.orange,
              boxShadow: `0 6px 18px ${C.orangeGlow}`,
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>次へ → 名前をつける</span>
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>市販品のバーコードでもOK</span>
            </div>
          )}
        </div>
      </div>
    </PhoneShell>
  );
}

// ─── F. QR Add — Step 2: Name & Save ────────────────────────
function QRAddNameScreen() {
  return (
    <SubShell title="名前をつける">
      {/* Scanned preview */}
      <div style={{ margin: '0 20px 20px', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 28, background: '#27A86220', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 3" stroke="#27A862" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#27A862' }}>スキャン成功</div>
        </div>
        {/* Mini QR */}
        <div style={{ width: 72, height: 72, borderRadius: 12, background: C.surfaceAlt, border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect x="2" y="2" width="16" height="16" rx="2.5" stroke={C.ink} strokeWidth="1.8"/>
            <rect x="34" y="2" width="16" height="16" rx="2.5" stroke={C.ink} strokeWidth="1.8"/>
            <rect x="2" y="34" width="16" height="16" rx="2.5" stroke={C.ink} strokeWidth="1.8"/>
            <rect x="5" y="5" width="10" height="10" rx="1.5" fill={C.ink}/>
            <rect x="37" y="5" width="10" height="10" rx="1.5" fill={C.ink}/>
            <rect x="5" y="37" width="10" height="10" rx="1.5" fill={C.ink}/>
            <rect x="34" y="34" width="6" height="6" rx="1" fill={C.ink}/>
            <rect x="42" y="34" width="6" height="6" rx="1" fill={C.ink}/>
            <rect x="34" y="42" width="6" height="6" rx="1" fill={C.ink}/>
            <rect x="24" y="2" width="4" height="4" rx="0.8" fill={C.ink}/>
            <rect x="24" y="8" width="4" height="4" rx="0.8" fill={C.ink}/>
            <rect x="2" y="24" width="4" height="4" rx="0.8" fill={C.ink}/>
            <rect x="8" y="24" width="4" height="4" rx="0.8" fill={C.ink}/>
          </svg>
        </div>
        <div style={{ fontSize: 11, color: C.ink3, fontFamily: 'ui-monospace,monospace', letterSpacing: 0.5 }}>QR · 認識済み</div>
      </div>

      {/* Name input */}
      <div style={{ margin: '0 20px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: C.ink3, textTransform: 'uppercase', marginBottom: 8 }}>名前</div>
        <div style={{
          height: 52, borderRadius: 14, background: C.surface,
          border: `2px solid ${C.orange}`,
          display: 'flex', alignItems: 'center', padding: '0 16px',
          fontSize: 16, color: C.ink, fontWeight: 500,
          gap: 8,
        }}>
          <span>冷蔵庫</span>
          <div style={{ width: 2, height: 20, background: C.orange, borderRadius: 1 }}/>
        </div>
      </div>

      {/* Location presets */}
      <div style={{ margin: '0 20px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: C.ink3, textTransform: 'uppercase', marginBottom: 8 }}>候補（タップで入力）</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['冷蔵庫', '洗面所', 'トイレ', '玄関', 'キッチン', 'リビング'].map((place, i) => (
            <div key={i} style={{
              padding: '7px 14px', borderRadius: 999,
              background: i === 0 ? C.orangeDim : C.surfaceAlt,
              border: `1px solid ${i === 0 ? C.orange : C.line}`,
              fontSize: 13, fontWeight: 600,
              color: i === 0 ? C.orange : C.ink2,
            }}>{place}</div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div style={{ margin: '0 20px' }}>
        <PillCTA glow>このコードを保存</PillCTA>
      </div>
    </SubShell>
  );
}

Object.assign(window, { HomeScreen, AlarmEditScreen, SettingsScreen, AppTabBar, Toggle, SubShell, SoundPickerScreen, RepeatScreen, SnoozeIntervalScreen, QRManageScreen, QRAddScanScreen, QRAddNameScreen });
