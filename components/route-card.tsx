import Link from "next/link";
import { CleaningRouteInstance } from "@/lib/types";
import { ArrowRight, Clock3, MapPin, ShieldAlert } from "lucide-react";

export function RouteCard({ route }: { route: CleaningRouteInstance }) {
  return (
    <article className="panel rounded-[1.7rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge">{route.categoria}</span>
            <span className="badge">{route.turno}</span>
            <span className="badge">{route.frequencia}</span>
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight">{route.ambienteNome}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/68">{route.acao}</p>
        </div>

        <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Janela</p>
          <p className="mt-2 text-lg font-black">{route.suggestedStart} → {route.suggestedEnd}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
          <Clock3 className="h-4 w-4 text-white/75" />
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">Tempo estimado</p>
          <p className="mt-2 text-lg font-black">{route.durationMin} min</p>
        </div>
        <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
          <MapPin className="h-4 w-4 text-white/75" />
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">Local</p>
          <p className="mt-2 text-lg font-black">{route.andar}</p>
        </div>
        <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
          <ShieldAlert className="h-4 w-4 text-white/75" />
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">Risco operacional</p>
          <p className="mt-2 text-lg font-black">{route.riskLabel}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/62">
          Itens-chave: <span className="text-white/90">{route.itens.slice(0, 3).join(" • ")}</span>
        </p>
        <Link href={`/rotas/${route.instanceId}`} className="secondary-button">
          Abrir rota
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
