import { google } from 'googleapis';

export async function handler(event, context) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1uACUK3A6Ih82OD6uHeJFhZojGBcDULKz5JeqXL4QCT0";

    // Read the full sheet
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A1:F336" // adjust if needed: 7 days × 48 rows × 5 people
    });

    const values = res.data.values || [];

    return { statusCode: 200, body: JSON.stringify(values) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to read sheet" }) };
  }
}
