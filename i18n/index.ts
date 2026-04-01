/**
 * ScanAlarm — 多言語対応（i18n）
 * デバイスの言語設定に基づき翻訳を提供。
 * 対応言語: ja（日本語）, en（英語）
 * 未対応言語はenにフォールバック。
 */
import { getLocales } from 'expo-localization';
import { ja } from './ja';
import { en } from './en';
import { ko } from './ko';
import { es } from './es';

export type Translations = typeof ja;

const translations: Record<string, Translations> = {
  ja,
  en: en as unknown as Translations,
  ko: ko as unknown as Translations,
  es: es as unknown as Translations,
};

function getDeviceLanguage(): string {
  const locales = getLocales();
  const lang = locales[0]?.languageCode ?? 'en';
  return lang;
}

const deviceLang = getDeviceLanguage();
const t: Translations = translations[deviceLang] ?? translations.en;

export { t, deviceLang };

// Day names based on locale
export function getDayNames(): string[] {
  return [...t.days];
}

// Date format based on locale
export function formatDate(month: number, day: number, dow: string): string {
  if (deviceLang === 'ja') return `${month}月${day}日（${dow}）`;
  if (deviceLang === 'ko') return `${month}월 ${day}일 (${dow})`;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const names = deviceLang === 'es' ? monthNamesEs : monthNames;
  return `${names[month - 1]} ${day} (${dow})`;
}

export function formatNextAlarm(hours: number, minutes: number): string {
  switch (deviceLang) {
    case 'ja':
      return hours === 0 ? `${minutes}分後` : `${hours}時間${minutes}分後`;
    case 'ko':
      return hours === 0 ? `${minutes}분 후` : `${hours}시간 ${minutes}분 후`;
    case 'es':
      return hours === 0 ? `en ${minutes} min` : `en ${hours}h ${minutes}min`;
    default:
      return hours === 0 ? `in ${minutes}min` : `in ${hours}h ${minutes}min`;
  }
}

export function formatSnoozeBanner(mins: number): string {
  switch (deviceLang) {
    case 'ja': return `スヌーズ中 — あと${mins}分`;
    case 'ko': return `스누즈 중 — ${mins}분 남음`;
    case 'es': return `Repetición — ${mins}min restantes`;
    default:   return `Snoozing — ${mins}min left`;
  }
}

// Countdown remaining
export function formatCountdownLabel(seconds: number): string {
  if (seconds > 0) return t.snooze.alarmInLabel;
  return t.snooze.alarmSoonLabel;
}
