import { Sparkles, ChevronRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

export function FinalCTA() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  const scrollToTiragens = () => {
    const el = document.getElementById('tiragens');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative px-5 py-20 bg-radial-bordo overflow-hidden">
      <div className="absolute inset-0 starfield opacity-30 pointer-events-none" />

      <div ref={ref} className={`relative flex flex-col items-center text-center ${visible ? 'is-visible' : 'reveal'}`}>
        <Sparkles className="w-6 h-6 text-dourado-200/60 mb-4 animate-twinkle" strokeWidth={1.5} />

        <h2 className="font-serif text-2xl font-semibold tracking-[0.1em] text-gradient-gold text-shadow-gold max-w-[300px]">
          AS CARTAS ESTÃO À SUA ESPERA
        </h2>

        <p className="font-serif text-[15px] text-creme/70 mt-4 max-w-[280px] leading-[160%]">
          Escolha a leitura que mais combina com seu momento.
        </p>

        <button
          onClick={scrollToTiragens}
          className="mt-8 flex items-center gap-2 px-8 py-4 rounded-full border-2 border-dourado-200/40 bg-dourado-200/10 text-dourado-200 font-sans text-sm font-semibold tracking-[0.15em] hover:bg-dourado-200/20 hover:border-dourado-200/60 transition-all duration-300 active:scale-95"
        >
          VER TIRAGENS
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
