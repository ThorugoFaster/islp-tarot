import {
  FormEvent,
  useEffect,
  useState,
} from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Screen = 'login' | 'register';

type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  error?: string;
};

export function LoginModal() {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] =
    useState<Screen>('login');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    function handleOpen() {
      setErro('');
      setSenha('');
      setScreen('login');
      setOpen(true);
    }

    document.addEventListener(
      'open-login',
      handleOpen
    );

    return () => {
      document.removeEventListener(
        'open-login',
        handleOpen
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

  function closeModal() {
    setOpen(false);
    setErro('');
    setSenha('');
    setShowPassword(false);
  }

  function continueAfterAuthentication() {
    const afterLogin =
      sessionStorage.getItem(
        'islp-after-login'
      );

    if (afterLogin === 'checkout') {
      sessionStorage.removeItem(
        'islp-after-login'
      );

      window.setTimeout(() => {
        document.dispatchEvent(
          new CustomEvent('open-checkout')
        );
      }, 150);

      return true;
    }

    return false;
  }

  async function handleLogin(
    event: FormEvent
  ) {
    event.preventDefault();

    const cleanUsername =
      username.trim().toLowerCase();

    if (!cleanUsername || !senha) {
      setErro(
        'Preencha seu usuário e sua senha.'
      );
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

      const continued =
        continueAfterAuthentication();

      if (continued) {
        return;
      }

      if (profile.role === 'admin') {
        window.setTimeout(() => {
          document.dispatchEvent(
            new CustomEvent(
              'open-admin-panel'
            )
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

  async function handleRegister(
    event: FormEvent
  ) {
    event.preventDefault();

    const cleanUsername =
      username.trim().toLowerCase();
    const cleanEmail =
      email.trim().toLowerCase();
    const cleanPhone = telefone.trim();

    if (!cleanUsername) {
      setErro(
        'Escolha um nome de usuário.'
      );
      return;
    }

    if (cleanUsername.length < 3) {
      setErro(
        'Seu usuário precisa ter pelo menos 3 caracteres.'
      );
      return;
    }

    if (
      !/^[a-z0-9._]+$/.test(
        cleanUsername
      )
    ) {
      setErro(
        'Use apenas letras, números, ponto ou underline no usuário.'
      );
      return;
    }

    if (!cleanEmail) {
      setErro('Digite seu e-mail.');
      return;
    }

    if (senha.length < 6) {
      setErro(
        'Sua senha precisa ter pelo menos 6 caracteres.'
      );
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const { data, error } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password: senha,

          options: {
            data: {
              nome: cleanUsername,
              username: cleanUsername,
              telefone:
                cleanPhone || null,
            },
          },
        });

      if (error) {
        const message =
          error.message.toLowerCase();

        if (
          message.includes(
            'already registered'
          ) ||
          message.includes(
            'already been registered'
          ) ||
          message.includes(
            'user already registered'
          )
        ) {
          setErro(
            'Este e-mail já possui uma conta.'
          );
        } else {
          console.error(
            'Erro no cadastro:',
            error
          );

          setErro(
            'Não foi possível criar sua conta. Tente novamente.'
          );
        }

        return;
      }

      if (!data.user) {
        setErro(
          'Não foi possível criar sua conta.'
        );
        return;
      }

      if (!data.session) {
        setErro(
          'Conta criada. Entre com seu usuário e senha para continuar.'
        );

        setScreen('login');
        setSenha('');
        return;
      }

      const { error: profileError } =
        await supabase
          .from('profiles')
          .update({
            nome: cleanUsername,
            username: cleanUsername,
            telefone:
              cleanPhone || null,
          })
          .eq('id', data.user.id);

      if (profileError) {
        console.error(
          'Erro ao configurar perfil:',
          profileError
        );

        const { error: insertError } =
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              nome: cleanUsername,
              username: cleanUsername,
              telefone:
                cleanPhone || null,
              role: 'cliente',
            });

        if (insertError) {
          console.error(
            'Erro ao criar perfil:',
            insertError
          );

          await supabase.auth.signOut();

          setErro(
            'Sua conta foi criada, mas não foi possível configurar seu usuário.'
          );

          return;
        }
      }

      setSenha('');
      setErro('');
      setOpen(false);

      continueAfterAuthentication();
    } catch (error) {
      console.error(
        'Erro ao criar conta:',
        error
      );

      setErro(
        'Não foi possível criar sua conta. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center">
      <div className="relative max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] border border-dourado-200/20 bg-bordo-300 px-6 pb-8 pt-6 shadow-2xl sm:rounded-[28px]">

        <button
          type="button"
          onClick={closeModal}
          aria-label="Fechar"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-dourado-200/20 text-dourado-200/60 transition hover:bg-dourado-200/10"
        >
          <X
            className="h-4 w-4"
            strokeWidth={1.5}
          />
        </button>

        {screen === 'register' && (
          <button
            type="button"
            onClick={() => {
              setErro('');
              setSenha('');
              setScreen('login');
            }}
            aria-label="Voltar"
            className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-dourado-200/20 text-dourado-200/60 transition hover:bg-dourado-200/10"
          >
            <ArrowLeft
              className="h-4 w-4"
              strokeWidth={1.5}
            />
          </button>
        )}

        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="ornament-line w-10" />

          <span className="text-xs text-dourado-200/50">
            ✦
          </span>

          <div className="ornament-line w-10" />
        </div>

        {screen === 'login' && (
          <form onSubmit={handleLogin}>
            <ModalHeader
              title="ENTRAR"
              description="Acesse sua conta na ISLP Tarot."
            />

            <div className="mt-8 space-y-4">
              <TextInput
                icon={<UserRound />}
                type="text"
                value={username}
                onChange={setUsername}
                placeholder="Usuário"
                autoComplete="username"
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
            <ModalHeader
              title="CRIAR CONTA"
              description="Crie sua conta para acompanhar seus atendimentos na ISLP Tarot."
            />

            <div className="mt-8 space-y-4">
              <TextInput
                icon={<UserRound />}
                type="text"
                value={username}
                onChange={setUsername}
                placeholder="Escolha seu usuário"
                autoComplete="username"
              />

              <TextInput
                icon={<Mail />}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="E-mail"
                autoComplete="email"
              />

              <TextInput
                icon={<Phone />}
                type="tel"
                value={telefone}
                onChange={setTelefone}
                placeholder="Telefone (opcional)"
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
              Seu e-mail e telefone são utilizados apenas
              para sua conta e sua experiência no site.
            </p>
          </form>
        )}

        <div className="mt-8 flex items-center gap-3">
          <div className="ornament-line flex-1" />

          <span className="text-[10px] text-dourado-200/35">
            ✦
          </span>

          <div className="ornament-line flex-1" />
        </div>
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <LockKeyhole
        className="mx-auto h-5 w-5 text-dourado-200/45"
        strokeWidth={1.3}
      />

      <h2 className="mt-4 font-serif text-xl font-semibold tracking-[0.15em] text-gradient-gold">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-[300px] font-serif text-sm leading-relaxed text-creme/50">
        {description}
      </p>
    </div>
  );
}

function TextInput({
  icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  icon: React.ReactElement;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
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
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoCapitalize={
          type === 'text'
            ? 'none'
            : undefined
        }
        spellCheck={
          type === 'text'
            ? false
            : undefined
        }
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
        type={
          show
            ? 'text'
            : 'password'
        }
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Senha"
        autoComplete="current-password"
        className="h-12 w-full bg-transparent font-serif text-sm text-creme/80 outline-none placeholder:text-creme/30"
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={
          show
            ? 'Ocultar senha'
            : 'Mostrar senha'
        }
        className="ml-2 text-dourado-200/40"
      >
        {show ? (
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
        <Loader2
          className="h-4 w-4 animate-spin"
          strokeWidth={1.5}
        />
      ) : (
        children
      )}
    </button>
  );
}

function ErrorMessage({
  message,
}: {
  message: string;
}) {
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
