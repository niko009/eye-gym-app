import React from 'react';
import { X, Volume2, Bell, Trash2, Languages } from 'lucide-react';
import { UserSettings } from '../types';

interface Props {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
  onClose: () => void;
  onReset: () => void;
}

const translations = {
  ru: {
    title: 'Настройки',
    settings: 'Настройки',
    voice: 'Голосовой коуч',
    reminders: 'Напоминания',
    reminderTime: 'Время уведомления',
    language: 'Язык / Limbă',
    reset: 'Сбросить весь прогресс',
    save: 'Сохранить изменения',
  },
  ro: {
    title: 'Setări',
    settings: 'Setări',
    voice: 'Antrenor vocal',
    reminders: 'Mementouri',
    reminderTime: 'Ora notificării',
    language: 'Язык / Limbă',
    reset: 'Resetează tot progresul',
    save: 'Salvează modificările',
  }
};

export default function SettingsView({ settings, onUpdate, onClose, onReset }: Props) {
  const t = translations[settings.language || 'ru'] || translations.ru;
  
  const toggleVoice = () => onUpdate({ ...settings, voiceEnabled: !settings.voiceEnabled });
  const toggleReminders = () => onUpdate({ ...settings, remindersEnabled: !settings.remindersEnabled });
  const setReminderTime = (e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ ...settings, reminderTime: e.target.value });
  const setLanguage = (lang: 'ru' | 'ro') => onUpdate({ ...settings, language: lang });

  return (
    <div className="fixed inset-0 bg-tg-bg z-50 flex flex-col pt-safe px-6">
      <header className="py-6 flex items-center justify-between border-b border-emerald-500/10">
        <h1 className="text-2xl font-black text-tg-text tracking-tight">{t.title}</h1>
        <button onClick={onClose} className="p-3 bg-tg-secondary-bg border border-emerald-500/10 rounded-2xl text-tg-hint hover:text-tg-text transition-colors shadow-sm">
          <X size={24} />
        </button>
      </header>
 
      <main className="flex-1 overflow-y-auto py-8">
        <div className="space-y-8">
          <section>
            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">{t.settings}</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-tg-secondary-bg border border-emerald-500/10 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-500/10">
                    <Volume2 size={18} />
                  </div>
                  <span className="font-bold text-tg-text">{t.voice}</span>
                </div>
                <button
                   onClick={toggleVoice}
                   className={`w-12 h-6 rounded-full transition-all relative ${settings.voiceEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.voiceEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
 
              <div className="flex items-center justify-between p-4 bg-tg-secondary-bg border border-emerald-500/10 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/10">
                    <Bell size={18} />
                  </div>
                  <span className="font-bold text-tg-text">{t.reminders}</span>
                </div>
                <button
                   onClick={toggleReminders}
                   className={`w-12 h-6 rounded-full transition-all relative ${settings.remindersEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.remindersEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
 
              {settings.remindersEnabled && (
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-3xl mt-2 animate-in fade-in slide-in-from-top-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">{t.reminderTime}</span>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={setReminderTime}
                    className="bg-tg-secondary-bg border border-emerald-500/10 rounded-xl px-3 py-1 font-bold text-tg-text"
                  />
                </div>
              )}
            </div>
          </section>
 
          <section>
            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">{t.language}</h2>
            <div className="p-4 bg-tg-secondary-bg border border-emerald-500/10 rounded-3xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-500/10">
                   <Languages size={18} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLanguage('ru')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs ${settings.language === 'ru' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-500/10 text-tg-hint'}`}
                  >
                    RU
                  </button>
                  <button 
                    onClick={() => setLanguage('ro')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs ${settings.language === 'ro' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-500/10 text-tg-hint'}`}
                  >
                    RO
                  </button>
                </div>
              </div>
            </div>
          </section>
 
          <section className="pt-4 flex justify-center">
             <button
                onClick={onReset}
                className="flex items-center gap-2 text-tg-hint font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-colors bg-tg-secondary-bg px-6 py-3 rounded-full border border-emerald-500/10 shadow-sm"
             >
               <Trash2 size={16} />
               {t.reset}
             </button>
          </section>
        </div>
      </main>
 
      <div className="py-8">
        <button
          onClick={onClose}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/20"
        >
          {t.save}
        </button>
      </div>
    </div>
  );
}
