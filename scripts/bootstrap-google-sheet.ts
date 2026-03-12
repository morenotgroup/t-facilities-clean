import "dotenv/config";
import { google } from "googleapis";
import { env, SHEETS } from "../lib/config";

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.serviceAccount.client_email,
      private_key: env.serviceAccount.private_key,
      project_id: env.serviceAccount.project_id
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive"
    ]
  });

  const sheets = google.sheets({ version: "v4", auth });

  console.log("Auth Google inicializado com sucesso.");
  console.log("Sheet ID:", env.sheetId);

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: env.sheetId
  });

  const existingSheets =
    spreadsheet.data.sheets
      ?.map((sheet) => sheet.properties?.title)
      .filter((title): title is string => Boolean(title)) ?? [];

  const requiredSheets = [
    SHEETS.registrosTab,
    SHEETS.feedbacksTab,
    SHEETS.tokensTab,
    SHEETS.configTab
  ];

  const missingSheets = requiredSheets.filter(
    (name) => !existingSheets.includes(name)
  );

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
    range: `${SHEETS.registrosTab}!A1:N1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        "log_id",
        "timestamp",
        "date_ref",
        "worker_id",
        "worker_name",
        "worker_email",
        "environment_slug",
        "environment_name",
        "status",
        "started_at",
        "finished_at",
        "duration_min",
        "notes",
        "photo_url"
      ]]
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.sheetId,
    range: `${SHEETS.feedbacksTab}!A1:H1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        "feedback_id",
        "timestamp",
        "environment_slug",
        "environment_name",
        "feedback_type",
        "message",
        "created_by",
        "status"
      ]]
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.sheetId,
    range: `${SHEETS.tokensTab}!A1:F1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        "email",
        "token",
        "role",
        "display_name",
        "is_active",
        "notes"
      ]]
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.sheetId,
    range: `${SHEETS.configTab}!A1:B6`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        ["key", "value"],
        ["app_name", "T.Clean"],
        ["company_name", "T.Group"],
        ["leader_email", "facilities@agenciataj.com"],
        ["drive_public_links", String(env.drivePublic)],
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
