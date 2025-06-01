# 作業自動化アシスタント (Task Automation Assistant)

このアプリケーションは、ユーザーが提供する指示書URLを基に、Googleドキュメントのタイトルを自動取得し、Gemini API と Google Sheets API を使用して情報を処理し、タスクの初稿戻し日を計算し表示します。

## セットアップ

### 環境変数

このアプリケーションを実行するには、以下のAPIキーが必要です。プロジェクトのルートディレクトリに `.env` という名前のファイルを作成し、キーを記述してください。

1.  **Gemini API Key**: Google Gemini APIへのアクセスに必要です。
    ```
    VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
    `YOUR_GEMINI_API_KEY` を実際の Gemini API キーに置き換えてください。

2.  **Google API Key**: Google Drive API（タイトル取得）および Google Sheets API（スプレッドシートデータ取得）へのアクセスに必要です。
    ```
    VITE_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
    ```
    `YOUR_GOOGLE_API_KEY` を実際の Google API キーに置き換えてください。このAPIキーは、Google Cloud Consoleで作成し、以下のAPIを有効にする必要があります：
    - **Google Drive API** (ドキュメントタイトル取得用)
    - **Google Sheets API** (スプレッドシートデータ取得用)
    
    また、アクセス対象のドキュメントやスプレッドシートが、このAPIキーで読み取り可能（例：一般公開、または「リンクを知っている全員が閲覧可」）である必要があります。

**重要 (Vite使用時):**
このアプリケーションはViteを使用しているため、環境変数には `VITE_` プレフィックスが必要です。コード内では `import.meta.env.VITE_...` としてアクセスします。

## 実行内容

1.  **STEP1：ユーザー入力とタイトル取得**
    *   ユーザーは「指示書URL」（GoogleドキュメントのURL）を入力します。
    *   アプリケーションは入力されたURLからGoogle Drive APIを利用してドキュメントのタイトル（{タイトル}）を自動で取得します。
2.  **STEP2：情報抽出とデータ照会**
    *   取得した{タイトル}からGemini APIを使用して3桁の「動画番号」（{動画番号}）を抽出します。
    *   Google Sheets APIを利用して、指定のスプレッドシート（ID: `1qK5u_ioBDrebXkPtlEaF7J9TQ5_XYdihsMYU6hK7x8k`、タブ名: "CRH\_マスター"）を検索し、B列の{動画番号}に一致する行のX列から「公開日」（{公開日}）を取得します。
3.  **STEP3：日付計算**
    *   取得した{公開日}の12日前の日付を「初稿戻し日」（{初稿戻し日}）として計算します。
4.  **STEP4：結果表示**
    *   以下の情報をコードブロック形式でユーザーに表示します。
        ```
        {タイトル}
        {指示書URL}
        {初稿戻し日}までに初稿よろしくお願いいたします！
        ```
    *   結果のコピーボタンをクリックすると、生成されたメッセージをクリップボードにコピーできます。

## 技術スタック

*   React 18+
*   TypeScript
*   Tailwind CSS (CDN)
*   Google Gemini API (`@google/genai`)
*   Google Drive API (via `fetch`)
*   Google Sheets API (via `fetch`)
*   Vite (ビルドツール)

## ローカル開発

### 必要要件
- Node.js 16.0.0以上
- npm または yarn

### インストールと実行
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## Vercelでのデプロイ

### 1. 前提条件
- Vercelアカウントの作成
- GitHubリポジトリにコードをプッシュ

### 2. デプロイ手順

#### GitHub連携でのデプロイ (推奨)
1. **Vercel Dashboard**にアクセス: https://vercel.com/dashboard
2. **「New Project」**をクリック
3. **GitHubリポジトリを選択**してインポート
4. **フレームワークプリセット**: 「Vite」が自動検出される
5. **環境変数の設定**:
   - `VITE_GEMINI_API_KEY`: あなたのGemini APIキー
   - `VITE_GOOGLE_API_KEY`: あなたのGoogle APIキー
6. **「Deploy」**をクリック

#### Vercel CLIでのデプロイ
```bash
# Vercel CLIのインストール
npm i -g vercel

# プロジェクトルートでデプロイ
vercel

# 環境変数の設定
vercel env add VITE_GEMINI_API_KEY
vercel env add VITE_GOOGLE_API_KEY

# 本番デプロイ
vercel --prod
```

### 3. 環境変数の設定

Vercel Dashboardで環境変数を設定する場合：
1. **プロジェクト** → **Settings** → **Environment Variables**
2. 以下の変数を追加：
   - **Name**: `VITE_GEMINI_API_KEY`, **Value**: `YOUR_GEMINI_API_KEY`
   - **Name**: `VITE_GOOGLE_API_KEY`, **Value**: `YOUR_GOOGLE_API_KEY`
3. **Environment**: `Production`, `Preview`, `Development` をすべて選択

### 4. カスタムドメインの設定 (オプション)
1. **Domains**タブでカスタムドメインを追加
2. DNSレコードの設定に従ってドメインを設定

### 5. 自動デプロイの有効化
GitHubと連携している場合、`main`ブランチへのプッシュで自動的にデプロイされます。

## 注意事項
* このアプリケーションは、APIキーが正しく設定され、対象のGoogleドキュメントおよびスプレッドシートが適切に共有設定されていることを前提としています。
* APIエラーや権限エラーが発生した場合は、適切なエラーメッセージが表示されます。
* 本番環境では、環境変数がブラウザに公開されるため、APIキーの制限設定を適切に行ってください。

## トラブルシューティング

### よくある問題
1. **401 Unauthorized エラー**: APIキーの設定を確認し、必要なAPIが有効化されているか確認してください。
2. **CORS エラー**: Google APIs は CORS を許可しているため、通常問題ありません。
3. **ビルドエラー**: TypeScript エラーがある場合、型定義の問題の可能性があります。

### ログの確認
- Vercel Dashboard の **Functions** タブでログを確認
- ブラウザの開発者ツールでコンソールエラーを確認
