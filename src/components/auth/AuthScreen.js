"use client";

import React, { useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { LogIn, UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) {
        setError(
          /failed to fetch|network/i.test(error.message)
            ? "Não foi possível conectar ao Supabase. Verifique sua conexão e tente novamente."
            : "Email ou senha incorretos. Verifique e tente novamente."
        );
        return;
      }
      onAuthSuccess(data.user);
    } catch (requestError) {
      console.error("Login request failed:", requestError);
      setError("Não foi possível conectar ao Supabase. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      setError("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (oauthError) {
      console.error("Google OAuth failed:", oauthError);
      setError("Não foi possível iniciar o login com Google. Verifique a configuração do provedor.");
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local.");
      return;
    }
    if (!form.name.trim()) { setError("Informe seu nome completo."); return; }
    if (form.password.length < 6) { setError("A senha deve ter ao menos 6 caracteres."); return; }
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.name.trim() } },
    });
    setLoading(false);

    if (error) {
      setError(error.message.includes("already registered")
        ? "Este email ja possui cadastro. Faca login."
        : error.message);
      return;
    }

    if (data?.session) {
      const { data: existingProfile, error: profileLookupError } = await supabase
        .from("participants")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();
      const profileError = profileLookupError || (!existingProfile
        ? (await supabase.from("participants").insert({
            id: data.user.id,
            full_name: form.name.trim(),
            email: form.email.trim(),
          })).error
        : null);
      if (profileError) {
        console.error("Failed to create participant profile:", profileError);
        setError(`Conta criada, mas não foi possível preparar seu perfil. ${profileError.message}`);
        return;
      }
      onAuthSuccess(data.user);
    } else {
      setError("Conta criada! Faca login agora.");
      setMode("login");
    }
  };

  return (
    <div className="auth-gate">
      <div className="auth-card">
        <div className="brand" style={{ marginBottom: 28 }}>
          <span className="logo">O</span>
          <span><small>Open Startup</small>School</span>
        </div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>P01 — Baseline de Competencias Empreendedoras</div>
        <h2 style={{ marginBottom: 24, fontSize: "1.4rem" }}>
          {mode === "login" ? "Entrar na plataforma" : "Criar minha conta"}
        </h2>

        {error && <div className="auth-error">{error}</div>}

        <button
          className="btn"
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          style={{ width: "100%", justifyContent: "center", border: "1px solid var(--border)", marginBottom: 18 }}
        >
          <span style={{ color: "#4285F4", fontWeight: 800, fontSize: "1.1rem" }}>G</span>
          Continuar com Google
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: ".75rem", margin: "0 0 18px" }}>
          <span style={{ height: 1, flex: 1, background: "var(--border)" }} />
          ou use seu e-mail
          <span style={{ height: 1, flex: 1, background: "var(--border)" }} />
        </div>

        <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="auth-name">Nome completo</label>
              <input id="auth-name" name="name" type="text" autoComplete="name"
                placeholder="Seu nome" value={form.name} onChange={handleChange} required />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" name="email" type="email" autoComplete="email"
              placeholder="seu@email.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="auth-password">Senha</label>
            <div className="password-wrap">
              <input id="auth-password" name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="Minimo 6 caracteres" value={form.password} onChange={handleChange} required />
              <button type="button" className="password-toggle"
                onClick={() => setShowPassword((v) => !v)} tabIndex={-1} aria-label="Mostrar senha">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button className="btn accent" type="submit" disabled={loading}
            style={{ width: "100%", marginTop: 8, justifyContent: "center" }}>
            {loading ? <Loader2 size={18} className="spin" />
              : mode === "login" ? <><LogIn size={18} /> Entrar</>
              : <><UserPlus size={18} /> Criar conta e entrar</>}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>Nao tem conta? <button onClick={() => { setMode("register"); setError(""); }}>Criar agora</button></>
          ) : (
            <>Ja tem conta? <button onClick={() => { setMode("login"); setError(""); }}>Fazer login</button></>
          )}
        </div>
      </div>
    </div>
  );
}
