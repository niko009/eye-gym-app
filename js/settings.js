/**
 * Settings Screen Controller
 * Handles:
 * - Reminders toggle and interval selection
 * - Voice guidance toggle
 * - Premium code entry
 * - Privacy policy link
 */

import { i18n } from './i18n.js';
import { storage } from './storage.js';
import { telegram } from './telegram.js';

class SettingsController {
  constructor() {
    this.container = null;
    this.reminderToggle = null;
    this.intervalSelector = null;
    this.voiceGuidanceToggle = null;
  }

  /**
   * Initialize and render the Settings screen
   */
  init() {
    this.container = document.getElementById('settings-screen');
    if (!this.container) {
      console.error('Settings screen container not found');
      return;
    }

    this.render();
    this.attachEventListeners();
  }

  /**
   * Render the Settings UI
   */
  render() {
    const preferences = storage.getPreferences();
    
    this.container.innerHTML = `
      <div class="settings-container">
        <div class="settings-header">
          <button id="settings-back-btn" class="btn-back">← ${i18n.t('session_back_to_list')}</button>
          <h2 class="settings-title">${i18n.t('settings_title')}</h2>
        </div>
        
        <!-- Reminders Section -->
        <div class="settings-section">
          <h3 class="settings-section-title">${i18n.t('reminders_section')}</h3>
          <p class="settings-description">${i18n.t('reminders_description')}</p>
          
          <div class="settings-item">
            <label class="settings-label">
              <input type="checkbox" id="reminders-toggle" ${preferences.reminder_enabled ? 'checked' : ''} />
              <span>${i18n.t('enable_reminders')}</span>
            </label>
          </div>
          
          <div class="settings-item interval-selector" id="interval-selector-container" style="display: ${preferences.reminder_enabled ? 'block' : 'none'};">
            <label class="settings-label" for="reminder-interval">${i18n.t('reminder_interval')}</label>
            <select id="reminder-interval" class="settings-select">
              <option value="2h" ${preferences.reminder_interval === '2h' ? 'selected' : ''}>${i18n.t('every_2_hours')}</option>
              <option value="4h" ${preferences.reminder_interval === '4h' ? 'selected' : ''}>${i18n.t('every_4_hours')}</option>
              <option value="6h" ${preferences.reminder_interval === '6h' ? 'selected' : ''}>${i18n.t('every_6_hours')}</option>
            </select>
          </div>
        </div>
        
        <!-- Voice Guidance Section -->
        <div class="settings-section">
          <h3 class="settings-section-title">${i18n.t('voice_guidance_section')}</h3>
          
          <div class="settings-item">
            <label class="settings-label">
              <input type="checkbox" id="voice-guidance-toggle" ${preferences.voice_guidance_enabled ? 'checked' : ''} />
              <span>${i18n.t('voice_guidance')}</span>
            </label>
          </div>
        </div>
        
        <!-- Premium Section -->
        <div class="settings-section">
          <h3 class="settings-section-title">${i18n.t('premium_section')}</h3>
          
          ${preferences.is_premium 
            ? `<p class="settings-premium-status">✅ ${i18n.t('premium_unlocked')}</p>`
            : `<button id="enter-premium-code-btn" class="btn btn-primary">${i18n.t('enter_premium_code')}</button>`
          }
        </div>
        
        <!-- Footer Links -->
        <div class="settings-footer">
          <a href="#" id="privacy-policy-link" class="settings-link">${i18n.t('privacy_policy')}</a>
        </div>
      </div>
      
      <!-- Premium Code Modal (hidden by default) -->
      <div id="premium-modal" class="modal" style="display: none;">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <h3 class="modal-title">${i18n.t('enter_premium_code')}</h3>
          <p class="modal-description">${i18n.t('premium_code_description')}</p>
          
          <input type="text" id="premium-code-input" class="modal-input" placeholder="${i18n.t('premium_code_placeholder')}" maxlength="6" />
          
          <div class="modal-actions">
            <button id="premium-unlock-btn" class="btn btn-primary">${i18n.t('unlock')}</button>
            <button id="premium-cancel-btn" class="btn btn-secondary">${i18n.t('cancel')}</button>
          </div>
          
          <p id="premium-error-message" class="modal-error" style="display: none;"></p>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to UI elements
   */
  attachEventListeners() {
    // Back button
    const backBtn = document.getElementById('settings-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.backToList());
    }

    // Reminders toggle
    this.reminderToggle = document.getElementById('reminders-toggle');
    if (this.reminderToggle) {
      this.reminderToggle.addEventListener('change', () => this.handleReminderToggle());
    }

    // Interval selector
    this.intervalSelector = document.getElementById('reminder-interval');
    if (this.intervalSelector) {
      this.intervalSelector.addEventListener('change', () => this.handleIntervalChange());
    }

    // Voice guidance toggle
    this.voiceGuidanceToggle = document.getElementById('voice-guidance-toggle');
    if (this.voiceGuidanceToggle) {
      this.voiceGuidanceToggle.addEventListener('change', () => this.handleVoiceGuidanceToggle());
    }

    // Premium code button
    const premiumCodeBtn = document.getElementById('enter-premium-code-btn');
    if (premiumCodeBtn) {
      premiumCodeBtn.addEventListener('click', () => this.openPremiumModal());
    }

    // Premium modal buttons
    const unlockBtn = document.getElementById('premium-unlock-btn');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => this.handlePremiumUnlock());
    }

    const cancelBtn = document.getElementById('premium-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closePremiumModal());
    }

    // Privacy policy link
    const privacyLink = document.getElementById('privacy-policy-link');
    if (privacyLink) {
      privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openPrivacyPolicy();
      });
    }
  }

  /**
   * Handle reminders toggle change
   */
  handleReminderToggle() {
    const isEnabled = this.reminderToggle.checked;
    const intervalContainer = document.getElementById('interval-selector-container');
    
    if (intervalContainer) {
      intervalContainer.style.display = isEnabled ? 'block' : 'none';
    }

    const preferences = storage.getPreferences();
    preferences.reminder_enabled = isEnabled;
    storage.setPreferences(preferences);

    if (isEnabled) {
      // Enable reminders - send to bot
      this.enableReminders();
    } else {
      // Disable reminders - send to bot
      this.disableReminders();
    }
  }

  /**
   * Handle reminder interval change
   */
  handleIntervalChange() {
    const interval = this.intervalSelector.value;
    const preferences = storage.getPreferences();
    preferences.reminder_interval = interval;
    storage.setPreferences(preferences);

    // Update bot with new interval
    if (preferences.reminder_enabled) {
      this.enableReminders();
    }
  }

  /**
   * Enable reminders via WebApp.sendData()
   */
  enableReminders() {
    const preferences = storage.getPreferences();
    const payload = {
      action: 'enable_reminders',
      interval: preferences.reminder_interval
    };

    try {
      telegram.sendData(JSON.stringify(payload));
      console.log('Reminders enabled:', payload);
    } catch (error) {
      console.error('Failed to enable reminders:', error);
      telegram.showAlert(i18n.t('reminders_error'));
    }
  }

  /**
   * Disable reminders via WebApp.sendData()
   */
  disableReminders() {
    const payload = {
      action: 'disable_reminders'
    };

    try {
      telegram.sendData(JSON.stringify(payload));
      console.log('Reminders disabled');
    } catch (error) {
      console.error('Failed to disable reminders:', error);
      telegram.showAlert(i18n.t('reminders_error'));
    }
  }

  /**
   * Handle voice guidance toggle
   */
  handleVoiceGuidanceToggle() {
    const isEnabled = this.voiceGuidanceToggle.checked;
    const preferences = storage.getPreferences();
    preferences.voice_guidance_enabled = isEnabled;
    storage.setPreferences(preferences);
  }

  /**
   * Open premium code modal
   */
  openPremiumModal() {
    const modal = document.getElementById('premium-modal');
    if (modal) {
      modal.style.display = 'flex';
      const input = document.getElementById('premium-code-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      const errorMsg = document.getElementById('premium-error-message');
      if (errorMsg) {
        errorMsg.style.display = 'none';
      }
    }
  }

  /**
   * Close premium code modal
   */
  closePremiumModal() {
    const modal = document.getElementById('premium-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Handle premium unlock attempt
   */
  handlePremiumUnlock() {
    const input = document.getElementById('premium-code-input');
    const errorMsg = document.getElementById('premium-error-message');
    
    if (!input) return;

    // Get and normalize code (trim whitespace, uppercase)
    const code = input.value.trim().toUpperCase();

    // Validate format (6 alphanumeric characters)
    if (code.length !== 6 || !/^[A-Z0-9]{6}$/.test(code)) {
      errorMsg.textContent = i18n.t('premium_code_invalid_format');
      errorMsg.style.display = 'block';
      return;
    }

    // Send to bot for validation
    const payload = {
      action: 'unlock_premium',
      code: code
    };

    try {
      telegram.sendData(JSON.stringify(payload));
      
      // For now, since we don't have bot response handling,
      // we'll do optimistic unlock (in production, wait for bot response)
      // TODO: Wait for bot confirmation via callback
      
      // Optimistic unlock for MVP
      this.unlockPremium();
      
    } catch (error) {
      console.error('Failed to send premium code:', error);
      errorMsg.textContent = i18n.t('premium_code_error');
      errorMsg.style.display = 'block';
    }
  }

  /**
   * Unlock premium features
   */
  unlockPremium() {
    const preferences = storage.getPreferences();
    preferences.is_premium = true;
    storage.setPreferences(preferences);

    // Close modal
    this.closePremiumModal();

    // Show success message
    telegram.showAlert(i18n.t('premium_unlocked_success'));

    // Refresh settings screen
    this.render();
    this.attachEventListeners();

    // Trigger reload of exercise list
    window.dispatchEvent(new CustomEvent('premium-unlocked'));
  }

  /**
   * Show premium code error
   */
  showPremiumError() {
    const errorMsg = document.getElementById('premium-error-message');
    if (errorMsg) {
      errorMsg.textContent = i18n.t('premium_code_not_found');
      errorMsg.style.display = 'block';
    }
  }

  /**
   * Open privacy policy page
   */
  openPrivacyPolicy() {
    telegram.openLink(window.location.origin + '/privacy.html');
  }

  /**
   * Return to exercise list
   */
  backToList() {
    this.hide();
    document.getElementById('exercise-list-screen').style.display = 'block';
  }

  /**
   * Show settings screen
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  /**
   * Hide settings screen
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}

// Export singleton instance
export const settingsController = new SettingsController();
