import { FormEvent, useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  UserRound,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  error?: string;
};

export function LoginModal() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    function handleOpen() {
      setErro('');
      setSenha('');
      setOpen(true);
    }

    document.addEventListener('open-login', handleOpen);

    return () => {
      document.removeEventListener('open-login', handleOpen);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || !senha) {
      setErro('Preencha seu usuário e sua senha.');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const { data, error } =
        await supabase.functions.invoke<LoginResponse>(
          'login-username',
          {
            body: {
              username: cleanUsername,
              password: senha,
            },
          }
        );

      if (
        error ||
        !data?.access_token ||
        !data?.refresh_token
      ) {
        setErro(
          data?.error ||
            'Usuário ou senha incorretos.'
        );
        return;
      }

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      if (
        sessionError ||
        !sessionData.user
      ) {
        setErro(
          'Não foi possível iniciar sua sessão.'
        );
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();

        setErro(
          'Não foi possível carregar sua conta.'
        );

        return;
      }

      setSenha('');
      setErro('');
      setOpen(false);

      if (profile.role === 'admin') {
        setTimeout(() => {
          document.dispatchEvent(
            new CustomEvent('open-admin-panel')
          );
        }, 150);
      }
    } catch (error) {
      console.error(
        'Erro ao realizar login:',
        error
      );

      setErro(
        'Não foi possível realizar o login.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-[480px] rounded-t-[28px] sm:rounded-[28px] border border-dourado-200/20 bg-bordo-300 px-6 pb-8 pt-6 shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fechar"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-dourado-200/20 text-dourado-200/60"
        >
          <X
            className="h-4 w-4"
            strokeWidth={1.5}
          />
        </button>

        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="ornament-line w-10" />

          <span className="text-xs text-dourado-200/50">
            ✦
          </span>

          <div className="ornament-line w-10" />
        </div>

        <form onSubmit={handleLogin}>
          <div className="text-center">
            <LockKeyhole
              className="mx-auto h-5 w-5 text-dourado-200/45"
              strokeWidth={1.3}
            />

            <h2 className="mt-4 font-serif text-xl font-semibold tracking-[0.15em] text-gradient-gold">
              ENTRAR
            </h2>

            <p className="mx-auto mt-3 max-w-[280px] font-serif text-sm leading-relaxed text-creme/50">
              Acesse sua conta na ISLP Tarot.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center rounded-full border border-dourado-200/20 bg-bordo-200/60 px-4 focus-within:border-dourado-200/45">
              <UserRound
                className="mr-3 h-4 w-4 text-dourado-200/40"
                strokeWidth={1.4}
              />

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Usuário"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                className="h-12 w-full bg-transparent font-serif text-sm text-creme/80 outline-none placeholder:text-creme/30"
              />
            </div>

            <div className="flex items-center rounded-full border border-dourado-200/20 bg-bordo-200/60 px-4 focus-within:border-dourado-200/45">
              <LockKeyhole
                className="mr-3 h-4 w-4 text-dourado-200/40"
                strokeWidth={1.4}
              />

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={senha}
                onChange={(event) =>
                  setSenha(event.target.value)
                }
                placeholder="Senha"
                autoComplete="current-password"
                className="h-12 w-full bg-transparent font-serif text-sm text-creme/80 outline-none placeholder:text-creme/30"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? 'Ocultar senha'
                    : 'Mostrar senha'
                }
                className="ml-2 text-dourado-200/40"
              >
                {showPassword ? (
                  <EyeOff
                    className="h-4 w-4"
                    strokeWidth={1.4}
                  />
                ) : (
                  <Eye
                    className="h-4 w-4"
                    strokeWidth={1.4}
                  />
                )}
              </button>
            </div>
          </div>

          {erro && (
            <p className="mt-4 text-center font-serif text-xs text-red-300/80">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center rounded-full border border-dourado-200/45 bg-dourado-200/10 px-6 py-3.5 font-serif text-[11px] tracking-[0.18em] text-dourado-200 uppercase disabled:opacity-50"
          >
            {loading ? (
              <Loader2
                className="h-4 w-4 animate-spin"
                strokeWidth={1.5}
              />
            ) : (
              'ENTRAR'
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 mt-8">
          <div className="ornament-line flex-1" />

          <span className="text-dourado-200/35 text-[10px]">
            ✦
          </span>

          <div className="ornament-line flex-1" />
        </div>
      </div>
    </div>
  );
}
