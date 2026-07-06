import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function TranslateWidget() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    const id = 'google-translate-script';
    // Remove if already existing to avoid duplicates on fast re-renders
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    // Inject Google Translate callback globally with try-catch safety
    (window as any).googleTranslateElementInit = () => {
      try {
        if (
          (window as any).google &&
          (window as any).google.translate &&
          (window as any).google.translate.TranslateElement
        ) {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'hi,mr,pa,ta,te,gu,kn,ml,bn,en', // Hindi, Marathi, Punjabi, Tamil, Telugu, Gujarati, Kannada, Malayalam, Bengali, English
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element'
          );
        } else {
          console.warn('Google Translate namespaces are not fully available yet.');
        }
      } catch (err) {
        console.warn('Failed to initialize Google Translate:', err);
      }
    };

    const addScript = document.createElement('script');
    addScript.setAttribute('src', 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
    addScript.setAttribute('id', id);
    addScript.async = true;
    addScript.onerror = (e) => {
      console.warn('Google Translate script failed to load (expected in sandboxed browser previews).');
    };
    document.body.appendChild(addScript);

    return () => {
      // Cleanup global callback
      delete (window as any).googleTranslateElementInit;
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return (
      <button
        onClick={() => setIsEnabled(true)}
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 transition-colors border border-stone-200 text-[10px] sm:text-xs font-semibold uppercase tracking-wider cursor-pointer"
        title="Enable translation to regional Indian languages"
      >
        <Globe className="h-3 w-3 text-stone-500" />
        Translate App
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 animate-in fade-in duration-200">
      <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest hidden sm:inline">Translate:</span>
      <div id="google_translate_element" className="google-translate-container shrink-0 min-w-[120px]" />
    </div>
  );
}

