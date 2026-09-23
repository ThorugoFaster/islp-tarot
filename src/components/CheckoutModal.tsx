import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export function CheckoutModal() {
  const [open, setOpen] = useState(false);

  const {
    items,
    quantidadeTotal,
    valorTotal,
  } = useCart();

  useEffect(() => {
    function handleOpenCheckout() {
      setOpen(true);
    }

    document.addEventListener(
      'open-checkout',
      handleOpenCheckout
    );

    return () => {
      document.removeEventListener(
        'open-checkout',
        handleOpenCheckout
      );
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  function formatPrice(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  function closeCheckout() {
    setOpen(false);
  }

  function backToCart() {
    setOpen(false);

    window.setTimeout(() => {
      document.dispatchEvent(
        new CustomEvent('open-cart')
      );
    }, 100);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Finalizar atendimento"
    >
      <div className="relative flex max-h-[95vh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[28px] border border-dourado-200/20 bg-bordo-300 shadow-2xl sm:rounded-[28px]">

        {/* CABEÇALHO */}
        <div className="relative border-b border-dourado-200/15 px-5 pb-5 pt-6">

          <button
            type="button"
            onClick={backToCart}
            aria-label="Voltar ao carrinho"
            className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-dourado-200/20 text-dourado-200/60 transition hover:bg-dourado-200/10"
          >
            <ArrowLeft
              className="h-4 w-4"
              strokeWidth={1.5}
            />
          </button>

          <button
            type="button"
            onClick={closeCheckout}
            aria-label="Fechar"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-dourado-200/20 text-dourado-200/60 transition hover:bg-dourado-200/10"
          >
            <X
              className="h-4 w-4"
              strokeWidth={1.5}
            />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3">
              <div className="ornament-line w-10" />

              <Sparkles
                className="h-3.5 w-3.5 text-dourado-200/50"
                strokeWidth={1.4}
              />

              <div className="ornament-line w-10" />
            </div>

            <h2 className="mt-4 font-serif text-xl font-semibold tracking-[0.15em] text-gradient-gold">
              SEU ATENDIMENTO
            </h2>

            <p className="mt-2 max-w-[280px] font-serif text-xs leading-relaxed text-creme/45">
              Vamos preparar os detalhes do seu atendimento.
            </p>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* PROGRESSO */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="h-1.5 w-8 rounded-full bg-dourado-200" />
            <div className="h-1.5 w-8 rounded-full bg-dourado-200/15" />
            <div className="h-1.5 w-8 rounded-full bg-dourado-200/15" />
            <div className="h-1.5 w-8 rounded-full bg-dourado-200/15" />
          </div>

          {/* RESUMO */}
          <div className="rounded-2xl border border-dourado-200/15 bg-bordo-200/35 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dourado-200/20">
                <ShoppingBag
                  className="h-4 w-4 text-dourado-200/70"
                  strokeWidth={1.4}
                />
              </div>

              <div>
                <p className="font-serif text-sm text-creme/85">
                  Resumo do pedido
                </p>

                <p className="mt-0.5 font-serif text-[10px] text-creme/35">
                  {quantidadeTotal}{' '}
                  {quantidadeTotal === 1
                    ? 'item'
                    : 'itens'}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-t border-dourado-200/10 pt-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-sm leading-snug text-creme/70">
                      {item.nome}
                    </p>

                    {item.quantidade > 1 && (
                      <p className="mt-1 font-serif text-[10px] text-creme/30">
                        Quantidade: {item.quantidade}
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 font-serif text-sm text-dourado-200/80">
                    {formatPrice(
                      item.preco *
                        item.quantidade
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-dourado-200/15 pt-4">
              <span className="font-serif text-xs tracking-[0.1em] text-creme/40 uppercase">
                Total
              </span>

              <span className="font-serif text-xl font-semibold text-gradient-gold">
                {formatPrice(valorTotal)}
              </span>
            </div>
          </div>

          {/* PRÓXIMAS ETAPAS */}
          <div className="mt-6">
            <p className="font-serif text-[10px] tracking-[0.15em] text-dourado-200/45 uppercase">
              Próximas etapas
            </p>

            <div className="mt-3 overflow-hidden rounded-2xl border border-dourado-200/10">

              <div className="flex items-center gap-3 border-b border-dourado-200/10 bg-bordo-200/25 px-4 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dourado-200/20 font-serif text-xs text-dourado-200">
                  1
                </div>

                <div className="flex-1">
                  <p className="font-serif text-sm text-creme/75">
                    Perguntas
                  </p>

                  <p className="mt-0.5 font-serif text-[10px] text-creme/30">
                    Informe o que deseja consultar.
                  </p>
                </div>

                <ChevronRight
                  className="h-4 w-4 text-dourado-200/25"
                  strokeWidth={1.4}
                />
              </div>

              <div className="flex items-center gap-3 border-b border-dourado-200/10 bg-bordo-200/25 px-4 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dourado-200/20 font-serif text-xs text-dourado-200">
                  2
                </div>

                <div className="flex-1">
                  <p className="font-serif text-sm text-creme/75">
                    Data e horário
                  </p>

                  <p className="mt-0.5 font-serif text-[10px] text-creme/30">
                    Escolha um horário disponível.
                  </p>
                </div>

                <CalendarDays
                  className="h-4 w-4 text-dourado-200/25"
                  strokeWidth={1.4}
                />
              </div>

              <div className="flex items-center gap-3 bg-bordo-200/25 px-4 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dourado-200/20 font-serif text-xs text-dourado-200">
                  3
                </div>

                <div className="flex-1">
                  <p className="font-serif text-sm text-creme/75">
                    Revisão e pagamento
                  </p>

                  <p className="mt-0.5 font-serif text-[10px] text-creme/30">
                    Confira tudo antes de finalizar.
                  </p>
                </div>

                <ChevronRight
                  className="h-4 w-4 text-dourado-200/25"
                  strokeWidth={1.4}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTÃO */}
        <div className="border-t border-dourado-200/15 bg-bordo-200/30 px-5 pb-6 pt-5">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-dourado-200 px-6 py-4 font-serif text-[11px] font-semibold tracking-[0.18em] text-bordo-300 transition hover:bg-dourado-100 active:scale-[0.99]"
          >
            INFORMAR MINHAS PERGUNTAS

            <ChevronRight
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </button>

          <p className="mt-3 text-center font-serif text-[10px] text-creme/25">
            Você ainda não será cobrada nesta etapa.
          </p>
        </div>
      </div>
    </div>
  );
}
