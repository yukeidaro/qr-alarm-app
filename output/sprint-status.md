# ScanAlarm Sprint Status — 2026-04-02 更新

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

---

## 承認待ち（ブロッカー）

| 項目 | 申請日 | 想定承認 | ブロックしているタスク |
|------|--------|---------|---------------------|
| Apple Developer Program 承認 | 4/2 | 4/3〜4/7 | EAS Build (iOS), TestFlight提出 |
| Google Play 本人確認 | 4/2 | 4/3〜4/5 | プロダクション公開（内部テストは可） |

---

## 残タスク

### Yu作業（手動）

| タスク | 予定日 | 依存 | 備考 |
|--------|--------|------|------|
| Google Play 本人確認書類提出 | 4/2 | — | **申請済み、承認待ち** |
| スクリーンショット撮影（実機5画面） | 4/5 | — | Expo Goで画面収録も同時に |
| ストア用動画作成（30秒 x 4言語） | 4/5 | スクショ撮影 | Canva/CapCutで編集 |
| Canvaでストア画像合成（5枚 x 4言語） | 4/5 | スクショ撮影 | store-metadata.md のコピー使用 |
| TestFlight確認（iOS実機テスト） | 4/6-7 | Apple承認, EAS Build | TestFlightアプリから |
| Google Play 内部テスト確認 | 4/6-7 | Play承認, EAS Build | 内部テストリンクから |
| 最終E2Eテスト（iOS + Android） | 4/9 | 上記全て | yu-action-guide.md Day 7 参照 |

### Copilot作業（自動）

| タスク | 予定日 | 依存 | 備考 |
|--------|--------|------|------|
| EAS Build for iOS production | 4/6 | Apple Developer承認 | `eas build --platform ios` |
| EAS Build for Android production | 4/6 | — | `eas build --platform android` |
| Submit to TestFlight | 4/6-7 | iOS Build完了 | `eas submit --platform ios` |
| Submit to Google Play Internal Testing | 4/6-7 | Android Build完了 | `eas submit --platform android` |

---

## 成果物一覧

| ファイル | 内容 |
|---------|------|
| `output/yu-action-guide.md` | Yu日別アクション手順書 |
| `output/store-metadata.md` | ストア用テキスト（4言語、コピペ用） |
| `output/sprint-status.md` | このファイル（スプリント進捗） |
| `privacy-policy.html` | プライバシーポリシー（日英対応） |
| `assets/screenshots/reference/` | ストア画像の参考素材（Cluely） |

---

## 次にやること（優先順）

1. **[Yu]** Apple Developer / Google Play の承認メールを待つ
2. **[Yu]** 4/5 にスクリーンショット撮影 + 画面収録
3. **[Yu]** Canvaでストア画像・動画を作成（store-metadata.md 参照）
4. **[Copilot]** 承認が来たら EAS Build + Submit を実行
5. **[Yu]** TestFlight / 内部テストで実機確認
6. **[Yu + Copilot]** 4/9 に最終E2Eテスト → プロダクション公開
