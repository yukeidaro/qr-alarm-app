/**
 * QR Alarm App — スペーシング & レイアウト定数
 * 8ptグリッドベースのスペーシングシステム。
 */

// ─── スペーシングスケール (8pt grid) ───
export const SPACING = {
  /** 2px */
  xxs: 2,
  /** 4px */
  xs: 4,
  /** 6px */
  s: 6,
  /** 8px */
  sm: 8,
  /** 10px */
  md: 10,
  /** 12px */
  base: 12,
  /** 16px */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px */
  xxl: 24,
  /** 28px */
  xxxl: 28,
  /** 32px */
  '4xl': 32,
  /** 40px */
  '5xl': 40,
  /** 48px */
  '6xl': 48,
  /** 60px */
  '7xl': 60,
  /** 64px */
  '8xl': 64,
  /** 80px */
  '9xl': 80,
  /** 120px */
  '10xl': 120,
} as const;

// ─── 画面共通パディング ───
export const SCREEN_PADDING = {
  horizontal: SPACING['5xl'],  // 40px — メインコンテンツ左右
  top: SPACING['8xl'],         // 64px — ヘッダー上部
  bottom: SPACING['9xl'],      // 80px — フッター余白
} as const;

// ─── ボーダーラジウス ───
export const RADIUS = {
  /** 完全な丸 (pill) */
  full: 9999,
  /** 32px — モーダル、スキャンフレーム */
  xl: 32,
  /** 28px — FAB */
  lg: 28,
  /** 20px — 曜日ボタン */
  md: 20,
  /** 16px — サウンドアイテム */
  base: 16,
  /** 12px — スヌーズバナー */
  sm: 12,
} as const;

// ─── サイズ定数 ───
export const SIZE = {
  /** 280px — スキャンフレーム */
  scanFrame: 280,
  /** 56px — FAB */
  fab: 56,
  /** 44px — 閉じるボタン */
  closeButton: 44,
  /** 40px — 曜日ボタン */
  dayButton: 40,
  /** スキャンフレームのボーダー幅 */
  scanBorderWidth: 2,
} as const;

// ─── アニメーション定数 ───
export const ANIMATION = {
  duration: {
    /** 200ms — カーソル点滅 */
    fast: 200,
    /** 300ms — トーストフェードイン */
    normal: 300,
    /** 350ms — カード出現（Video参照） */
    cardAppear: 350,
    /** 400ms — トーストフェードアウト */
    slow: 400,
    /** 450ms — テーマ切替トランジション */
    themeTransition: 450,
    /** 1000ms — パルス（緊急） */
    pulseUrgent: 1000,
    /** 1500ms — パルス（警告） */
    pulseWarning: 1500,
    /** 1500ms — トースト表示、エラー表示 */
    display: 1500,
    /** 2000ms — パルス（通常）、サウンドプレビュー */
    pulseNormal: 2000,
    /** 2400ms — ドットマトリクス明滅 */
    dotPulse: 2400,
  },
  /** タイピングアニメーション速度 (ms/文字) */
  typingSpeed: {
    default: 80,
    fast: 60,
  },
  /** タイピングアニメーション開始遅延 (ms) */
  typingDelay: {
    default: 300,
    long: 400,
  },
  /** パルスアニメーションのスケール値 */
  pulseScale: {
    normal: 1.02,
    warning: 1.03,
    urgent: 1.04,
  },
  /** Spring animation constants — Video参照のふわっとした動き */
  spring: {
    damping: 0.7,
    stiffness: 300,
    friction: 8,   // RN Animated.spring の friction
    tension: 60,   // RN Animated.spring の tension
  },
} as const;

// ─── インタラクション ───
export const ACTIVE_OPACITY = {
  default: 0.7,
  soft: 0.8,
  dimmed: 0.3,
} as const;

// ─── タイマー定数 ───
export const TIMER = {
  /** 5分（ms） — スヌーズ間隔 */
  snoozeDuration: 5 * 60 * 1000,
  /** 20秒 — スキャン画面自動消去 */
  dismissTimeout: 20,
  /** 15秒 — 広告カウントダウン */
  adDuration: 15,
  /** 10秒（ms） — スヌーズ確認インターバル */
  snoozeCheckInterval: 10000,
} as const;
