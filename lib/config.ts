export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  appName: process.env.APP_NAME || "T.Clean",
  sheetId: process.env.GOOGLE_SHEET_ID || "",
  projectId: process.env.GOOGLE_PROJECT_ID || "",
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
  privateKey: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  driveFolderId: process.env.GOOGLE_DRIVE_EVIDENCES_FOLDER_ID || "",
  drivePublic: String(process.env.GOOGLE_DRIVE_MAKE_PUBLIC || "false") === "true",
  sessionSecret: process.env.SESSION_SECRET || "troque-essa-chave"
};

export const SHEETS = {
  collaborators: "COLABORADORES_FACILITIES!A2:F",
  ambientes: "AMBIENTES!A2:Q",
  registros: "REGISTROS_LIMPEZA!A2:N",
  feedbacks: "FEEDBACK_AMBIENTES!A2:H"
};
