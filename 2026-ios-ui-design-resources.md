# 📱 2026年 iOS UIデザイン関連リソース 調査レポート

**調査日**: 2026年3月（現時点）  
**調査範囲**: GitHub・公式ブログ・学習サイト（計10 URL）  
**アクセス成功率**: 9/10（hackingwithswift.comのみ部分取得）

---

## 🚨 Executive Summary（重要な発見）

### iOS 26 & Liquid Glass 革命

2026年のiOS UIデザインを語る上で最大のトピックは、**Apple が iOS のバージョン体系を年号ベースに変更し、iOS 26 として発表したこと**と、全く新しいデザイン言語 **「Liquid Glass」** の導入です。

- **2026年4月28日以降**、App Store へのアプリ提出には **iOS 26 SDK でのビルドが必須**（Apple Developer News, 2026/2/3）
- **WWDC26**（2026年6月8〜12日）でさらなる詳細が発表予定
- **Swift 6.3** が 2026年3月24日にリリース（C互換性強化・Android SDK等）

---

## カテゴリ別リソース詳細

---

## 🤖 カテゴリ1: AI Coding Rules（Cursor / Claude / AI Harness）

### ① dinhquan/claude-ios-toolkit
| 項目 | 内容 |
|------|------|
| **URL** | https://github.com/dinhquan/claude-ios-toolkit |
| **更新日** | 2026年1月21日 |
| **種類** | Claude Code Agents / Skills / Rules |
| **Stars** | ⭐4 |

**内容概要:**  
Claude Code 用の iOS 開発特化ツールキット。9種の専門エージェント、スキル集、スラッシュコマンド、ルール、フックを網羅。

**ディレクトリ構成:**
```
agents/
  ├── planner.md           # 機能実装計画
  ├── architect.md         # アーキテクチャ設計
  ├── tdd-guide.md         # XCTest TDD
  ├── code-reviewer.md     # Swift/SwiftUI品質レビュー
  ├── security-reviewer.md # iOSセキュリティチェック
  └── ...（計9エージェント）

skills/
  ├── coding-standards.md  # Swift ベストプラクティス
  ├── ios-patterns.md      # MVVM, Coordinator
  └── swiftui-patterns.md  # View設計・状態管理

rules/
  ├── security.md          # Keychain・データ保護
  ├── coding-style.md      # Swift スタイル
  ├── performance.md       # メインスレッド・Instruments
  └── patterns.md          # MVVM/Coordinator規約
```

**iOS UIデザインへの有用性**: ★★★★★  
SwiftUIパターン・UIアクセシビリティ審査・デザインレビューコマンドを内包。Claude Codeで即利用可能。

---

### ② Dorukuz/Claude-Code-IOS-App-Studios
| 項目 | 内容 |
|------|------|
| **URL** | https://github.com/Dorukuz/Claude-Code-IOS-App-Studios |
| **更新日** | 2026年3月（調査時点で「昨日」更新） |
| **種類** | Claude Code + Cursor テンプレート |
| **Stars** | ⭐1 |

**内容概要:**  
Claude Code と Cursor を両対応した iOS 開発スタジオテンプレート。`.claude/rules/` と `.cursor/rules/` の両ディレクトリを持ち、パス別スコープルールを実現。

**主要スラッシュコマンド:**
| コマンド | 目的 |
|---------|------|
| `/start` | オンボーディング・ルーティング |
| `/code-review` | Swift/iOS 構造化レビュー |
| `/accessibility-audit` | VoiceOver・Dynamic Type・コントラスト |
| `/design-review` | UIデザインレビュー（スタブ） |
| `/release-checklist` | 提出前サニティチェック |
| `/privacy-review` | プライバシーマニフェスト |

**iOS UIデザインへの有用性**: ★★★★★  
`/accessibility-audit` と `/design-review` コマンドがUIデザイン作業に直結。Claude + Cursor 両対応は珍しく実用的。

---

### ③ xiaozhenyangCode/awesome-cursor-rules
| 項目 | 内容 |
|------|------|
| **URL** | https://github.com/xiaozhenyangCode/awesome-cursor-rules |
| **更新日** | 2026年1月25日 |
| **種類** | Cursor Rules コレクション |
| **Stars** | ⭐1 |

