// exercises.js - Exercise list loader and renderer

import { i18n } from './i18n.js';
import { storage } from './storage.js';
import { telegram } from './telegram.js';

class ExerciseManager {
    constructor() {
        this.freeExercises = [];
        this.premiumExercises = [];
        this.allExercises = [];
        this.loaded = false;
    }

    /**
     * Load exercises from JSON files
     */
    async loadExercises() {
        if (this.loaded) {
            return this.allExercises;
        }

        try {
            // Load free exercises
            const freeResponse = await fetch('exercises/free.json');
            this.freeExercises = await freeResponse.json();

            // Load premium exercises
            const premiumResponse = await fetch('exercises/premium.json');
            this.premiumExercises = await premiumResponse.json();

            // Combine all exercises
            this.allExercises = [...this.freeExercises, ...this.premiumExercises];
            this.loaded = true;

            console.log(`Loaded ${this.freeExercises.length} free + ${this.premiumExercises.length} premium exercises`);
            return this.allExercises;
        } catch (error) {
            console.error('Error loading exercises:', error);
            throw error;
        }
    }

    /**
     * Get exercise by ID
     */
    getExerciseById(exerciseId) {
        return this.allExercises.find(ex => ex.id === exerciseId);
    }

    /**
     * Get exercises filtered by premium status
     */
    getVisibleExercises() {
        const isPremium = storage.isPremium();

        return {
            free: this.freeExercises,
            premium: isPremium ? this.premiumExercises : []
        };
    }

    /**
     * Render exercise list to DOM
     */
    renderExerciseList(containerId = 'exercise-list') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Exercise list container not found');
            return;
        }

        const { free, premium } = this.getVisibleExercises();
        const isPremium = storage.isPremium();
        const lang = i18n.getLocale();

        let html = '';

        // Free Exercises Section
        if (free.length > 0) {
            html += `
                <div class="exercise-section">
                    <h2 class="exercise-section-title">${i18n.t('free_exercises')}</h2>
                    ${free.map(exercise => this._renderExerciseCard(exercise, lang, false)).join('')}
                </div>
            `;
        }

        // Premium Exercises Section
        if (premium.length > 0) {
            html += `
                <div class="exercise-section">
                    <h2 class="exercise-section-title">${i18n.t('premium_exercises')}</h2>
                    ${premium.map(exercise => this._renderExerciseCard(exercise, lang, false)).join('')}
                </div>
            `;
        } else if (!isPremium && this.premiumExercises.length > 0) {
            // Show locked premium exercises
            html += `
                <div class="exercise-section">
                    <h2 class="exercise-section-title">${i18n.t('premium_exercises')}</h2>
                    ${this.premiumExercises.slice(0, 3).map(exercise => this._renderExerciseCard(exercise, lang, true)).join('')}
                    <div class="premium-unlock-message">
                        ${i18n.t('premium_unlock_message')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;

        // Attach click handlers
        this._attachExerciseClickHandlers();
    }

    /**
     * Render a single exercise card
     */
    _renderExerciseCard(exercise, lang, isLocked) {
        const isCompleted = storage.isExerciseCompleted(exercise.id);
        const title = exercise.title[lang] || exercise.title.en;
        const description = exercise.description[lang] || exercise.description.en;
        const minutes = Math.floor(exercise.duration_sec / 60);
        const seconds = exercise.duration_sec % 60;
        const durationText = minutes > 0 
            ? `${minutes} ${i18n.t('minutes')}${seconds > 0 ? ` ${seconds} ${i18n.t('seconds')}` : ''}`
            : `${seconds} ${i18n.t('seconds')}`;

        const difficultyClass = `difficulty-${exercise.difficulty}`;
        const difficultyText = i18n.t(`difficulty_${exercise.difficulty}`);

        // Audio indicator (show if has_audio === true)
        const audioIndicator = exercise.has_audio ? `<span class="audio-indicator" title="${i18n.t('voice_available_tooltip')}">🔊</span>` : '';

        return `
            <div class="exercise-card ${isLocked ? 'locked' : ''}" data-exercise-id="${exercise.id}" data-locked="${isLocked}">
                <div class="exercise-card-header">
                    <h3 class="exercise-title">${title} ${audioIndicator}</h3>
                    ${exercise.is_premium ? `<span class="exercise-premium-badge">${i18n.t('premium_locked')}</span>` : ''}
                </div>
                <p class="exercise-description">${description}</p>
                <div class="exercise-meta">
                    <span class="exercise-meta-item">
                        ⏱️ ${durationText}
                    </span>
                    <span class="exercise-meta-item">
                        <span class="difficulty-badge ${difficultyClass}">${difficultyText}</span>
                    </span>
                </div>
                ${isCompleted ? `<div class="exercise-completed">✅ ${i18n.t('session_done')}</div>` : ''}
            </div>
        `;
    }

    /**
     * Attach click handlers to exercise cards
     */
    _attachExerciseClickHandlers() {
        const cards = document.querySelectorAll('.exercise-card');
        
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const exerciseId = card.dataset.exerciseId;
                const isLocked = card.dataset.locked === 'true';

                if (isLocked) {
                    // Show premium unlock message
                    telegram.showAlert(i18n.t('premium_unlock_message'));
                } else {
                    // Launch exercise session
                    this.launchExercise(exerciseId);
                }
            });
        });
    }

    /**
     * Launch an exercise session
     */
    launchExercise(exerciseId) {
        const exercise = this.getExerciseById(exerciseId);
        
        if (!exercise) {
            telegram.showAlert(i18n.t('error_exercise_not_found'));
            return;
        }

        // Check if premium and not unlocked
        if (exercise.is_premium && !storage.isPremium()) {
            telegram.showAlert(i18n.t('premium_unlock_message'));
            return;
        }

        console.log('Launching exercise:', exerciseId);
        
        // Dispatch custom event for session.js to handle
        const event = new CustomEvent('launch-exercise', {
            detail: { exerciseId, exercise }
        });
        document.dispatchEvent(event);
    }
}

// Export singleton instance
export const exerciseManager = new ExerciseManager();
