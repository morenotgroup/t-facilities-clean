import { AppHeader } from "@/components/app-header";
import { RouteCard } from "@/components/route-card";
import { getRequiredSession } from "@/lib/auth";
import { buildDashboardForSession } from "@/lib/facilities";
import { Clock3, Coffee, MapPinned, Sparkles } from "lucide-react";

export default async function StaffPage() {
  const session = await getRequiredSession("staff");
  const dashboard = await buildDashboardForSession(session);

  return (
    <main className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl">
        <AppHeader session={session} />
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="surface noise rounded-[2rem] p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="badge">Rota do dia</p>
                  <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                    {dashboard.user.displayName}, sua operação de hoje já está pronta.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
                    As tarefas abaixo foram organizadas por janela de horário, frequência, prioridade operacional
                    e responsabilidade definida na planilha.
                  </p>
                </div>
                <div className="kpi-ring" style={{ ["--progress" as string]: `${dashboard.progressPercent}%` }}>
                  <span className="relative z-10 text-xl font-black">{dashboard.progressPercent}%</span>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <article className="panel rounded-[1.4rem] p-4">
                  <Clock3 className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/42">Carga prevista</p>
                  <p className="mt-2 text-2xl font-black">{dashboard.totalEstimatedMinutes} min</p>
                </article>
                <article className="panel rounded-[1.4rem] p-4">
                  <MapPinned className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/42">Ambientes</p>
                  <p className="mt-2 text-2xl font-black">{dashboard.routes.length}</p>
                </article>
                <article className="panel rounded-[1.4rem] p-4">
                  <Sparkles className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/42">Concluídas hoje</p>
                  <p className="mt-2 text-2xl font-black">{dashboard.completedCount}</p>
                </article>
              </div>
            </div>

            <div className="grid gap-4">
              {dashboard.routes.map((route) => (
                <RouteCard key={route.instanceId} route={route} />
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="panel rounded-[2rem] p-5 md:p-6">
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5" />
                <h2 className="text-lg font-bold tracking-tight">Janela operacional</h2>
              </div>

              <div className="mt-5 space-y-3">
                {dashboard.timeline.map((item) => (
                  <div key={`${item.label}-${item.time}`} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{item.label}</p>
                      <span className="badge">{item.time}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/65">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel rounded-[2rem] p-5 md:p-6">
              <p className="badge">Leitura rápida</p>
              <h2 className="mt-4 text-xl font-black tracking-tight">Pontos de atenção do dia</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/68">
                <li>• Ao entrar em cada rota, sempre registre status, observação e foto quando houver anomalia.</li>
                <li>• Em superfícies de alto toque, limpe primeiro e desinfete somente quando fizer sentido operacional.</li>
                <li>• Em ambientes com fluxo alto, a régua pública do QR melhora transparência e percepção de cuidado.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
