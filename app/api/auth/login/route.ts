import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { findUserByCredentials } from "@/lib/facilities";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const token = String(body.token || "").trim();

    if (!email || !token) {
      return NextResponse.json(
        { ok: false, message: "Preencha e-mail e token." },
        { status: 400 }
      );
    }

    const user = await findUserByCredentials(email, token);

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Credenciais não encontradas na base." },
        { status: 401 }
      );
    }

    const sessionToken = await createSession({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    });

    const response = NextResponse.json({
      ok: true,
      redirectTo: user.role === "leader" ? "/leader" : "/staff"
    });

    response.cookies.set("tclean_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR", error);

    const message =
      error instanceof Error
        ? error.message
        : "Erro interno ao autenticar.";

    return NextResponse.json(
      { ok: false, message },
      { status: 500 }
    );
  }
}
