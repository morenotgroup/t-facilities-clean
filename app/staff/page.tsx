import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { RouteCard } from "@/components/route-card";
import { getRequiredSession } from "@/lib/auth";
import { buildDashboardForSession } from "@/lib/facilities";
import {
  ArrowRight,
  Clock3,
  Coffee,
  MapPinned,
  PlayCircle,
  Sparkles
} from "lucide-react";

export default async function StaffPage() {
  const session = await getRequiredSession("staff");
  const dashboard = await buildDashboardForSession(session);

  const firstRoute = dashboard.routes[0] || null;

  return (
    <main className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl">
        <AppHeader session={session} />

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="surface noise rounded-[2rem] p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-3xl">
                  <p className="badge">Operação do dia</p>

                  <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                    {dashboard.user.displayName}, bora executar.
                  </h1>

                  <p className="mt-3 text-sm leading-7 text-white/68">
                    Suas rotas de hoje já estão organizadas. Abra a próxima tarefa
                    e registre a execução direto no app.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {firstRoute ? (
                      <Link
                        href={`/staff/rotas/${firstRoute.instanceId}`}
                        className="primary-button"
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Iniciar próxima rota
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
                  <Clock3 className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/42">
                    Carga prevista
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {dashboard.totalEstimatedMinutes} min
                  </p>
                </article>

                <article className="panel rounded-[1.4rem] p-4">
                  <MapPinned className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/42">
                    Rotas do dia
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {dashboard.routes.length}
                  </p>
                </article>

                <article className="panel rounded-[1.4rem] p-4">
                  <Sparkles className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/42">
                    Concluídas hoje
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {dashboard.completedCount}
                  </p>
                </article>
              </div>
            </div>

            <section id="rotas-do-dia" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="badge">Execução</p>
                  <h2 className="mt-3 text-2xl font-black tracking-tight">
                    Rotas de hoje
                  </h2>
                </div>
              </div>

              {dashboard.routes.length === 0 ? (
                <div className="panel rounded-[1.7rem] p-6">
                  <p className="text-lg font-bold">Nenhuma rota encontrada para hoje.</p>
                  <p className="mt-2 text-sm leading-7 text-white/68">
                    Isso normalmente significa que a planilha ainda não vinculou
                    corretamente os ambientes ao responsável deste perfil.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {dashboard.routes.map((route) => (
                    <RouteCard key={route.instanceId} route={route} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="panel rounded-[2rem] p-5 md:p-6">
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5" />
                <h2 className="text-lg font-bold tracking-tight">
                  Janela operacional
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                {dashboard.timeline.map((item) => (
                  <div
                    key={`${item.label}-${item.time}`}
                    className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{item.label}</p>
                      <span className="badge">{item.time}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel rounded-[2rem] p-5 md:p-6">
              <p className="badge">Como usar</p>
              <h2 className="mt-4 text-xl font-black tracking-tight">
                Fluxo rápido
              </h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-white/68">
                <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                  1. Abra a rota do ambiente.
                </div>
                <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                  2. Registre status, observação e foto quando necessário.
                </div>
                <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                  3. Salve a execução para atualizar histórico e QR público.
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
