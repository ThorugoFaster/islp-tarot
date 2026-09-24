import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  X,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ISIS_WHATSAPP = '5513996798449';
const SAO_PAULO_TIMEZONE = 'America/Sao_Paulo';

type OrderItem = {
  id: number;
  service_name: string;
  category: 'consulta' | 'tiragem';
  quantity: number;
  total_price: number;
  question: string | null;
};

type CustomerOrder = {
  id: number;
  status:
    | 'rascunho'
    | 'aguardando_pagamento'
    | 'pago'
    | 'em_atendimento'
    | 'finalizado'
    | 'cancelado';
  payment_status:
    | 'pendente'
    | 'pago'
    | 'falhou'
    | 'cancelado'
    | 'reembolsado';
  total: number;
  appointment_start_at: string | null;
  appointment_end_at: string | null;
  duration_minutes: number | null;
  created_at: string;
  order_items?: OrderItem[];
};

type Profile = {
  nome: string;
  username: string | null;
  telefone: string | null;
};

export function MyOrders() {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
      loadOrders();
    }

    document.addEventListener('open-my-orders', handleOpen);

    return () => {
      document.removeEventListener('open-my-orders', handleOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  async function loadOrders() {
    setLoading(true);
    setError('');

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      setOrders([]);
      setProfile(null);
      setError('Entre na sua conta para visualizar seus pedidos.');
      setLoading(false);
      return;
    }

    const [ordersResult, profileResult] = await Promise.all([
      supabase
        .from('orders')
        .select(`
          id,
          status,
          payment_status,
          total,
          appointment_start_at,
          appointment_end_at,
          duration_minutes,
          created_at,
          order_items (
            id,
            service_name,
            category,
            quantity,
            total_price,
            question
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false }),

      supabase
        .from('profiles')
        .select('nome, username, telefone')
        .eq('id', session.user.id)
        .maybeSingle(),
    ]);

    if (ordersResult.error) {
      console.error(ordersResult.error);
      setOrders([]);
      setError('Não foi possível carregar seus pedidos.');
    } else {
      setOrders((ordersResult.data ?? []) as CustomerOrder[]);
    }

    if (!profileResult.error && profileResult.data) {
      setProfile(profileResult.data as Profile);
    }

    setLoading(false);
  }

  function continueOnWhatsApp(order: CustomerOrder) {
    const date = order.appointment_start_at
      ? new Date(order.appointment_start_at).toLocaleDateString('pt-BR', {
          timeZone: SAO_PAULO_TIMEZONE,
        })
      : '—';

    const startTime = formatTime(order.appointment_start_at);
    const endTime = formatTime(order.appointment_end_at);

    const lines = [
      '🔮 *PEDIDO — ISLP TAROT*',
      '',
      `Pedido: #${order.id}`,
      profile?.nome ? `Cliente: ${profile.nome}` : '',
      profile?.username ? `Usuário: @${profile.username}` : '',
      profile?.telefone ? `WhatsApp: ${formatBrazilPhone(profile.telefone)}` : '',
      '',
      '*ATENDIMENTO*',
    ].filter(Boolean);

    (order.order_items ?? []).forEach((item, index) => {
      lines.push(
        '',
        `${index + 1}. ${item.service_name}${item.quantity > 1 ? ` (${item.quantity}x)` : ''}`,
        `Valor: ${formatPrice(Number(item.total_price))}`
      );

      if (item.question?.trim()) {
        lines.push(`Pergunta: ${item.question.trim()}`);
      }
    });

    lines.push(
      '',
      `Total: ${formatPrice(Number(order.total))}`,
      `Data: ${date}`,
      `Horário: ${startTime}${endTime !== '—' ? ` às ${endTime}` : ''}`,
      '',
      'Olá! Gostaria de continuar o atendimento deste pedido. ✨'
    );

    window.open(
      `https://wa.me/${ISIS_WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[145] bg-bordo-300 overflow-y-auto">
      <div className="w-full max-w-[480px] min-h-screen mx-auto bg-bordo-300">
        <header className="sticky top-0 z-20 bg-bordo-300/95 backdrop-blur-md border-b border-dourado-200/15">
          <div className="h-16 px-5 flex items-center justify-between">
            <div>
              <p className="font-serif text-[10px] tracking-[0.22em] text-dourado-200/50 uppercase">
                ISLP Tarot
              </p>
              <h1 className="font-serif text-lg tracking-[0.1em] text-gradient-gold">
                MEUS PEDIDOS
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full border border-dourado-200/20 flex items-center justify-center text-dourado-200/70"
              aria-label="Fechar meus pedidos"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <main className="px-5 py-7">
          <section className="rounded-2xl border border-dourado-200/20 bg-bordo-200/50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-serif text-lg text-creme/90">
                  Seus atendimentos ✦
                </p>
                <p className="font-serif text-xs text-creme/40 mt-1 leading-relaxed">
                  Consulte seus pedidos sem precisar criar uma nova reserva.
                </p>
              </div>

              <button
                type="button"
                onClick={loadOrders}
                disabled={loading}
                className="w-10 h-10 shrink-0 rounded-full border border-dourado-200/20 flex items-center justify-center text-dourado-200/60 disabled:opacity-40"
                aria-label="Atualizar pedidos"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  strokeWidth={1.4}
                />
              </button>
            </div>
          </section>

          {error && (
            <p className="mt-5 text-center font-serif text-xs text-red-300/80">
              {error}
            </p>
          )}

          {loading && (
            <div className="py-16 flex justify-center">
              <Loader2
                className="w-6 h-6 text-dourado-200/60 animate-spin"
                strokeWidth={1.4}
              />
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="py-20 flex flex-col items-center text-center">
              <PackageCheck
                className="w-8 h-8 text-dourado-200/30"
                strokeWidth={1.3}
              />
              <p className="font-serif text-sm text-creme/50 mt-4">
                Você ainda não possui pedidos.
              </p>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="flex flex-col gap-4 mt-6">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border border-dourado-200/20 bg-bordo-200/45 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-serif text-[9px] tracking-[0.16em] text-dourado-200/50 uppercase">
                        Pedido
                      </p>
                      <h2 className="mt-1 font-serif text-xl text-creme/90">
                        #{order.id}
                      </h2>
                    </div>

                    <CustomerOrderStatus order={order} />
                  </div>

                  <div className="mt-5 space-y-3">
                    {(order.order_items ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-dourado-200/10 bg-bordo-300/35 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-serif text-sm text-creme/85">
                              {item.service_name}
                            </p>
                            <p className="mt-1 font-serif text-[10px] text-creme/35">
                              {item.category === 'consulta' ? 'Consulta' : 'Tiragem'}
                              {item.quantity > 1 ? ` • ${item.quantity}x` : ''}
                            </p>
                          </div>

                          <span className="font-serif text-xs text-dourado-200/75 whitespace-nowrap">
                            {formatPrice(Number(item.total_price))}
                          </span>
                        </div>

                        {item.question && (
                          <div className="mt-3 border-t border-dourado-200/10 pt-3">
                            <p className="font-serif text-[9px] tracking-[0.12em] text-dourado-200/45 uppercase">
                              Pergunta
                            </p>
                            <p className="mt-1.5 font-serif text-xs leading-relaxed text-creme/65">
                              {item.question}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-dourado-200/10 bg-bordo-300/25 p-4">
                    <Info
                      icon={<CalendarDays className="w-3.5 h-3.5" />}
                      label="Data"
                      value={formatDate(order.appointment_start_at)}
                    />
                    <Info
                      icon={<Clock3 className="w-3.5 h-3.5" />}
                      label="Horário"
                      value={formatTime(order.appointment_start_at)}
                    />
                    <Info
                      label="Duração"
                      value={formatDuration(order.duration_minutes)}
                    />
                    <Info
                      label="Total"
                      value={formatPrice(Number(order.total))}
                      gold
                    />
                  </div>

                  {order.status !== 'cancelado' &&
                    order.status !== 'finalizado' && (
                      <button
                        type="button"
                        onClick={() => continueOnWhatsApp(order)}
                        className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl border border-dourado-200/35 bg-dourado-200/10 px-4 py-3.5 font-serif text-xs text-dourado-200"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {order.payment_status === 'pago'
                          ? 'Falar com a Isis no WhatsApp'
                          : 'Continuar pelo WhatsApp'}
                      </button>
                    )}

                  {order.status === 'cancelado' && (
                    <p className="mt-5 text-center font-serif text-xs text-creme/35">
                      Este pedido foi cancelado.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function CustomerOrderStatus({ order }: { order: CustomerOrder }) {
  if (order.status === 'cancelado') {
    return (
      <span className="flex items-center gap-1 rounded-full border border-red-300/20 bg-red-300/5 px-3 py-1.5 font-serif text-[9px] text-red-300/70 uppercase">
        <XCircle className="w-3 h-3" />
        Cancelado
      </span>
    );
  }

  if (order.status === 'finalizado') {
    return (
      <span className="flex items-center gap-1 rounded-full border border-dourado-200/20 px-3 py-1.5 font-serif text-[9px] text-creme/50 uppercase">
        <Check className="w-3 h-3" />
        Finalizado
      </span>
    );
  }

  if (order.payment_status === 'pago') {
    return (
      <span className="flex items-center gap-1 rounded-full border border-dourado-200/30 bg-dourado-200/10 px-3 py-1.5 font-serif text-[9px] text-dourado-200 uppercase">
        <Check className="w-3 h-3" />
        Pago
      </span>
    );
  }

  return (
    <span className="rounded-full border border-dourado-200/15 px-3 py-1.5 font-serif text-[9px] text-creme/45 uppercase">
      Aguardando
    </span>
  );
}

function Info({
  icon,
  label,
  value,
  gold = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 font-serif text-[9px] text-creme/30 uppercase">
        {icon}
        {label}
      </p>
      <p
        className={`mt-1 font-serif text-xs ${
          gold ? 'text-dourado-200' : 'text-creme/70'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('pt-BR', {
    timeZone: SAO_PAULO_TIMEZONE,
  });
}

function formatTime(value: string | null) {
  if (!value) return '—';

  return new Date(value).toLocaleTimeString('pt-BR', {
    timeZone: SAO_PAULO_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes: number | null) {
  if (!minutes) return '—';

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours && rest) return `${hours}h ${rest}min`;
  if (hours) return `${hours}h`;
  return `${rest} min`;
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatBrazilPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('55') ? digits.slice(2) : digits;

  if (local.length !== 11) return value;

  return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
}
