# Figma MCP セットアップ手順

## 1. Figma Personal Access Token の取得

1. **Figma Desktop** を開く
2. 左上のFigmaアイコン → **Settings** をクリック
3. **Account** タブ → **Personal access tokens** セクション
4. **「Generate new token」** をクリック
5. 名前を付ける（例: `copilot-mcp`）
6. **Dev resources → Read-only** の権限を付与
7. 生成されたトークン（`figd_` で始まる文字列）をコピー

## 2. トークンの設定（環境変数方式 — 推奨）

トークンをファイルに直書きせず、Windows環境変数に保存します：

### PowerShellで実行:
```powershell
[System.Environment]::SetEnvironmentVariable("FIGMA_API_KEY", "figd_あなたのトークン", "User")
```

`.copilot/mcp.json` は `${FIGMA_API_KEY}` でOS環境変数を参照します。
トークンがファイルやチャット履歴に残らないため安全です。
```

## 3. Copilot CLI の再起動

トークン設定後、Copilot CLI のセッションを再起動してください。
MCP サーバーが自動的にロードされ、Figma のデザインデータにアクセスできるようになります。

## 4. 使い方

Copilot CLI で以下のようなプロンプトを使用できます：

```
Figmaのファイル https://www.figma.com/design/XXXXX を読み取り、
Home画面のデザインをReact Nativeコンポーネントに変換してください。
constants/colors.ts のカラー定数を使用してください。
```

## セキュリティ注意

- `.copilot/mcp.json` を `.gitignore` に追加してください（トークンが含まれるため）
- トークンは定期的にローテーションしてください
