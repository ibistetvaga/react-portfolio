import React from 'react';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';

// Test component to verify translation functionality
const TestComponent = () => {
  const { t, currentLanguage, setLanguage } = useTranslation();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Translation Test</h1>
      <p>Current Language: {currentLanguage}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setLanguage('en')}
          style={{ marginRight: '10px', padding: '5px 10px' }}
        >
          English
        </button>
        <button 
          onClick={() => setLanguage('es')}
          style={{ padding: '5px 10px' }}
        >
          Español
        </button>
      </div>

      <div>
        <h2>{t('hero.role')}</h2>
        <p>{t('hero.description')}</p>
        <h3>{t('about.title')} {t('about.titleSuffix')}</h3>
        <p>{t('about.description')}</p>
      </div>
    </div>
  );
};

// Test app wrapper
const TestApp = () => {
  return (
    <TranslationProvider>
      <TestComponent />
    </TranslationProvider>
  );
};

export default TestApp;