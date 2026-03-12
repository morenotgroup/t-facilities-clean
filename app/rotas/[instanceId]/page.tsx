import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { getRequiredSession } from "@/lib/auth";
import {
  getRouteDetailForSession,
  registerCheckin
} from "@/lib/facilities";
import { getRandomCompletionMessage } from "@/lib/motivation";
import {
  CheckCircle2,
  Camera,
  ClipboardList,
  MapPin,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export default async function StaffRouteDetailPage({
  params
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const { instanceId } = await params;
  const session = await getRequiredSession("staff");
  const detail = await getRouteDetailForSession(session, instanceId);

  if (!detail) {
    notFound();
  }

  const { route } = detail;

  async function submitCheckin(formData: FormData) {
    "use server";

    const session = await getRequiredSession("staff");
    const detail = await getRouteDetailForSession(session, instanceId);

    if (!detail) {
      throw new Error("Rota não encontrada.");
    }

    const status = String(formData.get("status") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    const justification = String(formData.get("justification") || "").trim();
    const file = formData.get("photo");

    await registerCheckin({
      session,
      route: detail.route,
      status,
      notes,
      justification,
      startedAt: "",
      finishedAt: "",
      file: file instanceof File && file.size > 0 ? file : undefined
    });

    const message = getRandomCompletionMessage();
    redirect(`/staff?done=1&msg=${encodeURIComponent(message)}`);
  }

  return (
    <main className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl">
        <AppHeader session={session} />

        <section className="mt-6 space-y-6">
          <div className="surface noise rounded-[2rem] p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge">{route.turno}</span>
                  <span className="badge">{route.frequencia}</span>
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                  {route.ambienteNome}
                </h1>

                <p className="mt-3 text-sm leading-7 text-white/68">
                  Registre a execução desta rota com o menor número possível de
                  etapas.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="panel rounded-[1.4rem] p-4">
                <div className="flex items-center gap-2 text-white/75">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.22em]">
                    Local
                  </span>
                </div>
                <p className="mt-3 text-xl font-black">{route.andar}</p>
              </div>

              <div className="panel rounded-[1.4rem] p-4">
                <div className="flex items-center gap-2 text-white/75">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.22em]">
                    Atenção
                  </span>
                </div>
                <p className="mt-3 text-xl font-black">{route.riskLabel}</p>
              </div>
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <div className="panel rounded-[2rem] p-5 md:p-6">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  <h2 className="text-xl font-black tracking-tight">
                    Kit da execução
                  </h2>
                </div>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                    Itens principais
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {route.itens.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/78"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                    EPI recomendado
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {route.epi.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/78"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                    Dicas rápidas
                  </p>
                  <ul className="mt-3 space-y-3 text-sm leading-7 text-white/72">
                    {route.tips.slice(0, 3).map((tip) => (
                      <li key={tip}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel rounded-[2rem] p-5 md:p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <h2 className="text-xl font-black tracking-tight">
                  Registrar execução
                </h2>
              </div>

              <p className="mt-3 text-sm leading-7 text-white/68">
                O horário será registrado automaticamente no momento do envio.
              </p>

              <form action={submitCheckin} className="mt-6 space-y-5">
                <div className="grid gap-2">
                  <label
                    htmlFor="status"
                    className="text-sm font-semibold text-white/82"
                  >
                    Status da rota
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue="CONCLUIDA"
                    className="input"
                    required
                  >
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="PENDENCIA">Pendência</option>
                    <option value="NAO_REALIZADA">Não realizada</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="notes"
                    className="text-sm font-semibold text-white/82"
                  >
                    Observações da execução
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="input min-h-[130px] resize-none py-4"
                    placeholder="Ex.: reposição feita, ambiente com fluxo alto, manutenção observada, etc."
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="justification"
                    className="text-sm font-semibold text-white/82"
                  >
                    Justificativa
                  </label>
                  <textarea
                    id="justification"
                    name="justification"
                    className="input min-h-[110px] resize-none py-4"
                    placeholder="Preencha quando houver pendência ou quando a rota não for realizada."
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="photo"
                    className="text-sm font-semibold text-white/82"
                  >
                    Foto da evidência
                  </label>
                  <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                    <Camera className="h-5 w-5 text-white/70" />
                    <input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
                    />
                  </div>
                  <p className="text-xs leading-6 text-white/48">
                    Use a foto quando houver anomalia, dano, pendência ou algo
                    importante para registro.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-200">
                    <Sparkles className="h-4 w-4" />
                    Ao salvar, a operação será atualizada automaticamente
                  </div>

                  <button type="submit" className="primary-button">
                    Salvar check-in
                  </button>
                </div>
              </form>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
