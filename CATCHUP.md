# ScanAlarm — 次回セッション Catchup

## 現在の状態: iOS TestFlight提出完了 / Android Closed Testing中

### 進捗サマリー (4/10時点)

| 項目 | 状態 |
|------|------|
| Android Build | (確定) 成功。Version code 11, v1.0.0 |
| Android Google Play | (確定) Closed testing (Test 0403) **承認済み — Available to selected testers** |
| Android テスト | テスター追加 → opt-inリンク共有 → テスト開始（4/7〜） |
| iOS Build | (確定) 成功。Build ID: a7c82080, v1.0.0, buildNumber 8 |
| iOS Submit | (確定) 4/10 App Store Connectへ提出完了。Apple処理待ち |
| iOS TestFlight | (確定) 4/10 Apple処理完了。「提出準備完了」状態。TestFlightテスター設定へ |
| Apple Developer | (確定) 4/6承認済み |
| App Store Connect | (確定) ASC App ID: 6761982403 |
| Google Play 本人確認 | 4/2申請済み。承認待ち（Closed testingには影響なし） |
| ストアアセット | (確定) アイコン・スクリーンショット・ストア画像 全て完了 |
| サウンドファイル | 3秒未満の7ファイルについて対応検討中 |

### Attempt履歴
- Attempt 1-7: パーミッションエラー → OneDrive Deny ACL除去で解決
- Attempt 8: Bundle JSフェーズで `gentle.wav` が `.easignore` の `*.wav` で除外されていた → 修正
- Attempt 9: Gradle ビルドフェーズで失敗
- Attempt 10-11: GitHub Copilotが修正。**Android Build成功**

### 次のアクション (4/10)

#### iOS TestFlight（Apple処理完了後）
1. Apple処理完了メールを待つ（通常5-10分）
2. TestFlight確認: https://appstoreconnect.apple.com/apps/6761982403/testflight/ios
3. テスターグループ作成 → テスターのメールアドレスを追加
4. テスターにTestFlight招待メール → インストール → テスト開始

#### Android Closed Testing（継続）
1. Google Play Console → ScanAlarm → Testing → Closed testing → Test 0403
2. Testersタブ → テスターのGmailアドレスを追加
3. opt-in URLをテスターに共有 → テスト開始

### ビルド前に毎回やること（OneDrive対策）
```powershell
powershell -Command "icacls 'C:\Users\yuasano\OneDrive - Microsoft\Documents\02 Claude\12-qr-alarm-app' /remove:d Everyone /T /C"
```

### iOS Build時の注意
- `--non-interactive` は使わない（初回は証明書セットアップが必要）
- `app.json` に `ITSAppUsesNonExemptEncryption: false` を追加済み
- Apple認証でエラーが出る場合はApp Store Connect反映待ちの可能性

## これまでの経緯

### 根本原因: OneDrive の Deny ACL
OneDriveが全ディレクトリに `Everyone Deny DeleteSubdirectoriesAndFiles` を自動付与。
EASがtar.gzに圧縮 → クラウドで展開時に `Permission denied` で失敗していた。

### 対処済み
1. `icacls /remove:d Everyone /T` で全38,454ファイルのDeny ACLを除去
2. `my-app/` (Expoテンプレート残骸) を削除
3. `.easignore` を正しく設定
4. `expo-build-properties` にAndroid SDK/Kotlin設定追加
5. `GRADLE_OPTS` 環境変数を `eas.json` に追加

### 注意: OneDriveが再度Deny ACLを付ける可能性あり
ビルド前に再度確認すること:
```powershell
powershell -Command "icacls 'C:\Users\yuasano\OneDrive - Microsoft\Documents\02 Claude\12-qr-alarm-app' /T /C 2>&1 | Select-String 'Deny'"
```

## EAS情報
- アカウント: ukdayoharry (yukeiasano@gmail.com)
- プロジェクト: @ukdayoharry/qr-alarm-app (ID: 69f046ad-ed1b-43f0-9f07-ee113e81965e)
- Android versionCode: 11
- iOS buildNumber: 8
- ASC App ID: 6761982403
- App Store Connect API Key ID: 7RC5PXVJFZ

## 承認状況
- **Apple Developer Program** — (確定) 4/6承認済み。App Store Connect開通済み
- **Google Play 本人確認** — 4/2申請済み。承認待ち（内部テストは本人確認なしで可）

## サウンドファイル対応（未完了）
3秒未満で要対応の7ファイル:
- digital_chiptune.mp3 (0.78s) — 差し替え推奨
- fun_chicken.wav (1.16s) — 差し替えまたは延長推奨
- digital_beep.mp3 (1.46s) — やや短い
- digital_robotic.mp3 (1.50s) — やや短い
- fun_dog_bark.wav (1.80s) — 差し替え推奨
- fun_rooster.wav (2.30s) — ギリギリ許容
- fun_dog_beg.mp3 (2.56s) — ギリギリ許容

## 残タスク
- iOS Build → TestFlight提出
- App Store Connect設定（Export Compliance、テスターグループ）
- Google Play審査完了後の内部テスト確認
- サウンドファイル対応
- 最終E2Eテスト
- 詳細: `output/sprint-status.md`, `output/yu-daily-2026-04-06.md`
