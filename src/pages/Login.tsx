import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
import logoIcon from '@/assets/logo-icon.png';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isCustomDomain =
    !window.location.hostname.includes('lovable.app') &&
    !window.location.hostname.includes('lovableproject.com') &&
    !window.location.hostname.includes('localhost');

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      if (isCustomDomain) {
        // Custom domain: bypass auth-bridge
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            skipBrowserRedirect: true,
          },
        });
        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      } else {
        const { error } = await lovable.auth.signInWithOAuth('google', {
          redirect_uri: window.location.origin,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao entrar com Google');
      setGoogleLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verifique seu email para confirmar o cadastro!');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        toast.error('Email ou senha incorretos.');
      } else {
        navigate('/');
      }
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5 bg-card p-6 rounded-2xl border border-border shadow-lg">
        <div className="flex items-center justify-center">
          <img src={logoIcon} alt="Kompas" className="w-12 h-12 rounded-xl" />
        </div>
        <h1 className="text-lg font-bold text-foreground text-center">
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </h1>

        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-secondary text-sm font-medium text-foreground transition-all disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          )}
          Continuar com Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            {mode === 'login' ? 'Entrar com email' : 'Criar conta'}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          {mode === 'login' ? (
            <>
              Não tem conta?{' '}
              <button onClick={() => setMode('signup')} className="text-primary font-medium hover:underline">
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button onClick={() => setMode('login')} className="text-primary font-medium hover:underline">
                Entrar
              </button>
            </>
          )}
        </p>

        <a href="/" className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Voltar ao mapa
        </a>
      </div>
    </div>
  );
}
