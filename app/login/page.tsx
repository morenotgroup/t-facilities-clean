import { LoginForm } from "@/components/login-form";
import { ShieldCheck, Sparkles, Smartphone } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-stretch gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="surface noise relative hidden overflow-hidden rounded-[2rem] p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(139,92,246,0.24),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_80%_85%,rgba(34,197,94,0.16),transparent_22%),linear-gradient(140deg,rgba(9,9,11,0.96),rgba(7,10,18,0.86))]" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-3">
              <span className="badge">T.Group • Facilities Ops</span>
              <div className="flex items-center gap-3">
                <img src="/branding/tclean-icon.svg" alt="T.Clean" className="h-14 w-14" />
                <div>
                  <h1 className="text-4xl font-black tracking-tight">T.Clean</h1>
                  <p className="text-sm text-white/70">Mobile-first, premium, operacional e público.</p>
                </div>
              </div>
            </div>
            <div className="badge">PWA • QR • Google Workspace</div>
          </div>

          <div className="relative z-10 mt-10 grid gap-5">
            <div className="max-w-xl">
              <p className="text-5xl font-black leading-[1.02] tracking-tight">
                A limpeza virou <span className="text-white/70">operação visível</span>, rastreável e elegante.
              </p>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/72">
                Cada colaborador abre o app, recebe sua rota do dia, registra execução, sobe evidência com foto
                e atualiza o status público da área via QR Code.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Smartphone,
                  title: "Rotas do dia",
                  text: "Fluxo mobile com tarefas priorizadas por janela, responsável e frequência."
                },
                {
                  icon: ShieldCheck,
                  title: "Controle do líder",
                  text: "Dashboard para Bruno acompanhar status, pendências e produtividade."
                },
                {
                  icon: Sparkles,
                  title: "Sala transparente",
                  text: "QR público por ambiente com horário da última limpeza e canal de feedback."
                }
              ].map((item) => (
                <article key={item.title} className="panel rounded-[1.6rem] p-4">
                  <item.icon className="mb-3 h-5 w-5 text-white/80" />
                  <h2 className="text-sm font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/65">{item.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">Arquivos opcionais de branding</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Se quiser deixar a tela ainda mais forte, suba suas artes em{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5">/public/branding</code>:
                <br />
                <span className="text-white/90">tgroup-logo-white.png</span> •{" "}
                <span className="text-white/90">login-bg-1.jpg</span> •{" "}
                <span className="text-white/90">login-bg-2.jpg</span>
              </p>
            </div>
            <div className="grid min-w-[220px] content-between gap-2 rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs text-white/50">Assets já inclusos</p>
              <img src="/branding/tclean-wordmark.svg" alt="T.Clean" className="h-10 w-auto" />
            </div>
          </div>
        </section>

        <section className="surface noise flex items-center justify-center rounded-[2rem] p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img src="/branding/tclean-icon.svg" alt="T.Clean" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-black tracking-tight">T.Clean</h1>
                <p className="text-sm text-white/65">Facilities mobile platform</p>
              </div>
            </div>

            <div className="panel rounded-[2rem] p-5 sm:p-6">
              <p className="badge">Acesso com e-mail + token</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight">Entrar na operação</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">
                O time de limpeza acessa a rota do dia. O líder acessa o painel executivo.
              </p>
              <div className="mt-6">
                <LoginForm />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
