import { useEffect, useState } from 'react';
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export function CartDrawer() {
  const [open, setOpen] = useState(false);

  const {
    items,
    quantidadeTotal,
    valorTotal,
    increaseCartItem,
    decreaseCartItem,
    removeFromCart,
  } = useCart();

  useEffect(() => {
    function handleOpenCart() {
      setOpen(true);
    }

    document.addEventListener(
      'open-cart',
      handleOpenCart
    );

    return () => {
      document.removeEventListener(
        'open-cart',
        handleOpenCart
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

  function handleContinue() {
    if (items.length === 0) return;

    /*
      Na próxima etapa esse botão vai levar para:
      1. identificação/login
      2. perguntas
      3. agendamento
      4. pagamento
    */

    console.log('Continuar compra', items);
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Carrinho"
    >
      {/* FUNDO */}
      <button
        type="button"
        aria-label="Fechar carrinho"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* CARRINHO */}
      <div className="relative ml-auto flex h-full w-full max-w-[480px] flex-col border-l border-dourado-200/20 bg-bordo-300 shadow-2xl">

        {/* CABEÇALHO */}
        <div className="flex min-h-16 items-center justify-between border-b border-dourado-200/15 px-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag
                className="h-5 w-5 text-dourado-200"
                strokeWidth={1.4}
              />

              {quantidadeTotal > 0 && (
                <span className="absolute -right-2.5 -top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-dourado-200 px-1 text-[8px] font-bold text-bordo-300">
                  {quantidadeTotal > 99
                    ? '99+'
                    : quantidadeTotal}
                </span>
              )}
            </div>

            <div>
              <h2 className="font-serif text-base font-semibold tracking-[0.15em] text-gradient-gold">
                SEU CARRINHO
              </h2>

              {quantidadeTotal > 0 && (
                <p className="mt-0.5 font-serif text-[10px] text-creme/35">
                  {quantidadeTotal}{' '}
                  {quantidadeTotal === 1
                    ? 'item selecionado'
                    : 'itens selecionados'}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-dourado-200/20 text-dourado-200/70 transition hover:bg-dourado-200/10"
            aria-label="Fechar"
          >
            <X
              className="h-4 w-4"
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* CARRINHO VAZIO */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dourado-200/15 bg-bordo-200/40">
              <ShoppingBag
                className="h-8 w-8 text-dourado-200/35"
                strokeWidth={1.2}
              />
            </div>

            <span className="mt-5 text-xs text-dourado-200/40">
              ✦
            </span>

            <h3 className="mt-4 font-serif text-lg tracking-[0.1em] text-creme/85">
              SEU CARRINHO ESTÁ VAZIO
            </h3>

            <p className="mt-3 max-w-[280px] font-serif text-sm leading-relaxed text-creme/40">
              Escolha uma consulta ou tiragem para
              iniciar seu atendimento.
            </p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-7 rounded-full border border-dourado-200/30 px-7 py-3 font-serif text-[10px] tracking-[0.18em] text-dourado-200 transition hover:bg-dourado-200/10"
            >
              CONTINUAR ESCOLHENDO
            </button>
          </div>
        ) : (
          <>
            {/* ITENS */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-dourado-200/15 bg-bordo-200/35 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">

                      {/* NOME */}
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-base leading-snug text-creme/90">
                          {item.nome}
                        </p>

                        <p className="mt-1 font-serif text-[10px] tracking-[0.13em] text-dourado-200/45 uppercase">
                          {item.categoria ===
                          'consulta'
                            ? 'Consulta'
                            : 'Tiragem'}
                        </p>
                      </div>

                      {/* REMOVER */}
                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-creme/25 transition hover:bg-red-500/10 hover:text-red-300/70"
                        aria-label={`Remover ${item.nome}`}
                      >
                        <Trash2
                          className="h-4 w-4"
                          strokeWidth={1.4}
                        />
                      </button>
                    </div>

                    <div className="mt-5 flex items-end justify-between">

                      {/* QUANTIDADE */}
                      <div>
                        <p className="mb-2 font-serif text-[9px] tracking-[0.14em] text-creme/30 uppercase">
                          Quantidade
                        </p>

                        <div className="flex items-center overflow-hidden rounded-full border border-dourado-200/20">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseCartItem(
                                item.id
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-dourado-200/65 transition hover:bg-dourado-200/10"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus
                              className="h-3.5 w-3.5"
                              strokeWidth={1.5}
                            />
                          </button>

                          <span className="flex h-9 min-w-9 items-center justify-center border-x border-dourado-200/15 px-2 font-serif text-sm text-creme/80">
                            {item.quantidade}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseCartItem(
                                item.id
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-dourado-200/65 transition hover:bg-dourado-200/10"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus
                              className="h-3.5 w-3.5"
                              strokeWidth={1.5}
                            />
                          </button>
                        </div>
                      </div>

                      {/* PREÇO */}
                      <div className="text-right">
                        {item.quantidade > 1 && (
                          <p className="mb-1 font-serif text-[10px] text-creme/30">
                            {item.quantidade} ×{' '}
                            {formatPrice(
                              item.preco
                            )}
                          </p>
                        )}

                        <p className="font-serif text-lg text-dourado-200">
                          {formatPrice(
                            item.preco *
                              item.quantidade
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CONTINUAR COMPRANDO */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-5 w-full py-2 font-serif text-[10px] tracking-[0.15em] text-creme/35 transition hover:text-dourado-200"
              >
                + ADICIONAR OUTRO JOGO
              </button>
            </div>

            {/* RESUMO */}
            <div className="border-t border-dourado-200/15 bg-bordo-200/30 px-5 pb-6 pt-5">
              <div className="flex items-center justify-between">
                <span className="font-serif text-xs tracking-[0.12em] text-creme/45 uppercase">
                  Total
                </span>

                <span className="font-serif text-2xl font-semibold text-gradient-gold">
                  {formatPrice(valorTotal)}
                </span>
              </div>

              <p className="mt-2 font-serif text-[10px] leading-relaxed text-creme/30">
                O agendamento e a forma de pagamento
                serão escolhidos na próxima etapa.
              </p>

              <button
                type="button"
                onClick={handleContinue}
                className="mt-5 w-full rounded-full border border-dourado-200/45 bg-dourado-200/10 px-6 py-4 font-serif text-[11px] font-semibold tracking-[0.18em] text-dourado-200 transition hover:bg-dourado-200/15 active:scale-[0.99]"
              >
                CONTINUAR
              </button>

              <div className="mt-4 flex items-center gap-3">
                <div className="ornament-line flex-1" />

                <span className="text-[9px] text-dourado-200/30">
                  ✦
                </span>

                <div className="ornament-line flex-1" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
