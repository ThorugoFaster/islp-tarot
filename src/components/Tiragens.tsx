import { useState } from 'react';
import { MessageCircle, Eye } from 'lucide-react';
import { tiragens, buildWhatsAppLink, type Service } from '@/data/services';
import { useReveal } from '@/hooks/useReveal';
import { ServiceModal } from './ServiceModal';

export function Tiragens() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [selected, setSelected] = useState<Service | null>(null);

  return (
    <section id="tiragens" className="relative px-5 py-16 bg-bordo-200">
      <div ref={ref} className={`flex flex-col items-center text-center ${visible ? 'is-visible' : 'reveal'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="ornament-line w-12" />
          <div className="w-1.5 h-1.5 rounded-full bg-dourado-200/60" />
          <div className="ornament-line w-12" />
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-[0.15em] text-gradient-gold">
          ESCOLHA SUA TIRAGEM
        </h2>
      </div>

      <div className="flex flex-col gap-4 mt-10">
        {tiragens.map((t, i) => (
          <TiragemCard
            key={t.id}
            service={t}
            delay={i * 0.08}
            onDetails={() => setSelected(t)}
          />
        ))}
      </div>

      {selected && (
        <ServiceModal service={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

function TiragemCard({
  service,
  delay,
  onDetails,
}: {
  service: Service;
  delay: number;
  onDetails: () => void;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`rounded-xl bg-gradient-to-br from-bordo-100/80 to-bordo-400/60 border border-dourado-200/15 p-5 ${visible ? 'is-visible' : 'reveal'}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full border border-dourado-200/25 flex items-center justify-center">
          <service.icon className="w-4 h-4 text-dourado-200/80" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-medium text-creme leading-tight">
            {service.name}
          </h3>
          <p className="font-serif text-[14px] text-creme/60 leading-[155%] mt-1">
            {service.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dourado-200/10">
        <span className="font-serif text-2xl font-semibold text-gradient-gold">
          {service.price}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onDetails}
            className="px-3 py-2 rounded-full border border-dourado-200/25 text-dourado-200/80 font-sans text-xs tracking-[0.05em] hover:border-dourado-200/50 hover:text-dourado-100 transition-all duration-300 active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
            Ver detalhes
          </button>
          <a
            href={buildWhatsAppLink(service.name, service.price)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-dourado-200/90 text-bordo-300 font-sans text-xs font-semibold tracking-[0.05em] hover:bg-dourado-100 transition-all duration-300 active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5 inline mr-1" strokeWidth={2} />
            Agendar
          </a>
        </div>
      </div>
    </div>
  );
}