**内容概要:**  
iOS・Python・Web向けの `.cursorrules` スニペット集。iOS/macOS セクションに SwiftUI Expert ルールを収録。AgentIndex.app（日次更新）と連携。

**SwiftUI Cursor Rules スニペット（実際の内容）:**
```
You are an expert iOS Developer proficient in Swift, SwiftUI, and Combine.

- Always use `struct` over `class` unless you need reference semantics.
- Use `some View` for body types.
- Prefer `Async/Await` over completion handlers.
- Strictly follow MVVM: Views should only talk to ViewModels.
- For UI, always assume iOS 16+ unless specified otherwise.
- When using SF Symbols, ensure availability check.
```

**iOS UIデザインへの有用性**: ★★★☆☆  
基本的なルールのみ。AgentIndex.app の全集を参照すると質が上がる。

---

### ④ zwb-dev/ios-project-template
| 項目 | 内容 |
|------|------|
| **URL** | https://github.com/zwb-dev/ios-project-template |
| **更新日** | 2026年3月（調査時点で「3分前」更新） |
| **種類** | AI Harness 付き SwiftUI プロジェクトテンプレート |
| **Stars** | ⭐0（新規） |
| **言語** | 中国語README |

**内容概要:**  
SwiftUI + Clean Architecture の AI コーディング向けスキャフォールド。`DESIGN.md` でUIデザイン規約を AI に強制する仕組みを内包。`.harness/` フォルダに AI 作業の許可パス・検証・レポートシステムを内蔵。

**iOS UIデザインへの有用性**: ★★★★☆  
`DESIGN.md` による UIデザイン規約の強制は新しいアプローチ。AIが勝手にUI実装を逸脱しないよう制御できる。

---

## 🎨 カテゴリ2: SwiftUI デザインシステム・UIライブラリ

### ⑤ muhittincamdali/SwiftUI-Design-System-Pro
| 項目 | 内容 |
|------|------|
| **URL** | https://github.com/muhittincamdali/SwiftUI-Design-System-Pro |
| **更新日** | 2026年（調査時点で「4日前」更新） |
| **種類** | SwiftUI デザインシステム / コンポーネントライブラリ |
| **Stars** | ⭐13 |
| **バージョン** | 2.0（SPM対応） |
| **対応OS** | iOS 15+, macOS 12+, visionOS |

**内容概要:**  
完全なデザイントークン + 50+コンポーネント + テーマエンジンを備えた本格デザインシステム。

**デザイントークン種別:**
| トークン | 内容 |
|---------|------|
| Colors | セマンティックカラー（ライト/ダーク） |
| Typography | 16サイズのタイプスケール |
| Spacing | 8ptグリッド（15段階） |
| Shadows | 6エレベーションレベル |
| Borders | コンポーネント別角丸・線幅 |
| Animations | マイクロ・ページ・フィードバック |

**テーマプリセット:** Ocean, Forest, Sunset, Lavender（ランタイム切り替え対応）

**インストール（SPM）:**
```swift
dependencies: [
    .package(url: "https://github.com/muhittincamdali/SwiftUI-Design-System-Pro", from: "2.0.0")
]
```

**iOS UIデザインへの有用性**: ★★★★★  
2026年版デザインシステムとして最も包括的。

---

### ⑥ gentle-giraffe-apps/GentleDesignShowcase
| 項目 | 内容 |
|------|------|
| **URL** | https://github.com/gentle-giraffe-apps/GentleDesignShowcase |
| **更新日** | 2026年（調査時点で「9日前」更新） |
| **種類** | SwiftUI UIショーケース + ライブデザイントークン編集 |
| **Stars** | ⭐7 |
| **技術スタック** | Swift 6.1+, SwiftUI, Tuist |
| **日本語対応** | README_ja.md 完備 ✅ |

**iOS UIデザインへの有用性**: ★★★★★  
リアルタイムでデザイントークンを調整して結果を確認できる点が学習に最適。

---

### ⑦ jasonjrr/SwiftUI.Foundations
| 項目 | 内容 |
|------|------|
| **URL** | https://github.com/jasonjrr/SwiftUI.Foundations |
| **更新日** | 2026年（「6日前」更新） |
| **種類** | SwiftUI基礎サンプル + CLAUDE.md 内蔵 |
| **Stars** | ⭐66（カテゴリ最多） |

