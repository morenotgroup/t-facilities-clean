import { NextRequest, NextResponse } from "next/server";
import { registerPublicFeedback } from "@/lib/facilities";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const slug = String(body.slug || "").trim();
  const tipo = String(body.tipo || "").trim();
  const mensagem = String(body.mensagem || "").trim();
  const nome = String(body.nome || "").trim();

  if (!slug || !tipo || !mensagem) {
    return NextResponse.json({ ok: false, message: "Preencha os campos obrigatórios." }, { status: 400 });
  }

  await registerPublicFeedback({ slug, tipo, mensagem, nome });

  return NextResponse.json({ ok: true });
}
