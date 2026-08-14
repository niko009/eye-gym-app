import { Eye, Sparkles } from 'lucide-react';

export default function App() {
  return (
    <main className="landing-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="hero-card" aria-labelledby="page-title">
        <div className="brand-mark" aria-hidden="true">
          <Eye size={54} strokeWidth={1.7} />
          <span className="focus-dot" />
        </div>

        <div className="eyebrow">
          <Sparkles size={16} />
          <span>Eye Gym</span>
        </div>

        <h1 id="page-title">Дайте глазам передышку</h1>

        <p className="hero-copy">
          Простые упражнения для глаз с понятным ритмом и голосовым сопровождением — прямо в браузере.
        </p>

        <div className="coming-soon" role="status">
          <span className="pulse" />
          <span>Уже скоро</span>
        </div>

        <p className="subcopy">
          Мы готовим новую веб-версию Eye Gym, основанную на опыте мобильного приложения.
        </p>
      </section>

      <footer>eye-gym.bacus.dev</footer>
    </main>
  );
}
