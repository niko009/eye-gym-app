import {useState} from 'react';
import type {ReactNode} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ALargeSmall, ArrowLeft, BarChart3, Bell, Contrast, FileText, Gauge, Headphones, Languages, LogIn, LogOut, Moon, Plus, Sun, Trash2, UserRound, Volume2} from 'lucide-react';
import {api} from '../api/client';
import type {PublicConfig} from '../api/types';
import {getMessages} from '../i18n';
import {getTelegramWebApp} from '../platform/telegram';
import type {Language, MotionPreference, SessionState, TextSizePreference, ThemePreference, UserSettings} from '../types';
import AudioPackSettings from './AudioPackSettings';

interface Props {settings: UserSettings; session: SessionState; publicConfig: PublicConfig; reminderStatus: 'idle' | 'saving' | 'enabled' | 'disabled' | 'unsupported' | 'denied' | 'error'; onSessionChange: (session: SessionState) => void; onUpdate: (settings: UserSettings) => void; onClose: () => void; onReset: () => void}

export default function SettingsView({settings, session, publicConfig, reminderStatus, onSessionChange, onUpdate, onClose, onReset}: Props) {
  const t = getMessages(settings.language);
  const [showReset, setShowReset] = useState(false);

  const addReminder = () => onUpdate({...settings, reminders: [...settings.reminders, {id: crypto.randomUUID(), localTime: '10:00', enabled: true}]});
  const updateReminder = (id: string, patch: {localTime?: string; enabled?: boolean}) => onUpdate({...settings, reminders: settings.reminders.map((item) => item.id === id ? {...item, ...patch} : item)});
  const removeReminder = (id: string) => onUpdate({...settings, reminders: settings.reminders.filter((item) => item.id !== id)});
  const logout = async () => {
    await api.logout().catch(() => undefined);
    onSessionChange({status: 'guest', user: null});
  };

  return (
    <div className="min-h-[var(--tg-viewport-stable-height,100dvh)] px-5 pb-14 pt-safe sm:px-8">
      <header className="mx-auto flex max-w-3xl items-center gap-4 py-5"><button type="button" aria-label={t.backHome} onClick={onClose} className="interactive-icon"><ArrowLeft size={21} /></button><div><p className="eyebrow">Eye Gym</p><h1 className="text-2xl font-black">{t.settingsTitle}</h1></div></header>
      <main className="mx-auto max-w-3xl space-y-7">
        <SettingsSection title={t.appearance}>
          <div className="settings-row"><RowLabel icon={<Languages />} text={t.language} /><div className="segmented">{(['ru', 'ro', 'en'] as Language[]).map((language) => <button type="button" key={language} onClick={() => onUpdate({...settings, language})} className={settings.language === language ? 'selected' : ''}>{language.toUpperCase()}</button>)}</div></div>
          <div className="settings-row items-start"><RowLabel icon={settings.theme === 'dark' ? <Moon /> : <Sun />} text={t.theme} /><div className="segmented flex-wrap justify-end">{(['system', 'light', 'dark'] as ThemePreference[]).map((theme) => <button type="button" key={theme} onClick={() => onUpdate({...settings, theme})} className={settings.theme === theme ? 'selected' : ''}>{theme === 'system' ? t.themeSystem : theme === 'light' ? t.themeLight : t.themeDark}</button>)}</div></div>
          <div className="settings-row"><RowLabel icon={<Volume2 />} text={t.voice} /><Switch checked={settings.voiceEnabled} label={t.voice} onChange={(voiceEnabled) => onUpdate({...settings, voiceEnabled, voiceOnly: voiceEnabled ? settings.voiceOnly : false})} /></div>
        </SettingsSection>

        <SettingsSection title={t.accessibility}>
          <div className="settings-row items-start"><RowLabel icon={<ALargeSmall />} text={t.textSize} /><div className="segmented ml-auto flex-wrap justify-end">{(['default', 'large', 'extra-large'] as TextSizePreference[]).map((textSize) => <button type="button" key={textSize} onClick={() => onUpdate({...settings, textSize})} className={settings.textSize === textSize ? 'selected' : ''}>{textSize === 'default' ? t.textDefault : textSize === 'large' ? t.textLarge : t.textExtraLarge}</button>)}</div></div>
          <div className="settings-row"><RowLabel icon={<Contrast />} text={t.highContrast} hint={t.highContrastHint} /><Switch checked={settings.highContrast} label={t.highContrast} onChange={(highContrast) => onUpdate({...settings, highContrast})} /></div>
          <div className="settings-row items-start"><RowLabel icon={<Gauge />} text={t.motion} /><div className="segmented ml-auto flex-wrap justify-end">{(['normal', 'slow', 'off'] as MotionPreference[]).map((motion) => <button type="button" key={motion} onClick={() => onUpdate({...settings, motion})} className={settings.motion === motion ? 'selected' : ''}>{motion === 'normal' ? t.motionNormal : motion === 'slow' ? t.motionSlow : t.motionOff}</button>)}</div></div>
          <div className="settings-row"><RowLabel icon={<Headphones />} text={t.voiceOnly} hint={t.voiceOnlyHint} /><Switch checked={settings.voiceOnly} label={t.voiceOnly} onChange={(voiceOnly) => onUpdate({...settings, voiceOnly, voiceEnabled: voiceOnly || settings.voiceEnabled})} /></div>
        </SettingsSection>

        <SettingsSection title={t.audioPacks}>
          <AudioPackSettings language={settings.language} />
        </SettingsSection>

        <SettingsSection title={t.account}>
          {session.user ? (
            <div className="settings-row">
              <RowLabel icon={<UserRound />} text={session.user.displayName} hint={`${session.user.provider === 'telegram' ? 'Telegram' : 'Google'}${session.user.email ? ` · ${session.user.email}` : ''}`} />
              <button type="button" onClick={() => void logout()} className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black text-red-600 hover:bg-red-500/10"><LogOut size={16} />{t.signOut}</button>
            </div>
          ) : publicConfig.googleAuthEnabled && !getTelegramWebApp() ? (
            <a href="/api/v1/auth/google/start" className="settings-row"><RowLabel icon={<LogIn />} text={t.googleAccount} /><span className="ml-auto" aria-hidden>›</span></a>
          ) : (
            <div className="settings-row"><RowLabel icon={<UserRound />} text={getTelegramWebApp() ? t.telegramAccount : t.guest} /></div>
          )}
        </SettingsSection>

        <SettingsSection title={t.reminders} action={<button type="button" onClick={addReminder} className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300"><Plus size={15} />{t.addReminder}</button>}>
          <p className="px-1 pb-3 text-xs leading-5 text-tg-hint">{t.reminderHint}</p>
          {reminderStatus !== 'idle' && reminderStatus !== 'disabled' && <p className={`px-1 pb-3 text-xs font-bold ${reminderStatus === 'enabled' ? 'text-emerald-600' : reminderStatus === 'saving' ? 'text-tg-hint' : 'text-orange-600'}`}>{reminderStatus === 'enabled' ? t.reminderEnabled : reminderStatus === 'saving' ? t.reminderSaving : reminderStatus === 'denied' ? t.reminderDenied : reminderStatus === 'unsupported' ? t.reminderUnsupported : t.error}</p>}
          {settings.reminders.length === 0 ? <div className="rounded-2xl border border-dashed border-[var(--line)] p-5 text-center text-sm text-tg-hint">{t.addReminder}</div> : settings.reminders.map((reminder) => (
            <div className="settings-row" key={reminder.id}>
              <Bell size={19} className="text-orange-500" />
              <input type="time" aria-label={t.reminders} value={reminder.localTime} onChange={(event) => updateReminder(reminder.id, {localTime: event.target.value})} className="rounded-xl border border-[var(--line)] bg-tg-bg px-3 py-2 font-black" />
              <div className="ml-auto flex items-center gap-2"><Switch checked={reminder.enabled} label={t.reminders} onChange={(enabled) => updateReminder(reminder.id, {enabled})} /><button type="button" aria-label={t.remove} onClick={() => removeReminder(reminder.id)} className="rounded-xl p-2 text-red-500 hover:bg-red-500/10"><Trash2 size={18} /></button></div>
            </div>
          ))}
        </SettingsSection>

        <SettingsSection title={t.privacy}>
          <div className="settings-row"><RowLabel icon={<BarChart3 />} text={t.analytics} hint={t.analyticsHint} /><Switch checked={settings.analyticsConsent === 'granted'} label={t.analytics} onChange={(enabled) => onUpdate({...settings, analyticsConsent: enabled ? 'granted' : 'denied'})} /></div>
          <a href="/privacy.html" target="_blank" rel="noreferrer" className="settings-row w-full text-left"><RowLabel icon={<FileText />} text={t.legal} /><span className="ml-auto" aria-hidden>›</span></a>
        </SettingsSection>

        <button type="button" onClick={() => setShowReset(true)} className="mx-auto flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-500/10"><Trash2 size={17} />{t.reset}</button>
        <button type="button" onClick={onClose} className="primary-button w-full">{t.save}</button>
      </main>

      <Modal open={showReset} onClose={() => setShowReset(false)} title={t.resetTitle}><p className="leading-6 text-tg-hint">{t.resetBody}</p><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => setShowReset(false)} className="secondary-button">{t.cancel}</button><button type="button" onClick={onReset} className="rounded-2xl bg-red-600 px-4 py-3.5 font-black text-white">{t.confirmReset}</button></div></Modal>
    </div>
  );
}

