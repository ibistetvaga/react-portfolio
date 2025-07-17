import { createContext, useContext, useState, useEffect } from 'react';

// Create the translation context
const TranslationContext = createContext();

// Translation provider component
export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [fallbackTranslations, setFallbackTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Load translation files with comprehensive error handling
  const loadTranslations = async (language) => {
    try {
      // Validate language parameter
      if (!language || typeof language !== 'string' || !/^[a-z]{2}$/.test(language)) {
        console.warn(`Invalid language code: ${language}, falling back to English`);
        language = 'en';
      }

      const translationModule = await import(`../translations/${language}.json`);
      const translations = translationModule.default || translationModule;
      
      // Validate that we got a proper object
      if (!translations || typeof translations !== 'object') {
        throw new Error(`Invalid translation file format for ${language}`);
      }
      
      return translations;
    } catch (error) {
      console.warn(`Failed to load translations for ${language}:`, error.message || error);
      
      // If we're trying to load Spanish and it fails, try English as fallback
      if (language !== 'en') {
        try {
          const fallbackModule = await import('../translations/en.json');
          const fallbackTranslations = fallbackModule.default || fallbackModule;
          
          if (!fallbackTranslations || typeof fallbackTranslations !== 'object') {
            throw new Error('Invalid English translation file format');
          }
          
          console.info('Falling back to English translations');
          return fallbackTranslations;
        } catch (fallbackError) {
          console.error('Failed to load fallback English translations:', fallbackError.message || fallbackError);
          setHasError(true);
          return {};
        }
      }
      
      // If English itself fails to load, we have a serious problem
      setHasError(true);
      return {};
    }
  };

  // Load English translations as fallback reference
  const loadFallbackTranslations = async () => {
    try {
      const fallbackModule = await import('../translations/en.json');
      const fallbackTranslations = fallbackModule.default || fallbackModule;
      
      // Validate that we got a proper object
      if (!fallbackTranslations || typeof fallbackTranslations !== 'object') {
        throw new Error('Invalid English translation file format');
      }
      
      return fallbackTranslations;
    } catch (error) {
      console.error('Failed to load fallback English translations:', error.message || error);
      setHasError(true);
      return {};
    }
  };

  // Safe localStorage operations with error handling
  const getStoredLanguage = () => {
    try {
      return localStorage.getItem('portfolio-language');
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  };

  const setStoredLanguage = (language) => {
    try {
      localStorage.setItem('portfolio-language', language);
      return true;
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
      return false;
    }
  };

  // Initialize language and translations
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Load English translations as fallback first
        const fallbackData = await loadFallbackTranslations();
        setFallbackTranslations(fallbackData);

        // Check localStorage for saved preference with error handling
        const savedLanguage = getStoredLanguage();
        
        // Validate saved language
        let validatedSavedLanguage = null;
        if (savedLanguage && typeof savedLanguage === 'string' && /^[a-z]{2}$/.test(savedLanguage)) {
          validatedSavedLanguage = savedLanguage;
        } else if (savedLanguage) {
          console.warn('Invalid saved language preference:', savedLanguage);
          // Clear invalid preference
          try {
            localStorage.removeItem('portfolio-language');
          } catch (error) {
            console.warn('Failed to clear invalid language preference:', error);
          }
        }
        
        // Detect browser language if no saved preference
        let browserLanguage = 'en';
        try {
          const navLang = navigator.language || navigator.userLanguage || navigator.browserLanguage;
          if (navLang && typeof navLang === 'string') {
            browserLanguage = navLang.toLowerCase().startsWith('es') ? 'es' : 'en';
          }
        } catch (error) {
          console.warn('Failed to detect browser language:', error);
        }
        
        // Use saved language or browser language, fallback to English
        const initialLanguage = validatedSavedLanguage || browserLanguage || 'en';
        
        // Load translations for the initial language
        const translationData = await loadTranslations(initialLanguage);
        
        // Ensure we have some translations, even if empty
        if (!translationData || typeof translationData !== 'object') {
          console.warn('No valid translation data loaded, using fallback');
          setCurrentLanguage('en');
          setTranslations(fallbackData);
        } else {
          setCurrentLanguage(initialLanguage);
          setTranslations(translationData);
        }
      } catch (error) {
        console.error('Failed to initialize translations:', error);
        setHasError(true);
        // Set minimal fallback state - app should still work
        setCurrentLanguage('en');
        setTranslations({});
        setFallbackTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  // Change language function with enhanced error handling
  const setLanguage = async (language) => {
    try {
      // Validate language parameter
      if (!language || typeof language !== 'string' || !/^[a-z]{2}$/.test(language)) {
        console.warn('Invalid language parameter:', language);
        return;
      }

      // Load new translations
      const translationData = await loadTranslations(language);
      
      // Only update state if we successfully loaded translations
      if (translationData && Object.keys(translationData).length > 0) {
        setCurrentLanguage(language);
        setTranslations(translationData);
        
        // Attempt to persist to localStorage with error handling
        const storageSuccess = setStoredLanguage(language);
        if (!storageSuccess) {
          console.warn('Language preference could not be saved, but language change was successful');
        }
      } else {
        console.error(`No translations loaded for language: ${language}`);
        // Don't change the current language if no translations were loaded
      }
    } catch (error) {
      console.error('Failed to change language:', error);
      // Language change failed, but app should continue functioning
      // Current language and translations remain unchanged
    }
  };

  // Translation function with comprehensive fallback
  const t = (key) => {
    if (!key || typeof key !== 'string') {
      console.warn('Invalid translation key:', key);
      return String(key || '');
    }

    const keys = key.split('.');
    let value = translations;
    
    // Navigate through nested object in current language
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = null;
        break;
      }
    }
    
    // If we found a valid string value, return it
    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }
    
    // Fallback to English translations if current language failed
    if (currentLanguage !== 'en' && fallbackTranslations && Object.keys(fallbackTranslations).length > 0) {
      let fallbackValue = fallbackTranslations;
      
      for (const k of keys) {
        if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
          fallbackValue = fallbackValue[k];
        } else {
          fallbackValue = null;
          break;
        }
      }
      
      if (typeof fallbackValue === 'string' && fallbackValue.trim() !== '') {
        console.warn(`Translation key "${key}" not found in ${currentLanguage}, using English fallback`);
        return fallbackValue;
      }
    }
    
    // Final fallback: return the key itself
    console.warn(`Translation key not found in any language: ${key}`);
    return key;
  };

  const contextValue = {
    currentLanguage,
    setLanguage,
    t
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use translation context
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  
  if (!context) {
    console.error('useTranslation must be used within a TranslationProvider');
    
    // Return a fallback implementation to prevent app crashes
    return {
      currentLanguage: 'en',
      setLanguage: (language) => {
        console.warn('Translation context not available, language change ignored:', language);
      },
      t: (key) => {
        console.warn('Translation context not available, returning key as-is:', key);
        return String(key || '');
      }
    };
  }
  
  return context;
};

export default TranslationContext;