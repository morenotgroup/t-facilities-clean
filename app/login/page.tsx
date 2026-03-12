import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(94,92,230,0.22),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(0,194,255,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(0,255,163,0.10),transparent_30%),linear-gradient(135deg,#050816_0%,#070b17_45%,#030508_100%)]" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-7">
            <div className="mb-8 flex items-center gap-4">
              <img
                src="/branding/tclean-icon.svg"
                alt="T.Clean"
                className="h-14 w-14 rounded-2xl border border-white/10 bg-black/20 p-2"
              />
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white">T.Clean</h1>
                <p className="text-sm text-white/60">Acesso à operação de limpeza</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                Login seguro
              </p>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
                Entrar no sistema
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/62">
                Use seu e-mail corporativo e token de acesso para abrir sua operação do dia.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
