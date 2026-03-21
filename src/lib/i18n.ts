const isJapanese =
  typeof navigator !== 'undefined' && navigator.language.startsWith('ja')

const translations = {
  ja: {
    appTitle: 'X落ちてる速報',
    appSubtitle: 'X障害時の緊急掲示板 on Nostr',
    loginWithNostr: 'Nostr拡張機能でログイン',
    loggedInWithNip07: 'NIP-07でログイン中',
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
  },
  en: {
    appTitle: 'X is Down',
    appSubtitle: 'Emergency bulletin board on Nostr',
    loginWithNostr: 'Login with Nostr extension',
    loggedInWithNip07: 'Logged in with NIP-07',
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
  },
} as const

export const t = isJapanese ? translations.ja : translations.en
