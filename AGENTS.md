# AGENTS.md

このファイルはAIエージェント（Claude等）向けのプロジェクトガイドです。

## プロジェクト概要

X（旧Twitter）障害時の緊急掲示板。[Nostr](https://nostr.com/) プロトコルを使って `#xisdown` タグの投稿をリアルタイムで共有するSvelteアプリ。

## 技術スタック

- **Svelte 5** + TypeScript（runesベース: `$state()`, `$derived()`, `$effect()`）
- **nostr-tools** v2 — Nostrプロトコルクライアント
- **Tailwind CSS v4** — `@tailwindcss/vite` プラグイン経由
- **Vite** v6 — ビルドツール
- **Biome** — リンター・フォーマッター（ESLint/Prettierの代替）
- **Vitest** v4 — ユニットテスト

## ディレクトリ構成

```
src/
  App.svelte          # ルートコンポーネント
  app.css             # Tailwind CSSエントリ
  main.ts             # エントリポイント
  lib/
    EggAvatar.svelte  # 卵アバターコンポーネント
    NostrPromo.svelte # Nostr誘導コンポーネント
    Post.svelte       # 投稿表示コンポーネント
    PostForm.svelte   # 投稿フォームコンポーネント
    Timeline.svelte   # タイムラインコンポーネント
    i18n.ts           # 国際化（日本語/英語）
    nostr.ts          # Nostrプロトコル処理
    nostr.test.ts     # nostr.tsのユニットテスト
    theme.svelte.ts   # テーマ管理（Svelteストア）
    utils.ts          # ユーティリティ関数
    utils.test.ts     # utils.tsのユニットテスト
scripts/
  generate-ogp.js     # OGP画像生成スクリプト
public/               # 静的アセット
```

## 開発コマンド

```bash
npm run dev           # 開発サーバー起動
npm run build         # プロダクションビルド
npm run preview       # ビルド結果プレビュー
npm run check         # TypeScript + Svelte型チェック
npm run lint          # Biomeリント
npm run lint:fix      # Biomeリント自動修正
npm run format        # Biomeフォーマット
npm test              # ユニットテスト実行（vitest run）
npm run test:watch    # テスト監視モード
npm run test:coverage # カバレッジ付きテスト
npm run generate-ogp  # OGP画像生成
```

## コード変更時のルール

### 必須チェック（変更後に必ず実行）

```bash
npm run build
npm run check
npm run lint
npm test
```

すべてパスするまで修正を繰り返すこと。

### Svelte 5 runesの注意事項

- `$state()` で宣言した変数は **`let`** で宣言する（`const`不可）
- `$derived()`, `$effect()` はトップレベルまたはコンポーネント初期化時のみ使用可
- Biomeの `noUnusedVariables`, `noUnusedImports`, `useConst` はSvelte対応のため無効化済み

### Biomeの注意事項

- `useImportExtensions` は無効化済み（`.svelte`, `.css` など拡張子の自動付与を防止）
- インポートパスに拡張子を手動で追加しないこと

### Tailwind CSS v4の注意事項

- `app.css` では `@import "tailwindcss"` を `@plugin` より前に記述する
- カスタムクラスは `@layer` を使って定義する

### Nostrプロトコル

- `nostr-tools` v2 APIを使用（v1とAPIが異なるため注意）
- イベント購読・投稿処理は `src/lib/nostr.ts` に集約
- NIP-07（ブラウザ拡張ウォレット）によるログインをサポート

## テスト方針

- テストファイルは対象ファイルと同ディレクトリに `*.test.ts` で配置
- UIコンポーネント（`.svelte`）のテストは現時点では対象外
- ロジック（`nostr.ts`, `utils.ts`）のユニットテストを維持・拡充する
