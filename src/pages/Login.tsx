import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleGoogle = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Erro ao entrar com Google", description: String(error), variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !acceptTerms) {
      toast({ title: "Aceite os termos de uso para continuar", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { accept_marketing: acceptMarketing },
          },
        });
        if (error) throw error;
        toast({ title: "Conta criada!", description: "Verifique seu email para confirmar o cadastro." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src={logoImg} alt="Kompas" className="h-10 mx-auto mb-4 cursor-pointer" onClick={() => navigate("/")} />
          <h1 className="text-2xl font-bold text-foreground">{isSignUp ? "Criar conta" : "Entrar"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignUp ? "Crie sua conta para salvar favoritos" : "Acesse sua conta"}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 text-sm font-medium gap-3"
          onClick={handleGoogle}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {isSignUp && (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(v) => setAcceptTerms(v === true)}
                />
                <Label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer">
                  Li e aceito os{" "}
                  <button type="button" onClick={() => setShowTerms(true)} className="text-primary underline">
                    termos de uso
                  </button>{" "}
                  e política de privacidade *
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="marketing"
                  checked={acceptMarketing}
                  onCheckedChange={(v) => setAcceptMarketing(v === true)}
                />
                <Label htmlFor="marketing" className="text-xs leading-relaxed cursor-pointer">
                  Aceito receber novidades e ofertas por email (opcional)
                </Label>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? "Carregando..." : isSignUp ? "Criar conta" : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-medium hover:underline"
          >
            {isSignUp ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>

      {/* Terms modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowTerms(false)}>
          <div className="bg-card rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground">Termos de Uso</h2>
            <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
              <p>Ao utilizar a plataforma Kompas Maps, você concorda com os seguintes termos:</p>
              <p><strong>1. Uso da Plataforma:</strong> A plataforma é destinada à visualização e busca de imóveis e espaços de mídia disponíveis. As informações são fornecidas pelos anunciantes e a Kompas Maps não garante a precisão dos dados.</p>
              <p><strong>2. Conta de Usuário:</strong> Ao criar uma conta, você é responsável por manter a confidencialidade de suas credenciais. Seus dados pessoais serão tratados conforme a LGPD (Lei Geral de Proteção de Dados).</p>
              <p><strong>3. Favoritos e Dados:</strong> Funcionalidades como favoritos estão disponíveis apenas para usuários cadastrados. Seus dados de uso podem ser utilizados para melhorar a experiência na plataforma.</p>
              <p><strong>4. Comunicações:</strong> Se optar por receber comunicações de marketing, você poderá cancelar a inscrição a qualquer momento.</p>
              <p><strong>5. Propriedade Intelectual:</strong> Todo o conteúdo da plataforma é protegido por direitos autorais.</p>
              <p><strong>6. Limitação de Responsabilidade:</strong> A Kompas Maps atua como intermediária e não se responsabiliza por negociações realizadas entre usuários e anunciantes.</p>
            </div>
            <Button onClick={() => setShowTerms(false)} className="w-full">Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
