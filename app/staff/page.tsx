import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { RouteCard } from "@/components/route-card";
import { getRequiredSession } from "@/lib/auth";
import { buildDashboardForSession } from "@/lib/facilities";
import {
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  SunMedium,
  MoonStar
} from "lucide-react";

function splitRoutesByTurno(routes: any[]) {
  const morning = routes.filter((route) =>
    String(route.turno || "").toLowerCase().includes("man")
  );

  const afternoon = routes.filter(
    (route) => !String(route.turno || "").toLowerCase().includes("man")
  );

  return { morning, afternoon };
}

export default async function StaffPage({
  searchParams
}: {
  searchParams?: Promise<{
    done?: string;
    msg?: string;
  }>;
}) {
  const params = (await searchParams) || {};
  const successMessage =
    params.done === "1" && params.msg ? decodeURIComponent(params.msg) : null;

  const session = await getRequiredSession("staff");
  const dashboard = await buildDashboardForSession(session);

  const { morning, afternoon } = splitRoutesByTurno(dashboard.routes);
  const firstRoute = dashboard.routes[0] || null;

  return (
    <main className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl">
        <AppHeader session={session} />

        {successMessage ? (
          <div className="mt-6 rounded-[1.6rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/20 p-2">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">
                  Check-in concluído
                </p>
                <p className="mt-1 text-base font-bold">{successMessage}</p>
              </div>
            </div>
          </div>
        ) : null}

        <section className="mt-6 space-y-6">
          <div className="surface noise rounded-[2rem] p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-3xl">
                <p className="badge">Operação do dia</p>

                <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                  {dashboard.user.displayName}, bora pra próxima.
                </h1>

                <p className="mt-3 text-sm leading-7 text-white/68">
                  Abra a rota, registre o check-in e siga a execução do dia.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {firstRoute ? (
                    <Link
                      href={`/staff/rotas/${firstRoute.instanceId}`}
                      className="primary-button"
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Iniciar operação
                    </Link>
                  ) : null}

                  <a href="#rotas-do-dia" className="secondary-button">
                    Ver rotas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>

              <div
                className="kpi-ring"
                style={{ ["--progress" as string]: `${dashboard.progressPercent}%` }}
              >
                <span className="relative z-10 text-xl font-black">
                  {dashboard.progressPercent}%
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <article className="panel rounded-[1.4rem] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                  Rotas do dia
                </p>
                <p className="mt-2 text-2xl font-black">
                  {dashboard.routes.length}
                </p>
              </article>

              <article className="panel rounded-[1.4rem] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                  Concluídas
                </p>
                <p className="mt-2 text-2xl font-black">
                  {dashboard.completedCount}
                </p>
              </article>

              <article className="panel rounded-[1.4rem] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                  Faltam
                </p>
                <p className="mt-2 text-2xl font-black">
                  {Math.max(dashboard.routes.length - dashboard.completedCount, 0)}
                </p>
              </article>
            </div>
          </div>

          <section id="rotas-do-dia" className="space-y-4">
            <div>
              <p className="badge">Execução</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">
                Rotas de hoje
              </h2>
            </div>

            {dashboard.routes.length === 0 ? (
              <div className="panel rounded-[1.7rem] p-6">
                <p className="text-lg font-bold">
                  Nenhuma rota encontrada para hoje.
                </p>
                <p className="mt-2 text-sm leading-7 text-white/68">
                  Revise o vínculo de responsáveis na planilha para este perfil.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <details open className="panel rounded-[1.7rem] p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full border border-white/10 bg-white/[0.04] p-2">
                        <SunMedium className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-lg font-black">Rotas da manhã</p>
                        <p className="text-sm text-white/58">
                          {morning.length} ambiente(s)
                        </p>
                      </div>
                    </div>
                    <span className="badge">Abrir</span>
                  </summary>

                  <div className="mt-4 grid gap-4">
                    {morning.length === 0 ? (
                      <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 text-sm text-white/60">
                        Nenhuma rota de manhã cadastrada para hoje.
                      </div>
                    ) : (
                      morning.map((route) => (
                        <RouteCard key={route.instanceId} route={route} />
                      ))
                    )}
                  </div>
                </details>

                <details open className="panel rounded-[1.7rem] p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full border border-white/10 bg-white/[0.04] p-2">
                        <MoonStar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-lg font-black">Rotas da tarde</p>
                        <p className="text-sm text-white/58">
                          {afternoon.length} ambiente(s)
                        </p>
                      </div>
                    </div>
                    <span className="badge">Abrir</span>
                  </summary>

                  <div className="mt-4 grid gap-4">
                    {afternoon.length === 0 ? (
                      <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 text-sm text-white/60">
                        Nenhuma rota de tarde cadastrada para hoje.
                      </div>
                    ) : (
                      afternoon.map((route) => (
                        <RouteCard key={route.instanceId} route={route} />
                      ))
                    )}
                  </div>
                </details>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
