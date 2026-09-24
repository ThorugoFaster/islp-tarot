ALTERAÇÕES NO src/components/Header.tsx

1) No import do lucide-react, adicione:
PackageCheck,

2) Logo depois de handleReview(), adicione:

  function handleMyOrders() {
    setOpen(false);

    setTimeout(() => {
      document.dispatchEvent(
        new CustomEvent('open-my-orders')
      );
    }, 150);
  }

3) Na parte CLIENTE, hoje existe apenas o botão "Deixar avaliação".
Troque o bloco CLIENTE por:

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleMyOrders}
                        className="w-full flex items-center gap-3 rounded-xl border border-dourado-200/25 bg-dourado-200/5 px-4 py-3.5 font-serif text-sm text-dourado-200 transition-all duration-300 hover:bg-dourado-200/10"
                      >
                        <PackageCheck
                          className="w-4 h-4"
                          strokeWidth={1.4}
                        />

                        Meus pedidos
                      </button>

                      <button
                        type="button"
                        onClick={handleReview}
                        className="w-full flex items-center gap-3 rounded-xl border border-dourado-200/25 bg-dourado-200/5 px-4 py-3.5 font-serif text-sm text-dourado-200 transition-all duration-300 hover:bg-dourado-200/10"
                      >
                        <Star
                          className="w-4 h-4"
                          strokeWidth={1.4}
                        />

                        Deixar avaliação
                      </button>
                    </div>
