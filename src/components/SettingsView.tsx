import React from 'react';
import { X, Volume2, Bell, Crown, Trash2 } from 'lucide-react';
import { UserSettings } from '../types';

interface Props {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
  onClose: () => void;
  onReset: () => void;
}

export default function SettingsView({ settings, onUpdate, onClose, onReset }: Props) {
  const toggleVoice = () => onUpdate({ ...settings, voiceEnabled: !settings.voiceEnabled });
  const toggleReminders = () => onUpdate({ ...settings, remindersEnabled: !settings.remindersEnabled });
  const setReminderTime = (e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ ...settings, reminderTime: e.target.value });

  return (
    <div className="fixed inset-0 bg-emerald-50 z-50 flex flex-col pt-safe px-6">
      <header className="py-6 flex items-center justify-between border-b border-emerald-100">
        <h1 className="text-2xl font-black text-emerald-900 tracking-tight">Настройки</h1>
        <button onClick={onClose} className="p-3 bg-white border border-emerald-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm">
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto py-8">
        <div className="space-y-8">
          <section>
            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Настройки</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-white border border-emerald-50 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                    <Volume2 size={18} />
                  </div>
                  <span className="font-bold text-slate-700">Голосовой коуч</span>
                </div>
                <button
                   onClick={toggleVoice}
                   className={`w-12 h-6 rounded-full transition-all relative ${settings.voiceEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.voiceEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-emerald-50 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-xl text-orange-500 border border-orange-100">
                    <Bell size={18} />
                  </div>
                  <span className="font-bold text-slate-700">Напоминания</span>
                </div>
                <button
                   onClick={toggleReminders}
                   className={`w-12 h-6 rounded-full transition-all relative ${settings.remindersEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.remindersEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {settings.remindersEnabled && (
                <div className="flex items-center justify-between p-4 bg-emerald-100/50 rounded-3xl mt-2 animate-in fade-in slide-in-from-top-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Время уведомления</span>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={setReminderTime}
                    className="bg-white border border-emerald-100 rounded-xl px-3 py-1 font-bold text-gray-900"
                  />
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Аккаунт</h2>
            <div className={`p-6 rounded-[32px] border-2 transition-all shadow-sm ${settings.isPro ? 'bg-white border-emerald-200 ring-4 ring-emerald-500/10' : 'bg-emerald-100/30 border-transparent'}`}>
              <div className="flex items-center gap-3 mb-2">
                 <div className={`p-2 rounded-xl ${settings.isPro ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                   <Crown size={20} fill="currentColor" />
                 </div>
                 <span className="font-black text-lg tracking-tight text-slate-900">{settings.isPro ? 'Pro Активен' : 'Бесплатная версия'}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {settings.isPro 
                  ? 'Неограниченный доступ ко всем упражнениям и голосовым подсказкам.' 
                  : 'Перейдите на Pro, чтобы открыть продвинутые схемы координации.'}
              </p>
            </div>
          </section>

          <section className="pt-8 flex justify-center">
             <button
                onClick={onReset}
                className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-colors bg-white px-6 py-3 rounded-full border border-slate-100 shadow-sm"
             >
               <Trash2 size={16} />
               Сбросить весь прогресс
             </button>
          </section>
        </div>
      </main>

      <div className="py-8">
        <button
          onClick={onClose}
          className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-900/20"
        >
          Сохранить изменения
        </button>
      </div>
    </div>
  );
}
