import { useEffect, useState } from 'react';
import {
  Check,
  Eye,
  Loader2,
  MessageCircle,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import {
  buildWhatsAppLink,
  type Service,
} from '@/data/services';
import { useReveal } from '@/hooks/useReveal';
import { ServiceModal } from './ServiceModal';
import { supabase } from '@/lib/supabase';
import { addToCart } from '@/hooks/useCart';

type DatabaseService = {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  categoria: 'consulta' | 'tiragem';
  ativo: boolean;
  destaque: boolean;
  ordem: number;
};

export function Tiragens() {
  const { ref, visible } =
    useReveal<HTMLDivElement>();

  const [tiragens, setTiragens] = useState<
    DatabaseService[]
  >([]);

  const [selected, setSelected] =
    useState<Service | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTiragens();

    function handleServicesUpdated() {
      loadTiragens();
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

  async function loadTiragens() {
    setLoading(true);

    const { data, error } = await supabase
      .from('services')
      .select(
        'id, nome, preco, descricao, categoria, ativo, destaque, ordem'
      )
      .eq('categoria', 'tiragem')
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) {
      console.error(
        'Erro ao carregar tiragens:',
        error
      );

      setTiragens([]);
    } else {
      setTiragens(
        (data ?? []) as DatabaseService[]
      );
    }

    setLoading(false);
  }

  function convertToService(
    service: DatabaseService
  ): Service {
    const price = formatPrice(service.preco);

    return {
      id: String(service.id),
      name: service.nome,
      price,
      priceValue: Number(service.preco),
      description: service.descricao,
      icon: Sparkles,
    };
  }

  return (
    <section
      id="tiragens"
      className="relative px-5 py-16 bg-bordo-200"
    >
      <div
        ref={ref}
        className={`flex flex-col items-center text-center ${
          visible ? 'is-visible' : 'reveal'
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="ornament-line w-12" />

          <div className="w-1.5 h-1.5 rounded-full bg-dourado-200/60" />

          <div className="ornament-line w-12" />
        </div>

        <h2 className="font-serif text-2xl font-semibold tracking-[0.15em] text-gradient-gold">
          ESCOLHA SUA TIRAGEM
        </h2>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2
            className="w-5 h-5 text-dourado-200/50 animate-spin"
            strokeWidth={1.5}
          />
        </div>
      )}

      {!loading && tiragens.length > 0 && (
        <div className="flex flex-col gap-4 mt-10">
          {tiragens.map((tiragem, i) => {
            const service =
              convertToService(tiragem);

            return (
              <TiragemCard
                key={tiragem.id}
                databaseService={tiragem}
                service={service}
                delay={i * 0.08}
                onDetails={() =>
                  setSelected(service)
                }
              />
            );
          })}
        </div>
      )}

      {selected && (
        <ServiceModal
          service={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

function TiragemCard({
  databaseService,
  service,
  delay,
  onDetails,
}: {
  databaseService: DatabaseService;
  service: Service;
  delay: number;
  onDetails: () => void;
}) {
  const { ref, visible } =
    useReveal<HTMLDivElement>();

  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addToCart({
      id: databaseService.id,
      nome: databaseService.nome,
      preco: Number(databaseService.preco),
      categoria: databaseService.categoria,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  return (
    <div
      ref={ref}
      className={`rounded-xl bg-gradient-to-br from-bordo-100/80 to-bordo-400/60 border border-dourado-200/15 p-5 ${
        visible ? 'is-visible' : 'reveal'
      }`}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full border border-dourado-200/25 flex items-center justify-center">
          <service.icon
            className="w-4 h-4 text-dourado-200/80"
            strokeWidth={1.5}
          />
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

      {/* PREÇO + DETALHES */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dourado-200/10">
        <span className="font-serif text-2xl font-semibold text-gradient-gold">
          {service.price}
        </span>

        <button
          type="button"
          onClick={onDetails}
          className="px-3 py-2 rounded-full border border-dourado-200/25 text-dourado-200/80 font-sans text-xs tracking-[0.05em] hover:border-dourado-200/50 hover:text-dourado-100 transition-all duration-300 active:scale-95"
        >
          <Eye
            className="w-3.5 h-3.5 inline mr-1"
            strokeWidth={1.5}
          />

          Ver detalhes
        </button>
      </div>

      {/* ADICIONAR AO CARRINHO */}
      <button
        type="button"
        onClick={handleAddToCart}
        className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-full font-sans text-xs font-semibold tracking-[0.08em] transition-all duration-300 active:scale-[0.98] ${
          added
            ? 'border border-dourado-200/35 bg-dourado-200/10 text-dourado-200'
            : 'bg-dourado-200/90 text-bordo-300 hover:bg-dourado-100'
        }`}
      >
        {added ? (
          <>
            <Check
              className="w-4 h-4"
              strokeWidth={2}
            />

            ADICIONADO
          </>
        ) : (
          <>
            <ShoppingBag
              className="w-4 h-4"
              strokeWidth={2}
            />

            ADICIONAR AO CARRINHO
          </>
        )}
      </button>

      {/* WHATSAPP */}
      <a
        href={buildWhatsAppLink(
          service.name,
          service.price
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 py-1.5 font-serif text-xs text-creme/45 transition-colors duration-300 hover:text-dourado-200"
      >
        <MessageCircle
          className="w-3.5 h-3.5"
          strokeWidth={1.5}
        />

        Prefiro agendar pelo WhatsApp
      </a>
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
