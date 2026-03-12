import { revalidatePath } from "next/cache";
import { getPublicEnvironmentStatus, registerPublicFeedback } from "@/lib/facilities";
import { AlertTriangle, BadgeCheck, Clock3, MessageSquareMore, SendHorizonal } from "lucide-react";

export default async function PublicEnvironmentPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicEnvironmentStatus(slug);

  if (!data) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">
          <h1 className="text-3xl font-black text-white">Ambiente não encontrado</h1>
          <p className="mt-3 text-white/60">Confira se o QR Code foi gerado para a sala correta.</p>
        </div>
      </main>
    );
  }

  async function submitFeedback(formData: FormData) {
    "use server";

    const nome = String(formData.get("nome") || "Colaborador");
    const tipo = String(formData.get("tipo") || "SUGESTAO");
    const mensagem = String(formData.get("mensagem") || "").trim();

    if (!mensagem) return;

    await registerPublicFeedback({ slug, tipo, mensagem, nome });
    revalidatePath(`/public/${slug}`);
  }

  const statusTone = !data.latest
    ? "border-white/10 bg-white/5 text-white/80"
    : data.latest.status === "CONCLUIDA"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
      : data.latest.status === "PENDENCIA"
        ? "border-amber-400/20 bg-amber-500/10 text-amber-200"
        : "border-red-400/20 bg-red-500/10 text-red-200";

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
          Transparência da limpeza
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">{data.ambiente.nome}</h1>
        <p className="mt-2 text-base leading-7 text-white/62">
          Confira o último registro operacional desta área e deixe uma percepção rápida de limpeza, cuidado ou necessidade de ajuste.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className={`rounded-[1.45rem] border p-4 ${statusTone}`}>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em]">
              <BadgeCheck className="h-4 w-4" /> Status atual
            </div>
            <div className="text-lg font-black">{data.statusLabel}</div>
          </div>

          <div className="rounded-[1.45rem] border border-white/10 bg-[#0d1323]/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-white/45">
              <Clock3 className="h-4 w-4" /> Último horário
            </div>
            <div className="text-lg font-black text-white">
              {data.latest?.finishedAt || "Sem registro ainda"}
            </div>
          </div>

          <div className="rounded-[1.45rem] border border-white/10 bg-[#0d1323]/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-white/45">
              <MessageSquareMore className="h-4 w-4" /> Tipo de área
            </div>
            <div className="text-lg font-black text-white">{data.ambiente.categoria}</div>
          </div>
        </div>

        {data.latest?.notes ? (
          <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/65">
            <strong className="text-white">Observação do último registro:</strong> {data.latest.notes}
          </div>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="mb-5 flex items-center gap-2 text-white">
          <AlertTriangle className="h-4 w-4" />
          <h2 className="text-2xl font-black tracking-tight">Sugestão, elogio ou reclamação</h2>
        </div>

        <form action={submitFeedback} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/75">Seu nome</span>
              <input name="nome" className="input" placeholder="Ex.: Moreno" />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/75">Tipo</span>
              <select name="tipo" className="input" defaultValue="SUGESTAO">
                <option value="SUGESTAO">Sugestão</option>
                <option value="ELOGIO">Elogio</option>
                <option value="RECLAMACAO">Reclamação</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-white/75">Mensagem</span>
            <textarea
              name="mensagem"
              rows={5}
              className="input min-h-[140px]"
              placeholder="Ex.: a sala estava ótima hoje / faltou papel toalha / seria bom reforçar vidro e maçanetas no final da tarde..."
              required
            />
          </label>

          <button type="submit" className="primary-button inline-flex items-center justify-center gap-2">
            <SendHorizonal className="h-4 w-4" /> Enviar percepção da limpeza
          </button>
        </form>
      </section>
    </main>
  );
}
