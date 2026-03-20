export type Lang = 'ja' | 'en'

const messages = {
  ja: {
    title: 'X落ちてる速報',
    subtitle: 'X障害時の緊急掲示板 on Nostr',
    timelineTitle: 'みんなの「X落ちてる」',
    timelineSubtitle: '#xisdown タグの投稿',
    noPostsYet: 'まだ投稿がありません',
    beFirst: '最初に「X落ちてる」と投稿しよう！',
    post: '投稿する',
    posting: '投稿中...',
    postFailed: '投稿に失敗しました。リレーに接続できません。',
    defaultText: 'X落ちてる',
    nostrLinksTitle: 'Nostrで見る',
    loginWithExtension: '拡張機能でログイン',
    loggedIn: 'ログイン済み',
    logout: 'ログアウト',
    noExtension: 'NIP-07拡張機能が見つかりません',
    themeLabel: 'テーマ',
    themeDark: 'ダーク',
    themeDim: 'ディム',
    themeLight: 'ライト',
  },
  en: {
    title: 'X is Down',
    subtitle: 'Emergency bulletin board on Nostr',
    timelineTitle: "Everyone's \"X is down\"",
    timelineSubtitle: '#xisdown tagged posts',
    noPostsYet: 'No posts yet',
    beFirst: 'Be the first to post "X is down"!',
    post: 'Post',
    posting: 'Posting...',
    postFailed: 'Failed to post. Cannot connect to relay.',
    defaultText: 'X is down',
    nostrLinksTitle: 'View on Nostr',
    loginWithExtension: 'Login with Extension',
    loggedIn: 'Logged in',
    logout: 'Logout',
    noExtension: 'NIP-07 extension not found',
    themeLabel: 'Theme',
    themeDark: 'Dark',
    themeDim: 'Dim',
    themeLight: 'Light',
  },
} as const

class I18nStore {
  lang = $state<Lang>('ja')

  get t() {
    return messages[this.lang]
  }

  toggle() {
    this.lang = this.lang === 'ja' ? 'en' : 'ja'
  }
}

export const i18n = new I18nStore()
