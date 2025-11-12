// telegram.js - Telegram WebApp SDK wrapper
// Provides a consistent interface for Telegram WebApp functionality with desktop fallback

class TelegramWrapper {
    constructor() {
        this.isAvailable = typeof window.Telegram !== 'undefined' && window.Telegram.WebApp;
        this.webApp = this.isAvailable ? window.Telegram.WebApp : this._createMock();
        this.isDesktop = !this.isAvailable;
    }

    /**
     * Initialize the Web App (must be called first)
     */
    ready() {
        if (this.isAvailable) {
            this.webApp.ready();
        } else {
            console.log('[Mock] Telegram WebApp ready() called');
        }
    }

    /**
     * Expand the Web App to full height
     */
    expand() {
        if (this.isAvailable) {
            this.webApp.expand();
        } else {
            console.log('[Mock] Telegram WebApp expand() called');
        }
    }

    /**
     * Get theme colors from Telegram
     */
    getTheme() {
        if (this.isAvailable && this.webApp.themeParams) {
            return {
                bgColor: this.webApp.themeParams.bg_color || '#ffffff',
                textColor: this.webApp.themeParams.text_color || '#000000',
                hintColor: this.webApp.themeParams.hint_color || '#999999',
                linkColor: this.webApp.themeParams.link_color || '#2481cc',
                buttonColor: this.webApp.themeParams.button_color || '#2481cc',
                buttonTextColor: this.webApp.themeParams.button_text_color || '#ffffff'
            };
        }
        
        // Default light theme for desktop
        return {
            bgColor: '#ffffff',
            textColor: '#000000',
            hintColor: '#999999',
            linkColor: '#2481cc',
            buttonColor: '#2481cc',
            buttonTextColor: '#ffffff'
        };
    }

    /**
     * Get user language code (for i18n)
     */
    getLanguageCode() {
        if (this.isAvailable && this.webApp.initDataUnsafe && this.webApp.initDataUnsafe.user) {
            return this.webApp.initDataUnsafe.user.language_code || 'en';
        }
        
        // Desktop fallback: use browser language
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        return browserLang.split('-')[0]; // 'en-US' -> 'en'
    }

    /**
     * Send data to bot (for reminders, premium unlock)
     */
    sendData(data) {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        
        if (this.isAvailable) {
            this.webApp.sendData(payload);
        } else {
            console.log('[Mock] Telegram WebApp sendData() called with:', payload);
            alert(`Mock: Data sent to bot:\n${payload}`);
        }
    }

    /**
     * Show alert dialog
     */
    showAlert(message, callback) {
        if (this.isAvailable) {
            this.webApp.showAlert(message, callback);
        } else {
            alert(`[Mock Alert]\n${message}`);
            if (callback) callback();
        }
    }

    /**
     * Show confirm dialog
     */
    showConfirm(message, callback) {
        if (this.isAvailable) {
            this.webApp.showConfirm(message, callback);
        } else {
            const result = confirm(`[Mock Confirm]\n${message}`);
            if (callback) callback(result);
        }
    }

    /**
     * Open link in external browser
     */
    openLink(url) {
        if (this.isAvailable) {
            this.webApp.openLink(url);
        } else {
            console.log('[Mock] Opening link:', url);
            window.open(url, '_blank');
        }
    }

    /**
     * Close the Web App
     */
    close() {
        if (this.isAvailable) {
            this.webApp.close();
        } else {
            console.log('[Mock] Telegram WebApp close() called');
            window.close();
        }
    }

    /**
     * Create a mock WebApp object for desktop testing
     */
    _createMock() {
        return {
            initDataUnsafe: {
                user: {
                    language_code: 'en'
                }
            },
            themeParams: {
                bg_color: '#ffffff',
                text_color: '#000000',
                hint_color: '#999999',
                link_color: '#2481cc',
                button_color: '#2481cc',
                button_text_color: '#ffffff'
            }
        };
    }
}

// Export singleton instance
export const telegram = new TelegramWrapper();
