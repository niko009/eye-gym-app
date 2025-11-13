// i18n.js - Internationalization module
// Loads and manages localized strings from embedded JSON

import { telegram } from './telegram.js';

class I18n {
    constructor() {
        this.currentLocale = 'en';
        this.translations = {};
        this.supportedLocales = ['en', 'ru', 'ro'];
    }

    /**
     * Initialize i18n with auto-detected or specified language
     */
    init(languageCode = null) {
        // Determine language from parameter or fallback chain
        let locale = languageCode;

        if (!locale) {
            // Try to get from localStorage (user preference)
            locale = this._getSavedLocale();
        }

        // If still not found, try Telegram-provided language code
        if (!locale) {
            try {
                const tgLang = telegram.getLanguageCode();
                locale = tgLang ? tgLang.split('-')[0] : null;
            } catch (e) {
                // ignore and fallback
            }
        }

        // Validate and fallback to English if unsupported
        if (!this.supportedLocales.includes(locale)) {
            console.log(`Language '${locale}' not supported, falling back to 'en'`);
            locale = 'en';
        }

        this.currentLocale = locale;

        // Load translations from embedded script tags
        this._loadTranslations(locale);

        // Persist chosen locale to localStorage
        this.saveLocale(locale);

        return locale;
    }

    /**
     * Get localized string by key
     */
    t(key, replacements = {}) {
        let text = this.translations[key] || key;
        
        // Replace {{variable}} placeholders
        Object.keys(replacements).forEach(placeholder => {
            const pattern = new RegExp(`{{${placeholder}}}`, 'g');
            text = text.replace(pattern, replacements[placeholder]);
        });
        
        return text;
    }

    /**
     * Get current locale code
     */
    getLocale() {
        return this.currentLocale;
    }

    /**
     * Switch to a different language
     */
    setLocale(locale) {
        if (!this.supportedLocales.includes(locale)) {
            console.error(`Locale '${locale}' not supported`);
            return false;
        }
        
        this.currentLocale = locale;
        this._loadTranslations(locale);
        return true;
    }

    /**
     * Load translations from embedded <script type="application/json"> tag
     */
    _loadTranslations(locale) {
        try {
            const scriptId = `locale-${locale}`;
            const scriptElement = document.getElementById(scriptId);
            
            if (!scriptElement) {
                console.error(`Locale script not found: ${scriptId}`);
                return;
            }
            
            const jsonContent = scriptElement.textContent;
            this.translations = JSON.parse(jsonContent);
        } catch (error) {
            console.error(`Error loading translations for '${locale}':`, error);
            this.translations = {};
        }
    }

    /**
     * Get saved locale from localStorage (if exists)
     */
    _getSavedLocale() {
        try {
            const data = localStorage.getItem('eyegym_preferences');
            if (data) {
                const prefs = JSON.parse(data);
                return prefs.user_language || 'en';
            }
        } catch (error) {
            console.error('Error reading locale from localStorage:', error);
        }
        return 'en';
    }

    /**
     * Save current locale to localStorage
     */
    saveLocale(locale) {
        try {
            const key = 'eyegym_preferences';
            const data = localStorage.getItem(key);
            const prefs = data ? JSON.parse(data) : {};
            prefs.user_language = locale;
            localStorage.setItem(key, JSON.stringify(prefs));
            return true;
        } catch (error) {
            console.error('Error saving locale to localStorage:', error);
            return false;
        }
    }
}

// Export singleton instance
export const i18n = new I18n();
