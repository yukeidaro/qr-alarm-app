# ScanAlarm: 3トラック並行リリース指示書

## Goal

以下の3トラックを**並行**で進め、Android/iOS両方のストアテストを開始する。

| Track | 内容 | ブロッカー |
|-------|------|-----------|
| **A: Android** | Gradle Build修正 → AAB生成 → Google Play Internal Testing | Gradle エラー修正 |
| **B: iOS** | EAS Build → TestFlight提出 → テスト | なし（Apple Developer 4/6承認済み） |
| **C: ストアアセット** | スクリーンショット・ストア画像準備 | なし（並行作業可） |

---

# Track A: Android Build修正 → Google Play

## A-1: エラーログの確認

Attempt 9のGradle phaseで失敗している。エラー詳細を確認する。

- **失敗ビルドID**: `cd0901ab-2b2c-40ba-802e-fb276b376d03`
- **ビルドログURL**: https://expo.dev/accounts/ukdayoharry/projects/qr-alarm-app/builds/cd0901ab-2b2c-40ba-802e-fb276b376d03#run-gradlew

CLIでも確認可能:
```bash
eas build:view cd0901ab-2b2c-40ba-802e-fb276b376d03
```

**確認ポイント**:
- Gradleのどのタスクで失敗しているか（`:app:bundleRelease`, `:app:mergeReleaseResources` 等）
- エラーメッセージの全文
- 依存関係の競合があるか

## A-2: エラー修正

エラーの種類に応じた対処パターン:

### パターンA: react-native-google-mobile-ads のビルドエラー
このライブラリ（v16.3.1）はReact Native 0.81 + Expo 54環境で互換性問題が起きやすい。

- `app.json` の `expo-build-properties` プラグインにAndroid設定を追加:
```json
["expo-build-properties", {
  "ios": { "useFrameworks": "static" },
  "android": {
    "compileSdkVersion": 35,
    "targetSdkVersion": 35,
    "minSdkVersion": 24,
    "kotlinVersion": "1.9.25"
  }
}]
```

### パターンB: Kotlin/Gradle バージョン競合
`react-native-google-mobile-ads` が要求するKotlinバージョンとExpoのデフォルトが衝突する場合。
- `expo-build-properties` で `kotlinVersion` を明示的に指定（上記参照）

### パターンC: リソースの重複・欠損
`assets/sounds/` 配下のオーディオファイル（48個以上のWAVファイル）が原因の場合:
- `.easignore` を確認（現在 `*.wav` は除外していない — 修正済み）
- ファイル名に日本語やスペースが含まれていないか確認

### パターンD: メモリ不足 (OOM)
Gradleビルドがメモリ不足で落ちる場合:
- `eas.json` の production profile に追加:
```json
"production": {
  "autoIncrement": true,
  "channel": "production",
  "env": {
    "GRADLE_OPTS": "-Xmx4g -XX:MaxMetaspaceSize=512m"
  }
}
```

**実際のエラーメッセージを見て、上記のどれに該当するか判断し、適切な修正を適用すること。**

## A-3: ビルド前の準備（必須 — 毎回実行）

OneDriveがDeny ACLを再付与する問題あり。ビルド前に必ず実行:

```powershell
# Deny ACLチェック
powershell -Command "icacls 'C:\Users\yuasano\OneDrive - Microsoft\Documents\02 Claude\12-qr-alarm-app' /T /C 2>&1 | Select-String 'Deny'"

# 出力があれば除去
powershell -Command "icacls 'C:\Users\yuasano\OneDrive - Microsoft\Documents\02 Claude\12-qr-alarm-app' /remove:d Everyone /T /C"
```

## A-4: Android再ビルド

```bash
cd "C:\Users\yuasano\OneDrive - Microsoft\Documents\02 Claude\12-qr-alarm-app"
eas build --platform android --profile production --non-interactive
```

- versionCodeは `autoIncrement: true` で自動インクリメント（現在9）
- ビルドはExpoクラウドで実行（10-15分）

## A-5: Google Play Console へ提出

### 方法A: EAS Submit（推奨）
```bash
eas submit --platform android --profile production
```
- `eas.json` で `"track": "internal"` 設定済み → Internal Testingトラックに自動提出

### 方法B: 手動アップロード
1. Google Play Console → ScanAlarm（パッケージ名: `com.yuasano.qralarm`）
2. **Testing > Internal testing** → **Create new release**
3. `.aab` をアップロード
4. Release notes: `ScanAlarm初回リリース - QRコードスキャンでアラームを解除するアプリ`
5. **Save** → **Review release** → **Start rollout to Internal testing**

---

# Track B: iOS Build → TestFlight

Apple Developer Programが2026-04-06に承認済み。iOSビルドのブロッカーは解消。

## B-1: ビルド前の準備

