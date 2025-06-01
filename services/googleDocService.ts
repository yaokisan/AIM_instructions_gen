/**
 * Extracts the Google Document ID from a URL.
 * Handles various Google Docs URL formats.
 * @param url The Google Document URL.
 * @returns The Document ID or null if not found.
 */
const extractDocumentId = (url: string): string | null => {
  const patterns = [
    /document\/d\/([a-zA-Z0-9-_]+)/, // Standard /d/ID/edit format
    /open\?id=([a-zA-Z0-9-_]+)/,      // /open?id=ID format
    // Add more patterns if needed for other URL structures
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  console.warn("Could not extract Document ID from URL:", url);
  return null;
};

/**
 * Fetches the title of a Google Document using the Google Drive API.
 * @param apiKey The Google API key.
 * @param documentUrl The URL of the Google Document.
 * @returns The document title as a string, or null if an error occurs or title not found.
 */
export const fetchDocumentTitle = async (apiKey: string, documentUrl: string): Promise<string | null> => {
  const documentId = extractDocumentId(documentUrl);
  if (!documentId) {
    console.error("Invalid Google Document URL or unable to extract Document ID.");
    throw { step: "ドキュメントタイトル取得", message: `無効なGoogleドキュメントURL、またはドキュメントIDを抽出できませんでした: ${documentUrl}` };
  }

  // Google Drive API を使用してファイルのメタデータ（タイトル）を取得
  const url = `https://www.googleapis.com/drive/v3/files/${documentId}?fields=name&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Error fetching document title: ${response.status} ${response.statusText}`, errorData);
      
      if (response.status === 403) {
         throw new Error("Google Drive API access forbidden. Check API key permissions or document sharing settings.");
      }
      if (response.status === 404) {
         throw new Error("Google Document not found. Check if the URL and Document ID are correct.");
      }
      throw new Error(`Google Drive API request failed: ${response.status} ${response.statusText}.`);
    }

    const data = await response.json();
    if (data && data.name) {
      return data.name;
    } else {
      console.warn("Document title not found in API response for ID:", documentId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching document title from Google Drive API:", error);
    if (error instanceof Error) {
        throw { step: "ドキュメントタイトル取得", message: error.message };
    }
    throw { step: "ドキュメントタイトル取得", message: "Google Drive APIへの接続中に不明なエラーが発生しました。" };
  }
};
