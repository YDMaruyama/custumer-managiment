import { google } from 'googleapis';

// Define a type for the customer record stored in Google Sheets
export interface CustomerRecord {
  id: string;
  name: string;
  kana?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  firstVisitDate?: string;
  lastVisitDate?: string;
  visitCount?: number;
  tags?: string;
  allergy?: string;
  history?: string;
  consent?: string;
  note?: string;
}

// Build an authenticated Google Sheets client using environment variables
async function getSheetsService() {
  const projectId = process.env.GOOGLE_PROJECT_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Google Sheets API credentials are not fully configured');
  }
  // Replace escaped newlines with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    projectId,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

/**
 * Fetch all rows from the specified sheet.
 * Returns an array of CustomerRecord objects.
 */
export async function getAllCustomers(sheetName: string): Promise<CustomerRecord[]> {
  const sheets = await getSheetsService();
  const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error('SHEETS_SPREADSHEET_ID is not set');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z`,
  });
  const rows = response.data.values || [];
  if (rows.length < 1) return [];
  // Assume first row is header
  const headers = rows[0].map((h: string) => h.trim());
  const records: CustomerRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const record: any = {};
    headers.forEach((header: string, idx: number) => {
      record[header] = row[idx];
    });
    // Convert numeric visitCount to number if present
    if (record.visitCount !== undefined) {
      const n = Number(record.visitCount);
      record.visitCount = isNaN(n) ? undefined : n;
    }
    records.push(record as CustomerRecord);
  }
  return records;
}

/**
 * Append a new customer record to the sheet. The order of fields must
 * correspond to the header row in the sheet.
 */
export async function appendCustomer(sheetName: string, data: CustomerRecord): Promise<void> {
  const sheets = await getSheetsService();
  const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error('SHEETS_SPREADSHEET_ID is not set');
  // Flatten record values in the correct order (matching headers)
  // We assume the first row already exists with headers
  const existing = await getAllCustomers(sheetName);
  const headers = Object.keys(existing[0] || data);
  const row = headers.map((header) => {
    const value: any = (data as any)[header];
    return value === undefined ? '' : String(value);
  });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });
}

/**
 * Update an existing row matching the given ID. Assumes that 'id' is in column A.
 */
export async function updateCustomer(sheetName: string, id: string, data: Partial<CustomerRecord>): Promise<void> {
  const sheets = await getSheetsService();
  const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error('SHEETS_SPREADSHEET_ID is not set');
  // Fetch all data to find row index
  const customers = await getAllCustomers(sheetName);
  const rowIndex = customers.findIndex((c) => c.id === id);
  if (rowIndex === -1) throw new Error(`No customer with id ${id}`);
  // rowIndex is zero-based relative to data array, but Google Sheets rows start at 1
  const targetRow = rowIndex + 2; // +1 for header row, +1 for 1-indexed
  const existingRecord = customers[rowIndex];
  const updatedRecord = { ...existingRecord, ...data };
  const headers = Object.keys(updatedRecord);
  const rowValues = headers.map((header) => {
    const value: any = (updatedRecord as any)[header];
    return value === undefined ? '' : String(value);
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${targetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowValues],
    },
  });
}

/**
 * Delete a customer by ID. This will remove the entire row.
 */
export async function deleteCustomer(sheetName: string, id: string): Promise<void> {
  const sheets = await getSheetsService();
  const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error('SHEETS_SPREADSHEET_ID is not set');
  const customers = await getAllCustomers(sheetName);
  const rowIndex = customers.findIndex((c) => c.id === id);
  if (rowIndex === -1) throw new Error(`No customer with id ${id}`);
  const targetRow = rowIndex + 2; // +2 for header
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: await getSheetId(sheets, spreadsheetId, sheetName),
              dimension: 'ROWS',
              startIndex: targetRow - 1,
              endIndex: targetRow,
            },
          },
        },
      ],
    },
  });
}

/**
 * Helper to get the sheetId given its name.
 */
async function getSheetId(sheetsService: any, spreadsheetId: string, sheetName: string): Promise<number> {
  const metadata = await sheetsService.spreadsheets.get({ spreadsheetId });
  const sheet = metadata.data.sheets?.find((s: any) => s.properties?.title === sheetName);
  if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
  return sheet.properties.sheetId;
}