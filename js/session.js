// session.js - Exercise session controller
// Handles step-by-step exercise guidance with timer, progress, and controls

import { i18n } from './i18n.js';
import { storage } from './storage.js';
import { telegram } from './telegram.js';

class SessionController {
    constructor() {
        this.currentExercise = null;
        this.currentStepIndex = 0;
        this.isPaused = false;
        this.isComplete = false;
        this.timer = null;
        this.remainingSeconds = 0;
        this.audioElement = null;
        // phrases manifest (deduplicated short audio clips)
        this.phrases = null; // map id -> phrase object
        this._phrasesLoaded = false;
        this._phrasesLoadingPromise = null;
    }

    /**
     * Start an exercise session
     */
    startSession(exercise) {
        if (!exercise) {
            console.error('No exercise provided to session');
            return;
        }

        this.currentExercise = exercise;
        this.currentStepIndex = 0;
        this.isPaused = false;
        this.isComplete = false;

        // Show session screen
        this._showSessionScreen();

        // Render session UI
        this._renderSession();

    // Preload audio for first step (if available) and start first step
    this._prepareAudioForStep(0);
    this._startStep(0);

        console.log('Session started:', exercise.id);
    }

    /**
     * Pause the current session
     */
    pause() {
        if (this.isPaused || this.isComplete) return;

        this.isPaused = true;
        this._stopTimer();
        this._renderControls();
        
        // Show paused message
        const instruction = document.querySelector('.session-instruction');
        if (instruction) {
            instruction.innerHTML = `
                <div class="session-paused-message">
                    ${i18n.t('session_paused')}
                </div>
            `;
        }

        console.log('Session paused');
    }

    /**
     * Resume the paused session
     */
    resume() {
        if (!this.isPaused || this.isComplete) return;

        this.isPaused = false;
        this._renderControls();
        
        // Restore current step instruction
        this._displayStep(this.currentStepIndex);
        
        // Resume timer
        this._startTimer();

        console.log('Session resumed');
    }

    /**
     * Skip to next step
     */
    skip() {
        if (this.isComplete) return;

        this._stopTimer();
        this._stopAudio();

        // Move to next step or complete
        if (this.currentStepIndex < this.currentExercise.steps.length - 1) {
            this.currentStepIndex++;
            this._startStep(this.currentStepIndex);
        } else {
            this._completeSession();
        }

        console.log('Skipped to next step or completion');
    }

    /**
     * Complete the session
     */
    _completeSession() {
        this.isComplete = true;
        this._stopTimer();
        this._stopAudio();

        // Mark exercise as completed in storage
        storage.markExerciseComplete(this.currentExercise.id);

        // Render completion UI
        this._renderCompletion();

        console.log('Session completed:', this.currentExercise.id);
    }

    /**
     * Go back to exercise list
     */
    backToList() {
        this._stopTimer();
        this._stopAudio();
        
        // Hide session screen, show exercise list
        document.getElementById('session-screen').style.display = 'none';
        document.getElementById('exercise-list-screen').style.display = 'block';

        // Reset session state
        this.currentExercise = null;
        this.currentStepIndex = 0;
        this.isPaused = false;
        this.isComplete = false;

        // Trigger event to reload exercise list (to show completed badge)
        document.dispatchEvent(new CustomEvent('reload-exercise-list'));

        console.log('Returned to exercise list');
    }

    /**
     * Repeat the exercise
     */
    repeatExercise() {
        this.startSession(this.currentExercise);
    }

    /**
     * Start a specific step
     */
    _startStep(stepIndex) {
        const step = this.currentExercise.steps[stepIndex];
        if (!step) {
            console.error('Step not found:', stepIndex);
            return;
        }

        this.currentStepIndex = stepIndex;
        this.remainingSeconds = step.duration_sec;
        this.isPaused = false;

        // Update progress bar
        this._updateProgress();

        // Display step instruction
        this._displayStep(stepIndex);

        // Play audio if enabled and available
    this._playStepAudio(step);

        // Start timer
        this._startTimer();
    }

    /**
     * Display step instruction
     */
    _displayStep(stepIndex) {
        const step = this.currentExercise.steps[stepIndex];
        const lang = i18n.getLocale();
        const instruction = step.instruction[lang] || step.instruction.en;

        const instructionElement = document.querySelector('.session-instruction');
        const timerElement = document.querySelector('.session-timer');

        if (instructionElement) {
            instructionElement.textContent = instruction;
        }

        if (timerElement) {
            timerElement.textContent = this._formatTime(this.remainingSeconds);
        }
    }

