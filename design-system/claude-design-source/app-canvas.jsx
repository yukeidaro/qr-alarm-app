// ScanAlarm App Screens — canvas layout

const AC = {
  bg: '#ECECEE',
  ink: '#18181B',
  ink2: '#52525B',
  ink3: '#8A8A92',
  line: '#D4D4D8',
  orange: '#F85A3E',
  surface: '#FFFFFF',
};

function AppScreenCard({ index, title, badge, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
        <div style={{
          fontFamily: 'ui-monospace,"SF Mono",Menlo,monospace',
          fontSize: 11, fontWeight: 600, color: AC.orange, letterSpacing: 1,
        }}>{String(index).padStart(2,'0')}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: AC.ink, letterSpacing: -0.2 }}>{title}</div>
        {badge && (
          <div style={{
            padding: '3px 8px', borderRadius: 999,
            background: AC.surface, border: `1px solid ${AC.line}`,
            fontSize: 10, color: AC.ink3,
            fontFamily: 'ui-monospace,"SF Mono",Menlo,monospace',
          }}>{badge}</div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function FlowConnector({ label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 6, alignSelf: 'center',
    }}>
      <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
        <path d="M0 6h26" stroke={AC.orange} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M24 2l5 4-5 4" stroke={AC.orange} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label && (
        <div style={{
          fontFamily: 'ui-monospace,"SF Mono",Menlo,monospace',
          fontSize: 9, color: AC.ink3, letterSpacing: 0.3, whiteSpace: 'nowrap',
        }}>{label}</div>
      )}
    </div>
  );
}

function ScanAlarmAppCanvas() {
  const row1 = [
    { title: 'ホーム', badge: 'tab · アラーム', c: <HomeScreen/> },
    { title: 'アラーム編集', badge: 'push', c: <FirstAlarmScreen/> },
    { title: '設定', badge: 'tab · 設定', c: <SettingsScreen/> },
  ];

  const row2 = [
    { title: 'サウンド選択', badge: 'from 編集', c: <SoundPickerScreen/> },
    { title: '繰り返し設定', badge: 'from 編集', c: <RepeatScreen/> },
    { title: 'スヌーズ間隔', badge: 'from 設定', c: <SnoozeIntervalScreen/> },
    { title: 'QR・バーコード管理', badge: 'from 設定 · QR設定', c: <QRManageScreen/> },
    { title: 'コード追加 · スキャン', badge: 'from コード管理', c: <QRAddScanScreen/> },
    { title: 'コード追加 · 名前付け', badge: 'after scan', c: <QRAddNameScreen/> },
  ];

  const ScreenRow = ({ screens, startIndex }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
      {screens.map((s, i) => (
        <React.Fragment key={i}>
          <AppScreenCard index={startIndex + i} title={s.title} badge={s.badge}>
            {s.c}
          </AppScreenCard>
          {i < screens.length - 1 && (
            <div style={{ paddingTop: 380, paddingLeft: 28, paddingRight: 28 }}>
              <FlowConnector/>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={{
      background: AC.bg, minHeight: '100vh',
      padding: '60px 60px 80px',
      fontFamily: '"Inter",-apple-system,system-ui,sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Title block */}
      <div style={{ marginBottom: 52, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div style={{
            fontFamily: 'ui-monospace,"SF Mono",Menlo,monospace',
            fontSize: 11, fontWeight: 600, color: AC.orange,
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10,
          }}>ScanAlarm · App Screens</div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.1, color: AC.ink }}>
            ホーム・編集・設定
          </div>
          <div style={{ fontSize: 16, color: AC.ink2, marginTop: 10, lineHeight: 1.55, maxWidth: 560 }}>
            メイン3画面 + 各設定の詳細画面。
          </div>
        </div>
        <div style={{
          fontFamily: 'ui-monospace,"SF Mono",Menlo,monospace',
          fontSize: 11, color: AC.ink3, letterSpacing: 0.5,
          display: 'flex', gap: 12,
        }}>
          <div>v1 · 26.04</div>
          <div style={{ width: 1, background: AC.line }}/>
          <div>9 screens</div>
        </div>
      </div>

      {/* Row 1: Main screens */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontFamily: 'ui-monospace,"SF Mono",Menlo,monospace',
          fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: AC.ink3,
          textTransform: 'uppercase', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 20, height: 1.5, background: AC.orange }}/>
          メイン画面
        </div>
        <ScreenRow screens={row1} startIndex={1}/>
      </div>

      {/* Divider */}
      <div style={{ margin: '56px 0 48px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, height: 1, background: AC.line }}/>
        <div style={{
          fontFamily: 'ui-monospace,"SF Mono",Menlo,monospace',
          fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: AC.ink3,
          textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 20, height: 1.5, background: AC.orange }}/>
          詳細設定画面
        </div>
        <div style={{ flex: 1, height: 1, background: AC.line }}/>
      </div>

      {/* Row 2: Detail screens */}
      <ScreenRow screens={row2} startIndex={4}/>

      {/* Footer */}
      <div style={{
        marginTop: 72, paddingTop: 24, borderTop: `1px solid ${AC.line}`,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'ui-monospace,"SF Mono",Menlo,monospace',
        fontSize: 11, color: AC.ink3, letterSpacing: 0.5,
      }}>
        <div>ScanAlarm · app screens v1</div>
        <div>iPhone · 390×844 · scaled 340×736</div>
      </div>
    </div>
  );
}

Object.assign(window, { ScanAlarmAppCanvas });
