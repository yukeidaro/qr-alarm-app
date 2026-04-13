# ScanAlarm 次回アップデート改善項目

**作成日**: 2026-04-10
**ステータス**: 未着手

---

## 1. QRコード登録画面に戻るボタンを追加

**問題**: QRコード登録画面に遷移すると、戻るボタンがないため前の画面に戻れない。

**対応**: 画面上部に戻るボタン（Back / 戻る）を配置する。

---

## 2. QRコード管理機能の追加 → 設定画面内に配置

**問題**: 登録済みQRコードの一覧表示・削除ができず、QRコードの管理ができない。

**対応**: **項目4の設定画面内**にQRコード管理セクションを設ける
- 設定画面に「QRコード管理」メニューを配置し、タップで管理画面へ遷移
- 管理画面の内容:
  - **登録済みQRコードの一覧を表示**する
  - 各QRコードに**削除ボタン**を付ける（不要なものを削除可能に）
  - 新規追加は**「追加」ボタン**を経由してからスキャン画面に遷移する
  - フロー: 一覧表示 → 削除 or 追加ボタン → 追加ならスキャン画面へ

---

## 3. アラームスワイプ削除ボタンの色を濃い赤に変更

**問題**: アラーム一覧で左スワイプ時に表示されるDeleteボタンの背景色が薄すぎて視認性が悪い。

**現状の色**: `ERROR_BG = '#FEE8E8'`（薄いピンク） -- `constants/colors.ts` L38
**適用箇所**: `components/AlarmCard.tsx` L208 `deleteAction.backgroundColor`

**対応**:
- `constants/colors.ts` の `ERROR_BG` を濃い赤に変更する
- 推奨カラーコード: **`#DC2626`**（Tailwind red-600相当、しっかり赤く見える）
- テキスト色 `TEXT_CONTRAST` は白(`#FFFFFF`)のままでOK
- **注意**: `ERROR_BG` は `Button.tsx` の danger スタイルでも使われている。影響範囲を確認すること
  - 必要なら Delete スワイプ専用の色定数（例: `DELETE_ACTION_BG = '#DC2626'`）を新設して分離する

---

## 4. 下部タブバー（ボトムナビゲーション）の追加

**問題**: 現在はStack navigationのみで、設定画面への導線がない。初期設定の変更やテーマ切替ができない。

**現状**: `app/_layout.tsx` で `Stack` ナビゲーションのみ使用中。タブ構造なし。

**対応**:
- Expo Router の **Tab Layout** を導入し、下部に2つのタブを配置する
- 構成:
  - **「アラーム」タブ** -- 現在のアラーム一覧画面（`index.tsx`）をそのまま配置
  - **「設定」タブ** -- 新規作成する設定画面

### 設定画面に含める項目

1. **初期設定の変更**
   - オンボーディング（`onboarding.tsx`）で設定した内容を後から変更可能にする
   - 例: デフォルトのスヌーズ時間、QRコードの必須/任意、アラーム音の選択など

2. **QRコード管理**（項目2参照）
   - 設定画面から「QRコード管理」をタップ → 登録済み一覧 → 削除/追加

3. **テーマ切替（ダークモード対応）**
   - ライトモード / ダークモード の切替トグルを設置
   - `constants/colors.ts` にダークモード用カラーセットを追加
   - `React.createContext` または `useColorScheme` でテーマをアプリ全体に反映
   - ユーザーの選択は `AsyncStorage` に永続化する

### 実装方針（参考）
- `app/(tabs)/_layout.tsx` を新設してタブ構造を定義
- `app/(tabs)/index.tsx` -- アラーム一覧（既存の `index.tsx` を移動）
- `app/(tabs)/settings.tsx` -- 設定画面（新規作成）
- `ringing.tsx`, `snooze.tsx`, `scan.tsx` 等はタブ外の Stack Screen として維持

---

## 5. QR/Barcode セクションからQRコード管理画面への導線を追加

**問題**: アラーム編集画面（`edit.tsx`）のQR/Barcodeセクションに「Scan QR / barcode」というテキストがあるが、ここから既存のQRコードを管理する手段がない。

**対応**:
- 「Scan QR / barcode」のテキスト・エリアを **「QRコード管理」への導線** に変更する
- タップすると QR Management 画面へ遷移（登録済み一覧の表示、削除、新規追加）
- ラベル例: 「Manage QR / Barcode」（i18n対応）
- 設定画面（項目4）からの導線と合わせて **2箇所からQR管理にアクセス可能** にする

---

## 6. ダークモードの全画面適用（Apple HIG準拠）

**問題**: ダークモードのトグルは入れたが、一部の画面にしか反映されておらず全体が切り替わっていない。

**対応**: Apple Human Interface Guidelines のダークモード仕様に準拠し、**全画面に一貫して適用**する

### Apple HIG ダークモードの原則
- **背景色**: System Background（`#000000`）、Secondary（`#1C1C1E`）、Tertiary（`#2C2C2E`）の階層を使う
- **テキスト色**: Primary（`#FFFFFF`）、Secondary（`#EBEBF5` 60%）、Tertiary（`#EBEBF5` 30%）
- **セパレータ**: `#38383A`
- **カード / Elevated surfaces**: 背景より1段明るい色を使用（`#1C1C1E` → `#2C2C2E`）
- **アクセントカラー**: ライト/ダーク両方で視認性を担保する（彩度・明度を調整）
- **Semantic Colors を使う**: `constants/colors.ts` に `lightTheme` / `darkTheme` オブジェクトを定義し、全コンポーネントがテーマ経由で色を取得する

### 適用対象（全画面チェックリスト）
- [ ] `index.tsx` -- アラーム一覧
- [ ] `edit.tsx` -- アラーム編集
- [ ] `scan.tsx` -- QRスキャン
- [ ] `ringing.tsx` -- アラーム鳴動
- [ ] `snooze.tsx` -- スヌーズ
- [ ] `sounds.tsx` -- サウンド選択
- [ ] `onboarding.tsx` -- オンボーディング
- [ ] 設定画面（新規） -- 項目4で作成
- [ ] QR管理画面（新規） -- 項目2で作成
- [ ] 全共通コンポーネント（`AlarmCard.tsx`, `Button.tsx` 等）
- [ ] ステータスバー、ナビゲーションバー、タブバーの色

---

## 7. サウンド選択画面のラジオボタン（トグル）の改善

**問題**: サウンド選択画面でサウンドの横にあるラジオボタン（選択インジケータ）が小さく潰れて見え、目立たない。

**現状** (`app/sounds.tsx`):
- ラジオ外円: `width: 22, height: 22`（小さい）
- 内側ドット: `width: 12, height: 12`
- 非選択時ボーダー色: `BG_TERTIARY`（背景に溶け込んで目立たない）
- 選択時ボーダー色: `ACCENT_PRIMARY`

**対応**:
1. **サイズを大きくして潰れを解消**
   - 外円: `width: 28, height: 28`（+6px）
   - 内側ドット: `width: 16, height: 16`（+4px）
   - `marginRight` も適宜調整して行全体のバランスを保つ

2. **色を変えて目立たせる**
   - 非選択時ボーダー: `BG_TERTIARY` → **`#9CA3AF`**（グレー400、はっきり見える）
   - 選択時: `ACCENT_PRIMARY` のまま（アクセントカラーで十分目立つ）
   - 選択時の外円に `backgroundColor` を薄く入れて存在感を出すのもあり（例: `ACCENT_PRIMARY` の10%透過）

3. **選択行をiOS風グラスモーフィズム（すりガラス）デザインにする**

   現状: `soundRowActive` は `borderWidth: 1, borderColor: ACCENT_PRIMARY`（ゴールド `#E8A838`）のみ → 地味

   **グラスモーフィズムの実装方針:**
   - `expo-blur` の `BlurView` を使って選択行の背景にすりガラス効果を入れる
   - または React Native で再現する場合:
     ```
     soundRowActive: {
       backgroundColor: 'rgba(232, 168, 56, 0.08)',  // ACCENT_PRIMARY 8%透過
       borderWidth: 1.5,
       borderColor: 'rgba(232, 168, 56, 0.4)',        // ゴールド 40%透過
       shadowColor: '#E8A838',
       shadowOffset: { width: 0, height: 0 },
       shadowOpacity: 0.15,
       shadowRadius: 8,
       elevation: 2,
     }
     ```
   - **ポイント**:
     - ボーダーは半透明にして「光っている」感じを出す
     - 背景にアクセントカラーの薄い透過を入れて浮遊感を出す
     - `shadowRadius` で柔らかいグロー（発光）を追加
     - iOS 16+ の素材感（Material）に近い仕上がりを目指す
   - **非選択行との差**: 非選択行は `BG_SECONDARY`（白 `#FFFFFF`）のソリッド背景のまま維持し、選択行だけがガラス質に変わることでコントラストを出す
   - **注**: 項目8のLiquid Glassガイドライン策定後、このセクションの具体値はガイドラインに統合される

---

## 8. Apple Liquid Glass デザインシステム準拠のブランドガイドライン再構築

**背景**: iOS 26（WWDC 2025）で導入された「Liquid Glass」デザインシステムに合わせ、ScanAlarm全体のデザイン言語を再定義する。単なる部分修正ではなく、ブランドガイドラインごと作り直す。

**参考ドキュメント**:
- https://developer.apple.com/documentation/technologyoverviews/liquid-glass
- https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass

### Liquid Glass の3原則（ScanAlarmへの適用）

| 原則 | 意味 | ScanAlarmでの適用 |
|------|------|-------------------|
| **Translucency（半透明）** | 背景が透けて見えるすりガラス質 | カード、ナビバー、タブバー、モーダルに適用 |
| **Adaptive Fluidity（適応的流動性）** | 状態・ジェスチャー・テーマで表面が変化 | 選択状態、ダーク/ライト切替、スワイプ操作 |
| **Hierarchy（階層）** | 重要な要素ほどリッチな質感 | プライマリボタンはグラス質、セカンダリは控えめ |

### React Native / Expo での実装ライブラリ

以下の優先順位で採用を検討:

1. **`expo-liquid-glass-view`** -- Expo ネイティブモジュール。`npx expo install` で導入可能
   ```jsx
   import { ExpoLiquidGlassView, LiquidGlassType } from 'expo-liquid-glass-view';
   <ExpoLiquidGlassView type={LiquidGlassType.Regular} style={{ borderRadius: 16 }}>
     {children}
   </ExpoLiquidGlassView>
   ```

2. **`@callstack/liquid-glass`** -- Callstack製。colorScheme / tintColor 対応
   ```jsx
   import { LiquidGlassView } from '@callstack/liquid-glass';
   <LiquidGlassView tintColor="#E8A838" colorScheme="light">
     {children}
   </LiquidGlassView>
   ```

3. **`expo-blur` (BlurView)** -- iOS 26未満でのフォールバック用

### カラートークン再定義（`constants/colors.ts` の改修）

現在のウォームベージュ基調（`#F5F0EB` / `#E8A838`）はそのまま維持しつつ、Liquid Glass用トークンを追加:

#### Glass Surface トークン（新設）

```typescript
// ─── Glass Surface（Liquid Glass 用） ───
export const GLASS = {
  light: {
    surface1: 'rgba(255, 255, 255, 0.60)',     // メインカード（すりガラス白）
    surface2: 'rgba(255, 255, 255, 0.40)',     // セカンダリ（より透ける）
    tint: 'rgba(232, 168, 56, 0.08)',          // アクセントティント
    border: 'rgba(255, 255, 255, 0.50)',       // ガラス境界線
    borderActive: 'rgba(232, 168, 56, 0.40)',  // 選択状態の境界線
    shadow: 'rgba(0, 0, 0, 0.08)',             // ソフトシャドウ
    shadowAccent: 'rgba(232, 168, 56, 0.15)',  // アクセントグロー
  },
  dark: {
    surface1: 'rgba(40, 38, 36, 0.70)',        // ダークガラス
    surface2: 'rgba(40, 38, 36, 0.50)',
    tint: 'rgba(232, 168, 56, 0.12)',
    border: 'rgba(255, 255, 255, 0.10)',
    borderActive: 'rgba(232, 168, 56, 0.50)',
    shadow: 'rgba(0, 0, 0, 0.30)',
    shadowAccent: 'rgba(232, 168, 56, 0.25)',
  },
} as const;
```

#### 既存トークンとの関係
- `BG_SECONDARY`（カード背景）→ Glass `surface1` に置き換え
- `BG_ELEVATED`（モーダル等）→ Glass `surface2` + blur
- `OVERLAY` オブジェクト → `GLASS` オブジェクトに統合 or 共存

### 適用箇所マトリクス

| コンポーネント | 現状 | Liquid Glass 化 |
|---------------|------|-----------------|
| **ナビゲーションバー** | ソリッド背景 | `surface1` + blur + `border` |
| **タブバー**（項目4で新設） | -- | `surface1` + blur |
| **AlarmCard** | `BG_SECONDARY` 白 | `surface1` + 半透明 + soft shadow |
| **選択行（サウンド等）** | `borderColor: ACCENT_PRIMARY` | `surface1` + `borderActive` + accent glow |
| **モーダル / シート** | `BG_MODAL` 白 | `surface2` + blur 強め |
| **ボタン（primary）** | ソリッド `ACCENT_PRIMARY` | グラス質 + グロー（ただし可読性最優先） |
| **ボタン（secondary）** | 控えめ | `surface2` + `border` |
| **Ringing画面** | `BG_URGENCY_1/2` | ソリッド維持（緊急時は視認性優先、グラス不使用） |

### ダーク/ライト共通デザインルール

1. **blur intensity**: ライトモード `20`、ダークモード `30`（暗い方が強めに）
2. **border-width**: 常に `0.5〜1px`。太くしない（ガラスの繊細さを保つ）
3. **border-radius**: `16px`（カード）、`12px`（ボタン）、`24px`（pill/capsule）
4. **shadow**: `shadowRadius: 8〜12`、`shadowOpacity: 0.08〜0.15`（控えめに）
5. **アクセントカラー `#E8A838`（ゴールド）は維持** -- ScanAlarmのブランドアイデンティティ
6. **フォント**: SF Pro（現行維持）-- Liquid Glass はタイポグラフィも太めを推奨

### アクセシビリティ対応

- **Reduce Transparency** 有効時: ガラス効果オフ → ソリッド背景フォールバック
- **Reduce Motion** 有効時: パララックス・アニメーション無効化
- **コントラスト比**: 半透明背景上のテキストは常に WCAG AA (4.5:1) 以上
- **Android**: ガラス効果非対応の場合、半透明ソリッド背景 + 微shadow でフォールバック

### 実装順序（推奨）

1. `constants/colors.ts` に `GLASS` トークン追加
2. `GlassCard` 共通コンポーネント作成（`expo-liquid-glass-view` or `expo-blur` ラップ）
3. ナビバー・タブバーにグラス適用
4. `AlarmCard` をグラスカードに移行
5. サウンド選択行の選択状態をグラス化（項目7と統合）
6. モーダル・シートのグラス化
7. ダークモード全画面テスト（項目6と統合）
8. アクセシビリティ・Androidフォールバックテスト

---

## 9. アプリをバックグラウンド/終了してもアラームが鳴るようにする

**問題**: アプリを閉じる（ホーム画面に戻る）とアラームが鳴らなくなる。

**対応**:
- iOS: バックグラウンド通知（Local Notifications）でアラームをトリガーする
  - `expo-notifications` でスケジュール済みのローカル通知を使用
  - アプリがフォアグラウンドでなくても通知音 + バナーでアラームを発火
  - 通知タップでアプリが開き、Ringing画面に遷移する導線
- 現在の実装がフォアグラウンド依存になっている箇所を特定し、通知ベースに移行する
- **注意**: iOSはバックグラウンドでのオーディオ再生に制限があるため、通知サウンド（最大30秒）+ フルスクリーン通知の組み合わせが現実的

---

## 10. Ringing画面の時刻表示が折り返して壊れる問題の修正

**問題**: Ringing画面で時刻が「18:3」+改行+「9」のように折り返してしまい、背景の楕円グロー（`timeGlow`）からもはみ出す。

**参考スクリーンショット**: `assets/screenshots/reference/S__56360964.jpg`

**原因** (`app/ringing.tsx`):
- `styles.time` の `fontSize: FONT_SIZE.display`（= `128px`）が大きすぎて画面幅に収まらない
- `letterSpacing: 4` がさらに幅を増やしている
- `timeGlow` は `width: 300` 固定で時刻テキストの実幅とずれている

