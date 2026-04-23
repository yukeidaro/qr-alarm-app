/**
 * 軽量ストア: qr-manage.tsx → edit.tsx のQR選択結果受け渡し
 */

let pendingQR: { id: string; name: string; data: string } | null = null;

export function setPendingQR(qr: { id: string; name: string; data: string }): void {
  pendingQR = qr;
}

export function getPendingQR(): { id: string; name: string; data: string } | null {
  return pendingQR;
}

export function clearPendingQR(): void {
  pendingQR = null;
}
