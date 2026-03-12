import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth";
import { getRouteDetailForSession, registerCheckin } from "@/lib/facilities";
import { AlertTriangle, Camera, CheckCircle2, Clock3, ImagePlus, MapPinned, ShieldAlert } from "lucide-react";

function toLocalDateTime(value: string) {
  const now = value ? new Date(value) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default async function StaffRouteDetailPage({
  params
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const { instanceId } = await params;
  const session = await getRequiredSession("staff");
  const detail = await getRouteDetailForSession(session, instanceId);

  if (!detail) {
    redirect("/staff");
  }

  const { route, latestForEnvironment } = detail;

  async function submitCheckin(formData: FormData) {
    "use server";

    const startedAt = String(formData.get("startedAt") || "");
    const finishedAt = String(formData.get("finishedAt") || "");
    const status = String(formData.get("status") || "CONCLUIDA");
    const notes = String(formData.get("notes") || "");
    const justification = String(formData.get("justification") || "");
    const file = formData.get("file");

    await registerCheckin({
      session,
      route,
      status,
      notes,
      startedAt,
      finishedAt,
      justification,
      file: file instanceof File && file.size > 0 ? file : null
    });

    revalidatePath("/staff");
    revalidatePath(`/staff/rotas/${route.instanceId}`);
    revalidatePath(`/public/${route.slugQr}`);
    redirect("/staff");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                {route.turno}
              </span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                {route.frequencia}
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">{route.ambienteNome}</h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-white/62">
              Registre a execução real da rota. Esse envio atualiza o histórico da operação e a consulta pública do QR Code.
            </p>
          </div>

          <a
            href={`/public/${route.slugQr}`}
            target="_blank"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/[0.07]"
          >
            Abrir página pública da sala
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.35rem] border border-white/10 bg-[#0d1323]/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-white/45"><Clock3 className="h-4 w-4" /> Janela sugerida</div>
            <div className="text-lg font-bold text-white">{route.suggestedStart} • {route.suggestedEnd}</div>
          </div>
          <div className="rounded-[1.35rem] border border-white/10 bg-[#0d1323]/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-white/45"><MapPinned className="h-4 w-4" /> Local</div>
            <div className="text-lg font-bold text-white">{route.andar || "Sem andar"}</div>
          </div>
          <div className="rounded-[1.35rem] border border-white/10 bg-[#0d1323]/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-white/45"><ShieldAlert className="h-4 w-4" /> Risco</div>
            <div className="text-lg font-bold text-white capitalize">{route.riskLabel}</div>
          </div>
          <div className="rounded-[1.35rem] border border-white/10 bg-[#0d1323]/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-white/45"><CheckCircle2 className="h-4 w-4" /> Duração</div>
            <div className="text-lg font-bold text-white">{route.durationMin} min</div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-black tracking-tight text-white">Kit da execução</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/45">Itens necessários</h3>
              <div className="flex flex-wrap gap-2">
                {route.itens.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75">{item}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/45">EPI recomendado</h3>
              <div className="flex flex-wrap gap-2">
                {route.epi.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75">{item}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/45">Dicas rápidas</h3>
              <ul className="space-y-2 text-sm leading-6 text-white/70">
                {route.tips.map((tip) => (
                  <li key={tip}>• {tip}</li>
                ))}
              </ul>
            </div>

            {latestForEnvironment ? (
              <div className="rounded-[1.4rem] border border-white/10 bg-[#0d1323]/60 p-4">
                <div className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/45">Último registro público</div>
                <div className="text-white/80">Status: <strong>{latestForEnvironment.status}</strong></div>
                <div className="text-white/60">Finalizado em {latestForEnvironment.finishedAt || latestForEnvironment.createdAt}</div>
                {latestForEnvironment.notes ? <div className="mt-2 text-sm text-white/60">{latestForEnvironment.notes}</div> : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-black tracking-tight text-white">Registrar execução</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Use “Concluída” quando a limpeza foi feita, “Pendência” quando houve algo impeditivo parcial e “Não realizada” quando a rota não aconteceu.
            </p>
          </div>

          <form action={submitCheckin} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-white/75">Início real</span>
                <input name="startedAt" type="datetime-local" defaultValue={toLocalDateTime(new Date().toISOString())} className="input" required />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-white/75">Fim real</span>
                <input name="finishedAt" type="datetime-local" defaultValue={toLocalDateTime(new Date().toISOString())} className="input" required />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/75">Status da rota</span>
              <select name="status" className="input" defaultValue="CONCLUIDA">
                <option value="CONCLUIDA">Concluída</option>
                <option value="PENDENCIA">Concluída com pendência</option>
                <option value="NAO_REALIZADA">Não realizada</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/75">Observações da execução</span>
              <textarea name="notes" rows={4} className="input min-h-[120px]" placeholder="Ex.: reposição feita, piso com fluxo alto, vidro externo manteve marcas por chuva..." />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/75">Justificativa obrigatória se houve pendência ou não realização</span>
              <textarea name="justification" rows={3} className="input min-h-[90px]" placeholder="Ex.: sala ocupada, material em falta, manutenção no local, indisponibilidade operacional..." />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/75">Foto da evidência</span>
              <div className="rounded-[1.35rem] border border-dashed border-white/15 bg-white/[0.02] p-4 text-white/60">
                <div className="mb-2 flex items-center gap-2 text-white/75"><ImagePlus className="h-4 w-4" /> Suba uma foto quando houver anomalia, pendência ou necessidade de evidência.</div>
                <input name="file" type="file" accept="image/*" className="block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500/15 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-200 hover:file:bg-cyan-500/20" />
              </div>
            </label>

            <div className="rounded-[1.35rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              <div className="mb-1 flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> Importante</div>
              Ao salvar, o histórico interno é atualizado e a página pública do QR Code passa a mostrar o último status da limpeza dessa área.
            </div>

            <button type="submit" className="primary-button inline-flex items-center justify-center gap-2">
              <Camera className="h-4 w-4" /> Salvar registro da rota
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