**対応**:
- `time` スタイルに `adjustsFontSizeToFit: true` + `numberOfLines={1}` を追加して自動縮小させる
  ```jsx
  <Animated.Text
    style={[styles.time, { transform: [{ scale: pulseAnim }] }]}
    adjustsFontSizeToFit
    numberOfLines={1}
  >
    {displayTime}
  </Animated.Text>
  ```
- または `fontSize` を端末幅に基づいて動的に計算する（`Dimensions.get('window').width * 0.28` 程度）
- `letterSpacing` を `2` に縮小
- `timeGlow` の `width` をテキスト幅に合わせて調整（`width: '80%'` など相対値に）

---

## 11. QRコード/バーコード照合の厳密化

**問題**: どのバーコードでもアラーム解除できてしまう（可能性がある）。登録したQRコード/バーコードの実データ（URL、数字等）と照合して、一致したものだけ解除するべき。

**現状のコード** (`app/scan.tsx` L110-117):
```typescript
// qrId が渡された場合 → 特定QRとのみ照合（正しい）
const qr = await getRegisteredQRById(qrId);
matched = !!qr && qr.data === data;

// qrId なしの場合 → 全登録QRのいずれかとマッチすれば解除
const qrs = await getRegisteredQRs();
matched = qrs.some((q) => q.data === data);
```

**調査結果**: コード上は `data`（スキャンしたrawデータ）を保存・照合する仕組みは実装済み。ただし以下を確認・修正する:

1. **Ringing画面から `qrId` が正しく渡されているか確認**
   - `ringing.tsx` の `handleScanQR` で `scan` 画面に遷移する際、`qrId` パラメータを渡していない場合、全QRマッチになる
   - アラームに紐づくQRがある場合は必ず `qrId` を渡すようにする

2. **登録時に `data` が正しく保存されているか確認**
   - `RegisteredQR.data` にスキャンしたrawデータ（URLや数字）が入っていることを確認
   - 現状 `scan.tsx` L169 で `data: pendingData` として保存しているので仕組み上はOK

3. **QR未登録でアラームを設定した場合の挙動**
   - QRが1件も登録されていない場合、`qrs.some()` は常に `false` → 解除できない（正しい）
   - ただし UI上の案内が不足しているかもしれないので確認

4. **デバッグ**: 実機で登録QRと別のQR/バーコードをスキャンして `mismatch` が表示されるかテストする

---

## 12. スキャン画面のフレーム枠に拡大縮小（ブリージング）アニメーションを追加

**要望**: QR/バーコードスキャン時、スキャンエリアの外枠がゆっくり拡大縮小する「呼吸」アニメーションをつけて、スキャン中であることを視覚的にフィードバックする。

**現状** (`app/scan.tsx`):
- 四隅コーナーに `opacity` パルス（0.6→1→0.6、1500ms周期）は既にあり
- `scanFrame`（`width/height: SCAN_FRAME_SIZE`）自体にはアニメーションなし

**対応**:
- `scanFrame` 全体に `Animated.Value` の `scale` トランスフォームを追加
- opacity パルスと同期して拡大縮小させる（呼吸感）

```typescript
// 既存の cornerPulse と並行して scanScale を追加
const scanScale = useRef(new Animated.Value(1)).current;

// useEffect 内で並列アニメーション
const breathe = Animated.loop(
  Animated.sequence([
    Animated.timing(scanScale, {
      toValue: 1.03,        // 3%拡大（控えめ）
      duration: 1500,
      useNativeDriver: true,
    }),
    Animated.timing(scanScale, {
      toValue: 1,            // 元に戻る
      duration: 1500,
      useNativeDriver: true,
    }),
  ])
);
breathe.start();

// JSX: scanFrame に transform を追加
<Animated.View style={[
  styles.scanFrame,
  { transform: [{ scale: scanScale }] }
]}>
  {/* 四隅コーナー（既存） */}
</Animated.View>
```

**デザインポイント**:
- スケール幅は **1.0 → 1.03**（3%）程度が上品。大きすぎると酔う
- `cornerPulse`（opacity）と `scanScale` を `Animated.parallel` でまとめると同期が取れる
- スキャン成功時: スケールを一瞬 `1.08` に拡大 → `1.0` に戻すバウンスエフェクトを入れると気持ちいい

---

## 13. ホーム画面左上の「ScanAlarm」ブランド名テキストを削除

**対応箇所**: `app/(tabs)/index.tsx` L222
```jsx
<Text style={styles.brandName}>ScanAlarm</Text>
```

**対応**: この行と関連する `styles.brandName` スタイル定義を削除する。topBar内のレイアウトが崩れないか確認すること。

---

## 14. AlarmCardのトグルスイッチの垂直センタリング修正

**問題**: アラーム一覧画面で各アラームカードのON/OFFトグル（Switch）が垂直方向にセンタリングされていない。

**現状** (`components/AlarmCard.tsx`):
- `cardInner`: `flexDirection: 'row'`, `alignItems: 'center'` → 本来はセンタリングされるはず
- `toggle` スタイル: `transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }]` → 縮小によって見かけの位置がずれている可能性

**対応**:
- Switch を囲む `View` ラッパーを追加し、明示的に `justifyContent: 'center'`, `alignItems: 'center'` を指定
- または `alignSelf: 'center'` を `toggle` スタイルに追加
- `transform` の縮小がレイアウトに影響している場合、`marginVertical` で微調整

---

## 15. ダークモードが全画面に反映されていない問題の再修正

**問題**: 設定画面でダークモードを有効にしても、全体に反映されていない画面がある。

**調査結果**:
- `useTheme` は全画面・全コンポーネントで import 済み（確認済み）
- `ThemeProvider` もルート `_layout.tsx` でラップ済み

**確認すべきポイント**:
1. **StatusBar の色**: ダークモード時に `StatusBar barStyle="light-content"` に切り替わっているか
2. **ルートの背景色**: `_layout.tsx` や `(tabs)/_layout.tsx` の `screenOptions.contentStyle.backgroundColor` がテーマ色を使っているか
3. **ハードコードされた色**: `#FFFFFF` や `#F5F0EB` 等がテーマ変数ではなく直書きされている箇所がないか
4. **タブバー**: `(tabs)/_layout.tsx` の `tabBarStyle` がダークモード対応しているか
5. **モーダル / シート**: 背景色がテーマ経由になっているか

**対応**: 上記を全画面で確認し、ハードコード色をすべて `colors.xxx` に置き換える。項目6のチェックリストと合わせて対応。

---

## 16. ホーム画面のQRボタンからQRコード管理画面への遷移が動かない

**問題**: ホーム画面の「QR Setup」/「QR」ボタン（旧「Scan QR / Barcode」エリア）をタップしてもQR管理画面に遷移できない。

**現状のコード** (`app/(tabs)/index.tsx`):
- L201-202: `handleRegisterQR` → `router.push('/qr-manage')` は定義済み
- L225: `onPress={handleRegisterQR}` も接続済み

**確認すべきポイント**:
1. `/qr-manage` ルートが `_layout.tsx` の Stack に登録されているか
2. タブレイアウト内からタブ外のStack画面にpushする際のルーティング問題（Expo Router のネスト構造）
3. `qr-manage.tsx` ファイルが正しいディレクトリに存在するか（`app/qr-manage.tsx` で確認済み）
4. 実機でタップイベントが発火しているかデバッグ（`console.log` で確認）

**対応**: ルーティングの問題を特定して修正する。Expo Router のタブ内→タブ外遷移は `router.push('/(tabs)/../qr-manage')` のようなパス指定が必要な場合がある。

---

## 17. 設定画面に「Alarm Optimization」セクションを新設

**背景**: iOSのFocus ModeやScreen Time（Downtime）によってアラームがシステムレベルでブロックされ、鳴らないケースがある。Alarmy同様、ユーザーに設定手順をガイドする画面を用意する。

**参考スクリーンショット**: `assets/screenshots/reference/alarmy2.jpg`, `alarmy3.jpg`

**設定画面からの導線**:
- 設定画面の下部にバナー風のカードを配置（Alarmyの青いカードのように目立つデザイン）
- テキスト: 「Alarm didn't ring? -- Alarm Optimization」
- タップで Alarm Optimization 画面に遷移

### Alarm Optimization 画面の構成

タイトル: **「Your alarm isn't ringing?」**
サブテキスト: 「Alarms may be blocked by the phone's system. Check the following guidelines!」

#### セクション1: Allow ScanAlarm in Focus Mode

アコーディオン（展開/折りたたみ）形式で手順を表示:

1. Go to **[Settings > Focus]**
   - （iOS設定画面のスクリーンショットイメージを表示）
2. Select the focus mode during which you want alarms to ring, especially **Sleep**
   - Do Not Disturb / Personal / Sleep / Work の一覧イメージ
3. Tap **"Allowed Apps"** and add **ScanAlarm** to the list
4. Repeat for each Focus mode you use

- **「Go to Setting」ボタン**: タップで `Linking.openSettings()` を呼び、iOS設定アプリを直接開く

#### セクション2: Always Allow During Downtime

アコーディオン形式:

1. Go to **[Settings > Screen Time]**
2. Tap **"Always Allowed"** (Choose apps to allow at all times)
3. Add **ScanAlarm** to the list

- **「Go to Setting」ボタン**: 同様に `Linking.openURL('app-settings:')` で設定へ

### 実装ファイル
- `app/alarm-optimization.tsx` を新規作成
- 設定画面（`app/(tabs)/settings.tsx`）にバナーカード + 遷移を追加
- i18n 対応（`en.ts`, `ja.ts`, `ko.ts`, `es.ts`）

---

## 18. サウンド出力先（Sound Output）設定の追加

**背景**: Bluetooth デバイスが接続されている場合、アラーム音がBluetoothスピーカー/イヤホンに出力され、本体スピーカーから鳴らない。寝ている間にBluetoothイヤホンを外していると聞こえない。

**参考スクリーンショット**: `assets/screenshots/reference/Alarmy.jpg`（「Sound output: Current device」の行）

**対応**:

### 設定画面に「Sound Output」行を追加
- 設定画面の「Theme」セクションの下あたりに配置
- 表示: 「Sound output」 -- 右側に現在の設定値（「Current device」/「Bluetooth device」）
- タップでピッカーまたはモーダルを表示

### 選択肢
1. **Current device (default)** -- 常に本体スピーカーから出力。Bluetooth接続中でも強制的に本体から鳴る
2. **Bluetooth device** -- 接続中のBluetoothデバイスから出力
3. **Auto** -- 接続中のデバイスに自動ルーティング（iOS標準の挙動）

### 実装方針
- `expo-av` の `Audio.setAudioModeAsync` で出力先を制御
  ```typescript
  // 本体スピーカー強制出力
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    // Bluetooth出力を無効にして本体スピーカーに強制
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
  });
  ```
- ユーザーの選択は `AsyncStorage` に永続化
- アラーム鳴動時（`ringing.tsx`）に選択に応じた出力先を設定
- デフォルト値: **Current device**（安全側）

---

## 19. ホーム画面の挨拶テキストを目立たせる登場アニメーション

**要望**: アプリ起動時に「Good evening」等の挨拶を一瞬大きく目立たせ、タイピングが完了したら小さく縮小して定位置に収まるアニメーション。時刻表示はタイピング中は非表示にし、縮小後にフェードインする。

**現状** (`app/(tabs)/index.tsx`):
- `HandwrittenText` コンポーネントでタイピングアニメーションは既にある（`speed: 60`, `delay: 400`）
- しかし `heroGreeting` は `fontSize: bodySmall`、`color: textMuted` で控えめすぎる
- 時刻（`heroTime` fontSize: 72）はタイピング中も常に表示されている

**対応**:

### アニメーションフロー

```
[アプリ起動]
  ↓ 400ms待機
  ↓
[Phase 1: 挨拶タイピング] (約2秒)
  - 時刻: 非表示（opacity: 0）
  - 挨拶テキスト: 画面中央に大きく表示（fontSize: 36〜40相当）
  - HandwrittenText のタイピングが1文字ずつ表示される
  ↓ タイピング完了
  ↓ 500ms ポーズ
  ↓
[Phase 2: 縮小トランジション] (約600ms)
  - 挨拶テキスト: scale 1.0 → 0.5 程度に縮小しながら定位置へ移動
  - fontSize も視覚的に bodySmall サイズに収束
  - 時刻: 同時に opacity 0→1 でフェードイン
  ↓
[Phase 3: 通常状態]
  - 時刻 + 小さい挨拶テキスト（現在のレイアウト）
```

### 実装方針

```typescript
// 状態管理
const [greetingPhase, setGreetingPhase] = useState<'typing' | 'shrinking' | 'done'>('typing');
const greetingScale = useRef(new Animated.Value(1)).current;
const greetingTranslateY = useRef(new Animated.Value(0)).current;
const timeOpacity = useRef(new Animated.Value(0)).current;

// HandwrittenText の onComplete コールバックで Phase 2 に移行
const handleTypingComplete = () => {
  setTimeout(() => {
    setGreetingPhase('shrinking');
    Animated.parallel([
      Animated.spring(greetingScale, { toValue: 0.5, useNativeDriver: true }),
      Animated.timing(greetingTranslateY, { toValue: -40, duration: 600, useNativeDriver: true }),
      Animated.timing(timeOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => setGreetingPhase('done'));
  }, 500);
};
```

### デザインポイント
- Phase 1 の挨拶テキストは **太字・大サイズ**（`fontSize: 36`, `fontFamily: FONT_FAMILY.bold`）
- 縮小後は現在の `heroGreeting` スタイルに戻る
- `HandwrittenText` に `onComplete` コールバック prop が必要（なければ追加）
- ~~アニメーションは **初回起動時のみ**（セッション中2回目以降は即座にPhase 3表示）~~
  - ~~`useRef(hasPlayedGreeting)` フラグで制御~~

### **変更: アニメーションは毎回再生する**

現在の実装（`index.tsx` L108-116）では `hasPlayedGreeting.current` フラグで、セッション中2回目以降はスキップしている:

```typescript
// L108-116 — 現在の実装（スキップ処理）
if (hasPlayedGreeting.current) {
  setGreetingPhase('done');
  greetingScale.setValue(0.55);
  greetingTranslateY.setValue(-50);
  timeOpacity.setValue(1);
}
```

**修正**: このスキップ処理を削除し、画面がマウントされるたびにアニメーションを再生する。

```typescript
// ★ L108-116 のスキップ処理を削除

// ★ L119 の early return も削除
const handleTypingComplete = useCallback(() => {
  // if (hasPlayedGreeting.current) return;  ← 削除
  // hasPlayedGreeting.current = true;        ← 削除
  setTimeout(() => {
    setGreetingPhase('shrinking');
    Animated.parallel([
      Animated.spring(greetingScale, { toValue: 0.55, useNativeDriver: true, friction: 8 }),
      Animated.timing(greetingTranslateY, { toValue: -50, duration: 600, useNativeDriver: true }),
      Animated.timing(timeOpacity, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
    ]).start(() => setGreetingPhase('done'));
  }, 500);
}, []);
```

- `hasPlayedGreeting` の `useRef` 自体も不要になるので削除可
- タブ切り替えで画面に戻るたびに挨拶アニメーションが再生される
- **ただし**: Expo Router のタブは unmount されない場合がある → その場合は `useFocusEffect` でアニメーション値をリセットする:

```typescript
import { useFocusEffect } from 'expo-router';

useFocusEffect(
  useCallback(() => {
    // タブに戻るたびにアニメーションをリセット→再生
    setGreetingPhase('typing');
    greetingScale.setValue(1);
    greetingTranslateY.setValue(0);
    timeOpacity.setValue(0);
  }, [])
);
```

---

## 20. オンボーディング画面にアプリ説明を追加

**問題**: 初回起動のオンボーディング（名前入力画面）に、アプリの仕組みについての説明がない。現在のsubtitleは「ちゃんと起きるためのアラームアプリです。」のみで、QRコード/バーコードをスキャンしないとアラームが止まらないという核心的な機能が伝わらない。

**ファイル**: `app/onboarding.tsx` L94-120（`renderWelcome`関数）、`i18n/ja.ts` L38-39、`i18n/en.ts` L39-40

### 現在の表示テキスト
```
タイトル: 「ScanAlarmへようこそ」
サブタイトル: 「ちゃんと起きるためのアラームアプリです。」
```

### 対応: アプリ説明テキストを追加

名前入力の上（subtitle の下）に、アプリの仕組みを簡潔に説明するテキストブロックを配置する。

