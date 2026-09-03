import type {Language} from './types';

const copy = {
  ru: {
    eyebrow: 'Теперь в Telegram',
    title: 'Eye Gym рядом в Telegram',
    body: 'Откройте Eye Gym прямо в Telegram — без установки. Напоминания могут приходить туда же.',
    returningBody: 'Продолжайте тренировки в Telegram и включите напоминания, чтобы легче возвращаться к перерывам.',
    action: 'Открыть в Telegram',
    compactTitle: 'Напоминания в Telegram',
    compactBody: 'Откройте Eye Gym в Telegram и получайте напоминания там же.',
  },
  ro: {
    eyebrow: 'Acum și în Telegram',
    title: 'Eye Gym, direct în Telegram',
    body: 'Deschide Eye Gym direct în Telegram, fără instalare. Mementourile pot veni tot acolo.',
    returningBody: 'Continuă exercițiile în Telegram și activează mementourile ca să revii mai ușor la pauze.',
    action: 'Deschide în Telegram',
    compactTitle: 'Mementouri în Telegram',
    compactBody: 'Deschide Eye Gym în Telegram și primește mementourile acolo.',
  },
  en: {
    eyebrow: 'Now in Telegram',
    title: 'Keep Eye Gym close in Telegram',
    body: 'Open Eye Gym directly in Telegram with no installation. Your reminders can arrive there too.',
    returningBody: 'Continue your workouts in Telegram and turn on reminders to make screen breaks easier to return to.',
    action: 'Open in Telegram',
    compactTitle: 'Telegram reminders',
    compactBody: 'Open Eye Gym in Telegram and receive your reminders there.',
  },
} satisfies Record<Language, Record<string, string>>;

export function getTelegramCtaCopy(language: Language) {
  return copy[language];
}
