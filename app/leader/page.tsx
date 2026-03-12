import { AppHeader } from "@/components/app-header";
import { getRequiredSession } from "@/lib/auth";
import { buildLeaderDashboard } from "@/lib/facilities";
import { AlertTriangle, CheckCircle2, MessageSquareWarning, Users } from "lucide-react";

export default async function LeaderPage() {
  const session = await getRequiredSession("leader");
  const dashboard = await buildLeaderDashboard();

  return (
    <main className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl">
        <AppHeader session={session} />
        <section className="mt-6 grid gap-6">
          <div className="surface rounded-[2rem] p-5 md:p-6">
            <p className="badge">Painel Bruno • Facilities</p>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
              Visão diária da limpeza, pendências e percepção dos ambientes.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
              Acompanhe execução por colaborador, status por ambiente, feedback público via QR e pendências que
              precisam de intervenção.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {[
                {
                  label: "Concluídas hoje",
                  value: dashboard.totals.completed,
                  icon: CheckCircle2
                },
                {
                  label: "Com pendência",
                  value: dashboard.totals.issues,
                  icon: AlertTriangle
                },
                {
                  label: "Feedbacks públicos",
                  value: dashboard.totals.feedbacks,
                  icon: MessageSquareWarning
                },
                {
                  label: "Equipe ativa",
                  value: dashboard.totals.people,
                  icon: Users
                }
              ].map((kpi) => (
                <article key={kpi.label} className="panel rounded-[1.4rem] p-4">
                  <kpi.icon className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/42">{kpi.label}</p>
                  <p className="mt-2 text-3xl font-black">{kpi.value}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="panel rounded-[2rem] p-5 md:p-6">
              <h2 className="text-xl font-black tracking-tight">Produtividade por colaborador</h2>
              <div className="mt-5 space-y-4">
                {dashboard.byPerson.map((item) => (
                  <div key={item.name} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold">{item.name}</p>
                        <p className="mt-1 text-sm text-white/60">
                          {item.completed} concluídas • {item.issues} com pendência
                        </p>
                      </div>
                      <span className="badge">{item.rate}% compliance</span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/8">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,#8b5cf6,#38bdf8)]"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel rounded-[2rem] p-5 md:p-6">
              <h2 className="text-xl font-black tracking-tight">Feedback público das salas</h2>
              <div className="mt-5 space-y-3">
                {dashboard.feedbacks.length === 0 ? (
                  <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4 text-sm text-white/65">
                    Nenhum feedback público recebido hoje.
                  </div>
                ) : (
                  dashboard.feedbacks.map((item) => (
                    <div key={item.id} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold">{item.ambienteNome}</p>
                        <span className="badge">{item.createdAt}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/68">
                        <strong className="text-white">Tipo:</strong> {item.tipo}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-white/68">{item.mensagem}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="panel rounded-[2rem] p-5 md:p-6">
            <h2 className="text-xl font-black tracking-tight">Últimos registros de limpeza</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-white/45">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Horário</th>
                    <th className="pb-3 pr-4 font-medium">Colaborador</th>
                    <th className="pb-3 pr-4 font-medium">Ambiente</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.latestLogs.map((log) => (
                    <tr key={log.id} className="border-t border-white/8">
                      <td className="py-3 pr-4 text-white/65">{log.finishedAt}</td>
                      <td className="py-3 pr-4">{log.collaboratorName}</td>
                      <td className="py-3 pr-4">{log.ambienteNome}</td>
                      <td className="py-3 pr-4">{log.status}</td>
                      <td className="py-3 text-white/65">{log.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
