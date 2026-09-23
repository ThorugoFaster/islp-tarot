import { useEffect, useState } from 'react';
import {
  Sparkles,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { buildWhatsAppLink } from '@/data/services';
import { useReveal } from '@/hooks/useReveal';
import { supabase } from '@/lib/supabase';

type PublicService = {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  categoria: 'consulta' | 'tiragem';
  ativo: boolean;
  destaque: boolean;
  ordem: number;
};

export function Consultations() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  const [consultations, setConsultations] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsultations();

    function handleServicesUpdated() {
      loadConsultations();
    }

    document.addEventListener(
      'services-updated',
      handleServicesUpdated
    );

    return () => {
      document.removeEventListener(
        'services-updated',
        handleServicesUpdated
      );
    };
  }, []);

  async function loadConsultations() {
    setLoading(true);

    const { data, error } = await supabase
      .from('services')
      .select(
        'id, nome, preco, descricao, categoria, ativo, destaque, ordem'
      )
      .eq('categoria', 'consulta')
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) {
      console.error(
        'Erro ao carregar consultas:',
        error
      );

      setConsultations([]);
    } else {
      setConsultations(
        (data ?? []) as PublicService[]
      );
    }

    setLoading(false);
  }

  return (
    <section
      id="consultas"
      className="relative px-5 py-16 bg-bordo-300"
    >
      <div
        ref={ref}
        className={`flex flex-col items-center text-center ${
          visible ? 'is-visible' : 'reveal'
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="ornament-line w-12" />

          <Sparkles
            className="w-4 h-4 text-dourado-200/60"
            strokeWidth={1.5}
          />

          <div className="ornament-line w-12" />
        </div>

        <h2 className="font-serif text-2xl font-semibold tracking-[0.15em] text-gradient-gold">
          CONSULTAS POR TEMPO
        </h2>

        <p className="font-serif text-[15px] text-creme/70 mt-3 max-w-[300px] leading-[160%]">
          Para quem deseja explorar diferentes questões com mais liberdade e profundidade.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2
            className="w-5 h-5 text-dourado-200/50 animate-spin"
            strokeWidth={1.5}
          />
        </div>
      )}

      {!loading && consultations.length > 0 && (
        <div className="flex flex-col gap-6 mt-10">
          {consultations.map((service, i) => (
            <ConsultationCard
              key={service.id}
              service={service}
              delay={i * 0.15}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ConsultationCard({
  service,
  delay,
}: {
  service: PublicService;
  delay: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  const price = formatPrice(service.preco);

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl bg-gradient-to-br from-bordo-100 to-bordo-400 border border-dourado-200/25 p-6 gold-glow ${
        visible ? 'is-visible' : 'reveal'
      }`}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <div className="ornament-line w-16" />
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full border border-dourado-200/30 flex items-center justify-center mb-4">
          <Sparkles
            className="w-5 h-5 text-dourado-200"
            strokeWidth={1.5}
          />
        </div>

        <h3 className="font-serif text-xl font-medium text-creme tracking-wide">
          {service.nome}
        </h3>

        <div className="my-4 flex items-baseline gap-1">
          <span className="font-serif text-4xl font-semibold text-gradient-gold">
            {price}
          </span>
        </div>

        <p className="font-serif text-[15px] text-creme/70 leading-[160%] max-w-[280px]">
          {service.descricao}
        </p>

        <a
          href={buildWhatsAppLink(
            service.nome,
            price
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-dourado-200 text-bordo-300 font-semibold text-sm tracking-[0.1em] hover:bg-dourado-100 transition-all duration-300 active:scale-[0.97]"
        >
          <MessageCircle
            className="w-4 h-4"
            strokeWidth={2}
          />

          AGENDAR CONSULTA
        </a>
      </div>
    </div>
  );
}

function formatPrice(value: number) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
