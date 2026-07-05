import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import zh from './locales/zh.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    fallbackLng: 'zh',
    detection: {
      // URL 参数 ?lng=xx 优先（每个标签页独立），fallback 到浏览器语言
      order: ['querystring', 'navigator'],
      lookupQuerystring: 'lng',
      // 不缓存到 localStorage，避免跨标签页互相影响
      caches: [],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
