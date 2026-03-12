import { AppHeader } from "@/components/app-header";
import { TaskSubmitForm } from "@/components/task-submit-form";
import { getRequiredSession } from "@/lib/auth";
import { getRouteDetailForSession } from "@/lib/facilities";
import { ShieldAlert, Sparkles, TimerReset, Wrench } from "lucide-react";
import { notFound } from "next/navigation";

export default async function RouteDetailPage({
  params
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const session = await getRequiredSession("staff");
  const { instanceId } = await params;
  const detail = await getRouteDetailForSession(session, instanceId);

  if (!detail) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-5xl">
        <AppHeader session={session} />
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="surface noise rounded-[2rem] p-5 md:p-6">
            <p className="badge">{detail.route.categoria} • {detail.route.andar}</p>
            <h1 className="mt-4 text-3xl font-black tracking-tight">{detail.route.ambienteNome}</h1>
            <p className="mt-3 text-sm leading-7 text-white/68">{detail.route.acao}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <article className="panel rounded-[1.3rem] p-4">
                <TimerReset className="h-5 w-5 text-white/80" />
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">Janela sugerida</p>
                <p className="mt-2 text-xl font-black">{detail.route.suggestedStart} → {detail.route.suggestedEnd}</p>
              </article>
              <article className="panel rounded-[1.3rem] p-4">
                <Wrench className="h-5 w-5 text-white/80" />
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">Kit recomendado</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{detail.route.itens.join(" • ")}</p>
              </article>
            </div>

            <div className="mt-6 grid gap-4">
              <article className="panel rounded-[1.5rem] p-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-white/80" />
                  <h2 className="text-lg font-bold tracking-tight">EPI recomendado</h2>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/68">{detail.route.epi.join(" • ")}</p>
              </article>

              <article className="panel rounded-[1.5rem] p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-white/80" />
                  <h2 className="text-lg font-bold tracking-tight">Dicas de execução</h2>
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-white/68">
                  {detail.route.tips.map((tip) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>

          <div className="panel rounded-[2rem] p-5 md:p-6">
            <p className="badge">Registro obrigatório</p>
            <h2 className="mt-4 text-2xl font-black tracking-tight">Encerrar etapa da rota</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Marque a etapa como concluída, sinalize pendência, anexe foto e deixe a justificativa sempre que algo
              impedir a execução.
            </p>
            <div className="mt-6">
              <TaskSubmitForm route={detail.route} session={session} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
