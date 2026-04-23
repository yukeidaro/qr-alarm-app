# 05 · Motion Spec

> Source: `_source/canvas.jsx` の `MotionSpec` カード + `_source/screens.jsx` の各 `@keyframes`

## グローバルなモーション設計

| Token | 値 | 用途 |
|---|---|---|
| `screen.slide` | spring · damping 20 · stiffness 180 | 画面間遷移 |
| `splash → value` | crossfade + scale 0.95→1.0 · 300ms | 起動 |
| `content.stagger` | 50ms between · 350ms each · ease-out | 要素のフェードイン |
| `cta.glow` | pulse · 1800ms · auto-reverse | Ready 画面の最終 CTA |
| `dots.active` | morph width · 200ms spring | ページネーションドット |
| `check.draw` | stroke path · 450ms · then burst particles | 成功チェック |

---

## トグルスイッチ

- Background-color: 200ms ease
- Knob position: 200ms ease (left/right)
- アラーム OFF 時のカード: opacity 1.0 → 0.45 (200ms)

---

## サウンドプレビュー

- 再生 ▶ ↔ 一時停止 ⏸ アイコン切替
- 別の曲を再生したら前の曲は停止 + UI 同期
- スライダーで音量調整（リアルタイム反映）

---

## QR スキャン

### スキャンライン (idle)
```css
@keyframes scan {
  0%   { top: 8%; opacity: 0; }
  8%   { opacity: 1; }
  88%  { top: 88%; opacity: 1; }
  95%  { opacity: 0; }
}
animation: 2.4s ease-in-out infinite;
```

### 成功時のリング展開
```css
@keyframes ring {
  0%   { transform: scale(0.6); opacity: 0; }
  60%  { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1.0); opacity: 1; }
}
animation: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
```

### チェック描画 (SVG)
```
stroke-dasharray: 40;
stroke-dashoffset: 40 → 0;
animation: 0.5s 0.3s ease-out forwards;
```

### パルスリング（成功後の継続）
- 外側に拡散して消える
- 1.2 秒ループ

---

## オンボーディング ValueProp1 (8 秒ループ)

| t | Scene | 動作 |
|---|---|---|
| 0–24% | Scene 1 | アラームシェイク (8% から左右 15deg 振動) |
| 24–40% | Scene 1 | 手スラップ (translateY -18→0→3, rotate -20→0→5) |
| 38–46% | Scene 1 | zzz フロート (opacity 0→1, translateY 4→-4) |
| 36–46% | Scene 1 | ✕ バッジ展開 (scale 0→1.15→1) |
| 50–62% | Scene 2 | 歩行 (translateX -30→90, leg swing 0.5s) |
| 50–60% | Scene 2 | QR appear (scale 0.8→1) |
| 64–80% | Scene 2 | scan flash (opacity 0→1→0.3→1→0) |
| 70–84% | Scene 2 | ✓ バッジ展開 (scale 0→1.15→1) |

詳細キーフレームは `_source/screens.jsx` L209-302 を参照。

---

## オンボーディング ValueProp2 (4 秒ループ)

```css
@keyframes sa-scanline {
  0%   { top: 10%; opacity: 0; }
  8%   { opacity: 1; }
  70%  { top: 90%; opacity: 1; }
  75%  { opacity: 0; }
}
@keyframes sa-check-appear {
  0%, 72% { opacity: 0; transform: scale(0.6); }
  78%     { opacity: 1; transform: scale(1.12); }
  85%     { transform: scale(1); }
  95%     { opacity: 1; transform: scale(1); }
  100%    { opacity: 0; }
}
@keyframes sa-ring {
  0%, 72% { opacity: 0; transform: scale(0.6); }
  78%     { opacity: 0.8; transform: scale(1); }
  100%    { opacity: 0; transform: scale(2.2); }
}
@keyframes sa-bracket-pulse {
  0%, 70%, 100% { border-color: #F85A3E; }
  78%, 90%      { border-color: #27A862; }
}
```

---

## React Native 実装上の注意

- `Animated.spring` で damping 20 / stiffness 180 を再現（`react-native-reanimated` 推奨）
- SVG の `stroke-dashoffset` 描画は `react-native-svg` + `Animated.Value` で実装
- CSS keyframes は **そのまま使えない** ので `Animated.loop()` + `withSequence()` で再構築する
- web 版（Expo Web）では CSS animation を直接利用可
