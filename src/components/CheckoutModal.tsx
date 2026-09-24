import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Loader2,
  MessageCircleQuestion,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/lib/supabase';

type CheckoutStep =
  | 'summary'
  | 'questions'
  | 'schedule'
  | 'review';

type QuestionAnswer = {
  key: string;
  serviceId: number;
  serviceName: string;
  categoria: string;
  itemNumber: number;
  text: string;
};

type AvailableSlot = {
  start_at: string;
  end_at: string;
};

type ServiceDuration = {
  id: number;
  duracao_minutos: number | null;
};

const QUESTIONS_STORAGE_KEY =
  'islp-checkout-questions';

const CHECKOUT_STORAGE_KEY =
  'islp-checkout-data';

const SAO_PAULO_TIMEZONE =
  'America/Sao_Paulo';

export function CheckoutModal() {
  const [open, setOpen] = useState(false);

  const [step, setStep] =
    useState<CheckoutStep>('summary');

  const [answers, setAnswers] = useState<
    Record<string, string>
  >({});

  const [error, setError] = useState('');

  const [durationMinutes, setDurationMinutes] =
    useState(0);

  const [loadingDuration, setLoadingDuration] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState('');

  const [selectedSlot, setSelectedSlot] =
    useState<AvailableSlot | null>(null);

  const [slots, setSlots] = useState<
    AvailableSlot[]
  >([]);

  const [loadingSlots, setLoadingSlots] =
    useState(false);

  const {
    items,
    quantidadeTotal,
    valorTotal,
  } = useCart();

  const questionFields =
    useMemo<QuestionAnswer[]>(() => {
      const fields: QuestionAnswer[] = [];

      items.forEach((item) => {
        for (
          let index = 1;
          index <= item.quantidade;
          index++
        ) {
          fields.push({
            key: `${item.id}-${index}`,
            serviceId: item.id,
            serviceName: item.nome,
            categoria: item.categoria,
            itemNumber: index,
            text: '',
          });
        }
      });

      return fields;
    }, [items]);

  const availableDates = useMemo(
    () => generateAvailableDates(14),
    []
  );

  useEffect(() => {
    function handleOpenCheckout() {
      setError('');
      setStep('summary');

      try {
        const savedQuestions =
          sessionStorage.getItem(
            QUESTIONS_STORAGE_KEY
          );

        if (savedQuestions) {
          const parsed =
            JSON.parse(savedQuestions);

          if (
            parsed &&
            typeof parsed === 'object'
          ) {
            setAnswers(parsed);
          }
        }

        const savedCheckout =
          sessionStorage.getItem(
            CHECKOUT_STORAGE_KEY
          );

        if (savedCheckout) {
          const parsedCheckout =
            JSON.parse(savedCheckout);

          if (
            parsedCheckout?.selectedDate
          ) {
            setSelectedDate(
              parsedCheckout.selectedDate
            );
          }

          if (
            parsedCheckout?.selectedSlot
          ) {
            setSelectedSlot(
              parsedCheckout.selectedSlot
            );
          }
        }
      } catch {
        setAnswers({});
      }

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

  useEffect(() => {
    try {
      sessionStorage.setItem(
        QUESTIONS_STORAGE_KEY,
        JSON.stringify(answers)
      );
    } catch {
      // Checkout continua funcionando
      // mesmo sem sessionStorage.
    }
  }, [answers]);

  useEffect(() => {
    if (
      step !== 'schedule' ||
      !selectedDate ||
      durationMinutes <= 0
    ) {
      return;
    }

    loadAvailableSlots(
      selectedDate,
      durationMinutes
    );
  }, [
    step,
    selectedDate,
    durationMinutes,
  ]);

  function formatPrice(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  function closeCheckout() {
    setOpen(false);
    setError('');
  }

  function backToCart() {
    setOpen(false);
    setError('');

    window.setTimeout(() => {
      document.dispatchEvent(
        new CustomEvent('open-cart')
      );
    }, 100);
  }

  function handleBack() {
    setError('');

    if (step === 'review') {
      setStep('schedule');
      return;
    }

    if (step === 'schedule') {
      setStep('questions');
      return;
    }

    if (step === 'questions') {
      setStep('summary');
      return;
    }

    backToCart();
  }

  function handleStartQuestions() {
    setError('');
    setStep('questions');
  }

  function updateAnswer(
    key: string,
    value: string
  ) {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));

    if (error) {
      setError('');
    }
  }

  function buildCheckoutQuestions() {
    return questionFields.map(
      (field) => ({
        serviceId: field.serviceId,
        serviceName:
          field.serviceName,
        categoria: field.categoria,
        itemNumber: field.itemNumber,
        question:
          answers[field.key]?.trim() ||
          '',
      })
    );
  }

  async function handleContinueToSchedule() {
    const missingQuestion =
      questionFields.find(
        (field) =>
          field.categoria !==
            'consulta' &&
          !answers[field.key]?.trim()
      );

    if (missingQuestion) {
      setError(
        'Preencha sua pergunta ou o tema que deseja analisar antes de continuar.'
      );

      return;
    }

    setError('');
    setLoadingDuration(true);

    try {
      const serviceIds = [
        ...new Set(
          items.map((item) => item.id)
        ),
      ];

      const { data, error: serviceError } =
        await supabase
          .from('services')
          .select(
            'id, duracao_minutos'
          )
          .in('id', serviceIds)
          .eq('ativo', true);

      if (serviceError) {
        console.error(
          'Erro ao buscar duração:',
          serviceError
        );

        setError(
          'Não foi possível calcular a duração do atendimento.'
        );

        return;
      }

      const services =
        (data || []) as ServiceDuration[];

      if (
        services.length !==
        serviceIds.length
      ) {
        setError(
          'Um dos atendimentos selecionados não está mais disponível.'
        );

        return;
      }

      let totalDuration = 0;

      for (const item of items) {
        const service = services.find(
          (current) =>
            current.id === item.id
        );

        const duration =
          Number(
            service?.duracao_minutos
          );

        if (
          !service ||
          !duration ||
          duration <= 0
        ) {
          setError(
            `Não foi possível identificar a duração de "${item.nome}".`
          );

          return;
        }

        totalDuration +=
          duration * item.quantidade;
      }

      if (totalDuration <= 0) {
        setError(
          'Não foi possível calcular a duração do atendimento.'
        );

        return;
      }

      const checkoutQuestions =
        buildCheckoutQuestions();

      setDurationMinutes(
        totalDuration
      );

      let dateToUse = selectedDate;

      if (!dateToUse) {
        dateToUse =
          availableDates[0]?.value ||
          '';
      }

      setSelectedDate(dateToUse);
      setSelectedSlot(null);
      setSlots([]);

      saveCheckoutData({
        questions: checkoutQuestions,
        durationMinutes:
          totalDuration,
        selectedDate: dateToUse,
        selectedSlot: null,
      });

      setStep('schedule');
    } catch (err) {
      console.error(
        'Erro ao preparar agenda:',
        err
      );

      setError(
        'Não foi possível preparar o agendamento.'
      );
    } finally {
      setLoadingDuration(false);
    }
  }

  async function loadAvailableSlots(
    date: string,
    duration: number
  ) {
    setLoadingSlots(true);
    setError('');
    setSlots([]);
    setSelectedSlot(null);

    try {
      const {
        data,
        error: slotsError,
      } = await supabase.rpc(
        'get_available_slots',
        {
          p_date: date,
          p_duration_minutes:
            duration,
        }
      );

      if (slotsError) {
        console.error(
          'Erro ao carregar horários:',
          slotsError
        );

        setError(
          'Não foi possível carregar os horários disponíveis.'
        );

        return;
      }

      setSlots(
        (data || []) as AvailableSlot[]
      );
    } catch (err) {
      console.error(
        'Erro ao consultar horários:',
        err
      );

      setError(
        'Não foi possível carregar os horários disponíveis.'
      );
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleSelectDate(
    date: string
  ) {
    if (date === selectedDate) {
      return;
    }

    setSelectedDate(date);
    setSelectedSlot(null);
    setSlots([]);
    setError('');
  }

  function handleSelectSlot(
    slot: AvailableSlot
  ) {
    setSelectedSlot(slot);
    setError('');

    saveCheckoutData({
      questions:
        buildCheckoutQuestions(),
      durationMinutes,
      selectedDate,
      selectedSlot: slot,
    });
  }

  function handleContinueToReview() {
    if (!selectedDate) {
      setError(
        'Escolha uma data para o atendimento.'
      );
      return;
    }

    if (!selectedSlot) {
      setError(
        'Escolha um horário disponível para continuar.'
      );
      return;
    }

    setError('');

    saveCheckoutData({
      questions:
        buildCheckoutQuestions(),
      durationMinutes,
      selectedDate,
      selectedSlot,
    });

    setStep('review');
  }

  function handleProceedToPayment() {
    /*
      PRÓXIMA ETAPA:

      Aqui NÃO vamos criar o pagamento
      diretamente pelo navegador.

      Vamos criar o pedido com uma
      Edge Function segura, recalculando:

      - serviços
      - preços
      - duração
      - horário
      - disponibilidade

      Depois a função criará o checkout
      no provedor de pagamento.
    */

    console.log(
      'Checkout pronto para pagamento',
      {
        items,
        questions:
          buildCheckoutQuestions(),
        durationMinutes,
        selectedDate,
        selectedSlot,
      }
    );
  }

  if (!open) return null;

  const currentProgress =
    step === 'summary'
      ? 1
      : step === 'questions'
        ? 2
        : step === 'schedule'
          ? 3
          : 4;

  const title =
    step === 'summary'
      ? 'SEU ATENDIMENTO'
      : step === 'questions'
        ? 'SUAS PERGUNTAS'
        : step === 'schedule'
          ? 'AGENDAMENTO'
          : 'REVISÃO';

  const description =
    step === 'summary'
      ? 'Vamos preparar os detalhes do seu atendimento.'
      : step === 'questions'
        ? 'Conte o que você deseja consultar nas cartas.'
        : step === 'schedule'
          ? 'Escolha a data e o horário do seu atendimento.'
          : 'Confira os detalhes antes de seguir para o pagamento.';

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
            onClick={handleBack}
            aria-label="Voltar"
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
              {title}
            </h2>

            <p className="mt-2 max-w-[300px] font-serif text-xs leading-relaxed text-creme/45">
              {description}
            </p>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          <Progress
            current={currentProgress}
          />

          {step === 'summary' && (
            <SummaryStep
              items={items}
              quantidadeTotal={
                quantidadeTotal
              }
              valorTotal={valorTotal}
              formatPrice={formatPrice}
            />
          )}

          {step === 'questions' && (
            <QuestionsStep
              fields={questionFields}
              answers={answers}
              updateAnswer={updateAnswer}
              error={error}
            />
          )}

          {step === 'schedule' && (
            <ScheduleStep
              dates={availableDates}
              selectedDate={
                selectedDate
              }
              onSelectDate={
                handleSelectDate
              }
              slots={slots}
              selectedSlot={
                selectedSlot
              }
              onSelectSlot={
                handleSelectSlot
              }
              loading={loadingSlots}
              durationMinutes={
                durationMinutes
              }
              error={error}
            />
          )}

          {step === 'review' && (
            <ReviewStep
              items={items}
              answers={answers}
              fields={questionFields}
              valorTotal={valorTotal}
              durationMinutes={
                durationMinutes
              }
              selectedSlot={
                selectedSlot
              }
              formatPrice={formatPrice}
            />
          )}
        </div>

        {/* RODAPÉ */}
        <div className="border-t border-dourado-200/15 bg-bordo-200/30 px-5 pb-6 pt-5">

          {step === 'summary' && (
            <>
              <button
                type="button"
                onClick={
                  handleStartQuestions
                }
                className="flex w-full items-center justify-center gap-2 rounded-full bg-dourado-200 px-6 py-4 font-serif text-[11px] font-semibold tracking-[0.18em] text-bordo-300 transition active:scale-[0.99]"
              >
                INFORMAR MINHAS PERGUNTAS

                <ChevronRight
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </button>

              <FooterMessage>
                Você ainda não será
                cobrada nesta etapa.
              </FooterMessage>
            </>
          )}

          {step === 'questions' && (
            <>
              <button
                type="button"
                disabled={
                  loadingDuration
                }
                onClick={
                  handleContinueToSchedule
                }
                className="flex w-full items-center justify-center gap-2 rounded-full bg-dourado-200 px-6 py-4 font-serif text-[11px] font-semibold tracking-[0.18em] text-bordo-300 transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
              >
                {loadingDuration ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    strokeWidth={1.7}
                  />
                ) : (
                  <>
                    CONTINUAR PARA
                    AGENDAMENTO

                    <CalendarDays
                      className="h-4 w-4"
                      strokeWidth={1.7}
                    />
                  </>
                )}
              </button>

              <FooterMessage>
                Na próxima etapa você
                escolherá a data e o
                horário.
              </FooterMessage>
            </>
          )}

          {step === 'schedule' && (
            <>
              <button
                type="button"
                disabled={
                  !selectedSlot ||
                  loadingSlots
                }
                onClick={
                  handleContinueToReview
                }
                className="flex w-full items-center justify-center gap-2 rounded-full bg-dourado-200 px-6 py-4 font-serif text-[11px] font-semibold tracking-[0.18em] text-bordo-300 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
              >
                REVISAR ATENDIMENTO

                <ChevronRight
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </button>

              <FooterMessage>
                O horário ainda não está
                reservado.
              </FooterMessage>
            </>
          )}

          {step === 'review' && (
            <>
              <button
                type="button"
                onClick={
                  handleProceedToPayment
                }
                className="flex w-full items-center justify-center gap-2 rounded-full bg-dourado-200 px-6 py-4 font-serif text-[11px] font-semibold tracking-[0.18em] text-bordo-300 transition active:scale-[0.99]"
              >
                IR PARA PAGAMENTO

                <ChevronRight
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </button>

              <FooterMessage>
                Confira os dados antes
                de continuar.
              </FooterMessage>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RESUMO
========================================================= */

function SummaryStep({
  items,
  quantidadeTotal,
  valorTotal,
  formatPrice,
}: {
  items: ReturnType<
    typeof useCart
  >['items'];
  quantidadeTotal: number;
  valorTotal: number;
  formatPrice: (value: number) => string;
}) {
  return (
    <>
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
                    Quantidade:{' '}
                    {item.quantidade}
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

      <div className="mt-6">
        <p className="font-serif text-[10px] tracking-[0.15em] text-dourado-200/45 uppercase">
          Próximas etapas
        </p>

        <div className="mt-3 overflow-hidden rounded-2xl border border-dourado-200/10">
          <CheckoutStepItem
            number="1"
            title="Perguntas"
            description="Informe o que deseja consultar."
          />

          <CheckoutStepItem
            number="2"
            title="Data e horário"
            description="Escolha um horário disponível."
            calendar
          />

          <CheckoutStepItem
            number="3"
            title="Revisão e pagamento"
            description="Confira tudo antes de finalizar."
          />
        </div>
      </div>
    </>
  );
}

/* =========================================================
   PERGUNTAS
========================================================= */

function QuestionsStep({
  fields,
  answers,
  updateAnswer,
  error,
}: {
  fields: QuestionAnswer[];
  answers: Record<string, string>;
  updateAnswer: (
    key: string,
    value: string
  ) => void;
  error: string;
}) {
  return (
    <>
      <div className="rounded-2xl border border-dourado-200/15 bg-bordo-200/30 p-4">
        <div className="flex items-start gap-3">
          <MessageCircleQuestion
            className="mt-0.5 h-5 w-5 shrink-0 text-dourado-200/65"
            strokeWidth={1.4}
          />

          <div>
            <p className="font-serif text-sm text-creme/80">
              Antes de continuar
            </p>

            <p className="mt-2 font-serif text-xs leading-relaxed text-creme/45">
              Para tiragens avulsas,
              informe uma pergunta ou tema
              por campo. Caso sua questão
              envolva vários assuntos ou
              precise de uma análise mais
              aprofundada, a Isis poderá
              orientar sobre a tiragem mais
              adequada.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {fields.map((field) => {
          const isConsulta =
            field.categoria ===
            'consulta';

          return (
            <div
              key={field.key}
              className="rounded-2xl border border-dourado-200/15 bg-bordo-200/25 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-base text-creme/90">
                    {field.serviceName}
                  </p>

                  <p className="mt-1 font-serif text-[10px] tracking-[0.12em] text-dourado-200/45 uppercase">
                    {isConsulta
                      ? 'Consulta por tempo'
                      : `Pergunta ${field.itemNumber}`}
                  </p>
                </div>

                {isConsulta && (
                  <Clock3
                    className="h-4 w-4 shrink-0 text-dourado-200/40"
                    strokeWidth={1.4}
                  />
                )}
              </div>

              {isConsulta ? (
                <>
                  <p className="mt-4 font-serif text-xs leading-relaxed text-creme/40">
                    Na consulta por tempo
                    você pode abordar várias
                    questões dentro do período
                    contratado. Se quiser,
                    conte abaixo os principais
                    assuntos que deseja
                    priorizar.
                  </p>

                  <textarea
                    value={
                      answers[field.key] ||
                      ''
                    }
                    onChange={(event) =>
                      updateAnswer(
                        field.key,
                        event.target.value
                      )
                    }
                    maxLength={1000}
                    rows={5}
                    placeholder="Ex.: Quero priorizar minha vida amorosa e depois falar sobre trabalho..."
                    className="mt-4 w-full resize-none rounded-2xl border border-dourado-200/15 bg-bordo-300/60 px-4 py-3 font-serif text-sm leading-relaxed text-creme/80 outline-none transition placeholder:text-creme/25 focus:border-dourado-200/40"
                  />

                  <div className="mt-2 flex justify-between gap-3">
                    <span className="font-serif text-[9px] text-creme/25">
                      Opcional
                    </span>

                    <span className="font-serif text-[9px] text-creme/25">
                      {
                        (
                          answers[
                            field.key
                          ] || ''
                        ).length
                      }
                      /1000
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-4 font-serif text-xs leading-relaxed text-creme/40">
                    Escreva de forma clara
                    qual pergunta ou situação
                    você deseja analisar.
                  </p>

                  <textarea
                    value={
                      answers[field.key] ||
                      ''
                    }
                    onChange={(event) =>
                      updateAnswer(
                        field.key,
                        event.target.value
                      )
                    }
                    maxLength={600}
                    rows={5}
                    placeholder="Digite sua pergunta ou explique brevemente a situação..."
                    className="mt-4 w-full resize-none rounded-2xl border border-dourado-200/15 bg-bordo-300/60 px-4 py-3 font-serif text-sm leading-relaxed text-creme/80 outline-none transition placeholder:text-creme/25 focus:border-dourado-200/40"
                  />

                  <div className="mt-2 flex justify-end">
                    <span className="font-serif text-[9px] text-creme/25">
                      {
                        (
                          answers[
                            field.key
                          ] || ''
                        ).length
                      }
                      /600
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <ErrorBox error={error} />

      <Ornament />
    </>
  );
}

/* =========================================================
   AGENDAMENTO
========================================================= */

function ScheduleStep({
  dates,
  selectedDate,
  onSelectDate,
  slots,
  selectedSlot,
  onSelectSlot,
  loading,
  durationMinutes,
  error,
}: {
  dates: {
    value: string;
    weekday: string;
    day: string;
    month: string;
  }[];
  selectedDate: string;
  onSelectDate: (
    date: string
  ) => void;
  slots: AvailableSlot[];
  selectedSlot:
    | AvailableSlot
    | null;
  onSelectSlot: (
    slot: AvailableSlot
  ) => void;
  loading: boolean;
  durationMinutes: number;
  error: string;
}) {
  return (
    <>
      <div className="rounded-2xl border border-dourado-200/15 bg-bordo-200/30 p-4">
        <div className="flex items-start gap-3">
          <Clock3
            className="mt-0.5 h-5 w-5 shrink-0 text-dourado-200/65"
            strokeWidth={1.4}
          />

          <div>
            <p className="font-serif text-sm text-creme/80">
              Tempo reservado
            </p>

            <p className="mt-1 font-serif text-xs leading-relaxed text-creme/40">
              Este atendimento reservará{' '}
              <span className="text-dourado-200/80">
                {formatDuration(
                  durationMinutes
                )}
              </span>{' '}
              na agenda.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="font-serif text-[10px] tracking-[0.15em] text-dourado-200/45 uppercase">
            Escolha o dia
          </p>

          <p className="font-serif text-[9px] text-creme/25">
            Seg. a sex. • 10h–18h
          </p>
        </div>

        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-2">
          {dates.map((date) => {
            const active =
              selectedDate ===
              date.value;

            return (
              <button
                key={date.value}
                type="button"
                onClick={() =>
                  onSelectDate(
                    date.value
                  )
                }
                className={`min-w-[76px] shrink-0 rounded-2xl border px-3 py-3 text-center transition ${
                  active
                    ? 'border-dourado-200/60 bg-dourado-200/10'
                    : 'border-dourado-200/12 bg-bordo-200/25'
                }`}
              >
                <p
                  className={`font-serif text-[9px] tracking-[0.1em] uppercase ${
                    active
                      ? 'text-dourado-200'
                      : 'text-creme/30'
                  }`}
                >
                  {date.weekday}
                </p>

                <p
                  className={`mt-1 font-serif text-xl ${
                    active
                      ? 'text-dourado-200'
                      : 'text-creme/70'
                  }`}
                >
                  {date.day}
                </p>

                <p className="mt-0.5 font-serif text-[9px] text-creme/30 uppercase">
                  {date.month}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="font-serif text-[10px] tracking-[0.15em] text-dourado-200/45 uppercase">
          Horários disponíveis
        </p>

        {loading ? (
          <div className="flex min-h-36 items-center justify-center">
            <Loader2
              className="h-5 w-5 animate-spin text-dourado-200/60"
              strokeWidth={1.5}
            />
          </div>
        ) : slots.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const active =
                selectedSlot?.start_at ===
                slot.start_at;

              return (
                <button
                  key={slot.start_at}
                  type="button"
                  onClick={() =>
                    onSelectSlot(slot)
                  }
                  className={`rounded-xl border px-2 py-3 font-serif text-sm transition ${
                    active
                      ? 'border-dourado-200 bg-dourado-200 text-bordo-300'
                      : 'border-dourado-200/15 bg-bordo-200/25 text-creme/70 hover:border-dourado-200/35'
                  }`}
                >
                  {formatTime(
                    slot.start_at
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-dourado-200/10 bg-bordo-200/20 px-5 py-7 text-center">
            <CalendarDays
              className="mx-auto h-6 w-6 text-dourado-200/30"
              strokeWidth={1.3}
            />

            <p className="mt-3 font-serif text-sm text-creme/55">
              Nenhum horário disponível
              neste dia.
            </p>

            <p className="mt-1 font-serif text-[10px] leading-relaxed text-creme/30">
              Escolha outra data para
              continuar.
            </p>
          </div>
        )}
      </div>

      {selectedSlot && (
        <div className="mt-5 rounded-2xl border border-dourado-200/25 bg-dourado-200/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dourado-200/10">
              <Check
                className="h-4 w-4 text-dourado-200"
                strokeWidth={1.7}
              />
            </div>

            <div>
              <p className="font-serif text-xs text-creme/45">
                Horário selecionado
              </p>

              <p className="mt-0.5 font-serif text-sm text-dourado-200">
                {formatFullDate(
                  selectedSlot.start_at
                )}{' '}
                às{' '}
                {formatTime(
                  selectedSlot.start_at
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <ErrorBox error={error} />

      <Ornament />
    </>
  );
}

/* =========================================================
   REVISÃO
========================================================= */

function ReviewStep({
  items,
  answers,
  fields,
  valorTotal,
  durationMinutes,
  selectedSlot,
  formatPrice,
}: {
  items: ReturnType<
    typeof useCart
  >['items'];
  answers: Record<string, string>;
  fields: QuestionAnswer[];
  valorTotal: number;
  durationMinutes: number;
  selectedSlot:
    | AvailableSlot
    | null;
  formatPrice: (value: number) => string;
}) {
  return (
    <>
      <ReviewCard title="Atendimento">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3"
            >
              <div>
                <p className="font-serif text-sm text-creme/75">
                  {item.nome}
                </p>

                {item.quantidade > 1 && (
                  <p className="mt-0.5 font-serif text-[10px] text-creme/30">
                    {item.quantidade} unidades
                  </p>
                )}
              </div>

              <p className="font-serif text-sm text-dourado-200/80">
                {formatPrice(
                  item.preco *
                    item.quantidade
                )}
              </p>
            </div>
          ))}
        </div>
      </ReviewCard>

      <div className="mt-4">
        <ReviewCard title="Data e horário">
          {selectedSlot ? (
            <>
              <p className="font-serif text-base text-creme/80">
                {formatFullDate(
                  selectedSlot.start_at
                )}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <Clock3
                  className="h-4 w-4 text-dourado-200/50"
                  strokeWidth={1.4}
                />

                <p className="font-serif text-sm text-dourado-200">
                  {formatTime(
                    selectedSlot.start_at
                  )}
                  {' — '}
                  {formatTime(
                    selectedSlot.end_at
                  )}
                </p>
              </div>

              <p className="mt-2 font-serif text-[10px] text-creme/30">
                Duração reservada:{' '}
                {formatDuration(
                  durationMinutes
                )}
              </p>
            </>
          ) : null}
        </ReviewCard>
      </div>

      <div className="mt-4">
        <ReviewCard title="Perguntas e temas">
          <div className="space-y-4">
            {fields.map((field) => {
              const answer =
                answers[field.key]?.trim();

              return (
                <div
                  key={field.key}
                  className="border-b border-dourado-200/10 pb-3 last:border-0 last:pb-0"
                >
                  <p className="font-serif text-[10px] tracking-[0.08em] text-dourado-200/50 uppercase">
                    {field.serviceName}
                  </p>

                  <p className="mt-1.5 font-serif text-sm leading-relaxed text-creme/65">
                    {answer ||
                      'Nenhum tema informado.'}
                  </p>
                </div>
              );
            })}
          </div>
        </ReviewCard>
      </div>

      <div className="mt-4 rounded-2xl border border-dourado-200/25 bg-dourado-200/5 p-5">
        <div className="flex items-center justify-between">
          <span className="font-serif text-xs tracking-[0.1em] text-creme/45 uppercase">
            Total
          </span>

          <span className="font-serif text-2xl font-semibold text-gradient-gold">
            {formatPrice(valorTotal)}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-dourado-200/10 bg-bordo-200/20 p-4">
        <p className="font-serif text-[10px] leading-relaxed text-creme/35">
          O horário será validado
          novamente antes da confirmação
          do pedido. A seleção desta tela
          ainda não garante a reserva.
        </p>
      </div>

      <Ornament />
    </>
  );
}

/* =========================================================
   COMPONENTES AUXILIARES
========================================================= */

function Progress({
  current,
}: {
  current: number;
}) {
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {[1, 2, 3, 4].map(
        (number) => (
          <div
            key={number}
            className={`h-1.5 w-8 rounded-full ${
              number <= current
                ? 'bg-dourado-200'
                : 'bg-dourado-200/15'
            }`}
          />
        )
      )}
    </div>
  );
}

function ReviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dourado-200/15 bg-bordo-200/25 p-5">
      <p className="mb-4 font-serif text-[10px] tracking-[0.15em] text-dourado-200/45 uppercase">
        {title}
      </p>

      {children}
    </div>
  );
}

function ErrorBox({
  error,
}: {
  error: string;
}) {
  if (!error) return null;

  return (
    <div className="mt-5 rounded-2xl border border-red-300/15 bg-red-500/5 px-4 py-3">
      <p className="text-center font-serif text-xs leading-relaxed text-red-300/80">
        {error}
      </p>
    </div>
  );
}

function FooterMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="mt-3 text-center font-serif text-[10px] text-creme/25">
      {children}
    </p>
  );
}

function Ornament() {
  return (
    <div className="mt-5 flex items-center gap-3">
      <div className="ornament-line flex-1" />

      <span className="text-[9px] text-dourado-200/30">
        ✦
      </span>

      <div className="ornament-line flex-1" />
    </div>
  );
}

function CheckoutStepItem({
  number,
  title,
  description,
  calendar = false,
}: {
  number: string;
  title: string;
  description: string;
  calendar?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-dourado-200/10 bg-bordo-200/25 px-4 py-4 last:border-b-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dourado-200/20 font-serif text-xs text-dourado-200">
        {number}
      </div>

      <div className="flex-1">
        <p className="font-serif text-sm text-creme/75">
          {title}
        </p>

        <p className="mt-0.5 font-serif text-[10px] text-creme/30">
          {description}
        </p>
      </div>

      {calendar ? (
        <CalendarDays
          className="h-4 w-4 text-dourado-200/25"
          strokeWidth={1.4}
        />
      ) : (
        <ChevronRight
          className="h-4 w-4 text-dourado-200/25"
          strokeWidth={1.4}
        />
      )}
    </div>
  );
}

/* =========================================================
   FUNÇÕES DE DATA
========================================================= */

function generateAvailableDates(
  amount: number
) {
  const dates: {
    value: string;
    weekday: string;
    day: string;
    month: string;
  }[] = [];

  const cursor = new Date();

  cursor.setHours(
    12,
    0,
    0,
    0
  );

  /*
    Começamos hoje.

    A função do Supabase já remove
    horários que ficaram no passado.
  */

  while (dates.length < amount) {
    const dayOfWeek =
      cursor.getDay();

    if (
      dayOfWeek !== 0 &&
      dayOfWeek !== 6
    ) {
      dates.push({
        value:
          formatDateForDatabase(
            cursor
          ),

        weekday:
          new Intl.DateTimeFormat(
            'pt-BR',
            {
              weekday: 'short',
              timeZone:
                SAO_PAULO_TIMEZONE,
            }
          )
            .format(cursor)
            .replace('.', ''),

        day:
          new Intl.DateTimeFormat(
            'pt-BR',
            {
              day: '2-digit',
              timeZone:
                SAO_PAULO_TIMEZONE,
            }
          ).format(cursor),

        month:
          new Intl.DateTimeFormat(
            'pt-BR',
            {
              month: 'short',
              timeZone:
                SAO_PAULO_TIMEZONE,
            }
          )
            .format(cursor)
            .replace('.', ''),
      });
    }

    cursor.setDate(
      cursor.getDate() + 1
    );
  }

  return dates;
}

function formatDateForDatabase(
  date: Date
) {
  const formatter =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone:
          SAO_PAULO_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    );

  return formatter.format(date);
}

function formatTime(
  isoDate: string
) {
  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone:
        SAO_PAULO_TIMEZONE,
    }
  ).format(new Date(isoDate));
}

function formatFullDate(
  isoDate: string
) {
  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      timeZone:
        SAO_PAULO_TIMEZONE,
    }
  ).format(new Date(isoDate));
}

function formatDuration(
  minutes: number
) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(minutes / 60);

  const remaining =
    minutes % 60;

  if (remaining === 0) {
    return hours === 1
      ? '1 hora'
      : `${hours} horas`;
  }

  return `${hours}h ${remaining}min`;
}

function saveCheckoutData(
  data: {
    questions: {
      serviceId: number;
      serviceName: string;
      categoria: string;
      itemNumber: number;
      question: string;
    }[];
    durationMinutes: number;
    selectedDate: string;
    selectedSlot:
      | AvailableSlot
      | null;
  }
) {
  try {
    sessionStorage.setItem(
      CHECKOUT_STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch {
    // Checkout continua funcionando.
  }
}
