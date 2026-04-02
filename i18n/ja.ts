export const ja = {
  // Days
  days: ['日', '月', '火', '水', '木', '金', '土'],

  // Greetings (time-based)
  greetingMorning: 'おはようございます',
  greetingMorningName: (name: string) => `おはよう、${name}さん`,
  greetingAfternoon: 'こんにちは',
  greetingAfternoonName: (name: string) => `こんにちは、${name}さん`,
  greetingEvening: 'お疲れさまです',
  greetingEveningName: (name: string) => `お疲れさま、${name}さん`,
  greetingNight: 'こんばんは',
  greetingNightName: (name: string) => `こんばんは、${name}さん`,

  // Home
  home: {
    qrRegistered: '✓ QR',
    qrRegister: 'QR登録',
    alarms: 'アラーム',
    addAlarm: '+ 追加',
    emptyTitle: '最初のアラームを作成',
    emptyHint: 'タップして始めましょう',
  },

  // Onboarding (modal)
  onboarding: {
    title: 'QR / バーコードを登録',
    description: 'アラーム解除に使うQRコードまたはバーコードを登録してください。',
    registerNow: '今すぐ登録する',
    later: 'あとで',
  },

  // Onboarding flow
  onboardingFlow: {
    skip: 'スキップ',
    next: '次へ',
    start: 'はじめる',
    welcomeTitle: 'ScanAlarmへようこそ',
    welcomeSubtitle: 'ちゃんと起きるためのアラームアプリです。',
    nameLabel: 'ニックネーム',
    namePlaceholder: 'なんて呼びましょう？',
    permissionsTitle: '大事な設定',
    permissionsSubtitle: 'アラームを確実に鳴らすために必要です。',
    notificationTitle: '通知',
    notificationDesc: 'アラームを時間通りに鳴らすために必要です。',
    allow: '許可する',
    soundTipTitle: 'サウンドとバイブレーション',
    soundTipDesc: 'ScanAlarmはマナーモードでも鳴ります。就寝前に音量を上げておくと安心です。',
    openSettings: 'デバイス設定を開く',
    readyTitle: '準備完了！',
    readySubtitle: '使い方のヒントをどうぞ。',
    readySubtitleName: (name: string) => `${name}さん、使い方のヒントをどうぞ。`,
    tipQr: 'QRコードやバーコードを登録すると、スキャンしてアラームを解除できます。',
    tipSound: 'いろいろなアラーム音から好きなサウンドを選べます。',
    tipSnooze: 'スヌーズはアラームごとにオン/オフを設定できます。',
  },

  // Edit
  edit: {
    back: '← 戻る',
    newAlarm: '新規',
    editAlarm: '編集',
    repeat: '繰り返し',
    sound: 'サウンド',
    qrBarcode: 'QR / バーコード',
    qrRegistered: '登録済み',
    qrNotRegistered: '未登録',
    ringingBackground: '鳴動画面の背景',
    bgSet: '設定済み ›',
    bgDefault: 'デフォルト ›',
    bgReset: 'リセット',
    save: '保存',
    delete: '削除',
    deleteAlarmTitle: 'アラームを削除',
    deleteAlarmMessage: '本当に削除しますか？',
    cancel: 'キャンセル',
    close: '閉じる',
    snooze: 'スヌーズ',
    snoozeOffHint: '解除のみ',
    volume: '音量',
    fadeIn: '徐々に大きく',
    fadeInHint: '30秒かけて音量を上げる',
    oneTime: '一回限り',
  },

  // Toast messages
  toast: {
    saved: ['保存しました', 'セット完了', 'おやすみなさい'],
    deleted: '削除しました',
  },

  // Ringing
  ringing: {
    greeting: 'おはようございます',
    urgency: '起きてください',
    scanToDismiss: 'スキャンして解除',
    dismiss: '解除',
    snooze: 'スヌーズ（5分）',
    snoozeWithAd: '広告を見てスヌーズ',
    snoozeBadge: (count: number) => `スヌーズ ${count}回`,
    snoozeCount: (count: number, max: number) => `スヌーズ（5分） ${count}/${max}`,
    noQrHint: 'QR / バーコードを登録すると解除できます',
    adNotReady: '広告を読み込み中',
    adWait: 'しばらくお待ちください',
    adRequired: 'スヌーズできません',
    adRequiredMessage: '広告を最後まで視聴するとスヌーズできます',
  },

  // Scan
  scan: {
    registerPrompt: 'QR / バーコードをスキャン',
    dismissPrompt: 'スキャンして解除',
    registered: '登録完了',
    dismissed: '解除しました',
    mismatch: '一致しません',
    cameraChecking: 'カメラ権限を確認中...',
    cameraRequired: 'カメラへのアクセスが必要です',
    allowCamera: '許可する',
    countdown: (seconds: number) => `残り ${seconds}秒`,
    scannedNamePrompt: 'スキャン完了！名前をつけましょう。',
    nameTitle: 'コードに名前をつける',
    nameDesc: 'どのアラームにどのコードを使うかわかるように名前をつけましょう。',
    namePlaceholder: '例: 寝室の本、マグカップ...',
    save: '保存',
  },

  // Snooze
  snooze: {
    countBadge: (count: number) => `スヌーズ ${count}回目`,
    alarmInLabel: '後にアラームが鳴ります',
    alarmRinging: 'アラームが鳴っています！',
    alarmSoonLabel: 'まもなくアラームが鳴ります',
    scanToDismiss: 'スキャンして解除',
    registerQr: 'QRを登録して解除',
    hintQr: 'スキャンするとアラームを完全に解除できます',
    hintNoQr: 'QR / バーコードを登録するとアラームを解除できます',
  },

  // Dismiss celebration messages
  dismissMessages: {
    general: [
      'おはよう！いい一日にしよう。',
      'おはよう！今日もがんばろう。',
      'ちゃんと起きれた！えらい！',
      '朝だよ！今日も素敵な一日を。',
      'おはよう！いい朝だね。',
      '起きれたね！その調子！',
      '今日も一日、楽しんでいこう。',
      'おはよう！今日は何しよう？',
      'すっきり起きれたね！',
      'おはよう！コーヒーでも飲もう。',
      '新しい朝がきた！',
      'いい目覚めだね！今日も最高の一日に。',
      'おはよう！今日もよろしくね。',
      '朝に強くなってきたね！',
      'スヌーズなしで起きれた？すごい！',
      'おはよう！無理せずマイペースで。',
      '早起きは三文の徳。今日もいい日に。',
      'よく起きた！自分を褒めよう。',
      'おはよう！いいことありそうな予感。',
      '今日も最高の一日が始まるよ。',
    ],
    noSnooze: [
      'スヌーズなしで起きれた！すごい！',
      '一発で起きた！かっこいい！',
      'スヌーズゼロ。最高の朝だね。',
      '二度寝なし！自分を褒めよう。',
    ],
    snoozed: [
      '何回かかかったけど、起きれた！',
      'スヌーズと戦って勝った！',
      '遅くなったけど、起きたのが偉い！',
      '起きた！それが大事！',
    ],
    streak: (days: number) => [
      `${days}日連続で起きれたよ！すごい！`,
      `${days}連続！その調子でいこう！`,
      `${days}日目！いい習慣になってきたね。`,
    ],
  },

  // Notifications
  notification: {
    title: 'ScanAlarm',
    body: 'アラームを解除してください',
    snoozeTitle: 'ScanAlarm',
    snoozeBody: 'スヌーズ終了！',
    testTitle: 'ScanAlarm テスト',
    testBody: 'スキャンして解除！',
  },

  // Sound Browser
  soundBrowser: {
    title: 'サウンド',
    all: '全て',
    done: '完了',
    addCustom: 'サウンドを追加',
    customSection: 'マイサウンド',
    importSound: '取り込む',
    deleteCustom: 'サウンドを削除',
    deleteConfirm: 'このカスタムサウンドを削除しますか？',
    categories: {
      gentle: 'やさしい',
      nature: '自然',
      digital: 'デジタル',
      loud: '大音量',
    } as Record<string, string>,
  },

  // Sound labels
  sounds: {
    gentle: 'Gentle',
    digital: 'Digital',
    nature: 'Nature',
    urgent: 'Urgent',
  } as Record<string, string>,
} as const;
