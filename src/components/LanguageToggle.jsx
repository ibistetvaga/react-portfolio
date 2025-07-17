import React from 'react'
import { useTranslation } from '../contexts/TranslationContext'

const LanguageToggle = () => {
  const { currentLanguage, setLanguage } = useTranslation()

  const handleToggle = () => {
    const newLanguage = currentLanguage === 'en' ? 'es' : 'en'
    setLanguage(newLanguage)
  }

  return (
    <button
      onClick={handleToggle}
      className="relative flex items-center justify-center w-16 h-8 bg-neutral-800 rounded-full border border-neutral-700 transition-all duration-300 hover:bg-neutral-700 hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
      aria-label={`Switch to ${currentLanguage === 'en' ? 'Spanish' : 'English'}`}
    >
      {/* Toggle slider */}
      <div
        className={`absolute w-6 h-6 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full shadow-lg transition-transform duration-300 ease-in-out ${
          currentLanguage === 'es' ? 'translate-x-4' : '-translate-x-4'
        }`}
      />
      
      {/* Language labels */}
      <div className="flex items-center justify-between w-full px-1 text-xs font-medium">
        <span
          className={`transition-colors duration-300 ${
            currentLanguage === 'en' 
              ? 'text-neutral-900 font-bold' 
              : 'text-neutral-400'
          }`}
        >
          EN
        </span>
        <span
          className={`transition-colors duration-300 ${
            currentLanguage === 'es' 
              ? 'text-neutral-900 font-bold' 
              : 'text-neutral-400'
          }`}
        >
          ES
        </span>
      </div>
    </button>
  )
}

export default LanguageToggle