import { Star, UserRound } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { testimonials } from '@/data/services';

export function Testimonials() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="relative px-5 py-16 bg-bordo-200">
      <div
        ref={ref}
        className={`flex flex-col items-center text-center ${
          visible ? 'is-visible' : 'reveal'
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="ornament-line w-12" />

          <Star
            className="w-3.5 h-3.5 text-dourado-200/60"
            strokeWidth={1.5}
          />

          <div className="ornament-line w-12" />
        </div>

        <h2 className="font-serif text-2xl font-semibold tracking-[0.12em] text-gradient-gold">
          O QUE DIZEM SOBRE AS LEITURAS
        </h2>

        <p className="font-serif text-sm text-creme/50 mt-4 max-w-[300px] leading-relaxed">
          Experiências reais de quem já encontrou orientação através das cartas.
        </p>
      </div>

      <div className="flex flex-col gap-5 mt-10">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="rounded-xl border border-dourado-200/20 bg-bordo-300/50 px-5 py-6"
          >
            {/* Perfil da cliente */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border border-dourado-200/25 bg-bordo-200 flex items-center justify-center">
                <UserRound
                  className="w-5 h-5 text-dourado-200/50"
                  strokeWidth={1.4}
                />
              </div>

              <div className="flex flex-col items-start">
                {/* Nome propositalmente borrado */}
                <span className="font-serif text-sm text-creme/60 blur-[3px] select-none">
                  {testimonial.name}
                </span>

                {/* 5 estrelas */}
                <div className="flex gap-1 mt-1">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star
                      key={star}
                      className="w-3 h-3 text-dourado-200/70 fill-current"
                      strokeWidth={1.2}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Avaliação - sem aspas */}
            <p className="font-serif text-[15px] text-creme/80 italic leading-[175%]">
              {testimonial.text}
            </p>

            {/* Detalhe decorativo */}
            <div className="flex items-center gap-2 mt-5">
              <div className="h-px flex-1 bg-dourado-200/10" />

              <Sparkle index={index} />

              <div className="h-px flex-1 bg-dourado-200/10" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 mt-10">
        <div className="ornament-line w-10" />

        <span className="font-serif text-[10px] tracking-[0.25em] text-dourado-200/50 uppercase">
          Experiências reais
        </span>

        <div className="ornament-line w-10" />
      </div>
    </section>
  );
}

function Sparkle({ index }: { index: number }) {
  return (
    <span className="text-dourado-200/30 text-[10px]">
      {index % 2 === 0 ? '✦' : '✧'}
    </span>
  );
}
