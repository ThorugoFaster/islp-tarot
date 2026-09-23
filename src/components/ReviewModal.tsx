import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Screen = 'login' | 'register' | 'review' | 'success';

export function ReviewModal() {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('login');

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [estrelas, setEstrelas] = useState(5);
  const [comentario, setComentario] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setScreen('review');
      }
    }

    checkSession();

    function handleOpen() {
      setErro('');

      supabase.auth.getSession().then(({ data }) => {
        setScreen(data.session ? 'review' : 'login');
        setOpen(true);
      });
    }

    document.addEventListener('open-review-auth', handleOpen);

    return () => {
      document.removeEventListener('open-review-auth', handleOpen);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function closeModal() {
    setOpen(false);
    setErro('');
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    if (!email.trim() || !senha) {
      setErro('Preencha seu e-mail e sua senha.');
      return;
    }

    setLoading(true);
    setErro('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    setLoading(false);

    if (error) {
      setErro('E-mail ou senha incorretos.');
      return;
    }

    setSenha('');
    setScreen('review');
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if (!nome.trim()) {
      setErro('Digite seu nome.');
      return;
    }

    if (!email.trim()) {
      setErro('Digite seu e-mail.');
      return;
    }

    if (senha.length < 6) {
      setErro('Sua senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErro('');

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: {
          nome: nome.trim(),
          telefone: telefone.trim() || null,
        },
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        setErro('Este e-mail já possui uma conta.');
      } else {
        setErro('Não foi possível criar sua conta. Tente novamente.');
      }

      return;
    }

    if (!data.session) {
      setErro(
        'Conta criada, mas não foi possível iniciar a sessão automaticamente.'
      );
      return;
    }

    setSenha('');
    setScreen('review');
  }

  async function handleReview(event: FormEvent) {
    event.preventDefault();

    if (comentario.trim().length < 2) {
      setErro('Escreva um pouquinho sobre sua experiência.');
      return;
    }

    setLoading(true);
    setErro('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setScreen('login');
      setErro('Entre novamente para enviar sua avaliação.');
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      estrelas,
      comentario: comentario.trim(),
      status: 'pendente',
      destaque: false,
    });

    setLoading(false);

    if (error) {
      setErro('Não foi possível enviar sua avaliação. Tente novamente.');
      return;
    }

    setComentario('');
    setEstrelas(5);
    setScreen('success');
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-[480px] max-h-[92vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] border border-dourado-200/20 bg-bordo-300 px-6 pb-8 pt-6 shadow-2xl">

        {/* Fechar */}
        <button
          type="button"
          onClick={closeModal}
          aria-label="Fechar"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-dourado-200/20 text-dourado-200/60 transition hover:bg-dourado-200/10 hover:text-dourado-200"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Ornamento */}
        <div className="mb-5 flex items-center justify-center gap-3">
          <div className="ornament-line w-10" />
          <span className="text-xs text-dourado-200/50">✦</span>
          <div className="ornament-line w-10" />
        </div>

        {screen === 'login' && (
          <form onSubmit={handleLogin}>
            <Header
              title="DEIXE SUA AVALIAÇÃO"
              description="Entre para compartilhar sua experiência."
            />

            <div className="mt-8 space-y-4">
              <Input
                icon={<Mail />}
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />

              <PasswordInput
                value={senha}
                onChange={setSenha}
                show={showPassword}
                setShow={setShowPassword}
              />
            </div>

            <ErrorMessage message={erro} />

            <GoldButton loading={loading}>
              ENTRAR
            </GoldButton>

            <Divider />

            <p className="text-center font-serif text-sm text-creme/55">
              Ainda não possui uma conta?
            </p>

            <button
              type="button"
              onClick={() => {
                setErro('');
                setSenha('');
                setScreen('register');
              }}
              className="mt-4 w-full rounded-full border border-dourado-200/30 px-5 py-3.5 font-serif text-[11px] tracking-[0.18em] text-dourado-200 uppercase transition hover:bg-dourado-200/10"
            >
              CRIAR MINHA CONTA
            </button>
          </form>
        )}

        {screen === 'register' && (
          <form onSubmit={handleRegister}>
            <BackButton
              onClick={() => {
                setErro('');
                setScreen('login');
              }}
            />

            <Header
              title="CRIAR CONTA"
              description="É rapidinho. Depois você já poderá deixar sua avaliação."
            />

            <div className="mt-8 space-y-4">
              <Input
                icon={<UserRound />}
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={setNome}
                autoComplete="name"
              />

              <Input
                icon={<Mail />}
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />

              <Input
                icon={<Phone />}
                type="tel"
                placeholder="Telefone (opcional)"
                value={telefone}
                onChange={setTelefone}
                autoComplete="tel"
              />

              <PasswordInput
                value={senha}
                onChange={setSenha}
                show={showPassword}
                setShow={setShowPassword}
              />
            </div>

            <ErrorMessage message={erro} />

            <GoldButton loading={loading}>
              CRIAR CONTA
            </GoldButton>

            <p className="mt-5 text-center font-serif text-[11px] leading-relaxed text-creme/35">
              Seus dados são utilizados apenas para sua conta e sua experiência
              no site.
            </p>
          </form>
        )}

        {screen === 'review' && (
          <form onSubmit={handleReview}>
            <Header
              title="SUA EXPERIÊNCIA"
              description="Como foi sua leitura com a ISLP Tarot?"
            />

            <div className="mt-8">
              <p className="mb-3 text-center font-serif text-xs tracking-[0.14em] text-creme/50 uppercase">
                Sua avaliação
              </p>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEstrelas(star)}
                    aria-label={`${star} estrelas`}
                    className="p-1 transition-transform active:scale-90"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= estrelas
                          ? 'fill-current text-dourado-200'
                          : 'text-dourado-200/25'
                      }`}
                      strokeWidth={1.3}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={comentario}
              onChange={(event) => setComentario(event.target.value)}
              maxLength={1500}
              rows={6}
              placeholder="Conte um pouco sobre sua experiência..."
              className="mt-7 w-full resize-none rounded-2xl border border-dourado-200/20 bg-bordo-200/60 px-4 py-4 font-serif text-sm leading-relaxed text-creme/80 outline-none placeholder:text-creme/30 focus:border-dourado-200/45"
            />

            <div className="mt-2 text-right font-serif text-[10px] text-creme/25">
              {comentario.length}/1500
            </div>

            <ErrorMessage message={erro} />

            <GoldButton loading={loading}>
              ENVIAR AVALIAÇÃO
            </GoldButton>
          </form>
        )}

        {screen === 'success' && (
          <div className="flex min-h-[330px] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dourado-200/30 bg-dourado-200/5">
              <Check
                className="h-7 w-7 text-dourado-200"
                strokeWidth={1.4}
              />
            </div>

            <h2 className="mt-7 font-serif text-xl tracking-[0.12em] text-gradient-gold">
              OBRIGADA PELO CARINHO
            </h2>

            <span className="mt-4 text-dourado-200/50">✦</span>

            <p className="mt-4 max-w-[280px] font-serif text-sm leading-relaxed text-creme/65">
              Sua avaliação foi enviada
            </p>

            <button
              type="button"
              onClick={closeModal}
              className="mt-8 min-w-[190px] rounded-full border border-dourado-200/35 px-6 py-3.5 font-serif text-[11px] tracking-[0.18em] text-dourado-200 uppercase transition hover:bg-dourado-200/10"
            >
              FECHAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 text-center">
      <div className="mb-3 flex justify-center">
        <LockKeyhole
          className="h-4 w-4 text-dourado-200/45"
          strokeWidth={1.3}
        />
      </div>

      <h2 className="font-serif text-xl font-semibold tracking-[0.12em] text-gradient-gold">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-[280px] font-serif text-sm leading-relaxed text-creme/50">
        {description}
      </p>
    </div>
  );
}

function Input({
  icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  icon: React.ReactElement;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="flex items-center rounded-full border border-dourado-200/20 bg-bordo-200/60 px-4 focus-within:border-dourado-200/45">
      <span className="mr-3 text-dourado-200/40">
        {icon}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-12 w-full bg-transparent font-serif text-sm text-creme/80 outline-none placeholder:text-creme/30"
      />
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  setShow,
}: {
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  setShow: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-dourado-200/20 bg-bordo-200/60 px-4 focus-within:border-dourado-200/45">
      <LockKeyhole
        className="mr-3 h-4 w-4 text-dourado-200/40"
        strokeWidth={1.4}
      />

      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Senha"
        autoComplete="current-password"
        className="h-12 w-full bg-transparent font-serif text-sm text-creme/80 outline-none placeholder:text-creme/30"
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="ml-2 text-dourado-200/40"
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {show ? (
          <EyeOff className="h-4 w-4" strokeWidth={1.4} />
        ) : (
          <Eye className="h-4 w-4" strokeWidth={1.4} />
        )}
      </button>
    </div>
  );
}

function GoldButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-6 flex w-full items-center justify-center rounded-full border border-dourado-200/45 bg-dourado-200/10 px-6 py-3.5 font-serif text-[11px] tracking-[0.18em] text-dourado-200 uppercase transition hover:bg-dourado-200/15 disabled:cursor-wait disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
      ) : (
        children
      )}
    </button>
  );
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;

  return (
    <p className="mt-4 text-center font-serif text-xs leading-relaxed text-red-300/80">
      {message}
    </p>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-dourado-200/10" />
      <span className="font-serif text-[10px] text-creme/25 uppercase">
        ou
      </span>
      <div className="h-px flex-1 bg-dourado-200/10" />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-dourado-200/20 text-dourado-200/60 transition hover:bg-dourado-200/10"
      aria-label="Voltar"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
    </button>
  );
}
