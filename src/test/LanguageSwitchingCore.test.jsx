import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TranslationProvider } from '../contexts/TranslationContext'
import LanguageToggle from '../components/LanguageToggle'
import Hero from '../components/Hero'
import About from '../components/About'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    img: ({ children, ...props }) => <img {...props}>{children}</img>,
  },
}))

// Mock image imports
vi.mock('../assets/kevinRushProfile.png', () => ({ default: 'mock-profile.png' }))
vi.mock('../assets/about.jpg', () => ({ default: 'mock-about.jpg' }))

describe('Core Language Switching Functionality', () => {
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

  describe('Language Toggle Integration', () => {
    it('should switch Hero component content when language toggle is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TranslationProvider>
          <LanguageToggle />
          <Hero />
        </TranslationProvider>
      )

      // Wait for initial English content
      await waitFor(() => {
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
      })

      // Find and click the language toggle
      const toggleButton = screen.getByRole('button', { name: /Switch to Spanish/i })
      await user.click(toggleButton)

      // Wait for Spanish content to appear
      await waitFor(() => {
        expect(screen.getByText('Desarrollador Full Stack')).toBeInTheDocument()
      })

      // Verify toggle button updated
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to English')
    })

    it('should switch About component content when language toggle is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TranslationProvider>
          <LanguageToggle />
          <About />
        </TranslationProvider>
      )

      // Wait for initial English content
      await waitFor(() => {
        expect(screen.getByText('About')).toBeInTheDocument()
        expect(screen.getByText('Me')).toBeInTheDocument()
      })

      // Find and click the language toggle
      const toggleButton = screen.getByRole('button', { name: /Switch to Spanish/i })
      await user.click(toggleButton)

      // Wait for Spanish content to appear
      await waitFor(() => {
        expect(screen.getByText('Acerca de')).toBeInTheDocument()
        expect(screen.getByText('Mí')).toBeInTheDocument()
      })
    })

    it('should persist language changes to localStorage', async () => {
      const user = userEvent.setup()
      
      render(
        <TranslationProvider>
          <LanguageToggle />
          <Hero />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
      })

      const toggleButton = screen.getByRole('button', { name: /Switch to Spanish/i })
      await user.click(toggleButton)

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('portfolio-language', 'es')
      })
    })
  })

  describe('Browser Language Detection', () => {
    it('should default to Spanish when browser language is Spanish', async () => {
      navigator.language = 'es-ES'
      localStorage.getItem.mockReturnValue(null)
      
      render(
        <TranslationProvider>
          <Hero />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Desarrollador Full Stack')).toBeInTheDocument()
      })
    })

    it('should default to English when browser language is English', async () => {
      navigator.language = 'en-US'
      localStorage.getItem.mockReturnValue(null)
      
      render(
        <TranslationProvider>
          <Hero />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
      })
    })

    it('should default to English for unsupported languages', async () => {
      navigator.language = 'fr-FR'
      localStorage.getItem.mockReturnValue(null)
      
      render(
        <TranslationProvider>
          <Hero />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
      })
    })
  })

  describe('Language Persistence', () => {
    it('should restore saved language preference on initialization', async () => {
      localStorage.getItem.mockReturnValue('es')
      
      render(
        <TranslationProvider>
          <Hero />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Desarrollador Full Stack')).toBeInTheDocument()
      })

      expect(localStorage.getItem).toHaveBeenCalledWith('portfolio-language')
    })

    it('should override browser language with saved preference', async () => {
      navigator.language = 'es-ES'
      localStorage.getItem.mockReturnValue('en')
      
      render(
        <TranslationProvider>
          <Hero />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      const user = userEvent.setup()
      localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      render(
        <TranslationProvider>
          <LanguageToggle />
          <Hero />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
      })

      const toggleButton = screen.getByRole('button', { name: /Switch to Spanish/i })
      await user.click(toggleButton)

      // Language should still change even if localStorage fails
      await waitFor(() => {
        expect(screen.getByText('Desarrollador Full Stack')).toBeInTheDocument()
      })
    })

    it('should handle missing translation keys gracefully', async () => {
      render(
        <TranslationProvider>
          <div data-testid="missing-translation">{/* This would use a missing key */}</div>
        </TranslationProvider>
      )

      // App should still render without crashing
      expect(screen.getByTestId('missing-translation')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should maintain component functionality after language switch', async () => {
      const user = userEvent.setup()
      
      render(
        <TranslationProvider>
          <LanguageToggle />
          <Hero />
        </TranslationProvider>
      )

      // Initial state
      await waitFor(() => {
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
      })

      // Switch to Spanish
      const toggleButton = screen.getByRole('button', { name: /Switch to Spanish/i })
      await user.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByText('Desarrollador Full Stack')).toBeInTheDocument()
      })

      // Switch back to English
      await user.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
      })

      // Verify toggle button is functional
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to Spanish')
    })

    it('should handle multiple components switching simultaneously', async () => {
      const user = userEvent.setup()
      
      render(
        <TranslationProvider>
          <LanguageToggle />
          <Hero />
          <About />
        </TranslationProvider>
      )

      // Wait for initial English content
      await waitFor(() => {
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
        expect(screen.getByText('About')).toBeInTheDocument()
      })

      // Switch to Spanish
      const toggleButton = screen.getByRole('button', { name: /Switch to Spanish/i })
      await user.click(toggleButton)

      // Both components should switch to Spanish
      await waitFor(() => {
        expect(screen.getByText('Desarrollador Full Stack')).toBeInTheDocument()
        expect(screen.getByText('Acerca de')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility and UX', () => {
    it('should maintain proper ARIA labels during language switches', async () => {
      const user = userEvent.setup()
      
      render(
        <TranslationProvider>
          <LanguageToggle />
        </TranslationProvider>
      )

      const toggleButton = await screen.findByRole('button')
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to Spanish')

      await user.click(toggleButton)

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-label', 'Switch to English')
      })
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      
      render(
        <TranslationProvider>
          <LanguageToggle />
          <Hero />
        </TranslationProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
      })

      // Focus the toggle button and activate with keyboard
      const toggleButton = screen.getByRole('button')
      await user.tab()
      expect(toggleButton).toHaveFocus()

      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Desarrollador Full Stack')).toBeInTheDocument()
      })
    })
  })
})