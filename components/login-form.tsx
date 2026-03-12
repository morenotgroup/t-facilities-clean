"use client";

import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token })
      });

      const contentType = response.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || "Resposta inválida do servidor." };
      }

      if (!response.ok) {
        setMessage(data.message || "Falha no login.");
        return;
      }

      router.push(data.redirectTo);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível autenticar agora."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/75">
          E-mail corporativo
        </span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
          <input
            className="input pl-11"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nome@agenciataj.com"
            required
          />
        </div>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/75">
          Token de acesso
        </span>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
          <input
            className="input pl-11"
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Digite seu token"
            required
          />
        </div>
      </label>

      {message ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {message}
        </div>
      ) : null}

      <button type="submit" className="primary-button mt-2" disabled={loading}>
        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
        Entrar no T.Clean
      </button>
    </form>
  );
}
