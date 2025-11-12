// app.js - Main application entry point
// Initializes Telegram SDK, i18n, and sets up the app

import { telegram } from './telegram.js';
import { i18n } from './i18n.js';
import { storage } from './storage.js';
import { exerciseManager } from './exercises.js';
import { sessionController } from './session.js';

class App {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;

        console.log('Initializing Eye Gym Web App...');

        // 1. Initialize Telegram WebApp SDK
        telegram.ready();
        telegram.expand();

        // 2. Apply Telegram theme colors
        this._applyTheme();

        // 3. Initialize i18n with auto-detected language
        const detectedLang = telegram.getLanguageCode();
        const currentLang = i18n.init(detectedLang);
        
        // Save detected language to storage if different
        if (currentLang !== storage.get('user_language')) {
            storage.set('user_language', currentLang);
        }

        // 4. Update page title
        document.title = i18n.t('app_title');

        // 5. Initialize routing (simple screen management)
        this._initRouting();

        // 6. Set up event listeners
        this._setupEventListeners();

        // 7. Load and render exercise list (default view)
        await this._loadExerciseList();

        this.initialized = true;
        console.log('Eye Gym Web App initialized successfully');
    }

    /**
     * Apply Telegram theme colors to CSS variables
     */
    _applyTheme() {
        const theme = telegram.getTheme();
        const root = document.documentElement;

        root.style.setProperty('--tg-theme-bg-color', theme.bgColor);
        root.style.setProperty('--tg-theme-text-color', theme.textColor);
        root.style.setProperty('--tg-theme-hint-color', theme.hintColor);
        root.style.setProperty('--tg-theme-link-color', theme.linkColor);
        root.style.setProperty('--tg-theme-button-color', theme.buttonColor);
        root.style.setProperty('--tg-theme-button-text-color', theme.buttonTextColor);

        // Apply background color to body
        document.body.style.backgroundColor = theme.bgColor;
        document.body.style.color = theme.textColor;
    }

    /**
     * Initialize simple routing/screen management
     */
    _initRouting() {
        const settingsButton = document.getElementById('settings-button');
        
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this._showScreen('settings');
            });
        }
    }

    /**
     * Set up global event listeners
     */
    _setupEventListeners() {
        // Listen for exercise launch events
        document.addEventListener('launch-exercise', (event) => {
            const { exercise } = event.detail;
            sessionController.startSession(exercise);
        });

        // Listen for reload exercise list events (after session completion)
        document.addEventListener('reload-exercise-list', () => {
            exerciseManager.renderExerciseList();
        });
    }

    /**
     * Show a specific screen (exercise-list, session, settings)
     */
    _showScreen(screenName) {
        // Hide all screens
        document.getElementById('exercise-list-screen').style.display = 'none';
        document.getElementById('session-screen').style.display = 'none';
        document.getElementById('settings-screen').style.display = 'none';

        // Show requested screen
        const screenMap = {
            'exercise-list': 'exercise-list-screen',
            'session': 'session-screen',
            'settings': 'settings-screen'
        };

        const screenId = screenMap[screenName];
        if (screenId) {
            document.getElementById(screenId).style.display = 'block';
        }
    }

    /**
     * Load and render exercise list
     */
    async _loadExerciseList() {
        const listContainer = document.getElementById('exercise-list');
        const titleElement = document.getElementById('app-title');
        
        if (titleElement) {
            titleElement.textContent = i18n.t('exercise_list_title');
        }

        if (listContainer) {
            // Show loading state
            listContainer.innerHTML = `
                <div class="loading">
                    <p>${i18n.t('loading')}</p>
                </div>
            `;

            try {
                // Load exercises from JSON files
                await exerciseManager.loadExercises();
                
                // Render exercise list
                exerciseManager.renderExerciseList();
            } catch (error) {
                console.error('Failed to load exercises:', error);
                listContainer.innerHTML = `
                    <div class="error">
                        ${i18n.t('error_generic')}
                    </div>
                `;
            }
        }
    }
}

// Initialize app when DOM is ready
const app = new App();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export for potential external access
export { app };
