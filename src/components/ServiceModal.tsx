import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Service } from '@/data/services';

export function ServiceModal({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[480px] max-h-[85vh] rounded-2xl bg-bordo-200 border-2 border-dourado-200/40 flex flex-col animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dourado-200/20 shrink-0">
          <div className="flex items-center gap-2">
            <service.icon className="w-5 h-5 text-dourado-200" strokeWidth={1.5} />
            <span className="font-serif text-sm tracking-[0.1em] text-dourado-200/80">
              DETALHES DA LEITURA
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-dourado-200/70 hover:text-dourado-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-6">
          <h3 className="font-serif text-2xl font-semibold text-gradient-gold mb-4">
            {service.name}
          </h3>

          <div className="flex items-center gap-3 mb-5">
            <span className="font-serif text-3xl font-semibold text-dourado-200">
              {service.price}
            </span>
          </div>

          <div className="ornament-line w-full mb-5" />

          <p className="font-serif text-base text-creme/80 leading-[170%]">
            {service.details ?? service.description}
          </p>

          {service.details && (
            <p className="font-serif text-[15px] text-creme/60 leading-[170%] mt-4">
              {service.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
