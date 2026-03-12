import { google } from "googleapis";
import { env } from "../lib/config";

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.serviceAccountEmail,
      private_key: env.privateKey,
      project_id: env.projectId
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: env.sheetId
  });

  const titles = (spreadsheet.data.sheets || []).map((item) => item.properties?.title).filter(Boolean);
  const wants = ["REGISTROS_LIMPEZA", "FEEDBACK_AMBIENTES"];
  const addRequests = wants
    .filter((title) => !titles.includes(title))
    .map((title) => ({
      addSheet: {
        properties: { title }
      }
    }));

  if (addRequests.length) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: env.sheetId,
      requestBody: { requests: addRequests }
    });
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.sheetId,
    range: "REGISTROS_LIMPEZA!A1:N1",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        "ROW_ID",
        "CREATED_AT",
        "DATE",
        "COLAB_ID",
        "COLAB_NAME",
        "COLAB_EMAIL",
        "AMBIENTE_SLUG",
        "AMBIENTE_NOME",
        "STATUS",
        "STARTED_AT",
        "FINISHED_AT",
        "DURATION_MIN",
        "NOTES",
        "PHOTO_URL"
      ]]
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.sheetId,
    range: "FEEDBACK_AMBIENTES!A1:H1",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        "ROW_ID",
        "CREATED_AT",
        "AMBIENTE_SLUG",
        "AMBIENTE_NOME",
        "TIPO",
        "MENSAGEM",
        "NOME",
        "STATUS"
      ]]
    }
  });

  console.log("Planilha preparada com abas e cabeçalhos do T.Clean.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
