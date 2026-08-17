import {ArrowLeft, ArrowRight, Brain, CircleDot, Eye, Lightbulb, MonitorSmartphone, Sparkles, Sun, Wind} from 'lucide-react';
import {motion} from 'motion/react';
import type {ReactNode} from 'react';
import {getMessages} from '../i18n';
import type {Language} from '../types';

interface Props {
  language: Language;
  onClose: () => void;
}

export default function LearnView({language, onClose}: Props) {
  const t = getMessages(language);

  return (
    <div className="min-h-[var(--tg-viewport-stable-height,100dvh)] pb-16">
      <header className="px-5 pt-safe sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between py-4">
          <button type="button" onClick={onClose} className="secondary-button inline-flex items-center gap-2 text-sm">
            <ArrowLeft size={18} /> {t.learnBack}
          </button>
          <span className="rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-black text-amber-700 dark:text-amber-300">{t.learnForKids}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 sm:px-8">
        <motion.section initial={{opacity: 0, y: 18}} animate={{opacity: 1, y: 0}} className="relative overflow-hidden rounded-[2.5rem] bg-[#075f51] text-white shadow-2xl shadow-emerald-950/20">
          <img src="/education/how-eye-works.webp" alt="" aria-hidden="true" width="1200" height="800" fetchPriority="high" className="aspect-[3/2] w-full object-cover sm:aspect-[2/1]" />
          <div className="bg-gradient-to-br from-[#06483f] to-[#087a65] p-6 sm:p-9">
            <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-200">{t.learnEyebrow}</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">{t.learnTitle}</h1>
            <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-emerald-50 sm:text-lg">{t.learnSubtitle}</p>
          </div>
        </motion.section>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <JumpLink href="#how-eye-works" icon={<Eye size={20} />} number="1" label={t.learnEyeTitle} />
          <JumpLink href="#screen-fatigue" icon={<MonitorSmartphone size={20} />} number="2" label={t.learnScreenTitle} />
          <JumpLink href="#eye-rest" icon={<Sun size={20} />} number="3" label={t.learnRestTitle} />
        </div>

        <LearningChapter id="how-eye-works" number="01" kicker={t.learnEyeKicker} title={t.learnEyeTitle} body={t.learnEyeBody} image="/education/how-eye-works.webp" imageAlt={t.learnEyeAlt} imageSide="right">
          <Fact icon={<Sun size={19} />} title={t.learnLightTitle} body={t.learnLightBody} />
          <Fact icon={<CircleDot size={19} />} title={t.learnFocusTitle} body={t.learnFocusBody} />
          <Fact icon={<Sparkles size={19} />} title={t.learnRetinaTitle} body={t.learnRetinaBody} />
          <Fact icon={<Brain size={19} />} title={t.learnBrainTitle} body={t.learnBrainBody} />
        </LearningChapter>

        <LearningChapter id="screen-fatigue" number="02" kicker={t.learnScreenKicker} title={t.learnScreenTitle} body={t.learnScreenBody} image="/education/screen-fatigue.webp" imageAlt={t.learnScreenAlt} imageSide="left" tone="amber">
          <Fact icon={<CircleDot size={19} />} title={t.learnNearTitle} body={t.learnNearBody} />
          <Fact icon={<Eye size={19} />} title={t.learnBlinkTitle} body={t.learnBlinkBody} />
          <Fact icon={<Lightbulb size={19} />} title={t.learnGlareTitle} body={t.learnGlareBody} />
        </LearningChapter>

        <LearningChapter id="eye-rest" number="03" kicker={t.learnRestKicker} title={t.learnRestTitle} body={t.learnRestBody} image="/education/look-far-rest.webp" imageAlt={t.learnRestAlt} imageSide="right" tone="sky">
          <Fact icon={<Eye size={19} />} title={t.learnFarTitle} body={t.learnFarBody} />
          <Fact icon={<Wind size={19} />} title={t.learnSoftBlinkTitle} body={t.learnSoftBlinkBody} />
          <Fact icon={<Sun size={19} />} title={t.learnLightTitle2} body={t.learnLightBody2} />
        </LearningChapter>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[2rem] bg-emerald-700 p-6 text-white shadow-xl shadow-emerald-950/15">
            <p className="text-3xl" aria-hidden="true">🌿</p>
            <h2 className="mt-3 text-xl font-black">{t.learnRememberTitle}</h2>
            <p className="mt-2 font-bold leading-7 text-emerald-50">{t.learnRememberBody}</p>
          </div>
          <div className="rounded-[2rem] border border-amber-500/20 bg-amber-500/10 p-6">
            <p className="text-3xl" aria-hidden="true">🤝</p>
            <h2 className="mt-3 text-xl font-black">{t.learnTellAdultTitle}</h2>
            <p className="mt-2 font-bold leading-7 text-tg-hint">{t.learnTellAdultBody}</p>
          </div>
        </section>

        <footer className="mt-10 rounded-[1.5rem] border border-[var(--line)] bg-tg-secondary-bg p-5 text-sm leading-6 text-tg-hint">
          <p className="font-black text-tg-text">{t.learnSources}</p>
          <p className="mt-1">{t.learnSourceDisclaimer}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-black text-emerald-700 dark:text-emerald-300">
            <a href="https://www.nei.nih.gov/eye-health-information/healthy-vision/how-eyes-work" target="_blank" rel="noreferrer" className="underline underline-offset-4">National Eye Institute</a>
            <a href="https://eyewiki.aao.org/Computer_Vision_Syndrome_(Digital_Eye_Strain)" target="_blank" rel="noreferrer" className="underline underline-offset-4">EyeWiki / AAO</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

function JumpLink({href, icon, number, label}: {href: string; icon: ReactNode; number: string; label: string}) {
  return (
    <a href={href} className="group flex min-h-20 items-center gap-3 rounded-[1.5rem] border border-[var(--line)] bg-tg-secondary-bg p-4 font-black shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/35">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">{icon}</span>
      <span className="min-w-0 flex-1 leading-tight"><span className="mb-1 block text-[10px] uppercase tracking-widest text-tg-hint">{number}</span>{label}</span>
      <ArrowRight size={17} className="shrink-0 text-tg-hint transition group-hover:translate-x-1" />
    </a>
  );
}

function LearningChapter({id, number, kicker, title, body, image, imageAlt, imageSide, tone = 'green', children}: {id: string; number: string; kicker: string; title: string; body: string; image: string; imageAlt: string; imageSide: 'left' | 'right'; tone?: 'green' | 'amber' | 'sky'; children: ReactNode}) {
  const toneClass = tone === 'amber' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : tone === 'sky' ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  return (
    <motion.section id={id} initial={{opacity: 0, y: 24}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, amount: 0.15}} className="scroll-mt-5 mt-8 overflow-hidden rounded-[2.25rem] border border-[var(--line)] bg-tg-secondary-bg shadow-[0_24px_70px_-50px_rgba(7,77,67,.65)]">
      <div className="grid lg:grid-cols-2">
        <img src={image} alt={imageAlt} width="1200" height="800" loading="lazy" className={`aspect-[3/2] h-full w-full object-cover ${imageSide === 'right' ? 'lg:order-2' : ''}`} />
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-black ${toneClass}`}>{number}</span>
            <p className="eyebrow">{kicker}</p>
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-3 font-bold leading-7 text-tg-hint">{body}</p>
          <div className="mt-6 grid gap-3">{children}</div>
        </div>
      </div>
    </motion.section>
  );
}

function Fact({icon, title, body}: {icon: ReactNode; title: string; body: string}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-500/5 p-3.5">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-tg-bg text-emerald-700 shadow-sm dark:text-emerald-300">{icon}</span>
      <div><h3 className="font-black">{title}</h3><p className="mt-0.5 text-sm font-semibold leading-6 text-tg-hint">{body}</p></div>
    </div>
  );
}
