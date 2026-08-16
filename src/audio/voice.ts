import type {Language} from '../types';

const voiceLanguage: Record<Language, string> = {ru: 'ru-RU', ro: 'ro-RO', en: 'en-US'};
let activeAudio: HTMLAudioElement | null = null;

export function speakText(text: string, language: Language): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLanguage[language];
  utterance.rate = 0.9;
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => voice.lang === utterance.lang)
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(language))
    ?? null;
  window.speechSynthesis.speak(utterance);
}

function playFile(file: string, fallbackText: string, language: Language): void {
  stopVoice();
  const audio = new Audio(file);
  activeAudio = audio;
  audio.addEventListener('ended', () => {if (activeAudio === audio) activeAudio = null}, {once: true});
  void audio.play().catch(() => {
    if (activeAudio === audio) activeAudio = null;
    speakText(fallbackText, language);
  });
}

export function speakExercise(exerciseId: string, fallbackText: string, language: Language): void {
  playFile(`/audio/v1/${language}/${exerciseId}.mp3`, fallbackText, language);
}

export function speakCue(cue: 'rest' | 'finished', fallbackText: string, language: Language): void {
  playFile(`/audio/v1/${language}/${cue}.mp3`, fallbackText, language);
}

export function stopVoice(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  window.speechSynthesis?.cancel();
}

export function pauseVoice(paused: boolean): void {
  if (activeAudio) {
    if (paused) activeAudio.pause();
    else void activeAudio.play();
  }
  if (!('speechSynthesis' in window)) return;
  if (paused) window.speechSynthesis.pause(); else window.speechSynthesis.resume();
}