#### フルバージョン（案）
```
ja: "このアプリは、QRコードやバーコードをスキャンしないとアラームが止まりません。
トイレや部屋の外など、ベッドから離れた場所にあるコードを登録して、
強制的に体を起こしましょう。"

en: "This alarm won't stop until you scan a QR code or barcode.
Register a code somewhere away from your bed — like the bathroom 
or outside your room — and force yourself to get up."
```

#### 短縮バージョン（要検討）
- フルバージョンが長い場合の代替案として用意する
- **TODO**: Yu と相談して短縮版のテキストを確定する
- 案:
  ```
  ja: "QRコード/バーコードをスキャンしないと止まらないアラーム。ベッドから離れた場所のコードを登録しよう。"
  en: "An alarm that only stops when you scan a code. Register one away from your bed."
  ```

### 実装イメージ

```tsx
// onboarding.tsx — renderWelcome() 内
const renderWelcome = () => (
  <Animated.View style={...}>
    <Text style={styles.title}>{t.onboardingFlow.welcomeTitle}</Text>
    <Text style={styles.subtitle}>{t.onboardingFlow.welcomeSubtitle}</Text>
    
    {/* ★ 新規追加: アプリ説明ブロック */}
    <View style={styles.descriptionCard}>
      <Text style={styles.descriptionText}>
        {t.onboardingFlow.appDescription}
      </Text>
    </View>

    <View style={styles.inputCard}>
      ...名前入力...
    </View>
  </Animated.View>
);
```

### スタイル

```typescript
descriptionCard: {
  backgroundColor: colors.bgSecondary,  // 薄い背景で区切る
  borderRadius: BORDER_RADIUS.lg,
  padding: SPACING.lg,
  marginBottom: SPACING.xl,
  marginHorizontal: SPACING.base,
},
descriptionText: {
  fontFamily: FONT_FAMILY.regular,
  fontSize: FONT_SIZE.bodySmall,  // 14-15px — 控えめだが読みやすい
  color: colors.textSecondary,
  lineHeight: 22,
  textAlign: 'center',
},
```

### i18n キー追加

| キー | 日本語 | 英語 |
|------|--------|------|
| `onboardingFlow.appDescription` | フルバージョン（上記） | フルバージョン（上記） |
| `onboardingFlow.appDescriptionShort` | 短縮バージョン（TBD） | 短縮バージョン（TBD） |

### 注意点
- 短縮バージョンは **要相談** — テキスト確定後に `appDescriptionShort` キーを使い分けるか、フルバージョン一本にするか決める
- 他言語（es, ko）にも追加が必要

---

## 21. Sound Output ラベルの文字重なり修正 + 専用画面への遷移

**問題**: 設定画面の Sound Output 行で、現在の値（`Device speaker` / `Bluetooth device`）と説明テキスト（`Choose where alarm sound plays`）が重なって表示される。ラベルが長すぎることが原因。

**ファイル**:
- `app/(tabs)/settings.tsx` L228-244（Sound Output 行の描画）
- `app/(tabs)/settings.tsx` L97-114（`handleCycleSoundOutput` — 現在はタップでサイクル切替）
- `i18n/en.ts` L290-294、`i18n/ja.ts` L287-291

### 現在の状態

```
rowLabel: "Sound Output"
rowDesc: "Choose where alarm sound plays"  ← 長いテキストが重なる原因
rowValue: "Device speaker" / "Bluetooth device" / "Auto"
```

`rowLeft` が `flex: 1` だが、`rowDesc`（L237）の長い文字列と `rowValue`（L241）が横並びで競合し、テキスト同士が重なる。

### 対応

#### A. ラベルを短縮する

`rowValue` に表示する値を短くして重なりを防ぐ:

| 現在 | 変更後 |
|------|--------|
| `Device speaker` | `Device` |
| `Bluetooth device` | `Bluetooth` |
| `Auto` | `Auto`（変更なし） |

i18n キーの変更:
```typescript
// en.ts
soundOutputDevice: 'Device',        // was: 'Device speaker'
soundOutputBluetooth: 'Bluetooth',   // was: 'Bluetooth device'

// ja.ts
soundOutputDevice: '本体',           // was: '本体スピーカー'
soundOutputBluetooth: 'Bluetooth',   // was: 'Bluetoothデバイス'
```

#### B. `rowDesc` を削除 or 短縮

`soundOutputDesc`（`Choose where alarm sound plays`）を削除するか、`rowDesc` の表示自体をやめて `rowLabel` のみにする。説明は専用画面に委ねる。

#### C. タップで専用画面に遷移させる（推奨）

現在は `handleCycleSoundOutput` でタップするたびにサイクル切替しているが、専用の Sound Output 選択画面に遷移する方式に変更する:

```tsx
// settings.tsx
<TouchableOpacity
  style={styles.row}
  onPress={() => router.push('/sound-output')}  // ← サイクルではなく画面遷移
  activeOpacity={ACTIVE_OPACITY.default}
>
  <View style={styles.rowLeft}>
    <Ionicons name="volume-high-outline" size={20} ... />
    <View>
      <Text style={styles.rowLabel}>{t.settings.soundOutput}</Text>
      {/* rowDesc を削除 — 専用画面で説明する */}
    </View>
  </View>
  <View style={styles.rowRight}>
    <Text style={styles.rowValue}>{soundOutputLabel}</Text>
    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
  </View>
</TouchableOpacity>
```

新規ファイル `app/sound-output.tsx` を作成:
- タイトル: 「Sound Output」
- 3つの選択肢をラジオボタンで表示:
  - **Device** — 常にデバイスのスピーカーから再生
  - **Bluetooth** — 接続中のBluetooth機器から再生
  - **Auto** — 接続があればBluetooth、なければデバイス
- 各選択肢に短い説明テキストをつけてわかりやすくする
- `AsyncStorage` への保存ロジックは既存の `SOUND_OUTPUT_KEY` をそのまま使う

---

## 22. サウンドカテゴリフィルター（チップ）の文字潰れ修正

**問題**: サウンド選択画面で「ALL」「GENTLE」「NATURE」「DIGITAL」等のカテゴリフィルターチップが表示されるが、「ALL」選択時（全サウンド表示で下にリスト項目が多い場合）にチップの文字が潰れて見える。

**ファイル**: `app/sounds.tsx`
- L277-304（チップ描画部分）
- L352（`chipScroll: { maxHeight: 52 }`）
- L358-375（chip / chipActive / chipText / chipTextActive スタイル）

### 原因分析

```typescript
// L352
chipScroll: { maxHeight: 52, marginBottom: SPACING.lg },

// L358-363
chip: {
  paddingHorizontal: SPACING.xl,   // 水平は十分
  paddingVertical: SPACING.base,   // 垂直パディングが小さい可能性
  borderRadius: RADIUS.full,
  backgroundColor: c.bgTertiary,
},
```

`maxHeight: 52` が `chipScroll`（ScrollView の style）に設定されているため、チップ自体の高さ + パディングが 52px を超えるとクリッピングされてテキストが潰れる。特に `SPACING.base`（8px前後）の上下パディングだと、`FONT_SIZE.bodySmall`（14-15px）+ line-height と合わせてギリギリになる。

### 対応

#### A. `maxHeight` を緩和する

```typescript
chipScroll: { 
  maxHeight: 56,  // 52 → 56 に拡大（4px余裕追加）
  marginBottom: SPACING.lg,
},
```

#### B. チップの `minHeight` を明示する

```typescript
chip: {
  paddingHorizontal: SPACING.xl,
  paddingVertical: SPACING.sm,    // SPACING.base → SPACING.sm (やや小さく)
  minHeight: 36,                   // ★ 追加: 最小高さを保証
  justifyContent: 'center',       // ★ 追加: テキストを中央揃え
  alignItems: 'center',           // ★ 追加
  borderRadius: RADIUS.full,
  backgroundColor: c.bgTertiary,
},
```

#### C. `chipText` に `lineHeight` を明示する

```typescript
chipText: {
  fontSize: FONT_SIZE.bodySmall,
  fontFamily: FONT_FAMILY.medium,
  color: c.textMuted,
  lineHeight: FONT_SIZE.bodySmall * 1.2,  // ★ 追加: 明示的に line-height 設定
  includeFontPadding: false,               // ★ Android のみ: フォントパディング除去
},
```

### 推奨: A + B + C すべて適用

3つ全て適用することで、どのカテゴリが選択されていてもチップの高さが安定し、テキストが潰れなくなる。

---

## 23. スキャン画面（登録モード）下部の「Scan QR / barcode」ステータスpillを削除

**問題**: QR管理画面から「ADD」→ スキャン画面（register モード）に遷移した際、画面下部に「Scan QR / barcode」（日本語: 「QR / バーコードをスキャン」）というステータスpillが表示されるが、不要。スキャン画面にいる時点でスキャンすることは明らかなので冗長。

**ファイル**:
- `app/scan.tsx` L265-286（`statusBar` ブロック）
- `app/scan.tsx` L45-46（`statusText` 初期値: `t.scan.registerPrompt`）
- `app/scan.tsx` L370-391（`statusBar` / `statusPill` スタイル）
- `i18n/en.ts` L115: `registerPrompt: 'Scan QR / barcode'`
- `i18n/ja.ts` L112: `registerPrompt: 'QR / バーコードをスキャン'`

### 対応

register モードの場合のみ、`statusBar` セクションを非表示にする。dismiss モードでは「Scan to dismiss」やカウントダウンが必要なので残す。

```tsx
// scan.tsx — L265 付近
// ★ register モードでは statusBar を表示しない
{mode === 'dismiss' && (
  <View style={styles.statusBar}>
    <View style={[styles.statusPill, dismissed && styles.statusPillSuccess]}>
      <View style={[styles.statusDot, dismissed && styles.statusDotSuccess]} />
      <Text style={[styles.statusText, dismissed && styles.statusTextSuccess]}>{statusText}</Text>
    </View>

    {countdown > 0 && !dismissed && (
      <View style={styles.countdownSection}>
        ...カウントダウン...
      </View>
    )}
  </View>
)}
```

### 注意点
- dismiss モードの `statusBar`（「Scan to dismiss」+ カウントダウン + 成功表示）は **そのまま残す**
- `modeLabel`（L233-235: `REGISTER` / `SCAN` テキスト）はスキャンフレーム内にあり別物。これは残して良い
- i18n の `registerPrompt` キーは参照箇所がなくなるが、将来使う可能性があるので削除せず残しておく

---

## 24. スリープ/Focus Mode中にアラームが鳴らない問題の根本対応

**問題**: iOSのスリープモード（Focus Mode）中にアラームが全く鳴らない。項目17でガイド画面を設ける仕様を書いたが、ユーザーに設定手順を案内するだけでなく、**初回インストール時に自動的にFocus Mode許可を促す**フローが必要。

**関連**: 項目9（バックグラウンドアラーム）、項目17（Alarm Optimization画面）

### 対応

#### A. オンボーディングにFocus Mode設定ステップを追加

`app/onboarding.tsx` の `permissions` ステップ（L122-166）に、通知許可の**後に**Focus Mode設定への誘導を追加する:

```tsx
// onboarding.tsx — permissions ステップに追加
<View style={styles.permissionItem}>
  <Text style={styles.permissionTitle}>Allow in Focus Mode</Text>
  <Text style={styles.permissionDesc}>
    To ring during Sleep or Do Not Disturb, add ScanAlarm to your Focus Mode allowed apps.
  </Text>
  <TouchableOpacity style={styles.grantButton} onPress={() => Linking.openSettings()}>
    <Text style={styles.grantButtonText}>Open Settings</Text>
  </TouchableOpacity>
</View>
```

#### B. Critical Notification Entitlement（理想だが制限あり）

- iOS の **Critical Alerts** は Focus Mode/サイレントモードを無視して鳴る
- ただし Apple の審査で **特別なentitlement承認** が必要（医療・公共安全系アプリ向け）
- アラームアプリで承認されるかは不確定
- `expo-notifications` で `interruptionLevel: 'critical'` を設定可能だが、entitlementなしでは動かない
- **TODO**: Apple Developer から Critical Alerts entitlement を申請する価値があるか検討

#### C. Time Sensitive Notification（現実的な対応）

- iOS 15+ の **Time Sensitive** 通知なら Focus Mode 中でも表示される（ユーザーが許可していれば）
- `expo-notifications` で `interruptionLevel: 'timeSensitive'` を設定:

```typescript
// alarmService.ts — scheduleNotificationAsync の content に追加
const content: Notifications.NotificationContentInput = {
  title: t.notification.title,
  body: t.notification.body,
  sound: 'default',
  // ★ Focus Mode でも突破する設定
  interruptionLevel: 'timeSensitive',  // iOS 15+
  // iOS の Full Screen Notification（ロック画面全面表示）
  // → Info.plist に UIBackgroundModes: ['remote-notification'] が必要
};
```

#### D. `app.json` / `Info.plist` 設定

```json
// app.json の ios セクションに追加
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio", "remote-notification"],
        "NSFaceIDUsageDescription": "..."
      }
    }
  }
}
```

### 推奨優先度
1. **C（Time Sensitive）を即座に実装** — 最も現実的
2. **A（オンボーディング誘導）を実装** — ユーザー教育
3. **B（Critical Alerts）は長期検討** — Apple審査次第

---

## 25. Sound Output「Device」選択時にBluetoothから音が出てしまう問題

**問題**: 設定で Sound Output を「Device」にしているにも関わらず、Bluetooth接続中はBluetoothデバイスから音が流れてしまう。

**原因** (`services/audioService.ts` L17-26):

```typescript
export async function configureAudio(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });
}
```

現在の実装は `Audio.setAudioModeAsync` にBluetoothルーティング制御がなく、iOS標準の挙動（Bluetooth優先）に従ってしまう。コメント（L22-24）にも「Bluetooth routing is OS-level; expo-av cannot reliably force device speaker」と書かれている。

### 対応

#### A. `AVAudioSession` カテゴリを直接制御（ネイティブモジュール）

`expo-av` だけでは iOS の Bluetooth ルーティングを完全に制御できない。**ネイティブモジュール**（Expo Module API or Swift）で `AVAudioSession` を直接操作する:

```swift
// ios/ScanAlarmAudioRouting.swift
import AVFoundation

@objc func forceDeviceSpeaker() {
    let session = AVAudioSession.sharedInstance()
    try? session.setCategory(
        .playback,
        mode: .default,
        options: [.defaultToSpeaker]  // ★ スピーカー強制
    )
    try? session.overrideOutputAudioPort(.speaker)  // ★ Bluetooth無視
    try? session.setActive(true)
}
```

#### B. `expo-av` でできる範囲の対応

完全な制御は不可だが、以下で改善可能:

```typescript
// audioService.ts — configureAudio を Sound Output 設定に応じて分岐
export async function configureAudio(outputMode: SoundOutputMode = 'device'): Promise<void> {
  if (outputMode === 'device') {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
      // allowsRecordingIOS: true にすると一部のケースで
      // Bluetooth出力が無効化されることがある（副作用あり）
      allowsRecordingIOS: true,
    });
    // 再生開始直後にrecordingをfalseに戻す（音声入力は不要なため）
  } else {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });
  }
}
```

#### C. `playAlarm` に `outputMode` パラメータを追加

```typescript
// audioService.ts
export async function playAlarm(
  soundId: string = 'gentle',
  customUri?: string,
  volume: number = 1.0,
  fadeIn: boolean = false,
  outputMode: SoundOutputMode = 'device',  // ★ 追加
): Promise<void> {
  await configureAudio(outputMode);
  // ... 既存ロジック
}
```

呼び出し元（`ringing.tsx`、`_layout.tsx`）で `AsyncStorage` から `soundOutput` を読み取って渡す。

### 推奨
- **短期**: B（`expo-av` の `allowsRecordingIOS` トリック）で試す
- **中期**: A（ネイティブモジュール `AVAudioSession.overrideOutputAudioPort(.speaker)`）で確実に制御
- 項目21の Sound Output 専用画面と連携して実装する

---

## 26. ロック画面/画面オフ時にアラーム解除画面を自動表示

**問題**: iPhoneがロックされている・画面がオフの状態でアラームが鳴っても、解除するための画面（Ringing画面）が自動で表示されない。ユーザーがロック解除してアプリを開かないと解除できない。

**関連**: 項目9（バックグラウンドアラーム）、項目24（Focus Mode対応）

### 対応

#### A. Full Screen Notification（iOS）

iOS では **Full Screen Intent** 相当の機能として、通知がロック画面に全面表示される設定が可能:

```typescript
// alarmService.ts — 通知スケジュール時
const content: Notifications.NotificationContentInput = {
  title: t.notification.title,
  body: t.notification.body,
  sound: true,
  interruptionLevel: 'timeSensitive',
  // iOS: ロック画面で目立つ表示
  // → 通知タップでアプリが起動し、ringing画面に遷移
};
```

