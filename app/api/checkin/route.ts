import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getRouteByInstanceForUser, registerCheckin } from "@/lib/facilities";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session || session.role !== "staff") {
    return NextResponse.json({ ok: false, message: "Sessão inválida." }, { status: 401 });
  }

  const formData = await request.formData();

  const instanceId = String(formData.get("instanceId") || "");
  const status = String(formData.get("status") || "CONCLUIDA");
  const notes = String(formData.get("notes") || "");
  const startedAt = String(formData.get("startedAt") || "");
  const finishedAt = String(formData.get("finishedAt") || "");
  const justification = String(formData.get("justification") || "");
  const file = formData.get("photo");

  const route = await getRouteByInstanceForUser(session, instanceId);

  if (!route) {
    return NextResponse.json({ ok: false, message: "Rota não encontrada para este usuário." }, { status: 404 });
  }

  const result = await registerCheckin({
    session,
    route,
    status,
    notes,
    startedAt,
    finishedAt,
    justification,
    file: file instanceof File ? file : null
  });

  return NextResponse.json({ ok: true, result });
}
