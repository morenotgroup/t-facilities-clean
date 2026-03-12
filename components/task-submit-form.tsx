"use client";

import { CleaningRouteInstance, SessionPayload } from "@/lib/types";
import { LoaderCircle, Upload, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";

export function TaskSubmitForm({
  route
}: {
  route: CleaningRouteInstance;
  session: SessionPayload;
}) {
  const now = useMemo(() => new Date().toISOString().slice(0, 16), []);
  const [status, setStatus] = useState("CONCLUIDA");
  const [startedAt, setStartedAt] = useState(now);
  const [finishedAt, setFinishedAt] = useState(now);
  const [notes, setNotes] = useState("");
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setDone(false);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("instanceId", route.instanceId);
    formData.set("status", status);
    formData.set("startedAt", startedAt);
    formData.set("finishedAt", finishedAt);
    formData.set("notes", notes);
    formData.set("justification", justification);

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Não foi possível salvar.");
        return;
      }

      setDone(true);
      setMessage("Registro salvo com sucesso.");
      form.reset();
    } catch {
      setMessage("Falha ao registrar a limpeza.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/75">Status da etapa</span>
        <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="CONCLUIDA">Concluída</option>
          <option value="PENDENCIA">Concluída com pendência</option>
          <option value="NAO_REALIZADA">Não realizada</option>
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/75">Início</span>
          <input className="input" type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/75">Fim</span>
          <input className="input" type="datetime-local" value={finishedAt} onChange={(e) => setFinishedAt(e.target.value)} />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/75">Observações rápidas</span>
        <textarea
          className="input min-h-[110px]"
          placeholder="Ex.: mesa organizada, piso com mancha removida, papel toalha reposto..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      {status !== "CONCLUIDA" ? (
        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/75">Justificativa da pendência</span>
          <textarea
            className="input min-h-[110px]"
            placeholder="Explique o motivo da pendência ou da não execução"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            required
          />
        </label>
      ) : null}

      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/75">Foto da evidência ou problema</span>
        <div className="rounded-[1rem] border border-dashed border-white/18 bg-white/[0.03] p-4">
          <input type="file" name="photo" accept="image/*" className="block w-full text-sm text-white/75" />
          <p className="mt-2 text-xs leading-5 text-white/45">
            Use foto principalmente em pendências, danos, falta de insumo ou situação atípica.
          </p>
        </div>
      </label>

      {message ? (
        <div className={`rounded-2xl p-3 text-sm ${done ? "border border-green-500/20 bg-green-500/10 text-green-200" : "border border-red-500/20 bg-red-500/10 text-red-200"}`}>
          {message}
        </div>
      ) : null}

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
        Salvar registro da rota
      </button>
    </form>
  );
}