#### B. 通知タップ → Ringing画面への自動遷移

`app/_layout.tsx` L55-100 に既存の通知レスポンスリスナーがある。ここでアラーム通知タップ時に自動でRinging画面に遷移する:

```typescript
// _layout.tsx — 既存のリスナー（L55付近）
responseListener.current = Notifications.addNotificationResponseReceivedListener(
  (response) => {
    const data = response.notification.request.content.data;
    // ★ alarmId があればringing画面に遷移
    if (data?.alarmId) {
      router.replace({
        pathname: '/ringing',
        params: { alarmId: data.alarmId },
      });
    }
  }
);
```

#### C. Foreground Notification Listener で自動遷移

アプリがフォアグラウンドの時に通知を受け取った場合も、自動でRinging画面に遷移:

```typescript
// _layout.tsx — L103付近の既存リスナーを拡張
notificationListener.current = Notifications.addNotificationReceivedListener(
  (notification) => {
    const data = notification.request.content.data;
    if (data?.type === 'alarm' && data?.alarmId) {
      // フォアグラウンドで通知受信 → 即座にringing画面へ
      router.replace({
        pathname: '/ringing',
        params: { alarmId: data.alarmId },
      });
    }
  }
);
```

#### D. Background Task + Wake Screen（Android向け、iOS制限あり）

- Android: `expo-task-manager` + `ReactNativeHeadlessJs` でバックグラウンドから画面を起動可能
- iOS: **システム制限により、アプリからロック画面を解除することはできない**。通知が最大限の手段
- ただし `interruptionLevel: 'timeSensitive'` + カスタムサウンド（30秒）で、ロック画面上で目立つ通知を出すことは可能

### 注意点
- iOSの制限上、ロック画面を無視してアプリ画面を強制表示することは**不可能**
- できる最大限は: **Time Sensitive通知 → ユーザーがタップ → アプリ起動 → Ringing画面自動遷移**
- 通知のカスタムサウンドを設定することで、ロック画面でもアラーム音を30秒間鳴らせる
- 項目9・24と合わせて一体的に実装する

---

## 27. Ringing画面の時刻表示とグロー背景のセンタリング修正

**問題**: アラーム解除画面（Ringing画面）で時刻表示がグロー背景（`timeGlow`）と中心がずれている。項目10で `adjustsFontSizeToFit` + `numberOfLines={1}` は対応済みだが、テキストとグロー円の**上下の中心合わせ**がまだずれている。

**ファイル**: `app/ringing.tsx`

### 現在のスタイル

```typescript
// L260-267 — timeGlow（時刻の後ろの楕円グロー）
timeGlow: {
  position: 'absolute',
  width: '80%',
  height: 200,
  borderRadius: 150,
  backgroundColor: c.warmGlowStrong,
  top: '30%',                // ★ 固定%指定 → 端末サイズで位置がずれる
},

// L287-294 — time（時刻テキスト）
time: {
  fontSize: FONT_SIZE.display,  // 128px
  fontFamily: FONT_FAMILY.bold,
  color: c.textPrimary,
  letterSpacing: 2,
  width: '100%',
  textAlign: 'center',
},
```

### 原因
- `timeGlow` は `position: 'absolute'` + `top: '30%'` で配置されているが、時刻テキストは親コンテナの `justifyContent: 'center'` で配置されている
- 端末の画面サイズやsnoozeバッジの有無で、時刻テキストの垂直位置が変わるが、`timeGlow` の `top: '30%'` は固定なのでずれる

### 対応

#### A. timeGlow を時刻テキストの兄弟要素として相対配置する

```tsx
// ringing.tsx — content 部分を修正
{/* Time と Glow をラッパーでまとめる */}
<View style={styles.timeContainer}>
  <View style={styles.timeGlow} />
  <Animated.Text
    style={[styles.time, { transform: [{ scale: pulseAnim }] }]}
    adjustsFontSizeToFit
    numberOfLines={1}
  >
    {displayTime}
  </Animated.Text>
</View>
```

```typescript
// スタイル修正
timeContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  // グローが相対的に時刻の背後に来るように
},
timeGlow: {
  position: 'absolute',
  width: '90%',
  height: 180,
  borderRadius: 150,
  backgroundColor: c.warmGlowStrong,
  // ★ top を削除 — コンテナ内で自動センタリング
  alignSelf: 'center',
},
time: {
  fontSize: FONT_SIZE.display,
  fontFamily: FONT_FAMILY.bold,
  color: c.textPrimary,
  letterSpacing: 2,
  textAlign: 'center',
  // ★ width: '100%' を削除し、テキスト自体の幅に任せる
},
```

#### B. `timeGlow` のアニメーション（`glowAnim`）もコンテナ内に移動

```tsx
<View style={styles.timeContainer}>
  <Animated.View style={[styles.timeGlow, { opacity: glowAnim }]} />
  <Animated.Text ...>{displayTime}</Animated.Text>
</View>
```

### ポイント
- `timeGlow` の `top: '30%'` 固定値を削除し、親コンテナ（`timeContainer`）でセンタリング
- テキストとグローが常に同じコンテナ内で中心揃えされる
- 端末サイズやsnoozeバッジの有無に影響されなくなる

---

## 28. サウンド一覧スクロール時にカテゴリチップを自動同期

**問題**: サウンド選択画面で、上部のカテゴリチップ（ALL / GENTLE / NATURE / DIGITAL 等）が「ALL」の状態でリストをスクロールし、例えば Nature セクションまでスクロールしても、上のチップは「ALL」のまま。現在表示中のセクションに合わせてチップが自動的にハイライトされてほしい。

**ファイル**: `app/sounds.tsx`
- L46: `activeCategory` state
- L277-304: カテゴリチップ描画
- L307-315: `SectionList` 描画

### 対応

`SectionList` の `onViewableItemsChanged` を使い、画面に表示中のセクションを検知してチップを自動更新する。

```tsx
// sounds.tsx

// ★ viewability 設定（コンポーネント外で定義 — re-render で参照が変わらないように）
const VIEWABILITY_CONFIG = {
  viewAreaCoveragePercentThreshold: 50, // セクションの50%以上が見えたら切替
};

export default function SoundsScreen() {
  // ... 既存 state ...

  // ★ スクロール検知用コールバック（useCallback で安定化）
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ section?: SectionData }> }) => {
      // activeCategory が手動で設定されている場合はスキップ
      // （ALL表示の時だけ自動同期する）
      if (activeCategory) return;

      const firstVisible = viewableItems.find(item => item.section);
      if (firstVisible?.section) {
        // チップのハイライトのみ更新（フィルタはしない）
        setVisibleCategory(firstVisible.section.category);
      }
    },
    [activeCategory]
  );

  // ★ 表示中カテゴリ（チップハイライト用、フィルタリングとは独立）
  const [visibleCategory, setVisibleCategory] = useState<SoundCategory | null>(null);

  // ...

  return (
    // チップ部分
    <TouchableOpacity
      style={[
        styles.chip,
        !activeCategory && !visibleCategory && styles.chipActive,
      ]}
      onPress={() => { handleChipPress(null); setVisibleCategory(null); }}
    >
      <Text style={[
        styles.chipText,
        !activeCategory && !visibleCategory && styles.chipTextActive,
      ]}>
        {t.soundBrowser.all}
      </Text>
    </TouchableOpacity>

    {SOUND_CATEGORIES.map(({ key, labelKey }) => (
      <TouchableOpacity
        key={key}
        style={[
          styles.chip,
          (activeCategory === key || (!activeCategory && visibleCategory === key))
            && styles.chipActive,
        ]}
        onPress={() => handleChipPress(activeCategory === key ? null : key)}
      >
        <Text style={[
          styles.chipText,
          (activeCategory === key || (!activeCategory && visibleCategory === key))
            && styles.chipTextActive,
        ]}>
          {getCategoryLabel(key)}
        </Text>
      </TouchableOpacity>
    ))}

    // SectionList に追加
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={handleViewableItemsChanged}  // ★ 追加
      viewabilityConfig={VIEWABILITY_CONFIG}                 // ★ 追加
    />
  );
}
```

### 動作仕様
1. **ALL表示（`activeCategory === null`）でスクロール時**: 表示中セクションに合わせてチップが自動ハイライト
2. **特定カテゴリを手動タップした場合**: そのカテゴリでフィルタ（従来通り）、スクロール同期は無効
3. **チップをタップして ALL に戻した場合**: スクロール同期が再び有効に

### 注意点
- `onViewableItemsChanged` と `viewabilityConfig` は **コンポーネント外** or **useRef/useMemo** で安定した参照にすること（SectionList の制約）
- チップのスクロール位置も連動させたい場合は、`ScrollView` に `ref` を付けて `scrollTo` で該当チップを画面内に移動させる

---

## 29. ホーム画面の右上 Add ボタンを削除（FAB と重複）

**問題**: ホーム画面にアラーム追加ボタンが2つある。セクションヘッダー右上の「+ Add」テキストボタンと、画面右下のFAB（フローティング「+」ボタン）が重複しており冗長。右上のボタンを削除する。

**ファイル**: `app/(tabs)/index.tsx`

### 削除対象

L322-324（セクションヘッダー内の `addButtonSmall`）:
```tsx
<TouchableOpacity style={styles.addButtonSmall} onPress={handleAdd} activeOpacity={ACTIVE_OPACITY.default}>
  <Text style={styles.addButtonSmallText}>{t.home.addAlarm}</Text>
</TouchableOpacity>
```

### 残すもの

L349-354（FAB — 画面右下のフローティング「+」ボタン）:
```tsx
{alarms.length > 0 && (
  <View style={styles.fabContainer}>
    <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.8}>
      <Text style={styles.fabIcon}>+</Text>
    </TouchableOpacity>
  </View>
)}
```

### 対応

1. L322-324 の `addButtonSmall` の TouchableOpacity を削除
2. `styles.addButtonSmall` / `styles.addButtonSmallText`（L514-524）も不要になるので削除
3. i18n の `home.addAlarm` キーは他で使っていなければ削除可（要確認）
4. アラームが0件の時は空カード（L327-334）のタップで追加できるので問題なし

---

## 30. アラーム解除完了時の達成感演出 + 広告画面遷移

**問題**: QRコード/バーコードをスキャンしてアラームを解除した後、現在は celebrationMsg を2.5秒表示してホーム画面に直接戻っている（`router.dismissAll()`）。達成感が薄く、視覚的・触覚的なフィードバックが不足。また、ホーム画面ではなく広告画面に遷移するべき。

**ファイル**: `app/scan.tsx` L131-168（dismiss成功時の処理）

### 現在のフロー

```
QRスキャン成功
  → Haptics.success (1回)
  → scanFrame バウンス
  → celebrationMsg テキスト表示
  → 2.5秒後 router.dismissAll() → ホーム画面
```

### 新フロー

```
QRスキャン成功
  → [Phase 1: チェックマーク演出] (約1.5秒)
     - 画面中央に大きなチェックマーク（円 + チェック）がアニメーション表示
     - チェックが描かれる stroke アニメーション（0% → 100%）
     - 完了時にバイブレーション（Haptics.notificationAsync Success）
     - 背景が success カラーにフェード
  → [Phase 2: 達成メッセージ — 常時表示] (広告画面に遷移するまで残る)
     - チェックマークの下に celebrationMsg をフェードイン
     - 既存の celebrationMsg プール（スヌーズなし/ストリーク/一般等）からランダム表示
     - ストリーク情報も表示（「3 days in a row!」等）
     - 軽いバイブレーション（Haptics.impactAsync Medium）
     - **メッセージは消えず、画面遷移まで常時表示し続ける**
  → [Phase 3: 広告画面に遷移]
     - チェック + メッセージ表示から約3秒後に広告画面に遷移
     - 広告画面に「閉じる」ボタン、押したらホームに戻る
```

### 実装

#### A. チェックマークアニメーション

```tsx
// scan.tsx — dismiss成功時に表示するオーバーレイ
{dismissed && (
  <View style={styles.completionOverlay}>
    {/* チェックマーク円 */}
    <Animated.View style={[styles.checkCircle, { 
      transform: [{ scale: checkScale }],
      opacity: checkOpacity,
    }]}>
      {/* SVG or Lottie でチェックマークアニメーション */}
      <Ionicons name="checkmark" size={64} color="#FFFFFF" />
    </Animated.View>

    {/* 達成メッセージ */}
    <Animated.Text style={[styles.completionMsg, { opacity: msgOpacity }]}>
      {celebrationMsg}
    </Animated.Text>

    {/* ストリーク表示 */}
    {streak >= 2 && (
      <Animated.Text style={[styles.streakText, { opacity: msgOpacity }]}>
        {t.scan.streakCount(streak)}
      </Animated.Text>
    )}

    {/* 日時 */}
    <Text style={styles.completionTime}>
      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </Text>
  </View>
)}
```

#### B. アニメーションシーケンス

```typescript
const checkScale = useRef(new Animated.Value(0)).current;
const checkOpacity = useRef(new Animated.Value(0)).current;
const msgOpacity = useRef(new Animated.Value(0)).current;

const playCompletionAnimation = async (streak: number) => {
  // Phase 1: チェックマーク登場
  Animated.parallel([
    Animated.spring(checkScale, { 
      toValue: 1, 
      friction: 4,        // バウンス感
      tension: 50,
      useNativeDriver: true,
    }),
    Animated.timing(checkOpacity, { 
      toValue: 1, 
      duration: 300, 
      useNativeDriver: true,
    }),
  ]).start();

  // バイブレーション
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  // Phase 2: メッセージ表示（500ms後）
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(msgOpacity, { 
      toValue: 1, 
      duration: 400, 
      useNativeDriver: true,
    }).start();
  }, 500);

  // Phase 3: 広告画面に遷移（3秒後）
  setTimeout(() => {
    router.replace('/ad-interstitial');  // 広告画面
  }, 3000);
};
```

#### C. スタイル

```typescript
completionOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(34, 120, 69, 0.92)',  // success green
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
},
checkCircle: {
  width: 120,
  height: 120,
  borderRadius: 60,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 3,
  borderColor: '#FFFFFF',
},
completionMsg: {
  fontSize: FONT_SIZE.heading2,
  fontFamily: FONT_FAMILY.bold,
  color: '#FFFFFF',
  marginTop: SPACING.xxl,
  textAlign: 'center',
  paddingHorizontal: SPACING.xxl,
},
streakText: {
  fontSize: FONT_SIZE.body,
  fontFamily: FONT_FAMILY.medium,
  color: 'rgba(255, 255, 255, 0.8)',
  marginTop: SPACING.base,
},
completionTime: {
  fontSize: FONT_SIZE.bodySmall,
  fontFamily: FONT_FAMILY.regular,
  color: 'rgba(255, 255, 255, 0.6)',
  marginTop: SPACING.xl,
},
```

#### D. 広告画面への遷移

現在の `setTimeout(() => router.dismissAll(), 2500)` を以下に変更:

```typescript
// L168 を変更
// before: setTimeout(() => router.dismissAll(), 2500);
// after:
setTimeout(() => {
  // 広告画面に遷移（広告終了後にホームに戻る）
  router.replace('/ad-completion');
}, 3000);
```

新規ファイル `app/ad-completion.tsx` を作成:
- 広告を表示（バナー or インタースティシャル）
- 画面に「閉じる」ボタンを配置（広告の上 or 下）。ユーザーがタップしたら `router.dismissAll()` でホームに戻る
- 自動遷移はしない — ユーザーが能動的に閉じるまで広告画面に留まる
- 広告読み込み失敗時は「閉じる」ボタンのみ表示（即ホームへ戻れる）

#### E. 履歴記録（将来拡張）

`recordDismiss()` は既に存在（L148）。将来的にはこのデータを使って:
- 設定画面に「アラーム達成履歴」セクションを追加
- カレンダー形式で起床成功日を表示
- ストリーク（連続達成）のビジュアル表示

### 注意点
- **Lottie アニメーション**（`lottie-react-native`）を使うと、より滑らかなチェックマーク描画が可能。導入検討
- 広告がない場合（開発中/Pro版等）はPhase 3をスキップしてホームへ直接遷移
- celebrationMsg の既存ロジック（ストリーク・スヌーズ回数による分岐）はそのまま活用

---

## 31. サウンド選択画面の「ALL」タブを削除

**問題**: サウンド選択画面に「ALL」タブがあり、全カテゴリの音が一覧表示される。カテゴリ（Gentle, Nature, Digital等）を選んで音を選ぶ形式に統一したいため、ALLタブは不要。

