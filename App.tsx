import React, { useState, useEffect, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingIndicator } from './components/LoadingIndicator';
import { fetchDocumentTitle } from './services/googleDocService';
import { extractVideoNumberFromTitle } from './services/geminiService';
import { getReleaseDateFromSheet } from './services/spreadsheetService';
import { calculateFirstDraftReturnDate } from './utils/dateUtils';
import type { AppStep, ProcessError } from './types';

// Constants for Google Sheets access
const SPREADSHEET_ID = '1qK5u_ioBDrebXkPtlEaF7J9TQ5_XYdihsMYU6hK7x8k';
const SHEET_NAME = 'CRH_マスター'; // Make sure this matches the exact tab name
const VIDEO_NUMBER_COLUMN_LETTER = 'B'; // Column for Video Number
const RELEASE_DATE_COLUMN_LETTER = 'X'; // Column for Release Date
const MAX_ROWS_TO_CHECK = 500;

const App: React.FC = () => {
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [googleApiKey, setGoogleApiKey] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState<AppStep>('input');
  const [instructionUrl, setInstructionUrl] = useState<string>('');
  const [fetchedDocumentTitle, setFetchedDocumentTitle] = useState<string | null>(null);
  
  const [videoNumber, setVideoNumber] = useState<string | null>(null);
  const [releaseDate, setReleaseDate] = useState<string | null>(null); // YYYY-MM-DD
  const [firstDraftReturnDate, setFirstDraftReturnDate] = useState<string | null>(null); // YYYY年M月D日

  const [outputMessage, setOutputMessage] = useState<string | null>(null);
  const [error, setError] = useState<ProcessError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const googleKey = import.meta.env.VITE_GOOGLE_API_KEY;

    console.log('Google API Key loaded:', googleKey ? `${googleKey.substring(0, 10)}...` : 'NOT FOUND');

    let setupError = false;
    if (!geminiKey) {
      setError({
        step: "APIキー設定 (Gemini)",
        message: "Gemini APIキーが設定されていません。README.mdの手順に従って、環境変数 VITE_GEMINI_API_KEY を設定してください。"
      });
      setupError = true;
    } else {
      setGeminiApiKey(geminiKey);
    }

    if (!googleKey) {
      setError(prevError => ({
        step: prevError ? prevError.step + ", Google" : "APIキー設定 (Google)",
        message: (prevError ? prevError.message + "\n" : "") + "Google APIキーが設定されていません。README.mdの手順に従って、環境変数 VITE_GOOGLE_API_KEY を設定してください。"
      }));
      setupError = true;
    } else {
      setGoogleApiKey(googleKey);
    }
    
    if (setupError) {
        setCurrentStep('error');
    }

  }, []);

  const resetState = useCallback(() => {
    setCurrentStep('input');
    setInstructionUrl('');
    setFetchedDocumentTitle(null);
    setVideoNumber(null);
    setReleaseDate(null);
    setFirstDraftReturnDate(null);
    setOutputMessage(null);
    
    if (error && !error.step.startsWith("APIキー設定")) {
       setError(null);
    }
    setIsLoading(false);
  }, [error]);


  const handleSubmit = async (url: string) => {
    if (!geminiApiKey || !googleApiKey) {
      setError({ step: "APIキー検証", message: "必要なAPIキーが利用できません。設定を確認してください。" });
      setCurrentStep('error');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInstructionUrl(url);
    setFetchedDocumentTitle(null); // Reset previous title if any
    setVideoNumber(null);
    setReleaseDate(null);
    setFirstDraftReturnDate(null);
    setOutputMessage(null);

    try {
      // STEP 1 (Part 1): Fetch Document Title
      setCurrentStep('processing'); // Update step for user feedback
      const title = await fetchDocumentTitle(googleApiKey, url);
      if (!title) {
        throw { step: "ドキュメントタイトル取得", message: "Googleドキュメントのタイトルを取得できませんでした。URLが正しいか、ドキュメントが共有されているか確認してください。" };
      }
      setFetchedDocumentTitle(title);

      // STEP 1 (Part 2) & STEP 2 (Part 1): Extract video number using Gemini
      const extractedVideoNum = await extractVideoNumberFromTitle(geminiApiKey, title);
      if (!extractedVideoNum) {
        throw { step: "動画番号抽出 (Gemini)", message: `タイトル「${title}」から3桁の動画番号を抽出できませんでした。` };
      }
      setVideoNumber(extractedVideoNum);

      // STEP 2 (Part 2): Get release date from Google Sheet
      const fetchedReleaseDate = await getReleaseDateFromSheet(
        googleApiKey,
        SPREADSHEET_ID,
        SHEET_NAME,
        VIDEO_NUMBER_COLUMN_LETTER,
        RELEASE_DATE_COLUMN_LETTER,
        MAX_ROWS_TO_CHECK,
        extractedVideoNum
      );
      if (!fetchedReleaseDate) {
        throw { step: "公開日取得 (スプレッドシート)", message: `動画番号「${extractedVideoNum}」に対応する公開日がスプレッドシートで見つかりませんでした。シートの内容や共有設定を確認してください。` };
      }
      setReleaseDate(fetchedReleaseDate);
      
      // STEP 3: Calculate first draft return date
      const calculatedDraftDate = calculateFirstDraftReturnDate(fetchedReleaseDate);
      if (!calculatedDraftDate) {
        throw { step: "初稿戻し日計算", message: "初稿戻し日の計算に失敗しました。" };
      }
      setFirstDraftReturnDate(calculatedDraftDate);

      // STEP 4: Prepare output message
      const message = `${title}\n${url}\n${calculatedDraftDate}までに初稿よろしくお願いいたします！`;
      setOutputMessage(message);
      setCurrentStep('result');

    } catch (err) {
      const typedError = err as ProcessError; // Type assertion
      console.error("Processing error:", typedError);
      setError({ 
        step: typedError.step || "不明な処理", 
        message: typedError.message || "予期せぬエラーが発生しました。"
      });
      setCurrentStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-700">AIM編集指示テキスト自動生成</h1>
        <p className="text-slate-500 mt-2">AIMの指示書URLからタスク期日を自動計算します。</p>
      </header>

      {isLoading && <LoadingIndicator />}

      {!isLoading && currentStep === 'input' && (
         <InputForm onSubmit={handleSubmit} initialUrl={instructionUrl} />
      )}

      {!isLoading && (currentStep === 'result' || currentStep === 'error' || currentStep === 'processing') && (
        <ResultDisplay
          outputMessage={outputMessage}
          error={error}
          onReset={resetState}
          instructionUrl={instructionUrl}
          documentTitle={fetchedDocumentTitle}
          videoNumber={videoNumber}
          releaseDate={releaseDate}
          firstDraftReturnDate={firstDraftReturnDate}
          currentStep={currentStep}
          isLoading={isLoading}
        />
      )}
       <footer className="mt-12 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} AI Task Assistant. All rights reserved.</p>
        <p className="mt-1">Powered by React, Tailwind CSS, Google Gemini API, Google Docs API, and Google Sheets API.</p>
      </footer>
    </div>
  );
};

export default App;
