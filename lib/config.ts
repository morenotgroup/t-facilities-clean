type ServiceAccountShape = {
  client_email: string;
  private_key: string;
  project_id: string;
};

type EnvShape = {
  appUrl: string;
  appName: string;
  sheetId: string;
  driveFolderId: string;
  drivePublic: boolean;
  sessionSecret: string;
  serviceAccount: ServiceAccountShape;
};

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Variável obrigatória ausente: ${name}`);
  }
  return value;
}

function normalizePrivateKey(value: string) {
  const raw = String(value).trim();

  const unquoted =
    raw.startsWith('"') && raw.endsWith('"')
      ? raw.slice(1, -1)
      : raw;

  return unquoted
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "")
    .trim();
}

function parseJsonString(jsonString: string): ServiceAccountShape {
  const parsed = JSON.parse(jsonString);

  if (!parsed.client_email || !parsed.private_key || !parsed.project_id) {
    throw new Error("Credencial da service account inválida.");
  }

  return {
    client_email: String(parsed.client_email).trim(),
    private_key: normalizePrivateKey(parsed.private_key),
    project_id: String(parsed.project_id).trim()
  };
}

function parseServiceAccount(): ServiceAccountShape {
  const rawValue = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;

  if (rawValue) {
    const trimmed = rawValue.trim();

    try {
      if (trimmed.startsWith("{")) {
        return parseJsonString(trimmed);
      }

      const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
      return parseJsonString(decoded);
    } catch (error) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 inválida. Use JSON puro ou Base64 válido do JSON da service account."
      );
    }
  }

  return {
    client_email: requireEnv(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL",
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    ),
    private_key: normalizePrivateKey(
      requireEnv("GOOGLE_PRIVATE_KEY", process.env.GOOGLE_PRIVATE_KEY)
    ),
    project_id: requireEnv(
      "GOOGLE_PROJECT_ID",
      process.env.GOOGLE_PROJECT_ID
    )
  };
}

export const env: EnvShape = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  appName: process.env.APP_NAME || "T.Clean",
  sheetId: requireEnv("GOOGLE_SHEET_ID", process.env.GOOGLE_SHEET_ID),
  driveFolderId: process.env.GOOGLE_DRIVE_EVIDENCES_FOLDER_ID || "",
  drivePublic:
    String(process.env.GOOGLE_DRIVE_MAKE_PUBLIC || "false").toLowerCase() ===
    "true",
  sessionSecret: requireEnv("SESSION_SECRET", process.env.SESSION_SECRET),
  serviceAccount: parseServiceAccount()
};

export const SHEETS = {
  collaboratorsTab: "COLABORADORES_FACILITIES",
  ambientesTab: "AMBIENTES",
  registrosTab: "REGISTROS_LIMPEZA",
  feedbacksTab: "FEEDBACK_AMBIENTES",
  tokensTab: "TOKENS_LOGIN",
  configTab: "CONFIGURACOES_APP",

  collaborators: "COLABORADORES_FACILITIES!A2:F",
  ambientes: "AMBIENTES!A2:Q",
  registros: "REGISTROS_LIMPEZA!A2:N",
  feedbacks: "FEEDBACK_AMBIENTES!A2:H"
};
