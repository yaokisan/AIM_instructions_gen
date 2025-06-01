
import React, { useState } from 'react';

interface InputFormProps {
  onSubmit: (url: string) => void;
  initialUrl?: string;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, initialUrl = '' }) => {
  const [url, setUrl] = useState<string>(initialUrl);
  const [formError, setFormError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setFormError('指示書URLを入力してください。');
      return;
    }
    try {
      const parsedUrl = new URL(url);
      if (!parsedUrl.protocol.startsWith('http')) {
        throw new Error("Invalid protocol");
      }
    } catch (_) {
      setFormError('有効な指示書URLを入力してください。 (例: https://docs.google.com/...)');
      return;
    }
    setFormError('');
    onSubmit(url);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-slate-700 mb-6">STEP 1: 指示書URL入力</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="instructionUrl" className="block text-sm font-medium text-slate-600 mb-1">
            指示書URL (Googleドキュメント)
          </label>
          <input
            type="url"
            id="instructionUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="例: https://docs.google.com/document/d/..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            required
            aria-describedby={formError ? "form-error-message" : undefined}
          />
        </div>
        
        {formError && (
          <p id="form-error-message" role="alert" className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{formError}</p>
        )}
        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-150 ease-in-out transform hover:scale-105"
        >
          処理開始
        </button>
      </form>
    </div>
  );
};
