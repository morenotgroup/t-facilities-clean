type ServiceAccountShape = {
  client_email: string;
  private_key: string;
  project_id: string;
};

type EnvShape = {
  sheetId: string;
  driveFolderId: string;
  drivePublic: boolean;
  serviceAccount: ServiceAccountShape;
};

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Variável obrigatória ausente: ${name}`);
  }
  return value;
}

function normalizePrivateKey(value: string) {
  return String(value)
    .replace(/^"(.*)"$/s, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "")
    .trim();
}

function parseServiceAccount(): ServiceAccountShape {
  const jsonBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;

  if (jsonBase64) {
    const jsonString = Buffer.from(jsonBase64, "base64").toString("utf-8");
    const parsed = JSON.parse(jsonString);

    if (!parsed.client_email || !parsed.private_key || !parsed.project_id) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 inválida.");
    }

    return {
      client_email: String(parsed.client_email).trim(),
      private_key: normalizePrivateKey(parsed.private_key),
      project_id: String(parsed.project_id).trim()
    };
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
  sheetId: requireEnv("GOOGLE_SHEET_ID", process.env.GOOGLE_SHEET_ID),
  driveFolderId: process.env.GOOGLE_DRIVE_EVIDENCES_FOLDER_ID || "",
  drivePublic:
    String(process.env.GOOGLE_DRIVE_MAKE_PUBLIC || "false").toLowerCase() ===
    "true",
  serviceAccount: parseServiceAccount()
};
