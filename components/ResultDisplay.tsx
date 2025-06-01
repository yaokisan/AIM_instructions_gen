import React, { useState } from 'react';
import type { ProcessError, AppStep } from '../types';

interface ResultDisplayProps {
  outputMessage: string | null;
  error: ProcessError | null;
  onReset: () => void;
  instructionUrl: string | null;
  documentTitle: string | null;
  videoNumber: string | null;
  releaseDate: string | null; // YYYY-MM-DD
  firstDraftReturnDate: string | null; // YYYY年M月D日
  currentStep: AppStep;
  isLoading: boolean; // Added to manage display during processing states
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  outputMessage, 
  error, 
  onReset,
  instructionUrl,
  documentTitle,
  videoNumber,
  releaseDate,
  firstDraftReturnDate,
  currentStep,
  isLoading
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!outputMessage) return;
    
    try {
      await navigator.clipboard.writeText(outputMessage);
      setIsCopied(true);
      // 2秒後にコピー状態をリセット
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  if (isLoading && currentStep === 'processing') {
    // Optionally, show more detailed loading progress here if desired,
    // but LoadingIndicator is global. This component might show placeholder for results.
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
        </div>
    );
  }

  if (currentStep === 'error' && error) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500 mr-3" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <h2 className="text-xl font-semibold text-red-700">エラーが発生しました</h2>
        </div>
        <div className="bg-red-50 p-4 rounded-md border border-red-200" role="alert">
          <p className="text-sm font-medium text-red-800">エラー箇所: {error.step}</p>
          <p className="text-sm text-red-700 mt-1 whitespace-pre-wrap">{error.message}</p>
        </div>
        <button
          onClick={onReset}
          className="mt-6 w-full bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors"
        >
          {error.step.includes("APIキー設定") ? "閉じる" : "最初からやり直す"}
        </button>
      </div>
    );
  }

  if (currentStep === 'result' && outputMessage) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600 mr-3" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <h2 className="text-xl font-semibold text-slate-700">STEP 4: 処理結果</h2>
        </div>

        <div className="mb-6 space-y-3 bg-slate-50 p-4 rounded-md border border-slate-200">
          <h3 className="text-md font-medium text-slate-600">入力・抽出・計算情報：</h3>
          {instructionUrl && <p className="text-sm text-slate-700">指示書URL: <span className="font-semibold text-sky-700 break-all">{instructionUrl}</span></p>}
          {documentTitle && <p className="text-sm text-slate-700">ドキュメントタイトル (取得値): <span className="font-semibold text-sky-700">{documentTitle}</span></p>}
          {videoNumber && <p className="text-sm text-slate-700">動画番号 (抽出値): <span className="font-semibold text-sky-700">{videoNumber}</span></p>}
          {releaseDate && <p className="text-sm text-slate-700">公開日 (取得値): <span className="font-semibold text-sky-700">{releaseDate}</span></p>}
          {firstDraftReturnDate && <p className="text-sm text-slate-700">初稿戻し日 (計算値): <span className="font-semibold text-sky-700">{firstDraftReturnDate}</span></p>}
        </div>
        
        <div className="bg-slate-800 text-slate-100 p-4 rounded-lg shadow-inner relative">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-sky-300">生成されたメッセージ:</p>
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                isCopied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
              }`}
              title="メッセージをコピー"
            >
              {isCopied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>コピー完了</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                  </svg>
                  <span>コピー</span>
                </>
              )}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed break-all">{outputMessage}</pre>
        </div>
        
        <button
          onClick={onReset}
          className="mt-8 w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
        >
          最初からやり直す
        </button>
      </div>
    );
  }

  // Fallback for unhandled currentStep or if isLoading is true but not 'processing'
  // Or if currentStep is 'processing' but isLoading is false (should not happen)
  return null;
};
