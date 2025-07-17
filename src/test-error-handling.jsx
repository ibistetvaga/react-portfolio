import React from 'react';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';

// Test component to verify error handling
const ErrorHandlingTest = () => {
  const { t, currentLanguage, setLanguage } = useTranslation();

  const testCases = [
    // Valid translation keys
    { key: 'hero.name', expected: 'should return translated value' },
    { key: 'nav.about', expected: 'should return translated value' },
    
    // Missing translation keys (should fallback)
    { key: 'nonexistent.key', expected: 'should return key itself' },
    { key: 'hero.nonexistent', expected: 'should return key itself' },
    
    // Invalid keys (should handle gracefully)
    { key: '', expected: 'should return empty string' },
    { key: null, expected: 'should return string representation' },
    { key: undefined, expected: 'should return string representation' },
    { key: 123, expected: 'should return string representation' },
    
    // Deeply nested missing keys
    { key: 'deep.nested.missing.key', expected: 'should return key itself' },
  ];

  const handleLanguageChange = async (lang) => {
    console.log(`Testing language change to: ${lang}`);
    await setLanguage(lang);
  };

  const testLocalStorageError = () => {
    // Temporarily break localStorage to test error handling
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    
    localStorage.setItem = () => {
      throw new Error('localStorage is not available');
    };
    localStorage.getItem = () => {
      throw new Error('localStorage is not available');
    };
    
    console.log('Testing localStorage error handling...');
    handleLanguageChange('es').then(() => {
      // Restore localStorage
      localStorage.setItem = originalSetItem;
      localStorage.getItem = originalGetItem;
      console.log('localStorage error test completed');
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Translation Error Handling Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Current Language:</strong> {currentLanguage}</p>
        <button onClick={() => handleLanguageChange('en')} style={{ marginRight: '10px' }}>
          Switch to English
        </button>
        <button onClick={() => handleLanguageChange('es')} style={{ marginRight: '10px' }}>
          Switch to Spanish
        </button>
        <button onClick={() => handleLanguageChange('invalid')} style={{ marginRight: '10px' }}>
          Test Invalid Language
        </button>
        <button onClick={testLocalStorageError}>
          Test localStorage Error
        </button>
      </div>

      <h2>Translation Key Tests</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Key</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Result</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Expected</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((testCase, index) => {
            const result = t(testCase.key);
            return (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {JSON.stringify(testCase.key)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  "{result}"
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {testCase.expected}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>Sample Translations</h2>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Hero Name:</strong> {t('hero.name')}</p>
        <p><strong>Hero Role:</strong> {t('hero.role')}</p>
        <p><strong>About Title:</strong> {t('about.title')}</p>
        <p><strong>Contact Title:</strong> {t('contact.title')}</p>
      </div>
    </div>
  );
};

// Test component that uses translation outside of provider (should handle gracefully)
const OutsideProviderTest = () => {
  const { t, currentLanguage } = useTranslation();
  
  return (
    <div style={{ padding: '20px', border: '2px solid red', margin: '20px' }}>
      <h3>Outside Provider Test</h3>
      <p>Current Language: {currentLanguage}</p>
      <p>Translation Test: {t('hero.name')}</p>
    </div>
  );
};

// Main test app
const TestApp = () => {
  return (
    <div>
      <TranslationProvider>
        <ErrorHandlingTest />
      </TranslationProvider>
      
      <OutsideProviderTest />
    </div>
  );
};

export default TestApp;