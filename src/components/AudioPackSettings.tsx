import {useEffect, useState} from 'react';
import {CheckCircle2, Download, LoaderCircle} from 'lucide-react';
import {downloadAudioPack, isAudioPackDownloaded} from '../audio/packs';
import {getMessages} from '../i18n';
import type {Language} from '../types';

type PackStatus = {state: 'checking' | 'ready' | 'missing' | 'downloading' | 'error'; progress: number};
const languages: Language[] = ['ru', 'ro', 'en'];
const names: Record<Language, string> = {ru: 'Русский', ro: 'Română', en: 'English'};

export default function AudioPackSettings({language}: {language: Language}) {
  const t = getMessages(language);
  const [statuses, setStatuses] = useState<Record<Language, PackStatus>>(() => ({
    ru: {state: 'checking', progress: 0}, ro: {state: 'checking', progress: 0}, en: {state: 'checking', progress: 0},
  }));

  useEffect(() => {
    let cancelled = false;
    void Promise.all(languages.map(async (candidate) => {
      const ready = await isAudioPackDownloaded(candidate);
      if (!cancelled) setStatuses((current) => ({...current, [candidate]: {state: ready ? 'ready' : 'missing', progress: ready ? 100 : 0}}));
    })).catch(() => {
      if (!cancelled) setStatuses((current) => Object.fromEntries(languages.map((candidate) => [candidate, {...current[candidate], state: 'error'}])) as Record<Language, PackStatus>);
    });
    return () => {cancelled = true};
  }, []);

  const download = async (candidate: Language) => {
    setStatuses((current) => ({...current, [candidate]: {state: 'downloading', progress: 0}}));
    try {
      await downloadAudioPack(candidate, (completed, total) => {
        setStatuses((current) => ({...current, [candidate]: {state: 'downloading', progress: Math.round(completed / total * 100)}}));
      });
      setStatuses((current) => ({...current, [candidate]: {state: 'ready', progress: 100}}));
    } catch {
      setStatuses((current) => ({...current, [candidate]: {state: 'error', progress: 0}}));
    }
  };

  return <div className="divide-y divide-[var(--line)]">{languages.map((candidate) => {
    const status = statuses[candidate];
    return <div className="settings-row" key={candidate}>
      <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-sm font-black text-emerald-700 dark:text-emerald-300">{candidate.toUpperCase()}</span>
      <span className="min-w-0 flex-1"><span className="block font-extrabold">{names[candidate]}</span><span className="text-xs text-tg-hint">{candidate === language ? t.audioAutomatic : t.audioOptional}</span></span>
      {status.state === 'ready' ? <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600"><CheckCircle2 size={16} />{t.audioReady}</span> : null}
      {status.state === 'downloading' || status.state === 'checking' ? <span className="inline-flex items-center gap-1 text-xs font-black text-tg-hint"><LoaderCircle className="animate-spin" size={16} />{status.state === 'downloading' ? `${status.progress}%` : t.loading}</span> : null}
      {status.state === 'missing' || status.state === 'error' ? <button type="button" onClick={() => void download(candidate)} className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300"><Download size={15} />{status.state === 'error' ? t.retry : t.audioDownload}</button> : null}
    </div>;
  })}</div>;
}
