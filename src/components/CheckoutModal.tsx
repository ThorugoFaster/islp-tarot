import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  MessageCircleQuestion,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';

type CheckoutStep = 'summary' | 'questions';

type QuestionAnswer = {
  key: string;
  serviceId: number;
  serviceName: string;
  categoria: string;
  itemNumber: number;
  text: string;
};

const QUESTIONS_STORAGE_KEY =
  'islp-checkout-questions';

export function CheckoutModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] =
    useState<CheckoutStep>('summary');

  const [answers, setAnswers] = useState<
    Record<string, string>
  >({});

  const [error, setError] = useState('');

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

  useEffect(() => {
    function handleOpenCheckout() {
      setError('');
      setStep('summary');

      try {
        const saved =
          sessionStorage.getItem(
            QUESTIONS_STORAGE_KEY
          );

        if (saved) {
          const parsed = JSON.parse(saved);

          if (
            parsed &&
            typeof parsed === 'object'
          ) {
            setAnswers(parsed);
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
      // Se o navegador bloquear o sessionStorage,
      // o checkout continua funcionando normalmente.
    }
  }, [answers]);

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

  function handleContinueToSchedule() {
    const missingQuestion =
      questionFields.find(
        (field) =>
          field.categoria !== 'consulta' &&
          !answers[field.key]?.trim()
      );

    if (missingQuestion) {
      setError(
        'Preencha sua pergunta ou o tema que deseja analisar antes de continuar.'
      );

      return;
    }

    setError('');

    const checkoutQuestions =
      questionFields.map((field) => ({
        serviceId: field.serviceId,
        serviceName: field.serviceName,
        categoria: field.categoria,
        itemNumber: field.itemNumber,
        question:
          answers[field.key]?.trim() || '',
      }));

    sessionStorage.setItem(
      'islp-checkout-data',
      JSON.stringify({
        questions: checkoutQuestions,
      })
    );

    /*
      PRÓXIMA ETAPA:
      Aqui abriremos a seleção real
      de data e horário.
    */

    console.log(
      'Perguntas do checkout:',
      checkoutQuestions
    );
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
              {step === 'summary'
                ? 'SEU ATENDIMENTO'
                : 'SUAS PERGUNTAS'}
            </h2>

            <p className="mt-2 max-w-[300px] font-serif text-xs leading-relaxed text-creme/45">
              {step === 'summary'
                ? 'Vamos preparar os detalhes do seu atendimento.'
                : 'Conte o que você deseja consultar nas cartas.'}
            </p>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* PROGRESSO */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="h-1.5 w-8 rounded-full bg-dourado-200" />

            <div
              className={`h-1.5 w-8 rounded-full ${
                step === 'questions'
                  ? 'bg-dourado-200'
                  : 'bg-dourado-200/15'
              }`}
            />

            <div className="h-1.5 w-8 rounded-full bg-dourado-200/15" />

            <div className="h-1.5 w-8 rounded-full bg-dourado-200/15" />
          </div>

          {step === 'summary' ? (
            <SummaryStep
              items={items}
              quantidadeTotal={
                quantidadeTotal
              }
              valorTotal={valorTotal}
              formatPrice={formatPrice}
            />
          ) : (
            <QuestionsStep
              fields={questionFields}
              answers={answers}
              updateAnswer={updateAnswer}
              error={error}
            />
          )}
        </div>

        {/* RODAPÉ */}
        <div className="border-t border-dourado-200/15 bg-bordo-200/30 px-5 pb-6 pt-5">
          {step === 'summary' ? (
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

              <p className="mt-3 text-center font-serif text-[10px] text-creme/25">
                Você ainda não será cobrada
                nesta etapa.
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={
                  handleContinueToSchedule
                }
                className="flex w-full items-center justify-center gap-2 rounded-full bg-dourado-200 px-6 py-4 font-serif text-[11px] font-semibold tracking-[0.18em] text-bordo-300 transition active:scale-[0.99]"
              >
                CONTINUAR PARA AGENDAMENTO

                <CalendarDays
                  className="h-4 w-4"
                  strokeWidth={1.7}
                />
              </button>

              <p className="mt-3 text-center font-serif text-[10px] text-creme/25">
                Na próxima etapa você
                escolherá a data e o horário.
              </p>
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

      {error && (
        <div className="mt-5 rounded-2xl border border-red-300/15 bg-red-500/5 px-4 py-3">
          <p className="text-center font-serif text-xs leading-relaxed text-red-300/80">
            {error}
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <div className="ornament-line flex-1" />

        <span className="text-[9px] text-dourado-200/30">
          ✦
        </span>

        <div className="ornament-line flex-1" />
      </div>
    </>
  );
}

/* =========================================================
   ITEM DO PASSO
========================================================= */

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
