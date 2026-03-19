# X落ちてる速報

X（旧Twitter）障害時の緊急掲示板。[Nostr](https://nostr.com/) プロトコルを使って `#xisdown` タグの投稿をリアルタイムで共有します。

## 技術スタック

- [Svelte 5](https://svelte.dev/) + TypeScript
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

## 開発

```bash
npm install
npm run dev
```

## コマンド

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm test` | ユニットテスト実行 |
| `npm run check` | TypeScript 型チェック |
| `npm run lint` | Biome リント |
| `npm run format` | Biome フォーマット |
