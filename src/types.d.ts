export enum FULL_LANGUAGES_CODE {
  es = "es-ES",
  en = "en-US",
  fr = "fr-FR",
  de = "de-DE",
  it = "it-IT",
  pt = "pt-PT",
  ru = "ru-RU",
  ja = "ja-JP",
  zh = "zh-CN",
}

export type LanguageKeys = keyof typeof FULL_LANGUAGES_CODE;
