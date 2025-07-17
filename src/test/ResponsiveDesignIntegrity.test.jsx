import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TranslationProvider } from '../contexts/TranslationContext'
import LanguageToggle from '../components/LanguageToggle'
import Navbar from '../components/navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Experience from '../components/Experience'
import Projects from '../components/Projects'
import Contact from '../components/Contact'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    img: ({ children, ...props }) => <img {...props}>{children}</img>,
  },
}))

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  writable: true,
})

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})

// Helper function to simulate mobile viewport
const setMobileViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 667,
  })
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    ...mockMatchMedia(query),
    matches: query.includes('max-width'),
  }))
}

// Helper function to simulate desktop viewport
const setDesktopViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
  })
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    ...mockMatchMedia(query),
    matches: query.includes('min-width'),
  }))
}

// Helper function to render component with translation provider
const renderWithTranslation = (component) => {
  return render(
    <TranslationProvider>
      {component}
    </TranslationProvider>
  )
}

describe('Responsive Design and Layout Integrity', () => {
  beforeEach(() => {
    // Reset viewport to desktop by default
    setDesktopViewport()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    })
    // Mock navigator.language
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      configurable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Language Toggle Mobile Responsiveness', () => {
    it('should display language toggle correctly on mobile devices', async () => {
      setMobileViewport()
      renderWithTranslation(<Navbar />)
      
      const languageToggle = await screen.findByRole('button', { name: /switch to/i })
      expect(languageToggle).toBeInTheDocument()
      
      // Check if toggle has appropriate mobile styling
      expect(languageToggle).toHaveClass('w-16', 'h-8')
    })

    it('should maintain toggle functionality on mobile', async () => {
      setMobileViewport()
      renderWithTranslation(<Navbar />)
      
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /switch to english/i })).toBeInTheDocument()
      })
    })

    it('should position language toggle appropriately in mobile navbar', async () => {
      setMobileViewport()
      renderWithTranslation(<Navbar />)
      
      const navbar = screen.getByRole('navigation')
      const languageToggle = await screen.findByRole('button', { name: /switch to/i })
      
      // Check if toggle is within navbar
      expect(navbar).toContainElement(languageToggle)
    })
  })

  describe('Layout Adjustments for Different Text Lengths', () => {
    it('should handle longer Spanish text in Hero component without breaking layout', async () => {
      const { container } = renderWithTranslation(<Hero />)
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Brian Ramos')).toBeInTheDocument()
      })
      
      // Switch to Spanish
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        expect(screen.getByText('Desarrollador Full Stack')).toBeInTheDocument()
      })
      
      // Check that container maintains proper structure
      const heroContainer = container.querySelector('.border-b')
      expect(heroContainer).toBeInTheDocument()
      
      // Verify text doesn't overflow
      const description = screen.getByText(/Soy un desarrollador full stack apasionado/)
      expect(description).toBeVisible()
    })

    it('should adjust About section layout for longer Spanish content', async () => {
      renderWithTranslation(<About />)
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('About')).toBeInTheDocument()
      })
      
      // Switch to Spanish
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        expect(screen.getByText('Acerca de')).toBeInTheDocument()
      })
      
      // Check that longer Spanish text is properly contained
      const aboutDescription = screen.getByText(/Soy un desarrollador full stack dedicado/)
      expect(aboutDescription).toBeVisible()
    })

    it('should handle Experience section with longer Spanish job descriptions', async () => {
      renderWithTranslation(<Experience />)
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Experience')).toBeInTheDocument()
      })
      
      // Switch to Spanish
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        expect(screen.getByText('Experiencia')).toBeInTheDocument()
      })
      
      // Check that Spanish job descriptions are properly displayed
      expect(screen.getByText(/Lideré un equipo en el desarrollo/)).toBeVisible()
      expect(screen.getByText('Desarrollador Full Stack Senior')).toBeVisible()
    })

    it('should maintain Projects section layout with translated project titles', async () => {
      renderWithTranslation(<Projects />)
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Projects')).toBeInTheDocument()
      })
      
      // Switch to Spanish
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        expect(screen.getByText('Proyectos')).toBeInTheDocument()
      })
      
      // Check that longer Spanish project titles don't break layout
      expect(screen.getByText('Sitio Web de Comercio Electrónico')).toBeVisible()
      expect(screen.getByText('Aplicación de Gestión de Tareas')).toBeVisible()
    })
  })

  describe('Animation and Interaction Preservation', () => {
    it('should maintain hover animations on language toggle in both languages', async () => {
      renderWithTranslation(<LanguageToggle />)
      
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      
      // Check initial hover classes
      expect(languageToggle).toHaveClass('hover:bg-neutral-700', 'hover:border-neutral-600')
      
      // Switch language
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        const updatedToggle = screen.getByRole('button', { name: /switch to english/i })
        expect(updatedToggle).toHaveClass('hover:bg-neutral-700', 'hover:border-neutral-600')
      })
    })

    it('should preserve toggle slider animation during language changes', async () => {
      renderWithTranslation(<LanguageToggle />)
      
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      const slider = languageToggle.querySelector('.absolute.w-6.h-6')
      
      // Check initial position (English)
      expect(slider).toHaveClass('-translate-x-4')
      expect(slider).not.toHaveClass('translate-x-4')
      
      // Switch to Spanish
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        expect(slider).toHaveClass('translate-x-4')
        expect(slider).not.toHaveClass('-translate-x-4')
      })
      
      // Verify transition classes are present
      expect(slider).toHaveClass('transition-transform', 'duration-300', 'ease-in-out')
    })

    it('should maintain component animations after language switch', async () => {
      const { container } = renderWithTranslation(<Hero />)
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Brian Ramos')).toBeInTheDocument()
      })
      
      // Switch language
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        expect(screen.getByText('Desarrollador Full Stack')).toBeInTheDocument()
      })
      
      // Verify that the component structure is maintained (framer-motion is mocked)
      const heroTitle = screen.getByText('Brian Ramos')
      const heroRole = screen.getByText('Desarrollador Full Stack')
      expect(heroTitle).toBeInTheDocument()
      expect(heroRole).toBeInTheDocument()
    })
  })

  describe('Scroll Position Maintenance', () => {
    it('should maintain scroll position during language changes', async () => {
      // Mock scroll behavior
      const mockScrollTo = vi.fn()
      Object.defineProperty(window, 'scrollTo', {
        value: mockScrollTo,
        writable: true,
      })
      
      Object.defineProperty(window, 'scrollY', {
        value: 500,
        writable: true,
      })
      
      renderWithTranslation(<Hero />)
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Brian Ramos')).toBeInTheDocument()
      })
      
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      
      // Switch language
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        expect(screen.getByText('Desarrollador Full Stack')).toBeInTheDocument()
      })
      
      // Verify scroll position wasn't changed
      expect(mockScrollTo).not.toHaveBeenCalled()
    })

    it('should not trigger page reload during language switch', async () => {
      const mockReload = vi.fn()
      Object.defineProperty(window.location, 'reload', {
        value: mockReload,
        writable: true,
      })
      
      renderWithTranslation(<LanguageToggle />)
      
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /switch to english/i })).toBeInTheDocument()
      })
      
      expect(mockReload).not.toHaveBeenCalled()
    })
  })

  describe('Cross-Device Layout Consistency', () => {
    it('should maintain consistent layout structure across viewport sizes', async () => {
      // Test desktop layout
      setDesktopViewport()
      const { unmount: unmountDesktop } = renderWithTranslation(<Navbar />)
      
      // Switch to Spanish on desktop
      const desktopToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      fireEvent.click(desktopToggle)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /switch to english/i })).toBeInTheDocument()
      })
      
      unmountDesktop()
      
      // Test mobile layout
      setMobileViewport()
      renderWithTranslation(<Navbar />)
      
      // Verify mobile layout has the language toggle
      const mobileToggle = await screen.findByRole('button', { name: /switch to/i })
      expect(mobileToggle).toBeInTheDocument()
    })

    it('should handle text overflow gracefully on small screens', async () => {
      setMobileViewport()
      renderWithTranslation(<Contact />)
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Get in Touch')).toBeInTheDocument()
      })
      
      // Switch to Spanish for longer text
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        expect(screen.getByText('Ponte en Contacto')).toBeInTheDocument()
      })
      
      // Verify contact information is still visible and properly formatted
      const contactTitle = screen.getByText('Ponte en Contacto')
      expect(contactTitle).toBeVisible()
    })
  })

  describe('Visual Feedback and State Indicators', () => {
    it('should provide clear visual feedback for current language state', async () => {
      renderWithTranslation(<LanguageToggle />)
      
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      const enLabel = screen.getByText('EN')
      const esLabel = screen.getByText('ES')
      
      // Check initial state (English active)
      expect(enLabel).toHaveClass('text-neutral-900', 'font-bold')
      expect(esLabel).toHaveClass('text-neutral-400')
    })

    it('should update visual feedback after language switch', async () => {
      renderWithTranslation(<LanguageToggle />)
      
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        const enLabel = screen.getByText('EN')
        const esLabel = screen.getByText('ES')
        
        // Check updated state (Spanish active)
        expect(esLabel).toHaveClass('text-neutral-900', 'font-bold')
        expect(enLabel).toHaveClass('text-neutral-400')
      })
    })

    it('should maintain focus states and accessibility during language changes', async () => {
      renderWithTranslation(<LanguageToggle />)
      
      const languageToggle = await screen.findByRole('button', { name: /switch to spanish/i })
      
      // Focus the toggle
      languageToggle.focus()
      expect(languageToggle).toHaveFocus()
      
      // Switch language
      fireEvent.click(languageToggle)
      
      await waitFor(() => {
        const updatedToggle = screen.getByRole('button', { name: /switch to english/i })
        expect(updatedToggle).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-cyan-400')
      })
    })
  })
})