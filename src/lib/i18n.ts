import type { Theme } from './theme.svelte'

const isJapanese =
  typeof navigator !== 'undefined' && navigator.language.startsWith('ja')

const translations = {
  ja: {
    appTitle: 'X落ちてる？',
    appSubtitle: 'X障害時の緊急掲示板 on Nostr',
    loginWithNostr: 'ログイン',
    loginDialogTitle: 'ログイン方法を選択',
    loginWithNip07: 'Nostr拡張機能（NIP-07）',
    loginWithNip07Desc: 'ブラウザ拡張機能でログイン',
    loginWithNosskey: 'nosskey.app（パスキー）',
    loginWithNosskeyDesc: 'パスキーでログイン',
    loggedInWithNip07: 'NIP-07でログイン中',
    loggedInWithNosskey: 'nosskeyでログイン中',
    nosskeyConnecting: 'nosskeyに接続中...',
    nosskeyNoKey: 'パスキーが未登録です。先に nosskey.app でパスキーを作成してください。',
    nosskeyLoginError: 'nosskeyログインに失敗しました。',
    logout: 'ログアウト',
    defaultPostText: 'X落ちてる',
    postPlaceholder: 'X落ちてる',
    posting: '投稿中...',
    post: '投稿する',
    postError: '投稿に失敗しました。リレーに接続できません。',
    timelineTitle: 'みんなの「X落ちてる」',
    timelineSubtitle: '#xisdown タグの投稿',
    noPosts: 'まだ投稿がありません',
    noPostsCallToAction: '最初に「X落ちてる」と投稿しよう！',
    openInClient: '別のクライアントで開く',
    close: '閉じる',
  },
  en: {
    appTitle: 'X is Down',
    appSubtitle: 'Emergency bulletin board on Nostr',
    loginWithNostr: 'Login',
    loginDialogTitle: 'Choose login method',
    loginWithNip07: 'Nostr extension (NIP-07)',
    loginWithNip07Desc: 'Log in with a browser extension',
    loginWithNosskey: 'nosskey.app (passkey)',
    loginWithNosskeyDesc: 'Log in with a passkey',
    loggedInWithNip07: 'Logged in with NIP-07',
    loggedInWithNosskey: 'Logged in with nosskey',
    nosskeyConnecting: 'Connecting to nosskey...',
    nosskeyNoKey: 'No passkey found. Please create one at nosskey.app first.',
    nosskeyLoginError: 'Failed to log in with nosskey.',
    logout: 'Logout',
    defaultPostText: 'X is down',
    postPlaceholder: 'X is down',
    posting: 'Posting...',
    post: 'Post',
    postError: 'Failed to post. Cannot connect to relay.',
    timelineTitle: '"X is Down" Timeline',
    timelineSubtitle: 'Posts with #xisdown tag',
    noPosts: 'No posts yet',
    noPostsCallToAction: 'Be the first to post "X is down"!',
    openInClient: 'Open in another client',
    close: 'Close',
  },
} as const

const twitterOverrides = {
  ja: {
    appTitle: 'Twitter落ちてる？',
    appSubtitle: 'Twitter障害時の緊急掲示板 on Nostr',
    defaultPostText: 'Twitter落ちてる',
    postPlaceholder: 'Twitter落ちてる',
    timelineTitle: 'みんなの「Twitter落ちてる」',
    noPostsCallToAction: '最初に「Twitter落ちてる」と投稿しよう！',
  },
  en: {
    appTitle: 'Twitter is Down',
    appSubtitle: 'Emergency bulletin board on Nostr',
    defaultPostText: 'Twitter is down',
    postPlaceholder: 'Twitter is down',
    timelineTitle: '"Twitter is Down" Timeline',
    noPostsCallToAction: 'Be the first to post "Twitter is down"!',
  },
}

export function getTranslations(currentTheme: Theme) {
  const base = isJapanese ? translations.ja : translations.en
  if (currentTheme === 'twitter') {
    const overrides = isJapanese ? twitterOverrides.ja : twitterOverrides.en
    return { ...base, ...overrides }
  }
  return base
}

export const t = isJapanese ? translations.ja : translations.en
