import { Readable } from "node:stream";
import { google } from "googleapis";
import { env } from "./config";

function getAuth() {
  return new google.auth.GoogleAuth({
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
}

export function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

export function getDriveClient() {
  const auth = getAuth();
  return google.drive({ version: "v3", auth });
}

export async function readRange(range: string) {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.sheetId,
    range
  });

  return response.data.values || [];
}

export async function appendRow(sheetName: string, values: string[]) {
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.sheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values]
    }
  });
}

export async function uploadPhotoToDrive({
  fileName,
  mimeType,
  buffer
}: {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const drive = getDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: env.driveFolderId ? [env.driveFolderId] : undefined
    },
    media: {
      mimeType,
      body: Readable.from(buffer)
    },
    fields: "id,webViewLink,webContentLink"
  });

  const fileId = response.data.id;

  if (fileId && env.drivePublic) {
    await drive.permissions.create({
      fileId,
      requestBody: {
        type: "anyone",
        role: "reader"
      }
    });
  }

  return {
    fileId: fileId || "",
    webViewLink: response.data.webViewLink || "",
    webContentLink: response.data.webContentLink || ""
  };
}