A-3と同じOneDrive ACL除去を実行すること（共通手順）。

## B-2: iOS Production Build

```bash
cd "C:\Users\yuasano\OneDrive - Microsoft\Documents\02 Claude\12-qr-alarm-app"
eas build --platform ios --profile production --non-interactive
```

**注意点**:
- Apple Developer Team IDの設定確認が必要な場合がある
- 初回ビルド時に provisioning profile と signing certificate が自動生成される
- EASアカウント: ukdayoharry (yukeiasano@gmail.com)
- Bundle Identifier: `com.yuasano.qralarm`
- ビルド時間: 15-25分（iOSはAndroidより長い）

**もしEAS Build中にApple認証を求められたら**:
- Apple IDとパスワードの入力が必要
- App-specific passwordが必要な場合は https://appleid.apple.com で生成
- 2FAコードの入力を求められる場合あり

## B-3: TestFlightへ提出

ビルド成功後:
```bash
eas submit --platform ios --profile production
```

**EAS Submitが求める情報**:
- Apple ID (メールアドレス)
- App-specific password（2FAが有効な場合）
- ASC App ID（初回は自動作成される）

## B-4: App Store Connect設定（手動 — TestFlightテスト開始に必要）

TestFlightで配布するために、App Store Connectで以下を設定:

1. https://appstoreconnect.apple.com にログイン
2. **My Apps** → ScanAlarm が自動作成されているはず（EAS Submitで作成）
3. **TestFlight** タブに移動
4. ビルドが処理完了するのを待つ（数分〜1時間）
5. **Export Compliance**: 「暗号化を使用していますか？」→ **No**（標準HTTPS以外の暗号化なし）
6. **Internal Testing** グループを作成:
   - グループ名: `ScanAlarm Testers`
   - テスターを追加（自分のApple IDメールアドレス）
   - テスト対象ビルドを選択
7. テスターに招待メールが届く → TestFlightアプリからインストール

### TestFlightテスト確認事項

テスト端末で以下を確認:
- [ ] アプリが起動する
- [ ] アラームが設定できる
- [ ] アラームが鳴る
- [ ] QRコードスキャンでアラームが解除できる
- [ ] 広告が表示される（AdMob）
- [ ] 通知が届く
- [ ] 4言語の切り替えが正しい（ja/en/ko/es）

---

# Track C: ストアアセット準備（並行作業）

ビルドを待つ間に進められる。

## C-1: スクリーンショット撮影

Expo Go（開発サーバー）で以下5画面をキャプチャ:

| # | 画面 | ファイル名参考 |
|---|------|-------------|
| 1 | ホーム（アラーム一覧） | screenshot-1-home.png |
| 2 | アラーム編集 | screenshot-2-edit.png |
| 3 | アラーム鳴動中 | screenshot-3-ringing.png |
| 4 | QRスキャン中 | screenshot-4-scan.png |
| 5 | 機能紹介 | screenshot-5-features.png |

**App Store要件**: 6.5インチ (1290x2796) と5.5インチ (1242x2208) の2サイズ
**Google Play要件**: 最低2枚、推奨8枚 (16:9)

## C-2: ストア画像デザイン（Canva）

- 端末モックアップにスクリーンショットをはめ込み
- 各言語のコピーを重ねる（`output/store-metadata.md` 参照）
- Feature Graphic (1024x500) を1枚作成

## C-3: ストアテキスト

`output/store-metadata.md` に4言語分のコピーが準備済み。コピペで使用可能:
- アプリ名・サブタイトル
- 短い説明文 (80字)
- 説明文 (全文)
- キーワード

---

# 技術スタック（参考）

| 項目 | バージョン |
|------|-----------|
| Expo | 54.0.0 |
| React Native | 0.81.5 |
| React | 19.1.0 |
| TypeScript | 5.9.2 |
| react-native-google-mobile-ads | 16.3.1 |
| EAS CLI | latest |
| Bundle ID (iOS/Android) | com.yuasano.qralarm |
| EAS account | ukdayoharry |
| Apple Developer | 承認済み (2026-04-06) |

---

# 完了条件

## Track A: Android
- [ ] Gradle buildが成功し、AABファイルが生成されている
- [ ] Google Play Console Internal Testingトラックにアップロード完了

## Track B: iOS
- [ ] iOS production buildが成功し、IPAが生成されている
- [ ] TestFlightに提出完了
- [ ] App Store ConnectでExport Compliance設定完了
- [ ] TestFlightからアプリがインストールできる
- [ ] 基本動作確認完了（アラーム設定→鳴動→QRスキャン解除）

## Track C: アセット
- [ ] 5画面のスクリーンショット撮影完了
- [ ] ストア用画像（端末モックアップ付き）作成完了

## 全体
- [ ] `CATCHUP.md` にビルド成功・提出完了の記録を追記
