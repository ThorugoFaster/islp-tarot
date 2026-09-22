import { useReveal } from '@/hooks/useReveal';

const steps = [
  { num: '01', label: 'Escolha sua leitura' },
  { num: '02', label: 'Clique em agendar' },
  { num: '03', label: 'Converse diretamente pelo WhatsApp' },
  { num: '04', label: 'Combine o atendimento' },
];

export function HowItWorks() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="como-funciona" className="relative px-5 py-16 bg-bordo-300">
      <div ref={ref} className={`flex flex-col items-center text-center ${visible ? 'is-visible' : 'reveal'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="ornament-line w-12" />
          <div className="w-1.5 h-1.5 rounded-full bg-dourado-200/60" />
          <div className="ornament-line w-12" />
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-[0.15em] text-gradient-gold">
          COMO FUNCIONA
        </h2>
      </div>

      <div className="relative mt-12">
        <div className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-dourado-200/40 via-dourado-200/20 to-transparent" />

        <div className="flex flex-col gap-8">
          {steps.map((step, i) => (
            <Step key={step.num} step={step} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({
  step,
  delay,
}: {
  step: { num: string; label: string };
  delay: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`relative flex items-center gap-5 pl-0 ${visible ? 'is-visible' : 'reveal'}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative shrink-0 z-10 w-14 h-14 rounded-full bg-bordo-200 border-2 border-dourado-200/40 flex items-center justify-center gold-glow">
        <span className="font-serif text-lg font-semibold text-gradient-gold">
          {step.num}
        </span>
      </div>
      <p className="font-serif text-lg text-creme/85 leading-[140%]">
        {step.label}
      </p>
    </div>
  );
}
