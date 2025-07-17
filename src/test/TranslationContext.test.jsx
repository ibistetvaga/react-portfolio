import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TranslationProvider, useTranslation } from '../contexts/TranslationContext'

// Test component to access translation context
const TestComponent = ({ onLanguageChange } = {}) => {
  const { t, currentLanguage, setLanguage } = useTranslation()

  const handleLanguageChange = async (lang) => {
    await setLanguage(lang)
    if (onLanguageChange) {
      onLanguageChange(lang)
    }
  }

  return (
    <div>
      <div data-testid="current-language">{currentLanguage}</div>
      <div data-testid="hero-name">{t('hero.name')}</div>
      <div data-testid="hero-role">{t('hero.role')}</div>
      <div data-testid="nav-about">{t('nav.about')}</div>
      <div data-testid="missing-key">{t('missing.key')}</div>
      <div data-testid="invalid-key">{t('')}</div>
      <button 
        data-testid="switch-to-spanish" 
        onClick={() => handleLanguageChange('es')}
      >
        Switch to Spanish
      </button>
      <button 
        data-testid="switch-to-english" 
        onClick={() => handleLanguageChange('en')}
      >
        Switch to English
      </button>
      <button 
        data-testid="switch-to-invalid" 
        onClick={() => handleLanguageChange('invalid')}
      >
        Switch to Invalid
      </button>
    </div>
  )
}

// Component to test hook outside provider
const OutsideProviderComponent = () => {
  const { t, currentLanguage, setLanguage } = useTranslation()
  
  return (
    <div>
      <div data-testid="outside-language">{currentLanguage}</div>
      <div data-testid="outside-translation">{t('hero.name')}</div>
      <button onClick={() => setLanguage('es')}>Change Language</button>
    </div>
  )
}

describe('TranslationContext', () => {
  beforeEach(() => {
    // Reset localStorage mock
    localStorage.getItem.mockReturnValue(null)
    localStorage.setItem.mockImplementation(() => {})
    localStorage.removeItem.mockImplementation(() => {})
    
    // Reset navigator.language
    navigator.language = 'en-US'
    
    // Clear console warnings/errors for clean test output
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Language Detection', () => {
    it('should default to English when no saved preference and English browser', async () => {
      navigator.language = 'en-US'
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
        expect(screen.getByTestId('hero-name')).toHaveTextContent('Brian Ramos')
        expect(screen.getByTestId('hero-role')).toHaveTextContent('Full Stack Developer')
      })
    })

    it('should default to Spanish when no saved preference and Spanish browser', async () => {
      navigator.language = 'es-ES'
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('es')
      })
      
      expect(screen.getByTestId('hero-name')).toHaveTextContent('Brian Ramos')
      expect(screen.getByTestId('hero-role')).toHaveTextContent('Desarrollador Full Stack')
    })

    it('should use saved language preference over browser language', async () => {
      navigator.language = 'es-ES'
      localStorage.getItem.mockReturnValue('en')
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      })
      
      expect(screen.getByTestId('hero-role')).toHaveTextContent('Full Stack Developer')
    })

    it('should handle invalid saved language preference', async () => {
      localStorage.getItem.mockReturnValue('invalid-lang')
      navigator.language = 'es-ES'
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('es')
      })
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('portfolio-language')
    })
  })

  describe('Language Switching', () => {
    it('should switch from English to Spanish', async () => {
      const user = userEvent.setup()
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      })

      await user.click(screen.getByTestId('switch-to-spanish'))

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('es')
      })
      
      expect(screen.getByTestId('hero-role')).toHaveTextContent('Desarrollador Full Stack')
      expect(screen.getByTestId('nav-about')).toHaveTextContent('Acerca de')
    })

    it('should switch from Spanish to English', async () => {
      const user = userEvent.setup()
      localStorage.getItem.mockReturnValue('es')
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('es')
      })

      await user.click(screen.getByTestId('switch-to-english'))

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      })
      
      expect(screen.getByTestId('hero-role')).toHaveTextContent('Full Stack Developer')
      expect(screen.getByTestId('nav-about')).toHaveTextContent('About')
    })

    it('should persist language changes to localStorage', async () => {
      const user = userEvent.setup()
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      })

      await user.click(screen.getByTestId('switch-to-spanish'))

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('portfolio-language', 'es')
      })
    })

    it('should handle localStorage errors gracefully', async () => {
      const user = userEvent.setup()
      localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      })

      await user.click(screen.getByTestId('switch-to-spanish'))

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('es')
      })
      
      // Language should still change even if localStorage fails
      expect(screen.getByTestId('hero-role')).toHaveTextContent('Desarrollador Full Stack')
    })

    it('should ignore invalid language changes', async () => {
      const user = userEvent.setup()
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      })

      await user.click(screen.getByTestId('switch-to-invalid'))

      // Should remain English (the context should ignore invalid language codes)
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      }, { timeout: 3000 })
      
      expect(screen.getByTestId('hero-role')).toHaveTextContent('Full Stack Developer')
    })
  })

  describe('Translation Function', () => {
    it('should return correct translations for valid keys', async () => {
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('hero-name')).toHaveTextContent('Brian Ramos')
        expect(screen.getByTestId('hero-role')).toHaveTextContent('Full Stack Developer')
        expect(screen.getByTestId('nav-about')).toHaveTextContent('About')
      })
    })

    it('should fallback to English for missing Spanish translations', async () => {
      const user = userEvent.setup()
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await user.click(screen.getByTestId('switch-to-spanish'))

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('es')
      })

      // Test with a key that exists in English but might be missing in Spanish
      expect(screen.getByTestId('hero-name')).toHaveTextContent('Brian Ramos')
    })

    it('should return key name for completely missing translations', async () => {
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('missing-key')).toHaveTextContent('missing.key')
      })
    })

    it('should handle invalid translation keys gracefully', async () => {
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('invalid-key')).toHaveTextContent('')
      })
    })
  })

  describe('Hook Usage Outside Provider', () => {
    it('should provide fallback implementation when used outside provider', () => {
      // Suppress expected error logs for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      render(<OutsideProviderComponent />)
      
      expect(screen.getByTestId('outside-language')).toHaveTextContent('en')
      expect(screen.getByTestId('outside-translation')).toHaveTextContent('hero.name')
      
      expect(consoleSpy).toHaveBeenCalledWith('useTranslation must be used within a TranslationProvider')
      
      consoleSpy.mockRestore()
      warnSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage read errors', async () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage read error')
      })
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      })
      
      // Should still work with default language
      expect(screen.getByTestId('hero-name')).toHaveTextContent('Brian Ramos')
    })

    it('should handle browser language detection errors', async () => {
      // Mock localStorage to return null and set a problematic navigator
      localStorage.getItem.mockReturnValue(null)
      
      // Create a new navigator mock that throws
      const originalNavigator = global.navigator
      global.navigator = {
        ...originalNavigator,
        get language() {
          throw new Error('Navigator error')
        }
      }
      
      render(
        <TranslationProvider>
          <TestComponent />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      })
      
      // Should fallback to English
      expect(screen.getByTestId('hero-role')).toHaveTextContent('Full Stack Developer')
      
      // Restore original navigator
      global.navigator = originalNavigator
    })
  })
})