import "dotenv/config";
import { google } from "googleapis";
import { env } from "../lib/config";

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.serviceAccountEmail,
      private_key: env.privateKey,
      project_id: env.projectId
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive"
    ]
  });

  const sheets = google.sheets({
    version: "v4",
    auth
  });

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: env.sheetId
  });

  const existingSheets =
    spreadsheet.data.sheets?.map((sheet) => sheet.properties?.title).filter(Boolean) ?? [];

  const requiredSheets = [
    "Logs_Limpeza",
    "Feedbacks_Publicos",
    "Tokens_Login",
    "Configuracoes_App"
  ];

  const missingSheets = requiredSheets.filter((name) => !existingSheets.includes(name));

  if (missingSheets.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: env.sheetId,
      requestBody: {
        requests: missingSheets.map((title) => ({
          addSheet: {
            properties: { title }
          }
        }))
      }
    });
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.sheetId,
    range: "Logs_Limpeza!A1:N2",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          "log_id",
          "timestamp",
          "date_ref",
          "worker_email",
          "worker_name",
          "environment_id",
          "environment_name",
          "status",
          "justification",
          "issues_found",
          "photo_drive_file_id",
          "photo_url",
          "started_at",
          "finished_at"
        ]
      ]
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.sheetId,
    range: "Feedbacks_Publicos!A1:G2",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          "feedback_id",
          "timestamp",
          "environment_id",
          "environment_name",
          "feedback_type",
          "message",
          "created_by"
        ]
      ]
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.sheetId,
    range: "Tokens_Login!A1:F2",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          "email",
          "token",
          "role",
          "display_name",
          "is_active",
          "notes"
        ]
      ]
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.sheetId,
    range: "Configuracoes_App!A1:B6",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        ["key", "value"],
        ["app_name", "T.Clean"],
        ["company_name", "T.Group"],
        ["leader_email", "bruno@t.group"],
        ["drive_public_links", "false"],
        ["version", "1.0.0"]
      ]
    }
  });

  console.log("Planilha preparada com sucesso.");
}

main().catch((error) => {
  console.error("Erro ao preparar a planilha:", error);
  process.exit(1);
});
