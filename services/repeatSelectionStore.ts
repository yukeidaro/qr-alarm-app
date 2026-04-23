/**
 * 軽量ストア: /repeat 画面 → /edit 画面の繰り返し曜日選択結果受け渡し
 */

let pending: number[] | null = null;

export function setPendingRepeatDays(days: number[]): void {
  pending = [...days].sort();
}

export function getPendingRepeatDays(): number[] | null {
  return pending;
}

export function clearPendingRepeatDays(): void {
  pending = null;
}