    /**
     * Start countdown timer
     */
    _startTimer() {
        this._stopTimer(); // Clear any existing timer

        this.timer = setInterval(() => {
            if (this.isPaused) return;

            this.remainingSeconds--;

            // Update timer display
            const timerElement = document.querySelector('.session-timer');
            if (timerElement) {
                timerElement.textContent = this._formatTime(this.remainingSeconds);
            }

            // Check if step is complete
            if (this.remainingSeconds <= 0) {
                this._stopTimer();
                this._stopAudio();

                // Move to next step or complete session
                if (this.currentStepIndex < this.currentExercise.steps.length - 1) {
                    this.currentStepIndex++;
                    this._startStep(this.currentStepIndex);
                } else {
                    this._completeSession();
                }
            }
        }, 1000);
    }

    /**
     * Stop timer
     */
    _stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Play step audio if available and voice guidance enabled
     */
    async _playStepAudio(step) {
        // Check if voice guidance is enabled
        if (!storage.isVoiceGuidanceEnabled()) {
            return;
        }

        // Global mute check
        if (storage.isMuted()) {
            return;
        }

        // Check if step has audio
        // Prefer embedded audio if present
        if (step.audio_base64) {
            try {
                this._stopAudio(); // Stop any currently playing audio or speech

                // Create audio element if not preloaded
                try {
                    this.audioElement = new Audio(step.audio_base64);
                } catch (err) {
                    console.error('Error creating audio element:', err);
                    this._markAudioUnavailable();
                    return;
                }

                // Play returns a promise in modern browsers
                const playPromise = this.audioElement.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(err => {
                        console.warn('Audio playback failed:', err);
                        this._markAudioUnavailable();
                    });
                }
                return; // done
            } catch (error) {
                console.error('Error playing audio:', error);
                this._markAudioUnavailable();
                return;
            }
        }

        // Next prefer audio_phrase_id -> phrases manifest (locale-aware)
        if (step.audio_phrase_id) {
            try {
                await this._ensurePhrasesLoaded();
                const lang = i18n.getLocale();
                const phrase = this.phrases && this.phrases[step.audio_phrase_id];
                const audioSrc = phrase && phrase.audio && (phrase.audio[lang] || phrase.audio.en);
                if (audioSrc) {
                    this._stopAudio();
                    try {
                        this.audioElement = new Audio(audioSrc);
                    } catch (err) {
                        console.error('Error creating audio element from phrase:', err);
                        this._markAudioUnavailable();
                        return;
                    }
                    const playPromise2 = this.audioElement.play();
                    if (playPromise2 && playPromise2.catch) {
                        playPromise2.catch(err => {
                            console.warn('Phrase audio playback failed:', err);
                            this._markAudioUnavailable();
                        });
                    }
                    return;
                }
            } catch (err) {
                console.warn('Error loading phrases manifest:', err);
                // fallthrough to speechSynthesis fallback
            }
        }

        // Fallback: use Web Speech API if available
        if ('speechSynthesis' in window) {
            const lang = i18n.getLocale();
            const instruction = step.instruction[lang] || step.instruction.en || '';
            if (instruction) {
                this._stopAudio();
                this._speakInstruction(instruction, lang);
                return;
            }
        }

