import {mkdir, writeFile} from 'node:fs/promises';

const base = 'https://eye-gym.bacus.dev';
const langs = ['ru', 'en', 'ro'];

const copy = {
  ru: {
    guide: 'Полезные материалы', cta: 'Запустить бесплатную тренировку', back: 'Открыть Eye Gym', disclaimer: 'Eye Gym — wellness-приложение для коротких перерывов от экрана. Материалы не заменяют консультацию врача.',
    topics: {
      '20-20-20-rule': ['Правило 20-20-20', 'Простой способ не забывать о коротких перерывах при работе за экраном. Каждые 20 минут ненадолго переведите взгляд на удалённый объект.'],
      'eye-strain-from-computer': ['Устают глаза от компьютера: что можно изменить', 'Регулярные перерывы, естественное моргание, меньше бликов и удобное положение монитора помогают сделать работу за экраном комфортнее.'],
      'eye-breaks-at-work': ['Перерывы для глаз во время работы', 'Короткие регулярные паузы проще встроить в рабочий день, чем редкие длинные. Eye Gym может напоминать о них.'],
      'eye-exercises-for-computer-users': ['Короткие упражнения после работы за компьютером', 'Спокойные движения глаз и смена фокуса можно использовать как короткий ритуал отдыха от экрана.'],
      'eye-exercises-for-kids': ['Упражнения и перерывы для детей', 'Короткие сессии, обучение, звёзды и значки помогают сделать перерывы понятнее без наказаний за пропущенные дни.'],
      'screen-breaks-for-kids': ['Как сделать экранные перерывы ребёнка спокойнее', 'Лучше заранее договориться о понятном ритме и предложить короткую активность вне экрана.'],
      'eye-exercises-for-programmers': ['Перерывы для глаз для программистов', 'Во время длинных сессий кодинга легко забыть отвести взгляд от монитора. Таймер снимает необходимость помнить об этом вручную.'],
      'eye-exercises-for-gamers': ['Перерывы от экрана для геймеров', 'Между матчами удобно делать короткие паузы, посмотреть вдаль и спокойно моргнуть несколько раз.'],
      'eye-exercises-for-students': ['Перерывы от экрана во время учёбы', 'Короткие паузы помогают чередовать длительную работу вблизи и отдых от экрана.'],
      'how-often-to-rest-eyes': ['Как часто отдыхать от экрана', 'Универсального идеального интервала нет. Правило 20-20-20 удобно как напоминание, а Eye Gym позволяет выбрать свой ритм.'],
    },
    audiences: {
      developers: ['Eye Gym для программистов', 'Таймер перерывов, короткие голосовые упражнения, статистика и PWA для тех, кто проводит рабочий день перед монитором.'],
      kids: ['Eye Gym для детей', 'Короткие упражнения, понятные иллюстрации, звёзды, уровни и постоянные значки без наказаний за пропуски.'],
      parents: ['Eye Gym для родителей', 'Помогите ребёнку сделать спокойные экранные перерывы привычкой — без давления и бесконечной геймификации.'],
      gamers: ['Eye Gym для геймеров', 'Короткие паузы между игровыми сессиями, настраиваемый таймер и голосовые подсказки.'],
      students: ['Eye Gym для студентов', 'Короткие перерывы во время учёбы, таймер 20-20-20 и быстрые сессии отдыха от экрана.'],
      office: ['Eye Gym для офисной работы', 'Простой ритм экранных перерывов в течение рабочего дня с напоминаниями и статистикой.'],
    },
  },
  en: {
    guide: 'Guides', cta: 'Start a free session', back: 'Open Eye Gym', disclaimer: 'Eye Gym is a wellness app for short screen breaks. This content is not medical advice.',
    topics: {
      '20-20-20-rule': ['The 20-20-20 rule', 'A simple reminder to take short breaks from near screen work. Every 20 minutes, briefly look at something farther away.'],
      'eye-strain-from-computer': ['Computer eye strain: practical screen habits', 'Regular breaks, natural blinking, less glare and a comfortable screen position can make long screen sessions easier.'],
      'eye-breaks-at-work': ['Eye breaks during the workday', 'Short regular pauses are easier to build into a workday than rare long breaks. Eye Gym can remind you.'],
      'eye-exercises-for-computer-users': ['Short eye-relaxation routines for computer users', 'Gentle eye movements and changing focus can be used as a brief screen-break ritual.'],
      'eye-exercises-for-kids': ['Screen breaks and eye exercises for kids', 'Short sessions, learning, stars and badges make breaks friendlier without punishing missed days.'],
      'screen-breaks-for-kids': ['How to make screen breaks easier for kids', 'Agree on a simple routine in advance and offer a short off-screen activity.'],
      'eye-exercises-for-programmers': ['Screen breaks for programmers', 'During long coding sessions it is easy to forget to look away from the monitor. A timer removes the need to remember manually.'],
      'eye-exercises-for-gamers': ['Screen breaks for gamers', 'Between matches, take a short pause, look farther away and blink naturally.'],
      'eye-exercises-for-students': ['Screen breaks while studying', 'Short pauses help alternate sustained near work with time away from the screen.'],
      'how-often-to-rest-eyes': ['How often should you rest your eyes from screens?', 'There is no single perfect interval for everyone. The 20-20-20 rule is a convenient reminder, and Eye Gym lets you choose your cadence.'],
    },
    audiences: {
      developers: ['Eye Gym for developers', 'Break timer, short guided routines, stats and an installable PWA for people who spend the workday in front of a monitor.'],
      kids: ['Eye Gym for kids', 'Short routines, friendly illustrations, stars, levels and permanent badges without punishment for missed days.'],
      parents: ['Eye Gym for parents', 'Help children build calm screen-break habits without pressure or endless gamification.'],
      gamers: ['Eye Gym for gamers', 'Short pauses between gaming sessions, a configurable timer and guided audio.'],
      students: ['Eye Gym for students', 'Short study breaks, a 20-20-20 timer and quick guided screen-rest sessions.'],
      office: ['Eye Gym for office work', 'A simple screen-break rhythm during the workday with reminders and progress stats.'],
    },
  },
  ro: {
    guide: 'Ghiduri', cta: 'Pornește o sesiune gratuită', back: 'Deschide Eye Gym', disclaimer: 'Eye Gym este o aplicație wellness pentru pauze scurte de la ecran. Conținutul nu înlocuiește sfatul medical.',
    topics: {
      '20-20-20-rule': ['Regula 20-20-20', 'Un mod simplu de a-ți aminti de pauze scurte în timpul lucrului la ecran. La fiecare 20 de minute, privește pentru scurt timp un obiect mai îndepărtat.'],
      'eye-strain-from-computer': ['Oboseala ochilor la calculator: obiceiuri practice', 'Pauzele regulate, clipitul natural, reducerea reflexiilor și poziția comodă a ecranului pot face lucrul la monitor mai confortabil.'],
      'eye-breaks-at-work': ['Pauze pentru ochi în timpul lucrului', 'Pauzele scurte și regulate sunt mai ușor de integrat în zi decât pauzele lungi și rare. Eye Gym îți poate aminti de ele.'],
      'eye-exercises-for-computer-users': ['Rutine scurte după lucrul la calculator', 'Mișcările blânde ale ochilor și schimbarea focalizării pot fi folosite ca un scurt ritual de pauză.'],
      'eye-exercises-for-kids': ['Pauze și exerciții pentru copii', 'Sesiunile scurte, explicațiile, stelele și insignele fac pauzele mai prietenoase fără penalizare pentru zile ratate.'],
      'screen-breaks-for-kids': ['Cum facem pauzele de la ecran mai ușoare pentru copii', 'Stabiliți dinainte un ritm simplu și propuneți o activitate scurtă fără ecran.'],
      'eye-exercises-for-programmers': ['Pauze de la ecran pentru programatori', 'În sesiunile lungi de programare este ușor să uiți să privești departe de monitor. Un timer te ajută să nu depinzi de memorie.'],
      'eye-exercises-for-gamers': ['Pauze de la ecran pentru gameri', 'Între meciuri, fă o pauză scurtă, privește mai departe și clipește natural.'],
      'eye-exercises-for-students': ['Pauze de la ecran în timpul studiului', 'Pauzele scurte ajută la alternarea lucrului îndelungat de aproape cu timpul departe de ecran.'],
      'how-often-to-rest-eyes': ['Cât de des să faci pauze de la ecran', 'Nu există un interval perfect pentru toată lumea. Regula 20-20-20 este un memento convenabil, iar Eye Gym îți permite să alegi ritmul.'],
    },
    audiences: {
      developers: ['Eye Gym pentru programatori', 'Timer pentru pauze, rutine ghidate scurte, statistici și PWA instalabil pentru cei care lucrează mult la monitor.'],
      kids: ['Eye Gym pentru copii', 'Rutine scurte, ilustrații prietenoase, stele, niveluri și insigne permanente fără penalizare pentru zile ratate.'],
      parents: ['Eye Gym pentru părinți', 'Ajută copilul să formeze obiceiul pauzelor calme de la ecran, fără presiune și gamificare fără sfârșit.'],
      gamers: ['Eye Gym pentru gameri', 'Pauze scurte între sesiuni, timer configurabil și ghidare audio.'],
      students: ['Eye Gym pentru studenți', 'Pauze scurte la studiu, timer 20-20-20 și sesiuni rapide ghidate.'],
      office: ['Eye Gym pentru lucru la birou', 'Un ritm simplu de pauze de la ecran în timpul zilei, cu mementouri și statistici.'],
    },
  },
};

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function render(lang, route, title, desc, schemaType) {
  const url = `${base}/${lang}/${route}/`;
  const alternates = langs.map((l) => `<link rel="alternate" hreflang="${l}" href="${base}/${l}/${route}/">`).join('');
  const json = JSON.stringify({'@context':'https://schema.org','@type':schemaType,headline:title,name:title,description:desc,url,inLanguage:lang,author:{'@type':'Person',name:'Mihail Bacus'}});
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Eye Gym</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="index, follow"><link rel="canonical" href="${url}">${alternates}<link rel="alternate" hreflang="x-default" href="${base}/en/${route}/"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${base}/og-eye-gym.jpg"><script type="application/ld+json">${json}</script><link rel="stylesheet" href="/seo.css"></head><body><header><a href="/" class="brand">Eye Gym</a></header><main><article><p class="eyebrow">${copy[lang].guide}</p><h1>${esc(title)}</h1><p class="lead">${esc(desc)}</p><aside>${esc(copy[lang].disclaimer)}</aside><a class="cta" href="/?utm_source=organic&utm_medium=seo&utm_campaign=${encodeURIComponent(route)}">${copy[lang].cta}</a></article></main><footer><a href="/">${copy[lang].back}</a></footer></body></html>`;
}

