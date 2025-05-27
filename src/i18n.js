/**
 * Internationalization Module
 * Functions for managing translations and language settings
 */

// 言語ファイルをインポート
import enTranslations from '../locales/en.json';
import jaTranslations from '../locales/ja.json';
// 他の言語ファイルも必要に応じてインポート

/**
 * 利用可能な言語を定義
 */
export const AVAILABLE_LANGUAGES = {
  en: {
    name: 'English',
    translations: enTranslations,
  },
  ja: {
    name: '日本語',
    translations: jaTranslations,
  },
  // 他の言語も必要に応じて追加
};

// 現在の言語設定を保持する変数
let currentLanguage = 'en'; // デフォルトは英語

/**
 * 言語を設定する関数
 * @param {string} langCode - 言語コード（'en', 'ja'など）
 * @return {boolean} 言語設定が成功したかどうか
 */
export function setLanguage(langCode) {
  if (AVAILABLE_LANGUAGES[langCode]) {
    currentLanguage = langCode;
    // ローカルストレージに言語設定を保存
    localStorage.setItem('language', langCode);
    return true;
  }
  return false;
}

/**
 * 現在設定されている言語を取得
 * @return {string} 現在の言語コード
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * 指定されたキーに対応する翻訳テキストを取得
 * @param {string} key - 翻訳キー（ドット記法で階層を表現可能, 例: 'app.buttons.start'）
 * @param {Object} params - 翻訳テキスト内の変数を置換するためのパラメータ
 * @return {string} 翻訳されたテキスト
 */
export function t(key, params = {}) {
  const translations = AVAILABLE_LANGUAGES[currentLanguage].translations;
  const keys = key.split('.');

  // 階層をたどって翻訳を取得
  let value = translations;
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      // 翻訳が見つからない場合はキーをそのまま返す
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
  }

  // パラメータがある場合は置換
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : `{${paramKey}}`;
    });
  }

  return value;
}

/**
 * 利用可能な言語のリストを取得
 * @return {Array} 言語コードと名前のリスト
 */
export function getAvailableLanguages() {
  return Object.entries(AVAILABLE_LANGUAGES).map(([code, data]) => ({
    code,
    name: data.name,
  }));
}

/**
 * アプリケーション起動時の言語初期化
 * ローカルストレージに保存された言語設定があればそれを使用
 * @return {string} 設定された言語コード
 */
export function initLanguage() {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && AVAILABLE_LANGUAGES[savedLanguage]) {
    currentLanguage = savedLanguage;
  } else {
    // ブラウザの言語設定を取得して、対応する言語があればそれを設定
    const browserLang = navigator.language.split('-')[0];
    if (AVAILABLE_LANGUAGES[browserLang]) {
      currentLanguage = browserLang;
    }
  }
  return currentLanguage;
}
