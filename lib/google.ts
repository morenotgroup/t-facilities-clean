import { Readable } from "node:stream";
import { google } from "googleapis";
import { env } from "./config";

function getAuth() {
  return new google.auth.GoogleAuth({
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
}

export async function getSheetsClient() {
  const auth = await getAuth().getClient();
  return google.sheets({ version: "v4", auth });
}

export async function getDriveClient() {
  const auth = await getAuth().getClient();
  return google.drive({ version: "v3", auth });
}

export async function readRange(range: string) {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.sheetId,
    range
  });

  return response.data.values || [];
}

export async function appendRow(sheetName: string, values: string[]) {
  const sheets = await getSheetsClient();
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
  const drive = await getDriveClient();

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
