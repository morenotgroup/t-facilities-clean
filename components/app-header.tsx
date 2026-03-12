import { SessionPayload } from "@/lib/types";
import { LogOut } from "lucide-react";
import { LogoutButton } from "./logout-button";

export function AppHeader({ session }: { session: SessionPayload }) {
  return (
    <header className="surface rounded-[1.8rem] px-4 py-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/branding/tclean-icon.svg" alt="T.Clean" className="h-12 w-12" />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">T.Clean</p>
            <p className="text-lg font-black tracking-tight">{session.displayName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="badge">{session.role === "leader" ? "Líder Facilities" : "Operação de Limpeza"}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
