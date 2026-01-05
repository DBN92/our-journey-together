import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "recover">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const findRecoveryParam = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const qs = new URLSearchParams(hash.includes("?") ? hash.split("?")[1] : search);
      const type = qs.get("type");
      if (type === "recovery") {
        setMode("recover");
      }
    };
    findRecoveryParam();
  }, []);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Falha no login", description: error.message });
      setLoading(false);
      return;
    }
    toast({ title: "Login realizado" });
    navigate("/");
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast({ title: "E-mail inválido", description: "Informe um e-mail válido" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Senhas diferentes", description: "Confirme sua senha corretamente" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Senha muito curta", description: "Use pelo menos 6 caracteres" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });
    if (error) {
      if (error.message?.toLowerCase().includes("already registered")) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          toast({ title: "Falha no cadastro", description: error.message });
          setLoading(false);
          return;
        }
        toast({ title: "Conta já existente", description: "Login realizado" });
        setLoading(false);
        navigate("/onboarding");
        return;
      }
      toast({ title: "Falha no cadastro", description: error.message });
      setLoading(false);
      return;
    }
    toast({ title: "Cadastro iniciado", description: "Verifique seu e-mail para confirmar" });
    setLoading(false);
    navigate("/onboarding");
  };

  const sendMagicLink = async () => {
    if (!email) {
      toast({ title: "Informe seu e-mail", description: "Digite seu e-mail para enviar o link" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Falha ao enviar link", description: error.message });
      return;
    }
    toast({ title: "Link enviado", description: "Cheque seu e-mail para acessar" });
  };

  const requestReset = async () => {
    if (!email) {
      toast({ title: "Informe seu e-mail", description: "Digite seu e-mail para resetar a senha" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Falha ao enviar reset", description: error.message });
      return;
    }
    toast({ title: "E-mail enviado", description: "Abra o link para redefinir a senha" });
  };

  const applyNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Senha muito curta", description: "Use pelo menos 6 caracteres" });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast({ title: "Senhas diferentes", description: "Confirme sua nova senha corretamente" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast({ title: "Falha ao redefinir", description: error.message });
      return;
    }
    toast({ title: "Senha redefinida", description: "Entre com a nova senha" });
    setMode("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Entrar" : "Criar conta"}</CardTitle>
          <CardDescription>
            {mode === "login" ? "Acesse sua conta" : "Cadastre-se para começar o onboarding"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button variant={mode === "login" ? "default" : "soft"} onClick={() => setMode("login")}>Login</Button>
            <Button variant={mode === "signup" ? "default" : "soft"} onClick={() => setMode("signup")}>Cadastro</Button>
          </div>
          {mode === "login" ? (
            <form onSubmit={onLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="soft" size="sm" onClick={sendMagicLink} disabled={loading}>Enviar link de acesso</Button>
                <Button type="button" variant="soft" size="sm" onClick={() => setMode("recover")} disabled={loading}>Esqueci minha senha</Button>
              </div>
            </form>
          ) : mode === "signup" ? (
            <form onSubmit={onSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="soft" size="sm" onClick={sendMagicLink} disabled={loading}>Enviar link de acesso</Button>
                <Button type="button" variant="soft" size="sm" onClick={requestReset} disabled={loading}>Esqueci minha senha</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={applyNewPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPasswordConfirm">Confirmar nova senha</Label>
                <Input id="newPasswordConfirm" type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Redefinir senha"}
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="soft" size="sm" onClick={() => setMode("login")} disabled={loading}>Voltar ao login</Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
};

export default Auth;