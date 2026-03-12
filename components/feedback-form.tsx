"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";

export function FeedbackForm({
  slug,
  ambienteNome
}: {
  slug: string;
  ambienteNome: string;
}) {
  const [tipo, setTipo] = useState("SUGESTAO");
  const [mensagem, setMensagem] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, tipo, mensagem, nome })
      });

      const data = await response.json();
      if (!response.ok) {
        setStatus(data.message || "Não foi possível enviar.");
        return;
      }

      setMensagem("");
      setNome("");
      setStatus(`Seu feedback sobre ${ambienteNome} foi enviado.`);
    } catch {
      setStatus("Falha ao enviar feedback.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/75">Tipo de retorno</span>
        <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="SUGESTAO">Sugestão</option>
          <option value="RECLAMACAO">Reclamação</option>
          <option value="ELOGIO">Elogio</option>
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/75">Seu nome (opcional)</span>
        <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/75">Mensagem</span>
        <textarea
          className="input min-h-[130px]"
          placeholder="Conte para o time o que você percebeu nesta área"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          required
        />
      </label>

      {status ? <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/80">{status}</div> : null}

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
        Enviar feedback
      </button>
    </form>
  );
}
