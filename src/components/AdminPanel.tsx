import { useEffect, useState } from 'react';
import {
  Check,
  Clock3,
  Edit3,
  Gamepad2,
  Loader2,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Review = {
  id: number;
  estrelas: number;
  comentario: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  destaque: boolean;
  created_at: string;
};

type Service = {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  categoria: 'consulta' | 'tiragem';
  ativo: boolean;
  destaque: boolean;
  ordem: number;
  created_at: string;
};

type Filter = 'pendente' | 'aprovada' | 'rejeitada';
type AdminTab = 'avaliacoes' | 'jogos';

export function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AdminTab>('avaliacoes');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<Filter>('pendente');

  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }

    document.addEventListener('open-admin-panel', handleOpen);

    return () => {
      document.removeEventListener('open-admin-panel', handleOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    if (tab === 'avaliacoes') {
      loadReviews();
    } else {
      loadServices();
    }
  }, [open, tab, filter]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  async function loadReviews() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('reviews')
      .select(
        'id, estrelas, comentario, status, destaque, created_at'
      )
      .eq('status', filter)
      .order('created_at', { ascending: false });

    if (error) {
      setError('Não foi possível carregar as avaliações.');
      setReviews([]);
    } else {
      setReviews((data ?? []) as Review[]);
    }

    setLoading(false);
  }

  async function loadServices() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('services')
      .select(
        'id, nome, preco, descricao, categoria, ativo, destaque, ordem, created_at'
      )
      .order('categoria', { ascending: true })
      .order('ordem', { ascending: true });

    if (error) {
      console.error(error);
      setError('Não foi possível carregar os jogos.');
      setServices([]);
    } else {
      setServices((data ?? []) as Service[]);
    }

    setLoading(false);
  }

  async function updateReview(
    id: number,
    changes: Partial<Pick<Review, 'status' | 'destaque'>>
  ) {
    setActionId(id);
    setError('');

    const { error } = await supabase
      .from('reviews')
      .update(changes)
      .eq('id', id);

    if (error) {
      setError('Não foi possível alterar essa avaliação.');
      setActionId(null);
      return;
    }

    await loadReviews();
    setActionId(null);
  }

  async function deleteReview(id: number) {
    const confirmed = window.confirm(
      'Deseja realmente excluir esta avaliação?'
    );

    if (!confirmed) return;

    setActionId(id);
    setError('');

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Não foi possível excluir essa avaliação.');
      setActionId(null);
      return;
    }

    await loadReviews();
    setActionId(null);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-bordo-300 overflow-y-auto">
      <div className="w-full max-w-[480px] min-h-screen mx-auto bg-bordo-300">

        {/* TOPO */}
        <header className="sticky top-0 z-20 bg-bordo-300/95 backdrop-blur-md border-b border-dourado-200/15">
          <div className="h-16 px-5 flex items-center justify-between">
            <div>
              <p className="font-serif text-[10px] tracking-[0.22em] text-dourado-200/50 uppercase">
                ISLP Tarot
              </p>

              <h1 className="font-serif text-lg tracking-[0.1em] text-gradient-gold">
                PAINEL ADMINISTRATIVO
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full border border-dourado-200/20 flex items-center justify-center text-dourado-200/70"
              aria-label="Fechar painel"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <main className="px-5 py-7">

          {/* BOAS-VINDAS */}
          <section className="rounded-2xl border border-dourado-200/20 bg-bordo-200/50 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-dourado-200/30 flex items-center justify-center">
                <span className="text-dourado-200 text-lg">
                  ✦
                </span>
              </div>

              <div>
                <p className="font-serif text-lg text-creme/90">
                  Olá, Isis ✦
                </p>

                <p className="font-serif text-xs text-dourado-200/50 mt-1 tracking-[0.12em] uppercase">
                  Administradora
                </p>
              </div>
            </div>
          </section>

          {/* ABAS PRINCIPAIS */}
          <div className="grid grid-cols-2 gap-2 mt-7">
            <button
              type="button"
              onClick={() => setTab('avaliacoes')}
              className={`rounded-xl border py-3 font-serif text-xs transition ${
                tab === 'avaliacoes'
                  ? 'border-dourado-200/45 bg-dourado-200/10 text-dourado-200'
                  : 'border-dourado-200/15 text-creme/40'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4" strokeWidth={1.4} />
                Avaliações
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab('jogos')}
              className={`rounded-xl border py-3 font-serif text-xs transition ${
                tab === 'jogos'
                  ? 'border-dourado-200/45 bg-dourado-200/10 text-dourado-200'
                  : 'border-dourado-200/15 text-creme/40'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Gamepad2 className="w-4 h-4" strokeWidth={1.4} />
                Jogos
              </span>
            </button>
          </div>

          {/* ==============================
              AVALIAÇÕES
          ============================== */}

          {tab === 'avaliacoes' && (
            <>
              <div className="flex items-end justify-between mt-9 mb-5">
                <div>
                  <p className="font-serif text-[10px] tracking-[0.22em] text-dourado-200/45 uppercase">
                    Gerenciamento
                  </p>

                  <h2 className="font-serif text-2xl text-creme/90 mt-1">
                    Avaliações
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={loadReviews}
                  disabled={loading}
                  className="w-9 h-9 rounded-full border border-dourado-200/20 flex items-center justify-center text-dourado-200/60 disabled:opacity-40"
                  aria-label="Atualizar"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loading ? 'animate-spin' : ''
                    }`}
                    strokeWidth={1.4}
                  />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <FilterButton
                  active={filter === 'pendente'}
                  onClick={() => setFilter('pendente')}
                >
                  Pendentes
                </FilterButton>

                <FilterButton
                  active={filter === 'aprovada'}
                  onClick={() => setFilter('aprovada')}
                >
                  Aprovadas
                </FilterButton>

                <FilterButton
                  active={filter === 'rejeitada'}
                  onClick={() => setFilter('rejeitada')}
                >
                  Rejeitadas
                </FilterButton>
              </div>

              {error && (
                <p className="mt-5 font-serif text-xs text-red-300/80 text-center">
                  {error}
                </p>
              )}

              {loading && (
                <Loading />
              )}

              {!loading && reviews.length === 0 && (
                <div className="py-16 flex flex-col items-center text-center">
                  <Clock3
                    className="w-7 h-7 text-dourado-200/30"
                    strokeWidth={1.3}
                  />

                  <p className="font-serif text-sm text-creme/45 mt-4">
                    Nenhuma avaliação nesta categoria.
                  </p>
                </div>
              )}

              {!loading && reviews.length > 0 && (
                <div className="flex flex-col gap-4 mt-6">
                  {reviews.map((review) => {
                    const processing =
                      actionId === review.id;

                    return (
                      <article
                        key={review.id}
                        className="rounded-2xl border border-dourado-200/20 bg-bordo-200/45 p-5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(
                              (star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <=
                                    review.estrelas
                                      ? 'text-dourado-200 fill-current'
                                      : 'text-dourado-200/20'
                                  }`}
                                  strokeWidth={1.2}
                                />
                              )
                            )}
                          </div>

                          {review.destaque && (
                            <span className="font-serif text-[9px] tracking-[0.15em] text-dourado-200/60 uppercase">
                              Destaque ✦
                            </span>
                          )}
                        </div>

                        <p className="font-serif text-[15px] text-creme/80 leading-[175%] mt-4">
                          {review.comentario}
                        </p>

                        <p className="font-serif text-[10px] text-creme/25 mt-4">
                          {new Date(
                            review.created_at
                          ).toLocaleDateString('pt-BR')}
                        </p>

                        <div className="mt-5 pt-4 border-t border-dourado-200/10">
                          {filter === 'pendente' && (
                            <div className="grid grid-cols-2 gap-2">
                              <ActionButton
                                disabled={processing}
                                onClick={() =>
                                  updateReview(
                                    review.id,
                                    {
                                      status:
                                        'aprovada',
                                    }
                                  )
                                }
                              >
                                <Check className="w-4 h-4" />
                                Aprovar
                              </ActionButton>

                              <ActionButton
                                disabled={processing}
                                onClick={() =>
                                  updateReview(
                                    review.id,
                                    {
                                      status:
                                        'rejeitada',
                                    }
                                  )
                                }
                              >
                                <XCircle className="w-4 h-4" />
                                Rejeitar
                              </ActionButton>
                            </div>
                          )}

                          {filter === 'aprovada' && (
                            <button
                              type="button"
                              disabled={processing}
                              onClick={() =>
                                updateReview(
                                  review.id,
                                  {
                                    destaque:
                                      !review.destaque,
                                  }
                                )
                              }
                              className="w-full rounded-xl border border-dourado-200/20 px-4 py-3 font-serif text-xs text-dourado-200/75 disabled:opacity-40"
                            >
                              {review.destaque
                                ? 'Remover dos destaques'
                                : 'Marcar como destaque ✦'}
                            </button>
                          )}

                          {filter === 'rejeitada' && (
                            <button
                              type="button"
                              disabled={processing}
                              onClick={() =>
                                updateReview(
                                  review.id,
                                  {
                                    status:
                                      'aprovada',
                                  }
                                )
                              }
                              className="w-full rounded-xl border border-dourado-200/20 px-4 py-3 font-serif text-xs text-dourado-200/75 disabled:opacity-40"
                            >
                              Aprovar avaliação
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={processing}
                            onClick={() =>
                              deleteReview(review.id)
                            }
                            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 font-serif text-xs text-creme/35 hover:text-red-300/70 disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ==============================
              JOGOS / SERVIÇOS
          ============================== */}

          {tab === 'jogos' && (
            <>
              <div className="flex items-end justify-between mt-9 mb-5">
                <div>
                  <p className="font-serif text-[10px] tracking-[0.22em] text-dourado-200/45 uppercase">
                    Gerenciamento
                  </p>

                  <h2 className="font-serif text-2xl text-creme/90 mt-1">
                    Jogos
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={loadServices}
                  disabled={loading}
                  className="w-9 h-9 rounded-full border border-dourado-200/20 flex items-center justify-center text-dourado-200/60 disabled:opacity-40"
                  aria-label="Atualizar"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loading ? 'animate-spin' : ''
                    }`}
                    strokeWidth={1.4}
                  />
                </button>
              </div>

              {/* NOVO JOGO - ativaremos na próxima etapa */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dourado-200/35 bg-dourado-200/10 px-4 py-3.5 font-serif text-sm text-dourado-200"
              >
                <Plus
                  className="w-4 h-4"
                  strokeWidth={1.5}
                />
                Novo jogo
              </button>

              {error && (
                <p className="mt-5 font-serif text-xs text-red-300/80 text-center">
                  {error}
                </p>
              )}

              {loading && <Loading />}

              {!loading && services.length === 0 && (
                <div className="py-16 text-center">
                  <p className="font-serif text-sm text-creme/45">
                    Nenhum jogo cadastrado.
                  </p>
                </div>
              )}

              {!loading && services.length > 0 && (
                <div className="flex flex-col gap-4 mt-6">
                  {services.map((service) => (
                    <article
                      key={service.id}
                      className={`rounded-2xl border p-5 ${
                        service.ativo
                          ? 'border-dourado-200/20 bg-bordo-200/45'
                          : 'border-creme/10 bg-bordo-200/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-[9px] tracking-[0.15em] text-dourado-200/50 uppercase">
                              {service.categoria ===
                              'consulta'
                                ? 'Consulta'
                                : 'Tiragem'}
                            </span>

                            {!service.ativo && (
                              <span className="font-serif text-[9px] text-creme/30 uppercase">
                                • Inativo
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif text-lg text-creme/90 mt-2">
                            {service.nome}
                          </h3>
                        </div>

                        <span className="font-serif text-lg text-dourado-200 whitespace-nowrap">
                          {Number(
                            service.preco
                          ).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </div>

                      <p className="font-serif text-sm text-creme/55 leading-relaxed mt-4">
                        {service.descricao}
                      </p>

                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-dourado-200/10">
                        <span className="font-serif text-[10px] text-creme/30">
                          Ordem: {service.ordem}
                        </span>

                        {service.destaque && (
                          <span className="font-serif text-[10px] text-dourado-200/60">
                            Destaque ✦
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-dourado-200/20 px-4 py-3 font-serif text-xs text-dourado-200/70"
                      >
                        <Edit3
                          className="w-3.5 h-3.5"
                          strokeWidth={1.4}
                        />
                        Editar
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="py-16 flex justify-center">
      <Loader2
        className="w-6 h-6 text-dourado-200/60 animate-spin"
        strokeWidth={1.4}
      />
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2 py-2.5 font-serif text-[10px] transition ${
        active
          ? 'border-dourado-200/45 bg-dourado-200/10 text-dourado-200'
          : 'border-dourado-200/15 text-creme/40'
      }`}
    >
      {children}
    </button>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 rounded-xl border border-dourado-200/25 bg-dourado-200/5 px-3 py-3 font-serif text-xs text-dourado-200/80 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
