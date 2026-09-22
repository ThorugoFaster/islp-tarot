import { Sparkles, MessageCircle } from 'lucide-react';
import { consultations, buildWhatsAppLink } from '@/data/services';
import { useReveal } from '@/hooks/useReveal';

export function Consultations() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="consultas" className="relative px-5 py-16 bg-bordo-300">
      <div ref={ref} className={`flex flex-col items-center text-center ${visible ? 'is-visible' : 'reveal'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="ornament-line w-12" />
          <Sparkles className="w-4 h-4 text-dourado-200/60" strokeWidth={1.5} />
          <div className="ornament-line w-12" />
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-[0.15em] text-gradient-gold">
          CONSULTAS POR TEMPO
        </h2>
        <p className="font-serif text-[15px] text-creme/70 mt-3 max-w-[300px] leading-[160%]">
          Para quem deseja explorar diferentes questões com mais liberdade e profundidade.
        </p>
      </div>

      <div className="flex flex-col gap-6 mt-10">
        {consultations.map((c, i) => (
          <ConsultationCard key={c.id} service={c} delay={i * 0.15} />
        ))}
      </div>
    </section>
  );
}

import type { Service } from '@/data/services';

function ConsultationCard({ service, delay }: { service: Service; delay: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl bg-gradient-to-br from-bordo-100 to-bordo-400 border border-dourado-200/25 p-6 gold-glow ${visible ? 'is-visible' : 'reveal'}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <div className="ornament-line w-16" />
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full border border-dourado-200/30 flex items-center justify-center mb-4">
          <service.icon className="w-5 h-5 text-dourado-200" strokeWidth={1.5} />
        </div>

        <h3 className="font-serif text-xl font-medium text-creme tracking-wide">
          {service.name}
        </h3>

        <div className="my-4 flex items-baseline gap-1">
          <span className="font-serif text-4xl font-semibold text-gradient-gold">
            {service.price}
          </span>
        </div>

        <p className="font-serif text-[15px] text-creme/70 leading-[160%] max-w-[280px]">
          {service.description}
        </p>

        <a
          href={buildWhatsAppLink(service.name, service.price)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-dourado-200 text-bordo-300 font-semibold text-sm tracking-[0.1em] hover:bg-dourado-100 transition-all duration-300 active:scale-[0.97]"
        >
          <MessageCircle className="w-4 h-4" strokeWidth={2} />
          AGENDAR CONSULTA
        </a>
      </div>
    </div>
  );
}
