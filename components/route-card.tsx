import Link from "next/link";
import { CleaningRouteInstance } from "@/lib/types";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  SunMedium,
  MoonStar
} from "lucide-react";

function turnoIcon(turno?: string) {
  const value = (turno || "").toLowerCase();

  if (value.includes("man")) {
    return <SunMedium className="h-4 w-4" />;
  }

  return <MoonStar className="h-4 w-4" />;
}

export function RouteCard({ route }: { route: CleaningRouteInstance }) {
  return (
    <article className="panel rounded-[1.6rem] p-4 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.045]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge inline-flex items-center gap-2">
              {turnoIcon(route.turno)}
              {route.turno}
            </span>
            <span className="badge">{route.categoria}</span>
          </div>

          <h3 className="mt-3 text-xl font-black tracking-tight text-white md:text-2xl">
            {route.ambienteNome}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/62">
            <MapPin className="h-4 w-4" />
            <span>{route.andar}</span>
          </div>
        </div>

        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
          Pronta
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm text-white/68">
          <CheckCircle2 className="h-4 w-4" />
          <span>{route.frequencia}</span>
        </div>

        <Link
          href={`/staff/rotas/${route.instanceId}`}
          className="secondary-button"
        >
          Abrir rota
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