function SettingsSection({title, action, children}: {title: string; action?: ReactNode; children: ReactNode}) {return <section><div className="mb-3 flex items-center justify-between gap-3 px-1"><h2 className="eyebrow">{title}</h2>{action}</div><div className="surface-card divide-y divide-[var(--line)] px-4">{children}</div></section>}
function RowLabel({icon, text, hint}: {icon: ReactNode; text: string; hint?: string}) {return <div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 text-emerald-600 [&>svg]:size-[19px]">{icon}</span><span><span className="block font-extrabold">{text}</span>{hint && <span className="mt-1 block max-w-md text-xs leading-5 text-tg-hint">{hint}</span>}</span></div>}
function Switch({checked, label, onChange}: {checked: boolean; label: string; onChange: (checked: boolean) => void}) {return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-emerald-500' : 'bg-slate-400/35'}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} /></button>}
function Modal({open, onClose, title, children}: {open: boolean; onClose: () => void; title: string; children: ReactNode}) {return <AnimatePresence>{open && <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 grid place-items-end bg-slate-950/45 p-4 backdrop-blur-sm sm:place-items-center" onClick={onClose}><motion.div initial={{y: 30}} animate={{y: 0}} exit={{y: 30}} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-tg-secondary-bg p-6 shadow-2xl"><h2 className="text-2xl font-black">{title}</h2><div className="mt-3">{children}</div></motion.div></motion.div>}</AnimatePresence>}
