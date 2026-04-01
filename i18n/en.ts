export const en = {
  // Days
  days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

  // Greetings (time-based)
  greetingMorning: 'Good morning',
  greetingMorningName: (name: string) => `Good morning, ${name}`,
  greetingAfternoon: 'Good afternoon',
  greetingAfternoonName: (name: string) => `Good afternoon, ${name}`,
  greetingEvening: 'Good evening',
  greetingEveningName: (name: string) => `Good evening, ${name}`,
  greetingNight: 'Good evening',
  greetingNightName: (name: string) => `Good evening, ${name}`,

  // Home
  home: {
    qrRegistered: '✓ QR',
    qrRegister: 'QR Setup',
    alarms: 'Alarms',
    addAlarm: '+ Add',
    emptyTitle: 'Create your first alarm',
    emptyHint: 'Tap to get started',
  },

  // Onboarding (modal)
  onboarding: {
    title: 'Register QR / Barcode',
    description: 'Register a QR code or barcode to dismiss your alarm.',
    registerNow: 'Register now',
    later: 'Later',
  },

  // Onboarding flow
  onboardingFlow: {
    skip: 'Skip',
    next: 'Next',
    start: 'Get started',
    // Welcome
    welcomeTitle: 'Welcome to ScanAlarm',
    welcomeSubtitle: 'An alarm that makes sure you actually get up.',
    nameLabel: 'Nickname',
    namePlaceholder: 'What should we call you?',
    // Permissions
    permissionsTitle: 'Important settings',
    permissionsSubtitle: 'So your alarm rings reliably, every time.',
    notificationTitle: 'Notifications',
    notificationDesc: 'Required for alarm to sound on time.',
    allow: 'Allow',
    soundTipTitle: 'Sound & vibration',
    soundTipDesc: 'ScanAlarm plays through silent mode. For best results, keep your phone volume up before bed.',
    openSettings: 'Open device settings',
    // Ready
    readyTitle: 'All set!',
    readySubtitle: 'Here are some tips to get started.',
    readySubtitleName: (name: string) => `${name}, here are some tips to get started.`,
    tipQr: 'Register a QR code or barcode — scan it to dismiss the alarm.',
    tipSound: 'Choose your alarm sound from a variety of tones.',
    tipSnooze: 'Snooze can be turned on or off per alarm.',
  },

  // Edit
  edit: {
    back: '← Back',
    newAlarm: 'New',
    editAlarm: 'Edit',
    repeat: 'Repeat',
    sound: 'Sound',
    qrBarcode: 'QR / Barcode',
    qrRegistered: 'Registered',
    qrNotRegistered: 'Not set',
    ringingBackground: 'Alarm background',
    bgSet: 'Set ›',
    bgDefault: 'Default ›',
    bgReset: 'Reset',
    save: 'Save',
    delete: 'Delete',
    deleteAlarmTitle: 'Delete alarm',
    deleteAlarmMessage: 'Are you sure?',
    cancel: 'Cancel',
    close: 'Close',
    snooze: 'Snooze',
    snoozeOffHint: 'Dismiss only',
    oneTime: 'One-time',
  },

  // Toast messages
  toast: {
    saved: ['Saved', 'All set', 'Good night'],
    deleted: 'Deleted',
  },

  // Ringing
  ringing: {
    greeting: 'Good morning',
    urgency: 'Time to wake up',
    scanToDismiss: 'Scan to dismiss',
    dismiss: 'Dismiss',
    snooze: 'Snooze (5 min)',
    snoozeWithAd: 'Watch ad to snooze',
    snoozeBadge: (count: number) => `Snoozed ${count}x`,
    snoozeCount: (count: number, max: number) => `Snooze (5 min) ${count}/${max}`,
    noQrHint: 'Register a QR / barcode to dismiss',
    adNotReady: 'Loading ad',
    adWait: 'Please wait a moment',
    adRequired: 'Cannot snooze',
    adRequiredMessage: 'Watch the full ad to snooze',
  },

  // Scan
  scan: {
    registerPrompt: 'Scan QR / barcode',
    dismissPrompt: 'Scan to dismiss',
    registered: 'Registered',
    dismissed: 'Dismissed',
    mismatch: 'No match',
    cameraChecking: 'Checking camera permission...',
    cameraRequired: 'Camera access is required',
    allowCamera: 'Allow',
    countdown: (seconds: number) => `${seconds}s remaining`,
    scannedNamePrompt: 'Scanned! Give it a name.',
    nameTitle: 'Name this code',
    nameDesc: 'Give it a name so you know which code to scan for each alarm.',
    namePlaceholder: 'e.g. Bedroom book, Mug...',
    save: 'Save',
  },

  // Snooze
  snooze: {
    countBadge: (count: number) => `Snooze #${count}`,
    alarmInLabel: 'until alarm rings',
    alarmRinging: 'Alarm ringing!',
    alarmSoonLabel: 'Alarm ringing soon',
    scanToDismiss: 'Scan to dismiss',
    registerQr: 'Register QR to dismiss',
    hintQr: 'Scan to fully dismiss the alarm',
    hintNoQr: 'Register a QR / barcode to dismiss',
  },

  // Dismiss celebration messages
  dismissMessages: {
    general: [
      'Good morning! Have a great day.',
      'Rise and shine!',
      'You did it! Time to start the day.',
      'Another morning conquered.',
      'Up and at it! Today is yours.',
      'Morning! The world is waiting.',
      'Well done! Make today count.',
      'Bright-eyed and ready to go!',
      'Good morning! You got this.',
      'A new day, a fresh start.',
      'Morning! Something good is coming.',
      'You woke up! That is step one.',
      'Hello, morning person!',
      'Great start! Keep it going.',
      'Up before the snooze? Impressive.',
      'Good morning! Stay awesome.',
      'The early bird wins. That is you.',
      'Day unlocked. Go make it count.',
      'You are on a roll. Keep it up!',
      'Another day, another chance.',
    ],
    streak: (days: number) => [
      `${days} days in a row! Keep it up!`,
      `${days}-day streak! You are unstoppable.`,
      `Day ${days}! Building a great habit.`,
    ],
  },

  // Notifications
  notification: {
    title: 'ScanAlarm',
    body: 'Dismiss your alarm',
    snoozeTitle: 'ScanAlarm',
    snoozeBody: 'Snooze ended!',
    testTitle: 'ScanAlarm Test',
    testBody: 'Scan to dismiss!',
  },

  // Sound Browser
  soundBrowser: {
    title: 'Sound',
    all: 'All',
    done: 'Done',
    addCustom: 'Add Sound',
    customSection: 'My Sounds',
    importSound: 'Import',
    deleteCustom: 'Delete sound',
    deleteConfirm: 'Delete this custom sound?',
    categories: {
      gentle: 'Gentle',
      nature: 'Nature',
      digital: 'Digital',
      loud: 'Loud',
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
