import { Star } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

export function Testimonials() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="relative px-5 py-16 bg-bordo-200">
      <div ref={ref} className={`flex flex-col items-center text-center ${visible ? 'is-visible' : 'reveal'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="ornament-line w-12" />
          <Star className="w-3.5 h-3.5 text-dourado-200/60" strokeWidth={1.5} />
          <div className="ornament-line w-12" />
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-[0.12em] text-gradient-gold">
          O QUE DIZEM SOBRE AS LEITURAS
        </h2>
      </div>

      <div className="flex flex-col gap-4 mt-10">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-dashed border-dourado-200/15 bg-bordo-300/40 px-6 py-10 flex flex-col items-center text-center"
          >
            <div className="flex gap-1 mb-3">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star
                  key={s}
                  className="w-3.5 h-3.5 text-dourado-200/20"
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <p className="font-serif text-sm text-creme/30 italic">
              Espaço reservado para depoimento
            </p>
          </div>
        ))}
      </div>

      <p className="font-serif text-[15px] text-dourado-200/50 italic text-center mt-8 max-w-[280px] mx-auto leading-[160%]">
        Em breve, experiências de quem já consultou as cartas.
      </p>
    </section>
  );
}
