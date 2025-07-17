# Design Document

## Overview

The Spanish translation and language toggle feature will be implemented using React Context API for state management, with a custom hook for translation functionality. The system will use JSON files for storing translations and localStorage for persistence. A toggle component will be added to the navbar, and all existing components will be updated to use translated content.

## Architecture

### Translation System Architecture

- **Translation Provider**: React Context that manages current language state and provides translation functions
- **Translation Files**: JSON files containing key-value pairs for English and Spanish content
- **Translation Hook**: Custom hook that provides translation function and current language state
- **Language Toggle**: UI component for switching between languages
- **Persistence Layer**: localStorage integration for remembering user preferences

### Component Integration

- All existing components will be wrapped with translation context
- Components will use translation keys instead of hardcoded strings
- Translation keys will follow a hierarchical naming convention (e.g., `hero.title`, `about.description`)

## Components and Interfaces

### 1. Translation Context (`TranslationContext`)

```javascript
interface TranslationContextType {
  currentLanguage: "en" | "es";
  setLanguage: (language: "en" | "es") => void;
  t: (key: string) => string;
}
```

### 2. Translation Provider (`TranslationProvider`)

- Manages language state
- Loads appropriate translation files
- Provides translation function
- Handles localStorage persistence
- Detects browser language on first visit

### 3. Language Toggle Component (`LanguageToggle`)

- Displays current language
- Provides toggle functionality
- Shows visual feedback on interaction
- Responsive design for mobile devices

### 4. Translation Hook (`useTranslation`)

```javascript
interface UseTranslationReturn {
  t: (key: string) => string;
  currentLanguage: "en" | "es";
  setLanguage: (language: "en" | "es") => void;
}
```

## Data Models

### Translation File Structure

```json
{
  "hero": {
    "name": "Brian Ramos",
    "role": "Full Stack Developer",
    "description": "I am a passionate full stack developer..."
  },
  "nav": {
    "about": "About",
    "experience": "Experience",
    "projects": "Projects",
    "technologies": "Technologies",
    "contact": "Contact"
  },
  "about": {
    "title": "About",
    "titleSuffix": "Me",
    "description": "I am a dedicated and versatile full stack developer..."
  },
  "experience": {
    "title": "Experience",
    "roles": {
      "seniorFullStack": "Senior Full Stack Developer",
      "frontend": "Frontend Developer",
      "fullStack": "Full Stack Developer",
      "softwareEngineer": "Software Engineer"
    },
    "descriptions": {
      "google": "Led a team in developing and maintaining web applications...",
      "adobe": "Designed and developed user interfaces for web applications...",
      "facebook": "Developed and maintained web applications using JavaScript...",
      "paypal": "Contributed to the development of web applications..."
    }
  },
  "projects": {
    "title": "Projects",
    "items": {
      "ecommerce": {
        "title": "E-Commerce Website",
        "description": "A fully functional e-commerce website with features..."
      },
      "taskManagement": {
        "title": "Task Management App",
        "description": "An application for managing tasks and projects..."
      },
      "portfolio": {
        "title": "Portfolio Website",
        "description": "A personal portfolio website showcasing projects..."
      },
      "blogging": {
        "title": "Blogging Platform",
        "description": "A platform for creating and publishing blog posts..."
      }
    }
  },
  "technologies": {
    "title": "Technologies"
  },
  "contact": {
    "title": "Get in Touch",
    "address": "767 Fifth Avenue, New York, NY 10153",
    "phone": "+12 4555 666 00",
    "email": "me@example.com"
  }
}
```

### Language Preference Storage

- Key: `portfolio-language`
- Values: `'en'` | `'es'`
- Storage: localStorage

## Error Handling

### Translation Key Missing

- Fallback to English translation
- Log warning in development mode
- Display key name if no fallback available

### Translation File Loading Errors

- Fallback to English
- Display error message in development
- Graceful degradation for users

### localStorage Errors

- Continue with default language (English)
- Don't break functionality if storage is unavailable

## Testing Strategy

### Unit Tests

- Translation context provider functionality
- Translation hook behavior
- Language toggle component interactions
- Translation key resolution
- Fallback mechanisms

### Integration Tests

- Language switching across all components
- Persistence functionality
- Browser language detection
- Responsive behavior of language toggle

### Visual Tests

- Layout integrity with different text lengths
- Animation preservation during language changes
- Mobile responsiveness of language toggle
- Visual feedback for language changes

### Accessibility Tests

- Screen reader compatibility
- Keyboard navigation for language toggle
- ARIA labels for language selection
- Focus management during language changes

## Implementation Considerations

### Performance

- Lazy load translation files
- Memoize translation functions
- Avoid unnecessary re-renders during language changes

### SEO Considerations

- Add lang attribute to HTML element
- Consider meta tags for language indication
- Maintain URL structure (single-page application)

### Browser Compatibility

- Support for localStorage
- ES6+ features used in implementation
- Fallback for older browsers if needed

### Responsive Design

- Language toggle positioning on mobile
- Text overflow handling for longer Spanish translations
- Maintain visual hierarchy across languages