        // No audio available
        this._markAudioUnavailable();
    }

    /**
     * Prepare audio for a specific step (preload first step on session start)
     */
    _prepareAudioForStep(stepIndex) {
        const step = this.currentExercise.steps[stepIndex];
        if (!step) return;

        // If embedded audio present, preload it
        if (step.audio_base64) {
            try {
                const pre = new Audio(step.audio_base64);
                pre.preload = 'auto';
                try { pre.load(); } catch (e) { /* ignore */ }
                this._preloadedAudio = pre;
                return;
            } catch (err) {
                console.warn('Preload failed:', err);
            }
        }

        // If phrase id present, attempt to preload phrase audio (async)
        if (step.audio_phrase_id) {
            // start loading manifest and preload audio if available
            this._ensurePhrasesLoaded().then(() => {
                try {
                    const lang = i18n.getLocale();
                    const phrase = this.phrases && this.phrases[step.audio_phrase_id];
                    const audioSrc = phrase && phrase.audio && (phrase.audio[lang] || phrase.audio.en);
                    if (audioSrc) {
                        const pre = new Audio(audioSrc);
                        pre.preload = 'auto';
                        try { pre.load(); } catch (e) { /* ignore */ }
                        this._preloadedAudio = pre;
                    }
                } catch (err) {
                    // swallow preload errors
                }
            }).catch(() => {/* ignore manifest load errors */});
        }
    }

    /**
     * Ensure phrases manifest is loaded and mapped
     */
    _ensurePhrasesLoaded() {
        if (this._phrasesLoaded) return Promise.resolve();
        if (this._phrasesLoadingPromise) return this._phrasesLoadingPromise;

        // Fetch the shared phrases manifest from the static path
        this._phrasesLoadingPromise = fetch('exercises/phrases.json', {cache: 'no-cache'})
            .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load phrases')))
            .then(arr => {
                this.phrases = {};
                if (Array.isArray(arr)) {
                    arr.forEach(p => { if (p && p.id) this.phrases[p.id] = p; });
                }
                this._phrasesLoaded = true;
            }).catch(err => {
                console.warn('Phrases manifest load error:', err);
                this.phrases = {};
                this._phrasesLoaded = true; // mark as loaded to avoid retry storms
            });

        return this._phrasesLoadingPromise;
    }

    _markAudioUnavailable() {
        const instructionElement = document.querySelector('.session-instruction');
        if (instructionElement) {
            instructionElement.title = i18n.t('audio_unavailable');
        }
    }

    /**
     * Stop audio playback
     */
    _stopAudio() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.audioElement = null;
        }
        // Stop any speech synthesis as well
        try {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        } catch (err) {
            // ignore
        }
    }

    /**
     * Speak instruction using Web Speech API
     */
    _speakInstruction(text, lang) {
        try {
            const utter = new SpeechSynthesisUtterance(text);
            // Map locale codes to speechSynthesis voice/lang where possible
            utter.lang = lang;

            // Optional: pick a matching voice if available
            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length) {
                // try to find exact match on lang
                const match = voices.find(v => v.lang && v.lang.startsWith(lang));
                if (match) utter.voice = match;
            }

            window.speechSynthesis.speak(utter);
        } catch (err) {
            console.error('SpeechSynthesis failed:', err);
            this._markAudioUnavailable();
        }
    }

    /**
     * Update progress bar
     */
    _updateProgress() {
        const progressFill = document.querySelector('.session-progress-fill');
        const stepCounter = document.querySelector('.session-step-counter');

        if (progressFill) {
            const progress = ((this.currentStepIndex + 1) / this.currentExercise.steps.length) * 100;
            progressFill.style.width = `${progress}%`;
        }

        if (stepCounter) {
            stepCounter.textContent = i18n.t('session_step_of', {
                current: this.currentStepIndex + 1,
                total: this.currentExercise.steps.length
            });
        }
    }

    /**
     * Format seconds to MM:SS
     */
    _formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Show session screen
     */
    _showSessionScreen() {
        document.getElementById('exercise-list-screen').style.display = 'none';
        document.getElementById('settings-screen').style.display = 'none';
        document.getElementById('session-screen').style.display = 'block';
    }

    /**
     * Render session UI
     */
    _renderSession() {
        const container = document.getElementById('session-screen');
        const lang = i18n.getLocale();
        const title = this.currentExercise.title[lang] || this.currentExercise.title.en;

        container.innerHTML = `
            <div class="session-container">
                <div class="session-progress">
                    <div class="session-progress-bar">
                        <div class="session-progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="session-step-counter">Step 1 of ${this.currentExercise.steps.length}</div>
                </div>

                <div class="session-content">
                    <h2 style="margin-bottom: 20px; color: var(--tg-theme-hint-color); font-size: 18px;">${title}</h2>
                    <p class="session-instruction">Loading...</p>
                    <div class="session-timer">0:00</div>
                </div>

                <div class="session-controls">
                    <button id="pause-button" class="button-secondary">${i18n.t('session_pause')}</button>
                    <button id="skip-button" class="button-secondary">${i18n.t('session_skip')}</button>
                </div>
            </div>
        `;

        // Attach control handlers
        this._attachControlHandlers();
    }

    /**
     * Render completion UI
     */
    _renderCompletion() {
        const container = document.getElementById('session-screen');

        container.innerHTML = `
            <div class="session-done">
                <div class="session-done-icon">✅</div>
                <div class="session-done-message">${i18n.t('session_done')}</div>
                <div class="session-done-actions">
                    <button id="repeat-button" class="button-primary">${i18n.t('session_repeat')}</button>
                    <button id="back-button" class="button-secondary">${i18n.t('session_back_to_list')}</button>
                </div>
            </div>
        `;

        // Attach completion handlers
        document.getElementById('repeat-button').addEventListener('click', () => this.repeatExercise());
        document.getElementById('back-button').addEventListener('click', () => this.backToList());
    }

    /**
     * Attach control button handlers
     */
    _attachControlHandlers() {
        const pauseButton = document.getElementById('pause-button');
        const skipButton = document.getElementById('skip-button');

        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                if (this.isPaused) {
                    this.resume();
                } else {
                    this.pause();
                }
            });
        }

        if (skipButton) {
            skipButton.addEventListener('click', () => this.skip());
        }
    }

    /**
     * Render controls (updates pause/resume button)
     */
    _renderControls() {
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) {
            pauseButton.textContent = this.isPaused ? i18n.t('session_resume') : i18n.t('session_pause');
        }
    }
}

// Export singleton instance
export const sessionController = new SessionController();
