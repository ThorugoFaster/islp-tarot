import { useEffect, useState } from 'react';
import { Menu, X, Moon } from 'lucide-react';
import { menuItems } from '@/data/services';

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleNav = (href: string) => {
    setOpen(false);
    const el = document.getElementById(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-[480px] bg-bordo-300/95 backdrop-blur-md border-b border-dourado-200/15">
        <div className="flex items-center justify-between px-5 h-14">
          <button
            onClick={() => handleNav('inicio')}
            className="flex items-center gap-2"
            aria-label="ISLP Tarot — Início"
          >
            <Moon className="w-5 h-5 text-dourado-200" strokeWidth={1.5} />
            <span className="font-serif text-lg tracking-[0.15em] text-gradient-gold font-semibold">
              ISLP TAROT
            </span>
          </button>
          <button
            onClick={() => setOpen(true)}
            className="p-2 -mr-2 text-dourado-200"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav className="relative w-full max-w-[480px] h-full bg-bordo-200 border-l border-dourado-200/20 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between px-5 h-14 border-b border-dourado-200/15">
              <span className="font-serif text-lg tracking-[0.15em] text-gradient-gold font-semibold">
                MENU
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 -mr-2 text-dourado-200"
                aria-label="Fechar menu"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
            <ul className="flex flex-col px-5 py-4">
              {menuItems.map((item, i) => (
                <li key={item.href} className="border-b border-dourado-200/8">
                  <button
                    onClick={() => handleNav(item.href)}
                    className="w-full text-left py-4 font-serif text-2xl text-creme/90 hover:text-dourado-200 transition-colors duration-300"
                    style={{
                      animation: `fadeUp 0.4s ease-out ${i * 0.06}s both`,
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-auto px-5 py-6">
              <div className="ornament-line w-full mb-4" />
              <p className="font-serif text-sm tracking-[0.2em] text-dourado-200/60 text-center">
                TAROT • ORIENTAÇÃO • CLAREZA
              </p>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
