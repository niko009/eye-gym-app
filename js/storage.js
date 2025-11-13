// storage.js - localStorage wrapper for UserPreferences
// Handles all client-side data persistence

const STORAGE_KEY = 'eyegym_preferences';

/**
 * Default user preferences schema (per data-model.md)
 */
const DEFAULT_PREFERENCES = {
    user_language: 'en',
    is_premium: false,
    completed_exercises: [],
    reminder_enabled: false,
    reminder_interval: '4h', // Default: every 4 hours
    voice_guidance_enabled: true,
    muted: false
};

class Storage {
    constructor() {
        this._cache = null;
    }

    /**
     * Get all user preferences
     */
    getPreferences() {
        if (this._cache) {
            return this._cache;
        }

        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                this._cache = { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
            } else {
                this._cache = { ...DEFAULT_PREFERENCES };
            }
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            this._cache = { ...DEFAULT_PREFERENCES };
        }

        return this._cache;
    }

    /**
     * Save user preferences
     */
    setPreferences(preferences) {
        try {
            const merged = { ...this.getPreferences(), ...preferences };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            this._cache = merged;
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    }

    /**
     * Get a specific preference value
     */
    get(key) {
        const prefs = this.getPreferences();
        return prefs[key];
    }

    /**
     * Set a specific preference value
     */
    set(key, value) {
        return this.setPreferences({ [key]: value });
    }

    /**
     * Check if user has premium access
     */
    isPremium() {
        return this.get('is_premium') === true;
    }

    /**
     * Unlock premium features
     */
    unlockPremium() {
        return this.set('is_premium', true);
    }

    /**
     * Add exercise to completed list
     */
    markExerciseComplete(exerciseId) {
        const completed = this.get('completed_exercises') || [];
        if (!completed.includes(exerciseId)) {
            completed.push(exerciseId);
            return this.set('completed_exercises', completed);
        }
        return true;
    }

    /**
     * Check if exercise is completed
     */
    isExerciseCompleted(exerciseId) {
        const completed = this.get('completed_exercises') || [];
        return completed.includes(exerciseId);
    }

    /**
     * Get reminder settings
     */
    getReminderSettings() {
        return {
            enabled: this.get('reminder_enabled'),
            interval: this.get('reminder_interval')
        };
    }

    /**
     * Update reminder settings
     */
    setReminderSettings(enabled, interval) {
        return this.setPreferences({
            reminder_enabled: enabled,
            reminder_interval: interval
        });
    }

    /**
     * Get voice guidance setting
     */
    isVoiceGuidanceEnabled() {
        return this.get('voice_guidance_enabled') === true;
    }

    /**
     * Get global mute setting
     */
    isMuted() {
        return this.get('muted') === true;
    }

    /**
     * Set global mute
     */
    setMuted(value) {
        return this.set('muted', value === true);
    }

    /**
     * Toggle voice guidance
     */
    setVoiceGuidance(enabled) {
        return this.set('voice_guidance_enabled', enabled);
    }

    /**
     * Clear all data (for testing/reset)
     */
    clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            this._cache = null;
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
}

// Export singleton instance
export const storage = new Storage();
