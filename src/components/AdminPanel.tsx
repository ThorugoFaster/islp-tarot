import { useEffect, useState } from 'react';
import {
  Check,
  Clock3,
  Edit3,
  Gamepad2,
  Loader2,
  Plus,
  RefreshCw,
  Save,
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

type ServiceForm = {
  nome: string;
  preco: string;
  descricao: string;
  categoria: 'consulta' | 'tiragem';
  ativo: boolean;
  destaque: boolean;
  ordem: string;
};

type Filter = 'pendente' | 'aprovada' | 'rejeitada';
type AdminTab = 'avaliacoes' | 'jogos';

const emptyServiceForm: ServiceForm = {
  nome: '',
  preco: '',
  descricao: '',
  categoria: 'tiragem',
  ativo: true,
  destaque: false,
  ordem: '1',
};

export function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AdminTab>('avaliacoes');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<Filter>('pendente');

  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [serviceModalOpen, setServiceModalOpen] =
    useState(false);

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [serviceForm, setServiceForm] =
    useState<ServiceForm>(emptyServiceForm);

  const [savingService, setSavingService] =
    useState(false);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }

    document.addEventListener(
      'open-admin-panel',
      handleOpen
    );

    return () => {
      document.removeEventListener(
        'open-admin-panel',
        handleOpen
      );
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
    document.body.style.overflow =
      open || serviceModalOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, serviceModalOpen]);

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
      setError(
        'Não foi possível carregar as avaliações.'
      );
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

      setError(
        'Não foi possível carregar os jogos.'
      );

      setServices([]);
    } else {
      setServices((data ?? []) as Service[]);
    }

    setLoading(false);
  }

  async function updateReview(
    id: number,
    changes: Partial<
      Pick<Review, 'status' | 'destaque'>
    >
  ) {
    setActionId(id);
    setError('');

    const { error } = await supabase
      .from('reviews')
      .update(changes)
      .eq('id', id);

    if (error) {
      setError(
        'Não foi possível alterar essa avaliação.'
      );

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
      setError(
        'Não foi possível excluir essa avaliação.'
      );

      setActionId(null);
      return;
    }

    await loadReviews();
    setActionId(null);
  }

  function openNewService() {
    setEditingService(null);

    setServiceForm({
      ...emptyServiceForm,
      ordem: String(services.length + 1),
    });

    setError('');
    setSuccess('');
    setServiceModalOpen(true);
  }

  function openEditService(service: Service) {
    setEditingService(service);

    setServiceForm({
      nome: service.nome,
      preco: String(service.preco),
      descricao: service.descricao,
      categoria: service.categoria,
      ativo: service.ativo,
      destaque: service.destaque,
      ordem: String(service.ordem),
    });

    setError('');
    setSuccess('');
    setServiceModalOpen(true);
  }

  function closeServiceModal() {
    if (savingService) return;

    setServiceModalOpen(false);
    setEditingService(null);
    setServiceForm(emptyServiceForm);
  }

  async function saveService() {
    setError('');
    setSuccess('');

    const nome = serviceForm.nome.trim();
    const descricao = serviceForm.descricao.trim();

    const preco = Number(
      serviceForm.preco
        .replace(',', '.')
        .replace('R$', '')
        .trim()
    );

    const ordem = Number(serviceForm.ordem);

    if (!nome) {
      setError('Informe o nome do jogo.');
      return;
    }

    if (
      !Number.isFinite(preco) ||
      preco < 0
    ) {
      setError('Informe um preço válido.');
      return;
    }

    if (!descricao) {
      setError('Informe a descrição do jogo.');
      return;
    }

    if (
      !Number.isInteger(ordem) ||
      ordem < 1
    ) {
      setError(
        'A ordem precisa ser um número inteiro maior que zero.'
      );
      return;
    }

    setSavingService(true);

    const payload = {
      nome,
      preco,
      descricao,
      categoria: serviceForm.categoria,
      ativo: serviceForm.ativo,
      destaque: serviceForm.destaque,
      ordem,
    };

    if (editingService) {
      const { error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', editingService.id);

      if (error) {
        console.error(error);

        setError(
          'Não foi possível salvar as alterações.'
        );

        setSavingService(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('services')
        .insert(payload);

      if (error) {
        console.error(error);

        setError(
          'Não foi possível criar o novo jogo.'
        );

        setSavingService(false);
        return;
      }
    }

    setSavingService(false);
    setServiceModalOpen(false);
    setEditingService(null);
    setServiceForm(emptyServiceForm);

    setSuccess(
      editingService
        ? 'Jogo atualizado com sucesso ✦'
        : 'Novo jogo criado com sucesso ✦'
    );

    await loadServices();
  }

  async function toggleService(
    service: Service
  ) {
    setActionId(service.id);
    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('services')
      .update({
        ativo: !service.ativo,
      })
      .eq('id', service.id);

    if (error) {
      console.error(error);

      setError(
        'Não foi possível alterar a disponibilidade.'
      );

      setActionId(null);
      return;
    }

    await loadServices();
    setActionId(null);

    setSuccess(
      service.ativo
        ? 'Jogo desativado.'
        : 'Jogo ativado ✦'
    );
  }

  async function toggleHighlight(
    service: Service
  ) {
    setActionId(service.id);
    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('services')
      .update({
        destaque: !service.destaque,
      })
      .eq('id', service.id);

    if (error) {
      console.error(error);

      setError(
        'Não foi possível alterar o destaque.'
      );

      setActionId(null);
      return;
    }

    await loadServices();
    setActionId(null);
  }

  async function deleteService(
    service: Service
  ) {
    const confirmed = window.confirm(
      `Deseja realmente excluir "${service.nome}"?\n\nEssa ação não poderá ser desfeita.`
    );

    if (!confirmed) return;

    setActionId(service.id);
    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', service.id);

    if (error) {
      console.error(error);

      setError(
        'Não foi possível excluir esse jogo.'
      );

      setActionId(null);
      return;
    }

    await loadServices();
    setActionId(null);

    setSuccess('Jogo excluído.');
  }

  if (!open) return null;

  return (
    <>
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
                <X
                  className="w-4 h-4"
                  strokeWidth={1.5}
                />
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

            {/* ABAS */}
            <div className="grid grid-cols-2 gap-2 mt-7">
              <button
                type="button"
                onClick={() => {
                  setTab('avaliacoes');
                  setError('');
                  setSuccess('');
                }}
                className={`rounded-xl border py-3 font-serif text-xs transition ${
                  tab === 'avaliacoes'
                    ? 'border-dourado-200/45 bg-dourado-200/10 text-dourado-200'
                    : 'border-dourado-200/15 text-creme/40'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Star
                    className="w-4 h-4"
                    strokeWidth={1.4}
                  />
                  Avaliações
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('jogos');
                  setError('');
                  setSuccess('');
                }}
                className={`rounded-xl border py-3 font-serif text-xs transition ${
                  tab === 'jogos'
                    ? 'border-dourado-200/45 bg-dourado-200/10 text-dourado-200'
                    : 'border-dourado-200/15 text-creme/40'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Gamepad2
                    className="w-4 h-4"
                    strokeWidth={1.4}
                  />
                  Jogos
                </span>
              </button>
            </div>

            {/* ============================
                AVALIAÇÕES
            ============================ */}

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
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        loading
                          ? 'animate-spin'
                          : ''
                      }`}
                      strokeWidth={1.4}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <FilterButton
                    active={
                      filter === 'pendente'
                    }
                    onClick={() =>
                      setFilter('pendente')
                    }
                  >
                    Pendentes
                  </FilterButton>

                  <FilterButton
                    active={
                      filter === 'aprovada'
                    }
                    onClick={() =>
                      setFilter('aprovada')
                    }
                  >
                    Aprovadas
                  </FilterButton>

                  <FilterButton
                    active={
                      filter === 'rejeitada'
                    }
                    onClick={() =>
                      setFilter('rejeitada')
                    }
                  >
                    Rejeitadas
                  </FilterButton>
                </div>

                <Messages
                  error={error}
                  success={success}
                />

                {loading && <Loading />}

                {!loading &&
                  reviews.length === 0 && (
                    <div className="py-16 flex flex-col items-center text-center">
                      <Clock3
                        className="w-7 h-7 text-dourado-200/30"
                        strokeWidth={1.3}
                      />

                      <p className="font-serif text-sm text-creme/45 mt-4">
                        Nenhuma avaliação nesta
                        categoria.
                      </p>
                    </div>
                  )}

                {!loading &&
                  reviews.length > 0 && (
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
                                      strokeWidth={
                                        1.2
                                      }
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
                              ).toLocaleDateString(
                                'pt-BR'
                              )}
                            </p>

                            <div className="mt-5 pt-4 border-t border-dourado-200/10">
                              {filter ===
                                'pendente' && (
                                <div className="grid grid-cols-2 gap-2">
                                  <ActionButton
                                    disabled={
                                      processing
                                    }
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
                                    disabled={
                                      processing
                                    }
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

                              {filter ===
                                'aprovada' && (
                                <button
                                  type="button"
                                  disabled={
                                    processing
                                  }
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

                              {filter ===
                                'rejeitada' && (
                                <button
                                  type="button"
                                  disabled={
                                    processing
                                  }
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
                                  deleteReview(
                                    review.id
                                  )
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

            {/* ============================
                JOGOS
            ============================ */}

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
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        loading
                          ? 'animate-spin'
                          : ''
                      }`}
                      strokeWidth={1.4}
                    />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={openNewService}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-dourado-200/35 bg-dourado-200/10 px-4 py-3.5 font-serif text-sm text-dourado-200"
                >
                  <Plus
                    className="w-4 h-4"
                    strokeWidth={1.5}
                  />
                  Novo jogo
                </button>

                <Messages
                  error={error}
                  success={success}
                />

                {loading && <Loading />}

                {!loading &&
                  services.length === 0 && (
                    <div className="py-16 text-center">
                      <p className="font-serif text-sm text-creme/45">
                        Nenhum jogo cadastrado.
                      </p>
                    </div>
                  )}

                {!loading &&
                  services.length > 0 && (
                    <div className="flex flex-col gap-4 mt-6">
                      {services.map((service) => {
                        const processing =
                          actionId === service.id;

                        return (
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
                                <div className="flex items-center gap-2 flex-wrap">
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

                                  {service.destaque && (
                                    <span className="font-serif text-[9px] text-dourado-200/60 uppercase">
                                      • Destaque ✦
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
                                ).toLocaleString(
                                  'pt-BR',
                                  {
                                    style:
                                      'currency',
                                    currency: 'BRL',
                                  }
                                )}
                              </span>
                            </div>

                            <p className="font-serif text-sm text-creme/55 leading-relaxed mt-4">
                              {service.descricao}
                            </p>

                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-dourado-200/10">
                              <span className="font-serif text-[10px] text-creme/30">
                                Ordem:{' '}
                                {service.ordem}
                              </span>

                              <span
                                className={`font-serif text-[10px] ${
                                  service.ativo
                                    ? 'text-dourado-200/60'
                                    : 'text-creme/30'
                                }`}
                              >
                                {service.ativo
                                  ? 'Ativo'
                                  : 'Desativado'}
                              </span>
                            </div>

                            {/* EDITAR */}
                            <button
                              type="button"
                              disabled={processing}
                              onClick={() =>
                                openEditService(
                                  service
                                )
                              }
                              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-dourado-200/25 bg-dourado-200/5 px-4 py-3 font-serif text-xs text-dourado-200/80 disabled:opacity-40"
                            >
                              <Edit3
                                className="w-3.5 h-3.5"
                                strokeWidth={1.4}
                              />
                              Editar
                            </button>

                            {/* ATIVAR/DESATIVAR + DESTAQUE */}
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <button
                                type="button"
                                disabled={processing}
                                onClick={() =>
                                  toggleService(
                                    service
                                  )
                                }
                                className="rounded-xl border border-dourado-200/15 px-2 py-3 font-serif text-[10px] text-creme/55 disabled:opacity-40"
                              >
                                {service.ativo
                                  ? 'Desativar'
                                  : 'Ativar'}
                              </button>

                              <button
                                type="button"
                                disabled={processing}
                                onClick={() =>
                                  toggleHighlight(
                                    service
                                  )
                                }
                                className="rounded-xl border border-dourado-200/15 px-2 py-3 font-serif text-[10px] text-dourado-200/65 disabled:opacity-40"
                              >
                                {service.destaque
                                  ? 'Tirar destaque'
                                  : 'Destacar ✦'}
                              </button>
                            </div>

                            {/* EXCLUIR */}
                            <button
                              type="button"
                              disabled={processing}
                              onClick={() =>
                                deleteService(
                                  service
                                )
                              }
                              className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 font-serif text-[10px] text-creme/30 hover:text-red-300/70 disabled:opacity-40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Excluir jogo
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ============================
          MODAL CRIAR / EDITAR JOGO
      ============================ */}

      {serviceModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-end sm:items-center justify-center">
            <div className="relative w-full max-w-[480px] bg-bordo-300 border border-dourado-200/20 rounded-t-[28px] sm:rounded-[28px] px-5 pt-6 pb-8">

              {/* FECHAR */}
              <button
                type="button"
                onClick={closeServiceModal}
                className="absolute right-5 top-5 w-9 h-9 rounded-full border border-dourado-200/20 flex items-center justify-center text-dourado-200/60"
              >
                <X
                  className="w-4 h-4"
                  strokeWidth={1.4}
                />
              </button>

              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="ornament-line w-10" />
                <span className="text-dourado-200/40 text-xs">
                  ✦
                </span>
                <div className="ornament-line w-10" />
              </div>

              <div className="text-center">
                <p className="font-serif text-[10px] tracking-[0.2em] text-dourado-200/45 uppercase">
                  Painel administrativo
                </p>

                <h2 className="font-serif text-xl text-gradient-gold mt-2">
                  {editingService
                    ? 'EDITAR JOGO'
                    : 'NOVO JOGO'}
                </h2>
              </div>

              <div className="space-y-4 mt-7">

                {/* NOME */}
                <FieldLabel label="Nome do jogo">
                  <input
                    type="text"
                    value={serviceForm.nome}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        nome: event.target.value,
                      })
                    }
                    placeholder="Ex: Cruz Celta"
                    className="AdminInput"
                  />
                </FieldLabel>

                {/* PREÇO + ORDEM */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldLabel label="Preço (R$)">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={serviceForm.preco}
                      onChange={(event) =>
                        setServiceForm({
                          ...serviceForm,
                          preco:
                            event.target.value,
                        })
                      }
                      placeholder="30"
                      className="AdminInput"
                    />
                  </FieldLabel>

                  <FieldLabel label="Ordem">
                    <input
                      type="number"
                      min="1"
                      value={serviceForm.ordem}
                      onChange={(event) =>
                        setServiceForm({
                          ...serviceForm,
                          ordem:
                            event.target.value,
                        })
                      }
                      className="AdminInput"
                    />
                  </FieldLabel>
                </div>

                {/* CATEGORIA */}
                <FieldLabel label="Categoria">
                  <select
                    value={
                      serviceForm.categoria
                    }
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        categoria:
                          event.target.value as
                            | 'consulta'
                            | 'tiragem',
                      })
                    }
                    className="AdminInput"
                  >
                    <option value="tiragem">
                      Tiragem
                    </option>

                    <option value="consulta">
                      Consulta
                    </option>
                  </select>
                </FieldLabel>

                {/* DESCRIÇÃO */}
                <FieldLabel label="Descrição">
                  <textarea
                    value={
                      serviceForm.descricao
                    }
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        descricao:
                          event.target.value,
                      })
                    }
                    rows={5}
                    placeholder="Descrição que aparecerá para a cliente..."
                    className="AdminInput resize-none py-3"
                  />
                </FieldLabel>

                {/* CONFIGURAÇÕES */}
                <div className="rounded-xl border border-dourado-200/15 bg-bordo-200/30 divide-y divide-dourado-200/10">

                  <ToggleRow
                    label="Jogo ativo"
                    description="Exibir este jogo no site"
                    checked={serviceForm.ativo}
                    onChange={(checked) =>
                      setServiceForm({
                        ...serviceForm,
                        ativo: checked,
                      })
                    }
                  />

                  <ToggleRow
                    label="Destacar"
                    description="Marcar como destaque"
                    checked={
                      serviceForm.destaque
                    }
                    onChange={(checked) =>
                      setServiceForm({
                        ...serviceForm,
                        destaque: checked,
                      })
                    }
                  />
                </div>
              </div>

              {error && (
                <p className="mt-5 text-center font-serif text-xs text-red-300/80">
                  {error}
                </p>
              )}

              {/* SALVAR */}
              <button
                type="button"
                onClick={saveService}
                disabled={savingService}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-full border border-dourado-200/45 bg-dourado-200/10 px-5 py-3.5 font-serif text-[11px] tracking-[0.15em] text-dourado-200 uppercase disabled:opacity-40"
              >
                {savingService ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar jogo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   COMPONENTES AUXILIARES
========================================================= */

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

function Messages({
  error,
  success,
}: {
  error: string;
  success: string;
}) {
  return (
    <>
      {error && (
        <p className="mt-5 font-serif text-xs text-red-300/80 text-center">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-5 font-serif text-xs text-dourado-200/70 text-center">
          {success}
        </p>
      )}
    </>
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

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block mb-2 font-serif text-[10px] tracking-[0.15em] text-dourado-200/55 uppercase">
        {label}
      </span>

      {children}
    </label>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 px-4 py-4 text-left"
    >
      <div>
        <p className="font-serif text-sm text-creme/80">
          {label}
        </p>

        <p className="font-serif text-[10px] text-creme/35 mt-1">
          {description}
        </p>
      </div>

      <div
        className={`relative w-11 h-6 rounded-full border transition ${
          checked
            ? 'bg-dourado-200/20 border-dourado-200/50'
            : 'bg-bordo-300 border-creme/15'
        }`}
      >
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all ${
            checked
              ? 'left-6 bg-dourado-200'
              : 'left-1 bg-creme/30'
          }`}
        />
      </div>
    </button>
  );
}
