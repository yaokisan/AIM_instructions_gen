
export type AppStep = 'input' | 'processing' | 'result' | 'error';

export interface ProcessError {
  step: string; // e.g., "ドキュメントタイトル取得", "動画番号抽出 (Gemini)", "公開日取得 (スプレッドシート)", "APIキー設定"
  message: string;
}

// SpreadsheetRow type removed from here, will be local to spreadsheetService if needed,
// or API responses will be handled directly.