await writeFile('public/seo.css', '*{box-sizing:border-box}body{margin:0;background:#f2f7f2;color:#16312f;font:17px/1.7 system-ui,-apple-system,sans-serif}header,footer,main{max-width:860px;margin:auto;padding:24px}.brand{font-weight:900;color:#087568;text-decoration:none;font-size:22px}article{background:#fff;border:1px solid #dce9e5;border-radius:28px;padding:clamp(24px,5vw,52px);box-shadow:0 20px 60px #164b4420}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:12px;font-weight:900;color:#087568}h1{font-size:clamp(34px,6vw,58px);line-height:1.08;margin:.2em 0}.lead{font-size:21px;color:#4d6663}aside{margin:28px 0;padding:16px 18px;background:#eef8f5;border-radius:16px;color:#4d6663}.cta{display:inline-block;background:#087568;color:#fff;text-decoration:none;font-weight:900;padding:14px 20px;border-radius:14px}footer a{color:#087568}');

const urls = ['/', '/about.html', '/contact.html', '/privacy.html', '/terms.html'];
for (const lang of langs) {
  for (const [slug, [title, desc]] of Object.entries(copy[lang].topics)) {
    const dir = `public/${lang}/learn/${slug}`;
    await mkdir(dir, {recursive: true});
    await writeFile(`${dir}/index.html`, render(lang, `learn/${slug}`, title, desc, 'Article'));
    urls.push(`/${lang}/learn/${slug}/`);
  }
  for (const [slug, [title, desc]] of Object.entries(copy[lang].audiences)) {
    const dir = `public/${lang}/for/${slug}`;
    await mkdir(dir, {recursive: true});
    await writeFile(`${dir}/index.html`, render(lang, `for/${slug}`, title, desc, 'WebPage'));
    urls.push(`/${lang}/for/${slug}/`);
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile('public/sitemap.xml', sitemap);
console.log(`Generated ${urls.length} sitemap URLs`);
