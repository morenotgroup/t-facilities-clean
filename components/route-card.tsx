import Link from "next/link";
import { CleaningRouteInstance } from "@/lib/types";
import {
  ArrowRight,
  Clock3,
  MapPin,
  ShieldAlert,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export function RouteCard({ route }: { route: CleaningRouteInstance }) {
  return (
    <article className="panel rounded-[1.7rem] p-5 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.045]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge">{route.categoria}</span>
            <span className="badge">{route.turno}</span>
            <span className="badge">{route.frequencia}</span>
          </div>

          <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
            {route.ambienteNome}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/68">
            {route.acao}
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            Janela
          </p>
          <p className="mt-2 text-base font-black text-white md:text-lg">
            {route.suggestedStart} → {route.suggestedEnd}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
          <Clock3 className="h-4 w-4 text-white/75" />
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">
            Tempo estimado
          </p>
          <p className="mt-2 text-lg font-black text-white">
            {route.durationMin} min
          </p>
        </div>

        <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
          <MapPin className="h-4 w-4 text-white/75" />
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">
            Local
          </p>
          <p className="mt-2 text-lg font-black text-white">{route.andar}</p>
        </div>

        <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
          <ShieldAlert className="h-4 w-4 text-white/75" />
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">
            Risco operacional
          </p>
          <p className="mt-2 text-lg font-black text-white">
            {route.riskLabel}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-white/75" />
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">
              Itens principais
            </p>
          </div>

          <p className="mt-3 text-sm leading-7 text-white/75">
            {route.itens.slice(0, 4).join(" • ")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Pronta para execução
          </div>

          <Link
            href={`/staff/rotas/${route.instanceId}`}
            className="secondary-button"
          >
            Abrir rota
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
