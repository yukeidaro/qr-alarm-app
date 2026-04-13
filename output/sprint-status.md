# ScanAlarm Sprint Status — 2026-04-07 更新

## スプリント期間: 4/2 (木) 〜 4/9 (水)

---

## 完了済み

| タスク | 完了日 | 担当 |
|--------|--------|------|
| Git repo initialization | 4/2 | Copilot |
| Fix TypeScript FileSystem error (legacy → v19 API) | 4/2 | Copilot |
| Privacy policy 作成 (privacy-policy.html) | 4/1以前 | Copilot |
| AdMob アカウント作成 | 4/2 | Yu |
| AdMob 広告ユニットID設定 (iOS + Android 全8個) | 4/2 | Copilot |
| EAS Update (OTA) 設定 | 4/2 | Copilot |
| Apple Developer Program 支払い (12,800円/年) | 4/2 | Yu |
| Google Play Console 登録 ($25) | 4/2 | Yu |
| ストア用テキスト作成 (4言語) | 4/2 | Copilot |
| Apple Developer Program 承認 | 4/6 | Yu |
| Android Production Build 成功 (version code 11) | 4/6 | Copilot |
| Google Play Closed Testing 提出 (In review) | 4/6 | Yu |
| ストアアセット完成（アイコン・スクリーンショット・ストア画像） | 4/6 | Yu |
| app.json に ITSAppUsesNonExemptEncryption 追加 | 4/6 | Copilot |
| Google Play Closed Testing 承認 (Available to selected testers) | 4/7 | Google |

---

## 承認状況

| 項目 | 申請日 | 状況 | ブロックしているタスク |
| --- | --- | --- | --- |
| Apple Developer Program 承認 | 4/2 | **4/6 承認済み** | App Store Connect反映待ち（4/7再確認） |
| Google Play 本人確認 | 4/2 | 承認待ち | プロダクション公開（内部テストは可） |
| Google Play Closed Testing 審査 | 4/6 | **4/7 承認済み — Available to selected testers** | — |

---

## 残タスク

### Yu作業（手動）

| タスク | 予定日 | 依存 | 備考 |
| --- | --- | --- | --- |
| **Android Closed Testingテスター追加** | **4/7** | **なし（今すぐ可能）** | **Play Console → Test 0403 → Testers → メールリスト作成** |
| **opt-in URL を友達に共有** | **4/7** | テスター追加 | **LINE等でリンク送付 → 友達が承認 → インストール可能** |
| **Android テスト実施** | **4/7〜** | opt-in承認 | **アラーム→QRスキャン→スヌーズ→広告の基本フロー** |
| App Store Connect開通確認 | 4/7 | Apple承認反映 | https://appstoreconnect.apple.com/ |
| iOS Build実行 | 4/7 | App Store Connect開通 | `eas build --platform ios --profile production` |
| TestFlight提出 | 4/7 | iOS Build完了 | `eas submit --platform ios` |
| App Store Connect Export Compliance設定 | 4/7 | TestFlight提出 | 暗号化使用→No |
| TestFlightテスターグループ作成+自分追加 | 4/7 | Export Compliance | グループ名: ScanAlarm Internal |
| TestFlightからインストール+動作確認 | 4/7 | テスターグループ | アラーム→QRスキャン→広告 |
| サウンドファイル対応（3秒未満7ファイル） | 4/7 | — | 詳細: CATCHUP.md |
| 最終E2Eテスト（iOS + Android） | 4/9 | 上記全て | yu-action-guide.md 参照 |

---

## 成果物一覧

| ファイル | 内容 |
| --- | --- |
| `output/yu-action-guide.md` | Yu日別アクション手順書 |
| `output/yu-daily-2026-04-06.md` | 4/6アクションガイド（TestFlight手順含む） |
| `output/store-metadata.md` | ストア用テキスト（4言語、コピペ用） |
| `output/sprint-status.md` | このファイル（スプリント進捗） |
| `output/copilot-build-fix-instructions.md` | GitHub Copilot向け3トラック指示書 |
| `privacy-policy.html` | プライバシーポリシー（日英対応） |

---

## 次にやること（優先順）

1. **[Yu]** **Android Closed Testing開始**（テスター追加 → opt-in URL共有 → テスト）
2. **[Yu]** App Store Connectが開通しているか確認
3. **[Yu]** 開通していればiOS Build → TestFlight提出
4. **[Yu]** サウンドファイル（3秒未満）の対応
5. **[Yu + Copilot]** 4/9 に最終E2Eテスト → プロダクション公開
