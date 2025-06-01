
// Helper to convert column letter to 0-indexed number
function columnLetterToIndex(letter: string): number {
  let column = 0, length = letter.length;
  for (let i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column - 1;
}

/**
 * Fetches the release date from a Google Sheet.
 * @param apiKey Google API Key.
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @param sheetName The name of the sheet/tab.
 * @param videoNumberColumnLetter The column letter for video numbers (e.g., 'B').
 * @param releaseDateColumnLetter The column letter for release dates (e.g., 'X').
 * @param maxRowsToSearch The maximum number of rows to search in the specified columns.
 * @param targetVideoNumber The 3-digit video number to search for.
 * @returns The release date in YYYY-MM-DD format, or null if not found or error.
 */
export const getReleaseDateFromSheet = async (
  apiKey: string,
  spreadsheetId: string,
  sheetName: string,
  videoNumberColumnLetter: string,
  releaseDateColumnLetter: string,
  maxRowsToSearch: number,
  targetVideoNumber: string
): Promise<string | null> => {
  
  // Determine the range to fetch. Example: If B and X, fetch B1:X500
  // This ensures we get both columns in one go.
  const firstCol = videoNumberColumnLetter < releaseDateColumnLetter ? videoNumberColumnLetter : releaseDateColumnLetter;
  const lastCol = videoNumberColumnLetter > releaseDateColumnLetter ? videoNumberColumnLetter : releaseDateColumnLetter;
  const range = `${sheetName}!${firstCol}1:${lastCol}${maxRowsToSearch}`;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty obj
      console.error(`Error fetching spreadsheet data: ${response.status} ${response.statusText}`, errorData);
      throw new Error(`Google Sheets API request failed: ${response.status} ${response.statusText}. Check API key, spreadsheet ID, and sheet permissions.`);
    }

    const data = await response.json();
    const rows: any[][] = data.values;

    if (!rows || rows.length === 0) {
      console.warn("No data found in the specified spreadsheet range.");
      return null;
    }

    // Determine 0-indexed positions of our target columns within the fetched range
    const videoNumColIndexInFetchedRange = columnLetterToIndex(videoNumberColumnLetter) - columnLetterToIndex(firstCol);
    const releaseDateColIndexInFetchedRange = columnLetterToIndex(releaseDateColumnLetter) - columnLetterToIndex(firstCol);
    
    for (const row of rows) {
      // Ensure row has enough columns and the video number cell is not empty
      if (row.length > Math.max(videoNumColIndexInFetchedRange, releaseDateColIndexInFetchedRange) && row[videoNumColIndexInFetchedRange]) {
        const currentVideoNumber = String(row[videoNumColIndexInFetchedRange]).trim();
        if (currentVideoNumber === targetVideoNumber) {
          const releaseDateValue = String(row[releaseDateColIndexInFetchedRange]).trim();
          // Basic validation for YYYY-MM-DD format. More robust validation might be needed.
          if (/^\d{4}-\d{2}-\d{2}$/.test(releaseDateValue)) {
            return releaseDateValue;
          } else {
            // Handle cases where date might be a serial number or different format if needed
            console.warn(`Found video number ${targetVideoNumber}, but release date format is unexpected: ${releaseDateValue}`);
            // Attempt to parse common spreadsheet date serial numbers (Excel/Google Sheets standard)
            // This is a simplified version. For robust conversion, a library might be better.
            if (!isNaN(Number(releaseDateValue))) {
                const excelEpoch = new Date(1899, 11, 30); // Excel epoch starts Dec 30, 1899
                const date = new Date(excelEpoch.getTime() + Number(releaseDateValue) * 24 * 60 * 60 * 1000);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            }
            // If it's a string that can be parsed by Date constructor (e.g. MM/DD/YYYY)
            const parsedDate = new Date(releaseDateValue);
            if (!isNaN(parsedDate.getTime())) {
                console.warn(`Attempting to parse date string "${releaseDateValue}" directly.`);
                // Check if it's a somewhat valid date by checking year (e.g. > 1900)
                if (parsedDate.getFullYear() > 1900 && parsedDate.getFullYear() < 2100) {
                     return parsedDate.toISOString().split('T')[0];
                }
            }
            console.error(`Release date for video ${targetVideoNumber} is not in YYYY-MM-DD format and could not be parsed: ${releaseDateValue}`);
            return null; // Or throw an error for malformed date
          }
        }
      }
    }

    console.warn(`Video number "${targetVideoNumber}" not found in the spreadsheet.`);
    return null;

  } catch (error) {
    console.error("Error processing spreadsheet data:", error);
    // Re-throw or return null based on how App.tsx should handle it
    // For now, let App.tsx catch this as a generic error from this step.
    // To provide a more specific error message, can throw a custom error object.
    throw error; // Re-throw to be caught by App.tsx and set in ProcessError
  }
};