**ファイル**: `app/sounds.tsx`

### 削除対象

L312-322（ALL チップ）:
```tsx
<TouchableOpacity
  style={[styles.chip, !activeCategory && !visibleCategory && styles.chipActive]}
  onPress={() => { handleChipPress(null); }}
  onLayout={(e) => { chipPositions.current['all'] = e.nativeEvent.layout.x; }}
>
  <Text style={[styles.chipText, !activeCategory && !visibleCategory && styles.chipTextActive]}>
    {t.soundBrowser.all}
  </Text>
</TouchableOpacity>
```

### 対応

1. 上記 ALL チップの `TouchableOpacity` を削除
2. `activeCategory` の初期値を `null` → 最初のカテゴリ（例: `'gentle'`）に変更:
   ```typescript
   // before
   const [activeCategory, setActiveCategory] = useState<SoundCategory | null>(null);
   // after
   const [activeCategory, setActiveCategory] = useState<SoundCategory>(SOUND_CATEGORIES[0].key);
   ```
3. `activeCategory === null` で全件表示していたロジック（L218-228 `sections` 生成）を、常にカテゴリフィルタが掛かるように変更
4. `handleChipPress` でカテゴリをタップして null に戻す（トグル off）動作も削除 — 常にどれか1つが選択状態
   ```typescript
   // before
   onPress={() => handleChipPress(activeCategory === key ? null : key)}
   // after
   onPress={() => handleChipPress(key)}
   ```
5. i18n の `soundBrowser.all` キーは不要になるので削除
6. `visibleCategory`（スクロール同期用）も ALL 前提の機能なので、不要であれば削除を検討

---

## 32. 【最重要】アラームがバックグラウンド/ロック画面/他アプリ使用中に鳴らない問題の包括的修正

**重要度**: CRITICAL — アプリの存在意義に関わる致命的バグ

**現象**:
1. 画面がロックされている（スリープ状態）とアラームが鳴らない
2. 他のアプリを使用中（アプリがバックグラウンド）だとアラームが鳴らない
3. アプリを開いた瞬間に初めてアラームが鳴り始める
4. Bluetooth接続中にデバイス本体から音が出ない（設定で「Device」を選んでも）

### 根本原因の分析

#### 問題 A: 通知は届くが、アプリ内での音声再生に依存している

現在のフロー:
```
通知スケジュール → iOS がローカル通知を配信 → ユーザーがタップ → アプリ起動
→ _layout.tsx の addNotificationResponseReceivedListener → ringing画面に遷移
→ ringing.tsx useFocusEffect → playAlarm() → ようやく音が鳴る
```

**問題点**: 通知自体は iOS が配信するが、アラーム音の再生を `expo-av`（アプリ内オーディオ）に頼っている。アプリがフォアグラウンドでなければ `expo-av` は動作しない。通知サウンドは `gentle.wav` 1ファイルのみで短い。

#### 問題 B: フォアグラウンド受信時のみアプリ内再生が機能

`_layout.tsx` L103-114 の `addNotificationReceivedListener` はアプリがフォアグラウンドの時のみ発火する。バックグラウンド/キル状態では発火しない。

#### 問題 C: Background Task が実質何もしていない

`alarmService.ts` L22-30 の `BACKGROUND-NOTIFICATION-TASK` は空のタスク。バックグラウンドで音声再生やUI遷移を行っていない。

#### 問題 D: Bluetooth ルーティング制御の限界

`audioService.ts` L27-49 の `allowsRecordingIOS` トリックは不安定。`expo-av` だけでは iOS の Bluetooth ルーティングを確実に制御できない。

---

### 修正方針（5層の防御戦略）

アラームアプリは「鳴らない」が許されない。以下の5層で確実に鳴る仕組みを構築する。

---

### Layer 1: iOS 通知サウンド自体を長く・大きくする（最重要・最優先）

**アプリがバックグラウンドでもキルされていても、iOS の通知サウンドは鳴る。** これが最も信頼性の高い音声配信手段。

**ファイル**: `app.json`, `alarmService.ts`, `assets/sounds/`

#### 1-A. 30秒のアラームサウンドファイルを用意する

iOS のローカル通知サウンドは**最大30秒**まで対応。現在の `gentle.wav` が短い場合は30秒版を用意:

```
assets/sounds/
  gentle-notification.caf    ← 30秒版（iOS用 .caf 推奨）
  nature-notification.caf
  digital-notification.caf
```

- フォーマット: Linear PCM, MA4, u-law, a-law のいずれか。`.caf` が推奨
- 30秒を超えるとiOSはデフォルトサウンドにフォールバックする

#### 1-B. app.json にサウンドファイルを登録

```json
// app.json
"plugins": [
  [
    "expo-notifications",
    {
      "sounds": [
        "./assets/sounds/gentle-notification.caf",
        "./assets/sounds/nature-notification.caf",
        "./assets/sounds/digital-notification.caf"
      ]
    }
  ]
]
```

#### 1-C. 通知スケジュール時にユーザー選択サウンドを指定

```typescript
// alarmService.ts — scheduleAlarm()
const content: Notifications.NotificationContentInput = {
  title: t.notification.title,
  body: t.notification.body,
  data: { alarmId: alarm.id, soundId: alarm.soundId },
  // ★ ユーザーが選んだサウンドの通知版を使う
  sound: getNotificationSoundFile(alarm.soundId),
  categoryIdentifier: 'alarm',
  sticky: true,
  ...(Platform.OS === 'ios' && { interruptionLevel: 'timeSensitive' }),
};

function getNotificationSoundFile(soundId: string): string {
  // ユーザー選択サウンドに対応する通知用30秒ファイル名
  const map: Record<string, string> = {
    gentle: 'gentle-notification.caf',
    sunrise: 'nature-notification.caf',
    birds: 'nature-notification.caf',
    digital: 'digital-notification.caf',
    // ... 全サウンドに対応するマッピング
  };
  return map[soundId] || 'gentle-notification.caf';
}
```

**これだけで、アプリが完全にキルされていても30秒間アラーム音が鳴る。**

---

### Layer 2: Time Sensitive + Critical Alerts でフォーカスモード・サイレントモードを突破

**ファイル**: `app.json`, `alarmService.ts`, `onboarding.tsx`

#### 2-A. Time Sensitive（Apple申請不要・即実装可能）

現在 `interruptionLevel: 'timeSensitive'` は設定済み（L110）。ただし通知許可リクエスト時に Time Sensitive の権限を明示的に要求していない。

```typescript
// alarmService.ts — requestPermissions()
export async function requestPermissions(): Promise<boolean> {
  if (isWeb) return false;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
      allowDisplayInCarPlay: false,
      allowCriticalAlerts: false,       // Layer 2-B で true にする
      provideAppNotificationSettings: true,
      allowProvisional: false,
      allowAnnouncements: false,
    },
  });
  return status === 'granted';
}
```

#### 2-B. Critical Alerts（Apple申請が必要・中期目標）

Critical Alerts は**サイレントモードでもDNDでも確実に鳴る**唯一の方法。アラームアプリとして Apple に申請する。

**申請手順**:
1. Apple Developer Portal → Certificates, Identifiers & Profiles
2. App ID の Capabilities で「Critical Alerts」を有効化
3. https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/ で申請
4. 申請理由: 「目覚ましアラームアプリ。ユーザーがQRコードをスキャンしないとアラームが止まらない設計で、確実な通知配信が必要」
5. 承認後、`app.json` に entitlement を追加:

```json
// app.json → ios
"entitlements": {
  "com.apple.developer.usernotifications.critical-alerts": true
}
```

6. 通知コンテンツを Critical に変更:

```typescript
// alarmService.ts — 承認後
const content = {
  ...
  sound: {
    name: getNotificationSoundFile(alarm.soundId),
    critical: true,
    volume: 1.0,
  },
  ...(Platform.OS === 'ios' && { interruptionLevel: 'critical' }),
};
```

7. 権限リクエストも更新:

```typescript
const { status } = await Notifications.requestPermissionsAsync({
  ios: {
    allowCriticalAlerts: true,  // ★ Critical Alert 権限を要求
    allowAlert: true,
    allowSound: true,
  },
});
```

---

### Layer 3: 通知タップ → 即座にアラーム画面 + アプリ内音声再生開始

現在のフロー（`_layout.tsx` L55-100）は既に実装済みだが、以下を強化:

**ファイル**: `_layout.tsx`

#### 3-A. lastNotificationResponse で起動時通知を拾う

アプリがキルされた状態から通知タップで起動した場合、`addNotificationResponseReceivedListener` が間に合わない場合がある。`useLastNotificationResponse` で補完:

```typescript
// _layout.tsx に追加
import { useLastNotificationResponse } from 'expo-notifications';

// RootLayout 内:
const lastResponse = Notifications.useLastNotificationResponse();

useEffect(() => {
  if (!lastResponse) return;
  const data = lastResponse.notification.request.content.data as {
    alarmId?: string;
  };
  const alarmId = data.alarmId || '';
  const actionId = lastResponse.actionIdentifier;

  if (actionId === 'snooze') {
    // スヌーズ処理...
    return;
  }

  if (!shouldTriggerAlarm(alarmId || 'last_response')) return;
  
  if (actionId === 'dismiss') {
    router.push({ pathname: '/scan', params: { mode: 'dismiss', alarmId } });
  } else {
    router.push({ pathname: '/ringing', params: { alarmId } });
  }
}, [lastResponse]);
```

#### 3-B. アプリ起動後すぐに音声再生を開始

`ringing.tsx` の `useFocusEffect` で `playAlarm()` は既に呼んでいるが、画面遷移完了前から音を鳴らすよう `_layout.tsx` でも即座に開始:

```typescript
// _layout.tsx — 通知受信時
notificationListener.current = Notifications.addNotificationReceivedListener(
  async (notification) => {
    const data = notification.request.content.data as {
      alarmId?: string;
      soundId?: string;
    };
    const alarmId = data.alarmId || '';
    if (!shouldTriggerAlarm(alarmId || 'notif_received')) return;
    
    // ★ 画面遷移前に音声再生を開始（フォアグラウンドのみ）
    const outputMode = await getSoundOutputMode();
    playAlarm(data.soundId || 'gentle', undefined, 1.0, false, outputMode);
    
    router.push({ pathname: '/ringing', params: { alarmId } });
  }
);
```

---

### Layer 4: Bluetooth 接続時にデバイス本体スピーカーから強制出力

**ファイル**: 新規ネイティブモジュール

#### 4-A. Expo Module API でネイティブモジュールを作成

`expo-av` の `allowsRecordingIOS` トリックは不安定（現在のコード L36-48 で既にトリック実装済みだが効かない）。`AVAudioSession.overrideOutputAudioPort(.speaker)` を直接呼ぶネイティブモジュールが必要。

**新規ファイル**: `modules/audio-route/ios/AudioRouteModule.swift`

```swift
import ExpoModulesCore
import AVFoundation

public class AudioRouteModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AudioRoute")
    
    // デバイス本体スピーカーに強制出力
    AsyncFunction("forceDeviceSpeaker") { () -> Bool in
      let session = AVAudioSession.sharedInstance()
      do {
        // playAndRecord カテゴリでないと overrideOutputAudioPort が効かない
        try session.setCategory(
          .playAndRecord,
          mode: .default,
          options: [.defaultToSpeaker, .allowBluetooth]
        )
        try session.overrideOutputAudioPort(.speaker)
        try session.setActive(true)
        return true
      } catch {
        return false
      }
    }
    
    // Bluetooth / 自動に戻す
    AsyncFunction("resetAudioRoute") { () -> Bool in
      let session = AVAudioSession.sharedInstance()
      do {
        try session.setCategory(.playback, mode: .default)
        try session.overrideOutputAudioPort(.none)
        try session.setActive(true)
        return true
      } catch {
        return false
      }
    }
    
    // 現在のオーディオ出力先を取得
    AsyncFunction("getCurrentRoute") { () -> String in
      let session = AVAudioSession.sharedInstance()
      let outputs = session.currentRoute.outputs
      if let first = outputs.first {
        switch first.portType {
        case .builtInSpeaker: return "speaker"
        case .bluetoothA2DP, .bluetoothLE, .bluetoothHFP: return "bluetooth"
        case .headphones: return "headphones"
        default: return first.portType.rawValue
        }
      }
      return "unknown"
    }
  }
}
```

**新規ファイル**: `modules/audio-route/index.ts`

```typescript
import { requireNativeModule, Platform } from 'expo-modules-core';

const AudioRoute = Platform.OS === 'ios' 
  ? requireNativeModule('AudioRoute')
  : null;

export async function forceDeviceSpeaker(): Promise<boolean> {
  if (!AudioRoute) return false;
  return AudioRoute.forceDeviceSpeaker();
}

export async function resetAudioRoute(): Promise<boolean> {
  if (!AudioRoute) return false;
  return AudioRoute.resetAudioRoute();
}

export async function getCurrentRoute(): Promise<string> {
  if (!AudioRoute) return 'unknown';
  return AudioRoute.getCurrentRoute();
}
```

#### 4-B. audioService.ts に統合

```typescript
// audioService.ts — configureAudio() を修正
import { forceDeviceSpeaker, resetAudioRoute } from '../modules/audio-route';

export async function configureAudio(outputMode?: SoundOutputMode): Promise<void> {
  const mode = outputMode ?? await getSoundOutputMode();
  
  if (Platform.OS === 'ios' && mode === 'device') {
    // ★ ネイティブモジュールで確実にデバイススピーカーに切り替え
    await forceDeviceSpeaker();
  } else if (Platform.OS === 'ios' && mode === 'auto') {
    await resetAudioRoute();
  }
  
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
    allowsRecordingIOS: false,
    playThroughEarpieceAndroid: false,
  });
}
```

#### 4-C. 注意事項

- `overrideOutputAudioPort(.speaker)` は**一時的**。Bluetooth 切断/再接続でリセットされる
- アラーム再生前に毎回 `forceDeviceSpeaker()` を呼ぶこと
- `allowsRecordingIOS` トリック（既存 L33-48）は削除して、ネイティブモジュールに置き換える
- Expo の Development Build が必須（Expo Go では動作しない）

---

### Layer 5: オンボーディングでの許可設定ガイド

**ファイル**: `app/onboarding.tsx`

現在の onboarding にはフォーカスモード案内（L165-174）が既にあるが、より明確に「このアプリが鳴るために必要な設定」を案内する。

#### 5-A. Permission ステップの強化

```typescript
// onboarding.tsx — renderPermissions() に以下を追加

{/* 通知許可（既存） */}
<PermissionCard ... />

{/* ★ 新規: Time Sensitive 通知の説明 */}
<View style={styles.tipCard}>
  <Text style={styles.tipTitle}>
    {t.onboardingFlow.timeSensitiveTitle}
    {/* "Time Sensitive Notifications" */}
  </Text>
  <Text style={styles.tipDesc}>
    {t.onboardingFlow.timeSensitiveDesc}
    {/* "ScanAlarm はアラームを確実に届けるため、Time Sensitive 通知を
         使用します。設定 > ScanAlarm > 通知 で「即時通知」が有効になって
         いることを確認してください。" */}
  </Text>
</View>

{/* ★ 新規: フォーカスモード/Sleep 設定の案内 */}
<View style={styles.tipCard}>
  <Text style={styles.tipTitle}>
    {t.onboardingFlow.focusSleepTitle}
    {/* "Allow During Focus & Sleep" */}
  </Text>
  <Text style={styles.tipDesc}>
    {t.onboardingFlow.focusSleepDesc}
    {/* "おやすみモード/集中モード/Sleep 中でもアラームが鳴るように、
         以下の設定を行ってください:
         1. 設定 → 集中モード → Sleep
         2. 「通知を許可」→ ScanAlarm を追加
         3. 「即時通知」を有効にする" */}
  </Text>
  <TouchableOpacity onPress={() => Linking.openSettings()}>
    <Text style={styles.tipLink}>
      {t.onboardingFlow.openFocusSettings}
      {/* "Open Focus Settings" */}
    </Text>
  </TouchableOpacity>
</View>

{/* ★ 新規: サイレントスイッチ警告 */}
<View style={styles.tipCard}>
  <Text style={styles.tipTitle}>
    {t.onboardingFlow.silentSwitchTitle}
    {/* "Silent Switch" */}
  </Text>
  <Text style={styles.tipDesc}>
    {t.onboardingFlow.silentSwitchDesc}
    {/* "iPhoneのサイレントスイッチがONの場合でもアラーム音は鳴りますが、
         Critical Alerts が有効でない場合は一部制限があります。" */}
  </Text>
</View>
```

