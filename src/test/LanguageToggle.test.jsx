import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TranslationProvider } from '../contexts/TranslationContext'
import LanguageToggle from '../components/LanguageToggle'

// Mock component to test LanguageToggle in different language states
const TestWrapper = ({ initialLanguage = 'en' }) => {
  if (initialLanguage === 'es') {
    localStorage.getItem.mockReturnValue('es')
  } else {
    localStorage.getItem.mockReturnValue('en')
  }

  return (
    <TranslationProvider>
      <LanguageToggle />
    </TranslationProvider>
  )
}

describe('LanguageToggle Component', () => {
  beforeEach(() => {
    // Reset localStorage mock
    localStorage.getItem.mockReturnValue(null)
    localStorage.setItem.mockImplementation(() => {})
    
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

  describe('Rendering', () => {
    it('should render language toggle button', async () => {
      render(<TestWrapper />)
      
      const toggleButton = await screen.findByRole('button')
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to Spanish')
    })

    it('should display EN and ES labels', async () => {
      render(<TestWrapper />)
      
      await waitFor(() => {
        expect(screen.getByText('EN')).toBeInTheDocument()
        expect(screen.getByText('ES')).toBeInTheDocument()
      })
    })

    it('should highlight current language (English)', async () => {
      render(<TestWrapper initialLanguage="en" />)
      
      const toggleButton = await screen.findByRole('button')
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to Spanish')
      
      // Check that EN is highlighted (has darker text color)
      const enLabel = screen.getByText('EN')
      expect(enLabel).toHaveClass('text-neutral-900', 'font-bold')
      
      const esLabel = screen.getByText('ES')
      expect(esLabel).toHaveClass('text-neutral-400')
    })

    it('should highlight current language (Spanish)', async () => {
      render(<TestWrapper initialLanguage="es" />)
      
      await waitFor(async () => {
        const toggleButton = await screen.findByRole('button')
        expect(toggleButton).toHaveAttribute('aria-label', 'Switch to English')
      })
      
      // Check that ES is highlighted
      const esLabel = screen.getByText('ES')
      expect(esLabel).toHaveClass('text-neutral-900', 'font-bold')
      
      const enLabel = screen.getByText('EN')
      expect(enLabel).toHaveClass('text-neutral-400')
    })
  })

  describe('Interactions', () => {
    it('should toggle from English to Spanish when clicked', async () => {
      const user = userEvent.setup()
      render(<TestWrapper initialLanguage="en" />)
      
      const toggleButton = await screen.findByRole('button')
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to Spanish')
      
      await user.click(toggleButton)
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-label', 'Switch to English')
      })
      
      // Check that ES is now highlighted
      const esLabel = screen.getByText('ES')
      expect(esLabel).toHaveClass('text-neutral-900', 'font-bold')
    })

    it('should toggle from Spanish to English when clicked', async () => {
      const user = userEvent.setup()
      render(<TestWrapper initialLanguage="es" />)
      
      const toggleButton = await screen.findByRole('button')
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-label', 'Switch to English')
      })
      
      await user.click(toggleButton)
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-label', 'Switch to Spanish')
      })
      
      // Check that EN is now highlighted
      const enLabel = screen.getByText('EN')
      expect(enLabel).toHaveClass('text-neutral-900', 'font-bold')
    })

    it('should have proper hover states', async () => {
      const user = userEvent.setup()
      render(<TestWrapper />)
      
      const toggleButton = await screen.findByRole('button')
      
      // Check initial classes
      expect(toggleButton).toHaveClass('bg-neutral-800', 'border-neutral-700')
      expect(toggleButton).toHaveClass('hover:bg-neutral-700', 'hover:border-neutral-600')
      
      // Hover should be handled by CSS, but we can verify the classes are present
      await user.hover(toggleButton)
      expect(toggleButton).toHaveClass('hover:bg-neutral-700', 'hover:border-neutral-600')
    })

    it('should have proper focus states', async () => {
      const user = userEvent.setup()
      render(<TestWrapper />)
      
      const toggleButton = await screen.findByRole('button')
      
      await user.tab() // Focus the button
      
      expect(toggleButton).toHaveFocus()
      expect(toggleButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-cyan-400')
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<TestWrapper initialLanguage="en" />)
      
      const toggleButton = await screen.findByRole('button')
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to Spanish')
      
      // Focus and press Enter
      await user.tab()
      expect(toggleButton).toHaveFocus()
      
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-label', 'Switch to English')
      })
    })

    it('should be keyboard accessible with Space key', async () => {
      const user = userEvent.setup()
      render(<TestWrapper initialLanguage="en" />)
      
      const toggleButton = await screen.findByRole('button')
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to Spanish')
      
      // Focus and press Space
      await user.tab()
      expect(toggleButton).toHaveFocus()
      
      await user.keyboard(' ')
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-label', 'Switch to English')
      })
    })
  })

  describe('Visual States', () => {
    it('should have correct slider position for English', async () => {
      render(<TestWrapper initialLanguage="en" />)
      
      await waitFor(() => {
        // Find the slider element (the div with gradient background)
        const slider = document.querySelector('.bg-gradient-to-r')
        expect(slider).toHaveClass('-translate-x-4')
        expect(slider).not.toHaveClass('translate-x-4')
      })
    })

    it('should have correct slider position for Spanish', async () => {
      render(<TestWrapper initialLanguage="es" />)
      
      await waitFor(() => {
        // Find the slider element (the div with gradient background)
        const slider = document.querySelector('.bg-gradient-to-r')
        expect(slider).toHaveClass('translate-x-4')
        expect(slider).not.toHaveClass('-translate-x-4')
      })
    })

    it('should have smooth transition classes', async () => {
      render(<TestWrapper />)
      
      const toggleButton = await screen.findByRole('button')
      expect(toggleButton).toHaveClass('transition-all', 'duration-300')
      
      // Check slider transition
      const slider = document.querySelector('.bg-gradient-to-r')
      expect(slider).toHaveClass('transition-transform', 'duration-300', 'ease-in-out')
      
      // Check label transitions
      const labels = document.querySelectorAll('.transition-colors')
      expect(labels).toHaveLength(2)
      labels.forEach(label => {
        expect(label).toHaveClass('duration-300')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      render(<TestWrapper initialLanguage="en" />)
      
      const toggleButton = await screen.findByRole('button')
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to Spanish')
      
      // Should be focusable
      expect(toggleButton).not.toHaveAttribute('tabindex', '-1')
    })

    it('should update ARIA label when language changes', async () => {
      const user = userEvent.setup()
      render(<TestWrapper initialLanguage="en" />)
      
      const toggleButton = await screen.findByRole('button')
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to Spanish')
      
      await user.click(toggleButton)
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-label', 'Switch to English')
      })
    })

    it('should be screen reader friendly', async () => {
      render(<TestWrapper />)
      
      const toggleButton = await screen.findByRole('button')
      
      // Should be identifiable by screen readers
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveAttribute('aria-label')
      
      // Should not have any hidden content that would confuse screen readers
      expect(toggleButton).not.toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive classes for mobile compatibility', async () => {
      render(<TestWrapper />)
      
      const toggleButton = await screen.findByRole('button')
      
      // Check that it has appropriate sizing for mobile
      expect(toggleButton).toHaveClass('w-16', 'h-8')
      
      // Check that the parent container has text sizing
      const labelContainer = toggleButton.querySelector('.text-xs')
      expect(labelContainer).toBeInTheDocument()
    })

    it('should maintain functionality on different screen sizes', async () => {
      const user = userEvent.setup()
      
      // This test ensures the component works regardless of screen size
      render(<TestWrapper initialLanguage="en" />)
      
      const toggleButton = await screen.findByRole('button')
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to Spanish')
      
      await user.click(toggleButton)
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-label', 'Switch to English')
      })
    })
  })
})