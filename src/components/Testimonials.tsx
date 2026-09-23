import { useState } from 'react';
import {
  Star,
  UserRound,
  ChevronDown,
  ChevronUp,
  MessageCircleHeart,
} from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { testimonials } from '@/data/services';

const INITIAL_COUNT = 3;
const STEP = 3;

export function Testimonials() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const visibleTestimonials = testimonials.slice(0, visibleCount);
  const hasMore = visibleCount < testimonials.length;
  const isExpanded = visibleCount > INITIAL_COUNT;

  function handleShowMore() {
    setVisibleCount((current) =>
      Math.min(current + STEP, testimonials.length)
    );
  }

  function handleShowLess() {
    setVisibleCount(INITIAL_COUNT);

    setTimeout(() => {
      document
        .getElementById('avaliacoes')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function handleWriteReview() {
    // Na próxima etapa este botão abrirá
    // o login/cadastro e o formulário de avaliação.
    document.dispatchEvent(new CustomEvent('open-review-auth'));
  }

  return (
    <section
      id="avaliacoes"
      className="relative px-5 py-16 bg-bordo-200 scroll-mt-16"
    >
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

      {/* Avaliações */}
      <div className="flex flex-col gap-5 mt-10">
        {visibleTestimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="rounded-xl border border-dourado-200/20 bg-bordo-300/50 px-5 py-6"
          >
            {/* Perfil */}
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

            {/* Texto da avaliação */}
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

      {/* Ver mais / Mostrar menos */}
      {testimonials.length > INITIAL_COUNT && (
        <div className="flex justify-center mt-8">
          {hasMore ? (
            <button
              type="button"
              onClick={handleShowMore}
              className="group flex items-center gap-2 font-serif text-[11px] tracking-[0.2em] text-dourado-200/70 uppercase transition-all duration-300 hover:text-dourado-200"
            >
              Ver mais avaliações

              <ChevronDown
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5"
                strokeWidth={1.4}
              />
            </button>
          ) : (
            isExpanded && (
              <button
                type="button"
                onClick={handleShowLess}
                className="group flex items-center gap-2 font-serif text-[11px] tracking-[0.2em] text-dourado-200/70 uppercase transition-all duration-300 hover:text-dourado-200"
              >
                Mostrar menos

                <ChevronUp
                  className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5"
                  strokeWidth={1.4}
                />
              </button>
            )
          )}
        </div>
      )}

      {/* Separador */}
      <div className="flex items-center justify-center gap-3 mt-10 mb-8">
        <div className="ornament-line w-10" />

        <span className="text-dourado-200/35 text-[10px]">
          ✦
        </span>

        <div className="ornament-line w-10" />
      </div>

      {/* CTA para avaliação */}
      <div className="flex flex-col items-center text-center">
        <MessageCircleHeart
          className="w-5 h-5 text-dourado-200/60 mb-3"
          strokeWidth={1.3}
        />

        <p className="font-serif text-sm text-creme/65 leading-relaxed max-w-[280px]">
          Já realizou uma leitura?
          <br />
          Compartilhe sua experiência.
        </p>

        <button
          type="button"
          onClick={handleWriteReview}
          className="mt-5 min-w-[220px] rounded-full border border-dourado-200/40 px-7 py-3.5 font-serif text-[11px] tracking-[0.18em] text-dourado-200 uppercase transition-all duration-300 hover:bg-dourado-200/10 hover:border-dourado-200/60 active:scale-[0.98]"
        >
          Deixe sua avaliação
        </button>
      </div>

      {/* Rodapé decorativo */}
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
