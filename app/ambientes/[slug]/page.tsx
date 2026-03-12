import { FeedbackForm } from "@/components/feedback-form";
import { getPublicEnvironmentStatus } from "@/lib/facilities";
import { CheckCircle2, Clock3, MessageSquareWarning } from "lucide-react";
import { notFound } from "next/navigation";

export default async function PublicEnvironmentPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicEnvironmentStatus(slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-3xl">
        <section className="surface noise rounded-[2rem] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/branding/tclean-icon.svg" alt="T.Clean" className="h-11 w-11" />
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-white/45">Status público da limpeza</p>
                <h1 className="text-3xl font-black tracking-tight">{data.ambiente.nome}</h1>
              </div>
            </div>
            <span className="badge">{data.ambiente.andar}</span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <article className="panel rounded-[1.4rem] p-4">
              <CheckCircle2 className="h-5 w-5 text-white/80" />
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">Status</p>
              <p className="mt-2 text-xl font-black">{data.statusLabel}</p>
            </article>
            <article className="panel rounded-[1.4rem] p-4">
              <Clock3 className="h-5 w-5 text-white/80" />
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">Última limpeza</p>
              <p className="mt-2 text-xl font-black">{data.latest?.finishedAt || "Sem registro"}</p>
            </article>
            <article className="panel rounded-[1.4rem] p-4">
              <MessageSquareWarning className="h-5 w-5 text-white/80" />
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">Observação</p>
              <p className="mt-2 text-sm leading-6 text-white/68">{data.latest?.notes || "Nenhum apontamento registrado."}</p>
            </article>
          </div>
        </section>

        <section className="panel mt-6 rounded-[2rem] p-5 md:p-6">
          <p className="badge">Sugestão ou reclamação</p>
          <h2 className="mt-4 text-2xl font-black tracking-tight">Quer comentar a limpeza desta área?</h2>
          <p className="mt-3 text-sm leading-7 text-white/65">
            Seu feedback chega direto ao time de Facilities e ao líder da área para acompanhamento.
          </p>
          <div className="mt-6">
            <FeedbackForm slug={slug} ambienteNome={data.ambiente.nome} />
          </div>
        </section>
      </div>
    </main>
  );
}
