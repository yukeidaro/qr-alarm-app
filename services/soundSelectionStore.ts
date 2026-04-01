/**
 * 軽量ストア: sounds.tsx → edit.tsx のサウンド選択結果受け渡し
 */

let pendingSound: string | null = null;

export function setPendingSound(soundId: string): void {
  pendingSound = soundId;
}

export function getPendingSound(): string | null {
  return pendingSound;
}

export function clearPendingSound(): void {
  pendingSound = null;
}