#### 5-B. 設定画面にも「アラームが鳴らない場合」セクションを追加

`settings.tsx` に troubleshooting セクションを追加:

```typescript
// settings.tsx — 設定画面の下部に追加
<View style={styles.section}>
  <Text style={styles.sectionTitle}>{t.settings.troubleshootTitle}</Text>
  {/* "Alarm Not Working?" */}
  
  <TouchableOpacity style={styles.row} onPress={openTroubleshootGuide}>
    <Text style={styles.rowLabel}>{t.settings.troubleshootAlarm}</Text>
    {/* "Fix Alarm Issues" → ステップバイステップのガイド画面へ遷移 */}
  </TouchableOpacity>
</View>
```

ガイド内容:
1. 通知が許可されているか確認
2. Time Sensitive が有効か確認
3. 集中モード/Sleep で ScanAlarm が許可されているか確認
4. バッテリー最適化で制限されていないか確認（Android）
5. サウンド出力先の確認

---

### 実装の優先順位

| 順序 | 対象 | 効果 | 工数 |
|------|------|------|------|
| **1** | Layer 1 (通知サウンド30秒化) | バックグラウンド/キル状態でも30秒鳴る | 小 |
| **2** | Layer 3-A (lastNotificationResponse) | キル状態からの起動を確実に拾う | 小 |
| **3** | Layer 5 (オンボーディング強化) | ユーザーに正しい設定を案内 | 小 |
| **4** | Layer 4 (ネイティブ Bluetooth 制御) | デバイススピーカー強制出力 | 中（ネイティブモジュール） |
| **5** | Layer 2-A (Time Sensitive 権限明示) | フォーカスモード突破の確度向上 | 小 |
| **6** | Layer 2-B (Critical Alerts 申請) | 全環境で確実に鳴る究極の解 | 大（Apple審査） |

### Android での対応

Android は既に以下が設定済みで比較的問題が少ない:
- `AndroidImportance.MAX` (L73)
- `bypassDnd: true` (L78)
- `USE_FULL_SCREEN_INTENT` パーミッション
- `WAKE_LOCK` パーミッション

追加で必要な対応:
- `SCHEDULE_EXACT_ALARM` が Android 13+ で制限されるケースへの対応
- バッテリー最適化の除外をオンボーディングで案内

---

## 33. カメラ権限拒否時にホーム画面へ戻れない問題【バグ】

**問題**: QRコードスキャン画面でカメラアクセスを求められたとき、「Don't Allow」を選ぶと「Camera access is required. Allow」の画面から**どこにも遷移できなくなる**。戻るボタンもホームボタンもない。

**スクリーンショット参照**: `Camera allow`

**該当ファイル**: `app/scan.tsx` L246-252

**現在のコード**:
```tsx
// scan.tsx L246-252
if (!permission.granted) {
  return (
    <View style={styles.container}>
      <View style={styles.permissionCard}>
        <Text style={styles.message}>{t.scan.cameraRequired}</Text>
        <Button title={t.scan.allowCamera} onPress={requestPermission} />
      </View>
    </View>
  );
}
```

**問題点**: 「Allow」ボタン（`requestPermission`）のみで、ホームに戻る手段がない。iOSでは一度「Don't Allow」を選ぶと、以降 `requestPermission()` を呼んでも再度ポップアップが出ず、設定アプリに行く必要がある。

**修正内容**:

### A. ホームに戻るボタンを追加

```tsx
// scan.tsx — permission.granted === false の場合
if (!permission.granted) {
  return (
    <View style={styles.container}>
      <View style={styles.permissionCard}>
        {/* カメラアイコン */}
        <Ionicons name="camera-off-outline" size={48} color="#999" />
        
        <Text style={styles.message}>{t.scan.cameraRequired}</Text>
        <Text style={styles.subMessage}>
          {t.scan.cameraSettingsHint}
          {/* "カメラへのアクセスは設定アプリから許可できます" */}
        </Text>
        
        {/* 設定アプリを開くボタン */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.primaryButtonText}>
            {t.scan.openSettings}
            {/* "Open Settings" */}
          </Text>
        </TouchableOpacity>
        
        {/* ★ ホームに戻るボタン（必須） */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>
            {t.common.goHome}
            {/* "Back to Home" */}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### B. i18n キーの追加

```typescript
// i18n/en.ts
scan: {
  ...
  cameraSettingsHint: 'You can allow camera access from the Settings app.',
  openSettings: 'Open Settings',
},
common: {
  ...
  goHome: 'Back to Home',
},

// i18n/ja.ts
scan: {
  ...
  cameraSettingsHint: '設定アプリからカメラへのアクセスを許可できます。',
  openSettings: '設定を開く',
},
common: {
  ...
  goHome: 'ホームに戻る',
},
```

### C. UXフロー（修正後）

```
カメラ権限ポップアップ → 「Don't Allow」
   ↓
「Camera access is required」画面
   ├── [Open Settings] → 設定アプリへ（カメラ権限をONにして戻ればスキャン可能）
   └── [Back to Home] → ホーム画面へ戻る ★新規
```

---

## 34. オンボーディング「Important Settings」のFocus/Sleep設定を専用画面に分離

**問題**: オンボーディングの「Important Settings」画面で、Focus/Sleep Mode の設定案内が他の項目と一緒に表示されている。Focus/Sleep Modeは馴染みがないユーザーが多く、**タップしていいか分からない**状態になっている。

**スクリーンショット参照**: `S__56475653`

**該当ファイル**: `app/onboarding.tsx` L138-183

**現在のコード**:
```tsx
// onboarding.tsx L165-174
{Platform.OS === 'ios' && (
  <View style={styles.tipCard}>
    <Text style={styles.tipTitle}>{t.onboardingFlow.focusModeTitle}</Text>
    <Text style={styles.tipDesc}>{t.onboardingFlow.focusModeDesc}</Text>
    <TouchableOpacity onPress={handleOpenFocusSettings}>
      <Text style={styles.tipLink}>{t.onboardingFlow.focusModeButton}</Text>
    </TouchableOpacity>
  </View>
)}
```

**問題点**: Focus/Sleep設定が「Important Settings」画面内の1カードとして埋もれており、ユーザーが見落とす or 操作を躊躇する。

**修正内容**:

### A. Focus/Sleep Modeを専用ステップに分離

オンボーディングのステップ構成を変更:

```
現在: Step 1 (Welcome) → Step 2 (Important Settings: 通知 + Focus一括) → Step 3 (Done)
修正: Step 1 (Welcome) → Step 2 (通知許可) → Step 3 (Focus/Sleep設定 ★専用) → Step 4 (Done)
```

### B. 専用画面のUI設計

```tsx
// onboarding.tsx — Focus/Sleep Mode 専用ステップ