**iOS UIデザインへの有用性**: ★★★★☆  

---

### ⑧ tarkalabs/tarka-ui-kit-ios
| 項目 | 内容 |
|------|------|
| **URL** | https://github.com/tarkalabs/tarka-ui-kit-ios |
| **更新日** | 2026年（「16日前」更新） |
| **種類** | SwiftUI UIキット（Atomic Design） |
| **Stars** | ⭐11 |

**iOS UIデザインへの有用性**: ★★★☆☆  

---

### ⑨ govuk-one-login/mobile-ios-ui
| 項目 | 内容 |
|------|------|
| **URL** | https://github.com/govuk-one-login/mobile-ios-ui |
| **更新日** | 2026年（「2日前」更新） |
| **種類** | 政府系 iOS デザインシステム |
| **Stars** | ⭐2 |

**iOS UIデザインへの有用性**: ★★★☆☆  

---

## 📰 カテゴリ3: 公式・教育記事（2026年）

### ⑩ Kodeco「Liquid Glass for iOS 26 入門」
| 項目 | 内容 |
|------|------|
| **URL** | https://www.kodeco.com/ios/articles |
| **公開日** | 2026年2月4日 |
| **種類** | 教育記事（約10分） |

> "Apple's new Liquid Glass design language marks a major shift in iOS 26 UI design."

**iOS UIデザインへの有用性**: ★★★★★  

---

### ⑪ Kodeco「SwiftData in iOS 26 入門」
- **公開日**: 2026年2月11日 ★★★☆☆

### ⑫ Kodeco「iOS App Observability 入門」
- **公開日**: 2026年3月4日 ★★★☆☆

### ⑬ Swift by Sundell「Genius Scan のデザインシステム構築」
- **公開日**: 2026年 ★★★★☆

### ⑭ Apple Developer News「WWDC26 発表」
- **公開日**: 2026年3月23日 ★★★★★

### ⑮ Apple Developer News「iOS 26 SDK 必須化（4/28〜）」
- **公開日**: 2026年2月3日 ★★★★★（緊急度高）

### ⑯ Swift.org「Swift 6.3 リリース」
- **公開日**: 2026年3月24日 ★★☆☆☆

---

## ❌ アクセスできなかったURL

| URL | 状況 |
|-----|------|
| https://www.hackingwithswift.com/articles | JS動的レンダリングのため記事一覧取得不可 |

---

## 🏆 Top 5 ランキング

| 順位 | リソース | 更新日 | 種類 | 有用性 |
|------|---------|--------|------|--------|
| 🥇1位 | [muhittincamdali/SwiftUI-Design-System-Pro](https://github.com/muhittincamdali/SwiftUI-Design-System-Pro) | 2026/03 | デザインシステム50+コンポーネント | ★★★★★ |
| 🥈2位 | [Dorukuz/Claude-Code-IOS-App-Studios](https://github.com/Dorukuz/Claude-Code-IOS-App-Studios) | 2026/03（最新） | Claude+Cursor両対応テンプレート | ★★★★★ |
| 🥉3位 | [dinhquan/claude-ios-toolkit](https://github.com/dinhquan/claude-ios-toolkit) | 2026/01/21 | Claude Code iOS Agents | ★★★★★ |
| 4位 | Kodeco: Liquid Glass for iOS 26 | 2026/02/04 | 教育記事（iOS 26新UI） | ★★★★★ |
| 5位 | [gentle-giraffe-apps/GentleDesignShowcase](https://github.com/gentle-giraffe-apps/GentleDesignShowcase) | 2026/03 | UIショーケース（日本語対応） | ★★★★★ |

---

## ⚠️ 注意事項

1. **WWDC26未開催**: iOS 26 UIの最終仕様は未確定。Liquid Glassの実装API詳細はWWDC26（6/8〜12）後に明確化予定。
2. **iOS 26 SDK 必須化**: 2026年4月28日以降、App Store提出は iOS 26 SDK 必須。
3. **2026年新規リポジトリ**: Stars数は少ないが実用性は高い。認知度はこれから上がる段階。
4. **参考（スコープ外）**: `brunogama/ios-cursor-rules`（⭐68, 2025/05更新）は2025年作成だがSwiftUI Cursor Rulesとして依然参考値あり。

*レポート生成: Claude（調査日 2026年3月）*
