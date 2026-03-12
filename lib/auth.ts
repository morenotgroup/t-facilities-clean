import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { env } from "./config";
import { SessionPayload } from "./types";

const secret = new TextEncoder().encode(env.sessionSecret);

export async function createSession(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getOptionalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tclean_session")?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getRequiredSession(expected: "leader" | "staff") {
  const session = await getOptionalSession();

  if (!session) {
    redirect("/login");
  }

  if (expected === "leader" && session.role !== "leader") {
    redirect("/staff");
  }

  if (expected === "staff" && session.role !== "staff") {
    redirect("/leader");
  }

  return session;
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get("tclean_session")?.value;
  if (!token) return null;
  return verifySession(token);
}