const renderFocusSleepStep = () => (
  <View style={styles.stepContainer}>
    {/* ヘッダー */}
    <Text style={styles.stepTitle}>
      {t.onboardingFlow.focusSleepStepTitle}
      {/* "Allow Alarm During Sleep" */}
    </Text>
    
    <Text style={styles.stepDescription}>
      {t.onboardingFlow.focusSleepStepDesc}
      {/* "ScanAlarm needs to ring even when Focus or Sleep mode is active.
           Follow the steps below to allow it." */}
    </Text>
    
    {/* ステップバイステップガイド（スクリーンショット付き） */}
    <View style={styles.guideContainer}>
      <View style={styles.guideStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>1</Text>
        </View>
        <Text style={styles.guideText}>
          {t.onboardingFlow.focusStep1}
          {/* "Open Settings → Focus → Sleep" */}
        </Text>
      </View>
      
      <View style={styles.guideStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>2</Text>
        </View>
        <Text style={styles.guideText}>
          {t.onboardingFlow.focusStep2}
          {/* "Tap 'Apps' → Add ScanAlarm" */}
        </Text>
      </View>
      
      <View style={styles.guideStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>3</Text>
        </View>
        <Text style={styles.guideText}>
          {t.onboardingFlow.focusStep3}
          {/* "Enable 'Time Sensitive Notifications'" */}
        </Text>
      </View>
    </View>

    {/* 設定を開くボタン（大きく目立つように） */}
    <TouchableOpacity
      style={styles.primaryActionButton}
      onPress={handleOpenFocusSettings}
    >
      <Ionicons name="settings-outline" size={20} color="#fff" />
      <Text style={styles.primaryActionText}>
        {t.onboardingFlow.openFocusSettings}
        {/* "Open Settings" */}
      </Text>
    </TouchableOpacity>
    
    {/* スキップ/次へ */}
    <TouchableOpacity
      style={styles.skipButton}
      onPress={() => setCurrentStep(currentStep + 1)}
    >
      <Text style={styles.skipText}>
        {t.onboardingFlow.skipForNow}
        {/* "Skip for now (you can set this later in Settings)" */}
      </Text>
    </TouchableOpacity>
  </View>
);
```

### C. ステップ数の更新

```tsx
// onboarding.tsx
const TOTAL_STEPS = Platform.OS === 'ios' ? 4 : 3;
// iOS: Welcome → Notifications → Focus/Sleep → Done
// Android: Welcome → Notifications → Done（Focus不要）

const renderStep = () => {
  switch (currentStep) {
    case 0: return renderWelcome();
    case 1: return renderNotificationPermission();
    case 2:
      if (Platform.OS === 'ios') return renderFocusSleepStep(); // ★専用画面
      return renderComplete();
    case 3: return renderComplete();
  }
};
```

### D. UI設計のポイント

- **ステップ番号付きガイド**: 「1 → 2 → 3」で視覚的に手順が分かる
- **「Open Settings」ボタンを大きく**: ユーザーが迷わずタップできる
- **スキップ可能**: 後から設定画面で案内できるよう「Skip for now」を用意
- **iOSのみ表示**: Androidではこのステップをスキップ（`Platform.OS` で制御）
- **スクリーンショット**: 将来的にiOS設定画面のスクショを `assets/` に追加し、ガイド内に表示すると更に分かりやすい

---

## 35. ホーム画面ヒーローセクションから時間表示を削除し、メッセージのみ表示

**問題**: ホーム画面上部のヒーローセクションに時間（例: `12:44`）とグリーティングメッセージ（例: `Good Morning`）の両方が表示されているが、時間表示は不要。メッセージだけでよい。

**スクリーンショット参照**: `S__56475654`

**該当ファイル**: `app/(tabs)/index.tsx` L288-295

**現在のコード**:
```tsx
// index.tsx L288-295
{/* Hero — Time & Greeting */}
<Animated.View style={[styles.heroSection, { opacity: heroFade }]}>
  <Text style={styles.heroDateText}>{dateString}</Text>

  {/* Time — hidden during typing phase, fades in after shrink */}
  <Animated.Text style={[styles.heroTime, { opacity: greetingPhase === 'typing' ? timeOpacity : 1 }]}>
    {currentTime}
  </Animated.Text>

  {greeting ? (
    ...
```

**修正内容**:

### A. 時間表示の削除

```tsx
// index.tsx — ヒーローセクション修正
{/* Hero — Greeting Only */}
<Animated.View style={[styles.heroSection, { opacity: heroFade }]}>
  <Text style={styles.heroDateText}>{dateString}</Text>

  {/* ★ currentTime の表示を削除 */}
  {/* 以下の時間表示ブロックを丸ごと削除:
  <Animated.Text style={[styles.heroTime, { opacity: ... }]}>
    {currentTime}
  </Animated.Text>
  */}

  {greeting ? (
    <Animated.View
      style={[
        greetingPhase === 'typing' ? styles.greetingTypingContainer : undefined,
        {
          transform: [
            { scale: greetingScale },
            { translateY: greetingTranslateY },
          ],
        },
      ]}
    >
      <HandwrittenText
        text={greeting}
        style={greetingPhase === 'done' ? styles.heroGreeting : styles.greetingTyping}
        speed={60}
        delay={400}
        onComplete={handleTypingComplete}
      />
    </Animated.View>
  ) : null}
</Animated.View>
```

### B. 不要になるコードのクリーンアップ

以下の変数・ロジックも削除可能:

```tsx
// 削除対象（index.tsx）

// L109-115: currentTime の state と更新ロジック
const [currentTime, setCurrentTime] = useState(() => { ... });
// 関連する setInterval も削除

// L293-295: heroTime の Animated.Text（上記Aで削除済み）

// styles から削除:
heroTime: {
  fontSize: 72,
  fontWeight: '200',
  color: '#FFFFFF',
  letterSpacing: -2,
},
```

### C. timeOpacity アニメーションの整理

`currentTime` を削除すると `timeOpacity` も不要になる。グリーティングのタイピングアニメーション（`greetingPhase === 'typing'`）で `timeOpacity` を使っていた箇所を確認し、不要であれば削除:

```tsx
// 削除候補:
const timeOpacity = useRef(new Animated.Value(0)).current;
// timeOpacity に関連する Animated.timing も削除
```

### D. 表示構成（修正後）

```
修正前: [日付] → [時間 12:44] → [Good Morning]
修正後: [日付] → [Good Morning]（メッセージのみ）
```

---

## 36. アラーム発火を1秒精度に改善（フォアグラウンドポーリング5秒→1秒 + 通知トリガーの最適化）

**問題**: アラームが設定時刻ちょうどに鳴らないことがある。フォアグラウンドでアプリを開いている場合、5秒間隔のポーリングが原因で最大5秒の遅延が発生する。

### 現在のアラーム発火メカニズム（調査結果）

アラームは**2系統**で発火する:

#### 系統1: OS通知（メイン — バックグラウンド対応）

**ファイル**: `services/alarmService.ts` L107-161

```typescript
// ワンショットアラーム（L136-148）
target.setHours(alarm.hour, alarm.minute, 0, 0); // ← 秒=0固定
trigger: {
  type: SchedulableTriggerInputTypes.DATE,
  date: target,        // ← Date オブジェクトで秒単位の精度あり
  channelId: ALARM_CHANNEL_ID,
}

// 繰り返しアラーム（L117-130）
trigger: {
  type: SchedulableTriggerInputTypes.WEEKLY,
  weekday: alarm.repeatDays[i] + 1,
  hour: alarm.hour,
  minute: alarm.minute,  // ← 分単位（秒指定なし）
  channelId: ALARM_CHANNEL_ID,
}
```

**精度**: OS通知は基本的に正確（±1秒以内）。ただしiOSはバッテリー最適化で数秒遅延する可能性がある。

#### 系統2: フォアグラウンドポーリング（補助 — アプリ開いている時のみ）

**ファイル**: `app/_layout.tsx` L127-158

```typescript
// ★ 5秒間隔でポーリング
const interval = setInterval(checkAlarmTime, 5000);

// checkAlarmTime の中身（時・分のみ比較）
const now = new Date();
const currentHour = now.getHours();
const currentMinute = now.getMinutes();
// alarm.hour === currentHour && alarm.minute === currentMinute を比較
```

**精度**: **最大5秒の遅延**。12:00:00に設定しても、前回チェックが11:59:57だった場合、次のチェックは12:00:02になり2秒遅れる。

#### 重複防止: クールダウンガード

**ファイル**: `app/_layout.tsx` L21-29

```typescript
function shouldTriggerAlarm(alarmId: string): boolean {
  const last = alarmTriggerTimes.get(alarmId);
  if (last && Date.now() - last < 90000) return false; // 90秒クールダウン
  alarmTriggerTimes.set(alarmId, Date.now());
  return true;
}
```

これにより、通知とポーリングの両方が発火しても、先に到達した方だけがアラームを鳴らす。

---

### 修正内容

### A. フォアグラウンドポーリングを1秒間隔に変更

```typescript
// _layout.tsx — L127付近
// 修正前:
const interval = setInterval(checkAlarmTime, 5000);

// 修正後:
const interval = setInterval(checkAlarmTime, 1000);
```

**パフォーマンス考慮**:
- 1秒ポーリングは `Date()` の生成と数値比較のみなので負荷は無視できるレベル
- バッテリーへの影響もごくわずか（CPU wake は元々5秒ごとに発生していた）

### B. 秒の比較を追加（分の変わり目で即発火）

```typescript
// _layout.tsx — checkAlarmTime 関数を修正
const checkAlarmTime = async () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  const alarms = await getAlarms();
  for (const alarm of alarms) {
    if (!alarm.enabled) continue;

    const isTimeMatch =
      alarm.hour === currentHour &&
      alarm.minute === currentMinute &&
      currentSecond < 5; // ★ 分の先頭5秒以内のみ発火（重複防止と併用）

    if (isTimeMatch) {
      const alarmId = alarm.id || `alarm_${alarm.hour}_${alarm.minute}`;
      if (!shouldTriggerAlarm(alarmId)) continue;

      // アラーム発火
      const outputMode = await getSoundOutputMode();
      playAlarm(alarm.soundId || 'gentle', undefined, 1.0, false, outputMode);
      router.push({ pathname: '/ringing', params: { alarmId } });
    }
  }
};
```

### C. WEEKLY トリガーの秒精度を確認

`SchedulableTriggerInputTypes.WEEKLY` は `hour` と `minute` のみ指定で、秒は OS 依存（通常 :00 に発火）。
`SchedulableTriggerInputTypes.DATE` は `Date` オブジェクトで秒まで指定可能なので、こちらは問題なし。

WEEKLY の場合も OS レベルで分の先頭（:00秒）に発火するため、実用上は問題ないが、もし遅延が観測された場合は WEEKLY → DATE に変換して毎週再スケジュールする方式も検討:

```typescript
// 代替案: WEEKLY を使わず DATE で1週間分スケジュール
// メリット: 秒精度を完全制御可能
// デメリット: 毎週リスケジュールが必要

const scheduleWeeklyAsDate = (alarm: Alarm, dayOffset: number) => {
  const target = new Date();
  target.setDate(target.getDate() + dayOffset);
  target.setHours(alarm.hour, alarm.minute, 0, 0); // 秒=0で正確に発火
  return {
    type: SchedulableTriggerInputTypes.DATE,
    date: target,
    channelId: ALARM_CHANNEL_ID,
  };
};
```

### D. スヌーズ・テストアラームの精度確認

**スヌーズ**: `TIME_INTERVAL` + `seconds: 300`（5分後） → 秒精度OK
**テスト**: `TIME_INTERVAL` + `seconds: 10`（10秒後） → 秒精度OK

これらは問題なし。

### E. 発火フロー（修正後）

```
アプリがバックグラウンド/キル状態:
  OS通知 → 12:00:00 に発火（±1秒、OS依存）
  → _layout.tsx の通知リスナーが受信 → /ringing へ遷移

アプリがフォアグラウンド:
  ポーリング（1秒間隔）→ 12:00:00〜12:00:04 の間に検知
  → shouldTriggerAlarm でクールダウン確認 → /ringing へ遷移
  ※ OS通知も同時に届くが、クールダウンガードで重複防止
```

**改善効果**: フォアグラウンド時の最大遅延が **5秒 → 1秒** に短縮。

---

## 37. ウェルカム画面の説明文を変更 — 購入品のバーコードでもOKと明記【バグ/UX】

**問題**: ウェルカム画面の説明文が「QRコードやバーコードをスキャンするまで止まりません。コードを洗面所やキッチン…」となっているが、**購入した製品に貼ってあるバーコードでもスキャンすれば二度寝防止になる**という点が伝わらない。

**スクリーンショット参照**: `shokoreview3.jpg`

**該当ファイル**: `i18n/ja.ts` L34-40, `i18n/en.ts` L34-41

**現在のテキスト**:
```typescript
// i18n/ja.ts
appDescription: 'このアラームはQRコードやバーコードをスキャンするまで止まりません。コードを洗面所やキッチン、玄関など歩いて行かなければならない場所に貼っておけば、もう寝坊しません。',

// i18n/en.ts
appDescription: "This alarm won't stop until you scan a QR code or barcode. Place the code somewhere you have to walk to — your bathroom, kitchen, or front door — and you'll never oversleep again.",
```

**修正内容**:

```typescript
// i18n/ja.ts
appDescription: 'このアラームはQRコードやバーコードをスキャンするまで止まりません。お菓子や飲み物など、購入した製品に貼ってあるバーコードでもOK！洗面所やキッチンなど歩いて行かなければならない場所に置いておけば、二度寝を防止できます。',

// i18n/en.ts
appDescription: "This alarm won't stop until you scan a QR code or barcode. Even a barcode on any product you've bought — snacks, drinks, anything — works! Place it somewhere you have to walk to, and you'll never hit snooze again.",
```

**ポイント**:
- 「購入した製品のバーコードでもOK」を明記 → 専用QRコードを印刷しなくていいと安心感
- 「二度寝防止」というキーワードを入れる

---

## 38. ウェルカム画面のニックネーム入力でキーボードが常時表示される問題【バグ】

**問題**: ウェルカム画面で「ニックネーム なんて呼びましょう？」の入力欄にフォーカスが自動で当たり、キーボードが常時表示されるため、画面下部のボタン（「はじめる」等）が隠れて見えない。

**スクリーンショット参照**: `shokoreview3.jpg` — キーボードが画面下半分を占め、下のボタンが見切れている

**該当ファイル**: `app/onboarding.tsx` L107-118

**現在のコード**:
```tsx
// onboarding.tsx L107-118
<TextInput
  style={styles.textInput}
  ...
  autoFocus        // ★ これが原因 — 画面表示と同時にキーボードが出る
  returnKeyType="done"
  onSubmitEditing={handleNameDone}
/>
```

画面構造（L253-272, L316-362）:
```tsx
<KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
  // ScrollView がない → キーボード表示時にスクロールできない
  <View style={styles.stepContainer}>  // flex: 1
    ...
    <View style={styles.inputCard}>   // marginBottom: SPACING.xxl
      <TextInput autoFocus ... />
    </View>
    // ↓ ここから下がキーボードに隠れる
    <TouchableOpacity style={styles.primaryButton}>...</TouchableOpacity>
  </View>
</KeyboardAvoidingView>
```

**修正内容**:

### A. autoFocus を削除

```tsx
// onboarding.tsx — TextInput
<TextInput
  style={styles.textInput}
  ...
  autoFocus={false}  // ★ 自動フォーカスを無効化
  returnKeyType="done"
  onSubmitEditing={handleNameDone}
/>
```

### B. ScrollView でラップしてキーボード表示時もスクロール可能に

```tsx
// onboarding.tsx — ウェルカムステップ
<KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >
    <View style={styles.stepContainer}>
      {/* ウェルカムテキスト */}
      ...
      {/* ニックネーム入力 */}
      <TextInput autoFocus={false} ... />
      {/* はじめるボタン — キーボード表示時もスクロールで到達可能 */}
      <TouchableOpacity ...>...</TouchableOpacity>
    </View>
  </ScrollView>
</KeyboardAvoidingView>
```

### C. キーボード外タップで閉じる

```tsx
// onboarding.tsx — Keyboard.dismiss 追加
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  <ScrollView ...>
    ...
  </ScrollView>
</TouchableWithoutFeedback>
```

---

## 39. カメラ権限「設定を開く」がPrivacy設定に飛ぶ問題 → ScanAlarmアプリ設定に誘導【バグ・修正済み】

**問題**: カメラ権限拒否後の「Open Privacy Settings」ボタンが `App-Prefs:PRIVACY&path=CAMERA`（プライバシー設定）に遷移してしまい、ScanAlarmのアプリ設定（カメラトグルあり）に行かない。

**スクリーンショット参照**: `shokoreview1.jpg`, `S__56524808`

**修正済み（コード変更）**:
- `scan.tsx`: `Linking.openURL('App-Prefs:PRIVACY&path=CAMERA')` → `Linking.openSettings()`（ScanAlarmアプリ設定へ）
- ボタンテキスト: 「Open Privacy Settings」→「Open ScanAlarm Settings」
- ヒントテキスト: 「Go to Settings > Privacy & Security > Camera > ScanAlarm」→「Go to Settings > Apps > ScanAlarm and enable Camera」
- 4言語（en/ja/es/ko）のi18nを更新済み

**該当ファイル**: `app/scan.tsx` L254-259

**現在のコード**:
```tsx
// scan.tsx L254-259
<TouchableOpacity
  ...
  onPress={() => Linking.openSettings()}
>
  <Text ...>{t.scan.openSettings}</Text>
</TouchableOpacity>
```

**根本原因**: `Linking.openSettings()` は「設定 > ScanAlarm」（アプリ固有設定）を開く。しかしiOSではカメラ権限を一度も許可していない場合、そのアプリの設定ページにカメラのトグルが**表示されない**。カメラ権限トグルが表示されるのは、一度「Allow」した後に取り消した場合のみ。

**修正内容**:

### A. 初回拒否 vs 再拒否を判別して案内を分ける

```tsx
// scan.tsx — permission 状態に応じた分岐
import { Camera } from 'expo-camera';

const [permission, requestPermission] = Camera.useCameraPermissions();

if (!permission?.granted) {
  const canAskAgain = permission?.canAskAgain ?? true;

  return (
    <View style={styles.container}>
      <View style={styles.permissionCard}>
        <Ionicons name="camera-off-outline" size={48} color="#999" />

        {canAskAgain ? (
          // ★ 初回または再リクエスト可能 → アプリ内で再度許可を求める
          <>
            <Text style={styles.message}>{t.scan.cameraRequired}</Text>
            <Text style={styles.subMessage}>
              {t.scan.cameraAllowHint}
              {/* "アラーム解除にはカメラが必要です。「許可」をタップしてください。" */}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={requestPermission}
            >
              <Text style={styles.primaryButtonText}>
                {t.scan.allowCamera}
                {/* "カメラを許可" */}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          // ★ 「Don't Allow」後で再リクエスト不可 → 設定アプリに誘導
          // ただし設定にカメラ項目がない場合の案内も追加
          <>
            <Text style={styles.message}>{t.scan.cameraBlocked}</Text>
            <Text style={styles.subMessage}>
              {t.scan.cameraBlockedHint}
              {/* "カメラへのアクセスが拒否されています。
                   設定 > プライバシーとセキュリティ > カメラ > ScanAlarm
                   から許可してください。" */}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                // ★ プライバシー設定のカメラセクションを直接開く
                if (Platform.OS === 'ios') {
                  Linking.openURL('App-Prefs:PRIVACY&path=CAMERA');
                } else {
                  Linking.openSettings();
                }
              }}
            >
              <Text style={styles.primaryButtonText}>
                {t.scan.openPrivacySettings}
                {/* "プライバシー設定を開く" */}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ホームに戻るボタン（共通） */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>
            {t.common.goHome}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### B. i18n キー追加

```typescript
// i18n/ja.ts
scan: {
  cameraAllowHint: 'アラーム解除にはカメラが必要です。「許可」をタップしてください。',
  cameraBlocked: 'カメラへのアクセスが拒否されています',
  cameraBlockedHint: '設定 > プライバシーとセキュリティ > カメラ > ScanAlarm から許可してください。',
  openPrivacySettings: 'プライバシー設定を開く',
},

// i18n/en.ts
scan: {
  cameraAllowHint: 'Camera access is needed to dismiss alarms. Tap "Allow" to continue.',
  cameraBlocked: 'Camera access is blocked',
  cameraBlockedHint: 'Go to Settings > Privacy & Security > Camera > ScanAlarm to allow access.',
  openPrivacySettings: 'Open Privacy Settings',
},
```

### C. 注意事項

- `App-Prefs:PRIVACY&path=CAMERA` はプライベートAPIで、App Store審査でリジェクトされる可能性がある
- リジェクトされた場合のフォールバック: `Linking.openSettings()` + テキストで「プライバシー > カメラ」への手順を案内
- `expo-camera` の `info.plist` に `NSCameraUsageDescription` が正しく設定されているか確認すること（設定されていないとカメラ項目自体が表示されない）

### D. info.plist / app.json の確認

```json
// app.json — iOS セクションに以下があるか確認
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "アラームを解除するためにQRコード/バーコードをスキャンします"
      }
    }
  }
}
```

`NSCameraUsageDescription` が未設定だと、iOSの設定画面にカメラ項目が一切表示されない。

---

## 40. オンボーディング「Focus Mode」がアプリ設定に飛ぶ問題 — Focus Mode設定に誘導すべき【バグ】

**問題**: オンボーディングの「Focus/Sleep Mode」設定案内で「Open Settings」をタップすると、ScanAlarmのアプリ設定（`app-settings:`）に遷移してしまう。ScanAlarmのアプリ設定にはフォーカスモードの項目は存在しないため、ユーザーは何もできない。**iOSのフォーカスモード設定に直接誘導すべき**。

**スクリーンショット参照**: `shokoreview2.jpg`（ScanAlarm設定画面 — フォーカスモード項目なし）

**該当ファイル**: `app/onboarding.tsx` L76-82

**現在のコード**:
```tsx
// onboarding.tsx L76-82
const handleOpenFocusSettings = async () => {
  // ★ 現在: ScanAlarmのアプリ設定を開いてしまう
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};
```

**修正内容**:

### A. iOSフォーカスモード設定を直接開く

```tsx
// onboarding.tsx — handleOpenFocusSettings を修正
const handleOpenFocusSettings = async () => {
  if (Platform.OS === 'ios') {
    // ★ フォーカスモード設定を直接開く
    const focusUrl = 'App-Prefs:FOCUS';
    const canOpen = await Linking.canOpenURL(focusUrl);
    if (canOpen) {
      await Linking.openURL(focusUrl);
    } else {
      // フォールバック: iOS設定のトップを開く
      await Linking.openURL('App-Prefs:');
    }
  } else {
    Linking.openSettings();
  }
};
```

### B. 注意事項

- `App-Prefs:FOCUS` はプライベートURLスキーム。App Store審査でリジェクトされる可能性がある
- リジェクトされた場合のフォールバック案:
  - `Linking.openURL('App-Prefs:')` でiOS設定トップを開き、テキストで「集中モード > Sleep > 通知を許可するApp > ScanAlarmを追加」と手順案内
  - または画面内にスクリーンショット付きのステップガイドを表示（項目34の設計と連携）

### C. ScanAlarm通知設定への誘導も追加（2段階案内）

フォーカスモード設定に加えて、ScanAlarmの通知設定（Time Sensitive）も案内するのが理想:

```tsx
// 2つのボタンを用意
<View style={styles.settingsButtons}>
  {/* ① フォーカスモード設定 */}
  <TouchableOpacity onPress={handleOpenFocusSettings}>
    <Text style={styles.tipLink}>
      {t.onboardingFlow.openFocusSettings}
      {/* "フォーカスモード設定を開く" */}
    </Text>
  </TouchableOpacity>

  {/* ② ScanAlarmの通知設定（Time Sensitive確認用） */}
  <TouchableOpacity onPress={() => Linking.openSettings()}>
    <Text style={styles.tipLink}>
      {t.onboardingFlow.openNotificationSettings}
      {/* "ScanAlarmの通知設定を開く" */}
    </Text>
  </TouchableOpacity>
</View>
```

---

## 41. ホーム画面の日付テキストとグリーティングメッセージが重なる問題【バグ】

**問題**: ホーム画面上部で「4月12日（日）」の日付テキストと「こんにちは、しょうこさん」のグリーティングメッセージが重なって表示されている。グリーティングのアニメーション最終状態が上にずれすぎている。

**スクリーンショット参照**: `shokoreview.jpg` — 日付とグリーティングが同じ位置に重なっている

**該当ファイル**: `app/(tabs)/index.tsx` L126-143, L279-300, L409-427

**根本原因**: グリーティングのアニメーション最終状態で `translateY: -50` が設定されており、グリーティングテキストが日付テキストの位置まで上にずれている。

**現在のコード**:
```tsx
// index.tsx L126-143 — アニメーション完了/スキップ時の値
if (hasPlayed) {
  setGreetingPhase('done');
  greetingScale.setValue(0.55);       // 元の55%サイズに縮小
  greetingTranslateY.setValue(-50);   // ★ -50px上にずらす → 日付と重なる
}

// アニメーション（タイピング完了後の縮小）
Animated.parallel([
  Animated.spring(greetingScale, { toValue: 0.55, ... }),
  Animated.timing(greetingTranslateY, { toValue: -50, duration: 600, ... }),
  // ★ ここでも -50px 上に移動
]).start(() => setGreetingPhase('done'));
```

```tsx
// index.tsx L279-300 — ヒーローセクションの描画
<Animated.View style={[styles.heroSection, { opacity: heroFade }]}>
  <Text style={styles.heroDateText}>{dateString}</Text>
  {/* ↑ 日付 "4月12日（日）" */}

  {/* ★ 時間は項目35で削除予定 */}

  {greeting ? (
    <Animated.View style={[..., {
      transform: [
        { scale: greetingScale },       // 0.55
        { translateY: greetingTranslateY }, // -50 → 日付と重なる
      ],
    }]}>
      <HandwrittenText
        text={greeting}
        style={greetingPhase === 'done' ? styles.heroGreeting : styles.greetingTyping}
      />
    </Animated.View>
  ) : null}
</Animated.View>
```

**修正内容**:

### A. translateY の値を調整して重ならないようにする

```tsx
// index.tsx — アニメーション最終値を修正

// 修正前:
greetingScale.setValue(0.55);
greetingTranslateY.setValue(-50);

// 修正後（項目35で時間表示を削除した前提）:
greetingScale.setValue(1.0);    // ★ 縮小しない — 大きい文字のまま表示
greetingTranslateY.setValue(0); // ★ 上にずらさない — 日付の下に配置
```

### B. アニメーションの最終状態も修正

```tsx
// index.tsx — Animated.parallel の toValue を修正
Animated.parallel([
  Animated.spring(greetingScale, {
    toValue: 1.0,       // ★ 縮小しない
    useNativeDriver: true,
    friction: 8,
  }),
  Animated.timing(greetingTranslateY, {
    toValue: 0,          // ★ 上にずらさない
    duration: 600,
    useNativeDriver: true,
  }),
]).start(() => setGreetingPhase('done'));
```

### C. heroGreeting スタイルの調整

```tsx
// index.tsx — styles
heroGreeting: {
  fontSize: FONT_SIZE.h2,      // ★ 大きめのフォントサイズ（項目35と連携）
  fontWeight: '600',
  color: colors.textPrimary,
  textAlign: 'center',
  marginTop: SPACING.md,       // ★ 日付との間に適切な余白
},

heroDateText: {
  fontSize: FONT_SIZE.labelSmall,
  color: colors.textSecondary,
  marginBottom: SPACING.sm,    // 日付下の余白
},
```

### D. 表示構成（修正後）

```
修正前: [4月12日（日）]  ← 日付
         [こんにちは、しょうこさん]  ← 重なって読めない（translateY: -50 + scale: 0.55）

修正後: [4月12日（日）]            ← 日付（通常サイズ）
              ↓ marginTop
         [こんにちは、しょうこさん]   ← グリーティング（大きい文字、重ならない）
```

### E. 項目35との連携

項目35で時間表示（`currentTime`）を削除するため、ヒーローセクションは:
```
[日付] → [グリーティングメッセージ（大きく常時表示）]
```
のシンプルな2行構成になる。`translateY` と `scale` のアニメーションは**タイピングアニメーション中のみ**使い、完了後は通常のレイアウトフローに戻すのが正しい。

---

## 42. カメラ権限画面の「設定を開く」「ホームに戻る」ボタンを同じサイズに統一【UI・修正済み】

**問題**: カメラ権限拒否画面の「Open ScanAlarm Settings」と「Back to Home」のボタンサイズが異なっていた。

**スクリーンショット参照**: `shokoreview1.jpg`, `S__56524808`

**修正済み（コード変更）**:
- `permissionPrimaryButton` から `marginBottom: SPACING.md` を削除
- 両ボタンとも `width: '100%'`, `paddingVertical: SPACING.xl`, `minHeight: 56` で完全統一
- ボタン間の余白は `permissionCard` の `gap: SPACING.md` で統一管理

**該当ファイル**: `app/scan.tsx` L627-652

**現在のスタイル**:
```tsx
// scan.tsx L627-652
permissionPrimaryButton: {
  width: '100%',
  backgroundColor: c.accent,
  paddingVertical: SPACING.lg,
  borderRadius: RADIUS.full,
  alignItems: 'center',
  marginBottom: SPACING.base,
},
permissionSecondaryButton: {
  width: '100%',
  paddingVertical: SPACING.lg,
  borderRadius: RADIUS.full,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: c.textMuted,
},
```

**修正内容**:

### A. ボタンスタイルを統一

両ボタンのサイズ（幅、高さ、パディング）を完全に同じにし、色のみで区別する:

```tsx
// scan.tsx — styles 修正

// 共通ボタンサイズ
const permissionButtonBase = {
  width: '100%',
  paddingVertical: SPACING.xl,        // ★ lg → xl に拡大（窮屈さ解消）
  borderRadius: RADIUS.full,
  alignItems: 'center' as const,
  minHeight: 56,                       // ★ 最小高さを統一
};

permissionPrimaryButton: {
  ...permissionButtonBase,
  backgroundColor: c.accent,
  marginBottom: SPACING.md,            // ★ base → md に拡大（ボタン間の余白）
},
permissionPrimaryButtonText: {
  fontSize: FONT_SIZE.body,
  fontFamily: FONT_FAMILY.semiBold,
  color: c.accentText,
},
permissionSecondaryButton: {
  ...permissionButtonBase,
  backgroundColor: 'transparent',
  borderWidth: 1.5,                    // ★ 1 → 1.5 でやや太く
  borderColor: c.textSecondary,        // ★ textMuted → textSecondary でやや濃く
},
permissionSecondaryButtonText: {
  fontSize: FONT_SIZE.body,            // ★ 同じフォントサイズ
  fontFamily: FONT_FAMILY.medium,
  color: c.textSecondary,
},
```

### B. ボタン間の余白も調整

```tsx
// scan.tsx — permissionCard のパディング
permissionCard: {
  alignItems: 'center',
  paddingHorizontal: SPACING['3xl'],   // ★ 5xl → 3xl で左右余白を少し減らす
  gap: SPACING.md,                     // ★ アイコン・テキスト・ボタン間の統一余白
},
```

---

## 43. ホーム画面右上の「QR登録」ボタンを削除

**問題**: ホーム画面の右上にある「QR登録」ボタンが不要。QRコード管理は項目2で設定画面内に配置する予定のため、ホーム画面からは削除する。

**スクリーンショット参照**: `shokoreview.jpg` — 右上に「QR登録」ボタンが表示されている

**該当ファイル**: `app/(tabs)/index.tsx` L266-276

**現在のコード**:
```tsx
// index.tsx L265-276
{/* Top bar */}
<View style={styles.topBar}>
  <TouchableOpacity
    style={[styles.qrButton, hasQR && styles.qrButtonRegistered]}
    onPress={handleRegisterQR}
    activeOpacity={ACTIVE_OPACITY.default}
  >
    <Text style={[styles.qrButtonText, hasQR && styles.qrButtonTextActive]}>
      {hasQR ? t.home.qrRegistered : t.home.qrRegister}
    </Text>
  </TouchableOpacity>
</View>
```

**修正内容**:

### A. topBar セクションを丸ごと削除

```tsx
// index.tsx — 以下のブロックを削除
{/* Top bar */}
<View style={styles.topBar}>
  <TouchableOpacity
    style={[styles.qrButton, hasQR && styles.qrButtonRegistered]}
    onPress={handleRegisterQR}
    activeOpacity={ACTIVE_OPACITY.default}
  >
    <Text style={[styles.qrButtonText, hasQR && styles.qrButtonTextActive]}>
      {hasQR ? t.home.qrRegistered : t.home.qrRegister}
    </Text>
  </TouchableOpacity>
</View>
```

### B. 関連するスタイルも削除

```tsx
// index.tsx — styles から削除
qrButton: { ... },          // L390-395
qrButtonRegistered: { ... }, // L396-398
qrButtonText: { ... },      // L399-403
qrButtonTextActive: { ... }, // L404-406
topBar: { ... },             // 関連スタイル
```

### C. 関連ロジックの整理

- `handleRegisterQR` 関数が他で使われていなければ削除
- `hasQR` state が他で使われていなければ削除
- i18n の `t.home.qrRegister`, `t.home.qrRegistered` が他で使われていなければ削除

### D. 項目2との連携

QRコード管理は項目2で**設定画面内**に配置する予定:
- 設定画面 → 「QRコード管理」→ 一覧表示 / 削除 / 追加
- ホーム画面からのQR登録導線は不要

---

## 44. オンボーディング: スキップ禁止 + 通知許可の必須化 + Focus Mode修正【バグ・修正済み】

**問題**: オンボーディングで複数の致命的な問題がある:
1. **Skipボタンでオンボーディング全体をスキップできてしまう** — スキップするとアプリが正常に動作しない
2. **通知を許可せずに次の画面に進めてしまう** — 通知がないとアラームが鳴らない
3. **「Open Focus Settings」が `App-Prefs:FOCUS` を使用** — プライベートAPIでApp Storeリジェクトされる。iOS 18で動作しない
4. **Time Sensitive Notifications のentitlementが未設定** — `interruptionLevel: 'timeSensitive'` が設定されていてもiOSがsilentlyに `active` にダウングレードし、Focus Mode中にアラームが鳴らない

**リファレンス画像**: `assets/screenshots/reference/S__56524809`

**リサーチ結果（2025年4月確認）**:

### A. Time Sensitive Notifications の仕組み

| レイヤー | 必要な設定 | 現在の状態 |
|---------|-----------|-----------|
| 1. Entitlement | `com.apple.developer.usernotifications.time-sensitive: true` in app.json | **未設定→修正済み** |
| 2. Apple Developer Portal | Time Sensitive Notifications capability | EAS Buildがentitlementから自動同期 |
| 3. コード | `interruptionLevel: 'timeSensitive'` | **設定済み**（alarmService.ts L110） |
| 4. ユーザー設定 | Settings → ScanAlarm → Notifications → Time Sensitive | entitlement設定後に自動表示 |

- `expo-notifications` のconfig pluginは `aps-environment` のみ追加。Time Sensitive entitlementは **手動追加が必要**
- entitlementがないと、iOSが通知を `active` レベルにダウングレードする（エラーは出ない）
- entitlement追加後、次回EAS Buildで反映される

### B. App-Prefs:FOCUS は禁止

| 方法 | Focus設定に行けるか | App Store許可 |
|------|-------------------|--------------|
| `Linking.openSettings()` | ✗ アプリ設定のみ | **許可** |
| `Linking.openURL('app-settings:')` | ✗ アプリ設定のみ | **許可** |
| `Linking.openURL('App-Prefs:FOCUS')` | ○ | **禁止（リジェクト対象）** |

**正しいアプローチ**: アプリ設定を開く + テキストで手順案内

### C. 通知許可のiOS仕様

- iOSのシステム通知ダイアログは **1回しか表示されない**
- 拒否された場合、`requestPermissionsAsync()` を再度呼んでもダイアログは出ない
- 拒否後は `Linking.openSettings()` で設定画面に誘導するしかない

---

**修正内容（実施済み）**:

### 1. Skipボタンを全て削除

以下の4箇所からSkipを完全削除:

```diff
// onboarding.tsx

// (a) handleSkipToHome 関数を削除
- const handleSkipToHome = async () => {
-   await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
-   router.replace('/');
- };

// (b) 右上のグローバルSkipボタンを削除
- <TouchableOpacity style={styles.skipButton} onPress={handleSkipToHome}>
-   <Text style={styles.skipButtonText}>{t.onboardingFlow.skip}</Text>
- </TouchableOpacity>

// (c) Welcome画面のSkipテキストを削除
- <TouchableOpacity onPress={() => goToStep('permissions')}>
-   <Text style={styles.skipText}>{t.onboardingFlow.skip}</Text>
- </TouchableOpacity>

// (d) Focus画面のSkipを「Next」ボタンに変更
- <TouchableOpacity onPress={() => goToStep('ready')}>
-   <Text style={styles.skipText}>{t.onboardingFlow.focusSkip}</Text>
- </TouchableOpacity>
+ <TouchableOpacity style={styles.primaryButton} onPress={() => goToStep('ready')}>
+   <Text style={styles.primaryButtonText}>{t.onboardingFlow.next}</Text>
+ </TouchableOpacity>
```

### 2. 通知許可を必須化

```diff
// onboarding.tsx — renderPermissions

// Nextボタンを通知許可後のみ有効化
- <TouchableOpacity style={styles.primaryButton}
-   onPress={() => goToStep(Platform.OS === 'ios' ? 'focus' : 'ready')}>
-   <Text style={styles.primaryButtonText}>{t.onboardingFlow.next}</Text>
- </TouchableOpacity>
+ <TouchableOpacity
+   style={[styles.primaryButton, !notifGranted && styles.primaryButtonDisabled]}
+   onPress={() => {
+     if (notifGranted) goToStep(Platform.OS === 'ios' ? 'focus' : 'ready');
+   }}
+   activeOpacity={notifGranted ? ACTIVE_OPACITY.default : 1}
+ >
+   <Text style={[styles.primaryButtonText, !notifGranted && styles.primaryButtonTextDisabled]}>
+     {notifGranted ? t.onboardingFlow.next : t.onboardingFlow.enableNotificationFirst}
+   </Text>
+ </TouchableOpacity>
```

無効化スタイル:
```tsx
primaryButtonDisabled: {
  backgroundColor: c.bgTertiary,
  opacity: 0.6,
},
primaryButtonTextDisabled: {
  color: c.textMuted,
},
```

### 3. Focus Mode設定ボタンの修正

```diff
// onboarding.tsx — handleOpenFocusSettings

- const handleOpenFocusSettings = async () => {
-   if (Platform.OS === 'ios') {
-     const focusUrl = 'App-Prefs:FOCUS';
-     const canOpen = await Linking.canOpenURL(focusUrl);
-     if (canOpen) {
-       await Linking.openURL(focusUrl);
-     } else {
-       await Linking.openURL('App-Prefs:');
-     }
-   } else {
-     Linking.openSettings();
-   }
- };
+ const handleOpenFocusSettings = async () => {
+   // App-Prefs:FOCUS はプライベートAPIでApp Storeリジェクトされるため使用禁止
+   // ScanAlarmのアプリ設定を開き、テキストで手順案内する
+   if (Platform.OS === 'ios') {
+     Linking.openURL('app-settings:');
+   } else {
+     Linking.openSettings();
+   }
+ };
```

Focus画面のボタンを1つに統合（2つとも同じ遷移先なので）:
```diff
- {/* Open Focus Settings button */}
- <TouchableOpacity onPress={handleOpenFocusSettings}>
-   <Text>{t.onboardingFlow.openFocusSettings}</Text>  // "Open Focus Settings"
- </TouchableOpacity>
- {/* Open Notification Settings button */}
- <TouchableOpacity onPress={handleOpenNotificationSettings}>
-   <Text>{t.onboardingFlow.openNotificationSettings}</Text>  // "Open Notification Settings"
- </TouchableOpacity>
+ {/* Open ScanAlarm Settings button (統合) */}
+ <TouchableOpacity onPress={handleOpenFocusSettings}>
+   <Text>{t.onboardingFlow.openFocusSettings}</Text>  // "Open ScanAlarm Settings"
+ </TouchableOpacity>
```

### 4. Time Sensitive Notifications entitlement追加

```diff
// app.json — ios セクション
  "ios": {
    ...
    "infoPlist": { ... },
+   "entitlements": {
+     "com.apple.developer.usernotifications.time-sensitive": true
+   }
  },
```

### 5. i18n更新（全4言語）

```typescript
// en.ts
enableNotificationFirst: 'Enable notifications first',
openFocusSettings: 'Open ScanAlarm Settings',
openNotificationSettings: 'Open ScanAlarm Settings',

// ja.ts
enableNotificationFirst: '先に通知を有効にしてください',
openFocusSettings: 'ScanAlarmの設定を開く',
openNotificationSettings: 'ScanAlarmの設定を開く',

// es.ts
enableNotificationFirst: 'Primero active las notificaciones',
openFocusSettings: 'Abrir Ajustes de ScanAlarm',
openNotificationSettings: 'Abrir Ajustes de ScanAlarm',

// ko.ts
enableNotificationFirst: '먼저 알림을 활성화하세요',
openFocusSettings: 'ScanAlarm 설정 열기',
openNotificationSettings: 'ScanAlarm 설정 열기',
```

---

**テスト確認事項**:

- [ ] 全画面でSkipボタンが表示されないこと
- [ ] 通知を許可していない状態でNextボタンが無効（グレーアウト）であること
- [ ] 通知許可後にNextボタンが有効になること
- [ ] Focus画面の「Open ScanAlarm Settings」がScanAlarmのアプリ設定を開くこと
- [ ] EAS Build後、Settings → ScanAlarm → Notifications に「Time Sensitive Notifications」トグルが表示されること
- [ ] Time Sensitiveをオンにした状態でFocusモード中でもアラームが鳴ること

---

**今後の改善検討事項**:

1. **通知拒否時の再誘導**: iOSの通知ダイアログは1回しか出ない。拒否後は `Linking.openSettings()` + 「通知をONにしてからお戻りください」のUI + `AppState.addEventListener('change')` で戻り検知
2. **iOS 16+ SetFocusFilterIntent**: Focus Modeのフィルター設定にScanAlarmがネイティブに表示される（要追加実装）

---
