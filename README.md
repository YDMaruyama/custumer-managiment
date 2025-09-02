# 顧客管理アプリ（ローカル開発版）

これは Google スプレッドシートをデータベースとして使う Next.js 14（App Router）アプリの最小構成です。顧客の追加・一覧表示・更新・削除が可能です。Vercel へのデプロイにも対応できますが、ここではローカルで動かすことを前提にしています。

## セットアップ手順

1. このリポジトリをローカルにクローンするか、`customer-management-app` ディレクトリの内容を作成します。
2. Google Cloud Console で Sheets API を有効化し、サービスアカウントを作成します。JSON キーをダウンロードし、サービスアカウントのメールアドレスを対象となるスプレッドシートに閲覧/編集権限で共有します。
3. `.env.local` ファイルをプロジェクトルートに作成し、以下のように環境変数を設定します（`GOOGLE_PRIVATE_KEY` の改行は `\n` でエスケープしてください）：

   ```env
   GOOGLE_PROJECT_ID=your-project-id
   GOOGLE_CLIENT_EMAIL=service-account@your-project-id.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0B...\n-----END PRIVATE KEY-----\n
   SHEETS_SPREADSHEET_ID=1AbcD...  # スプレッドシートのID
   SHEETS_CUSTOMER_SHEET=Customers  # 顧客データを保存するワークシート名
   ```

4. 依存パッケージをインストールします：

   ```bash
   npm install
   ```

5. 開発サーバーを起動します：

   ```bash
   npm run dev
   ```

   ブラウザで `http://localhost:3000` を開くと、顧客管理画面が表示されます。

## 構成ファイル

| パス | 役割 |
| --- | --- |
| `app/page.tsx` | フロントエンド。顧客一覧表示と新規登録フォームを提供します。 |
| `app/api/customers/route.ts` | API エンドポイント。GET/POST/PUT/DELETE メソッドでスプレッドシートと通信します。 |
| `lib/googleSheet.ts` | Google Sheets API のラッパー。認証や CRUD 操作をまとめています。 |
| `.env.example` | 環境変数のサンプル。コピーして `.env.local` を作成します。 |

## 注意点

* `GOOGLE_PRIVATE_KEY` の改行は `\n` として .env に記述してください。環境変数が正しく読み込まれない場合があります。
* スプレッドシートの最初の行にヘッダーを用意してください。現在の実装では、最初の行のヘッダー順に値を挿入・更新します。
* このサンプルは最小構成です。実際の運用では入力値の検証や認証、エラーハンドリングの強化が必要です。

## Vercel へのデプロイ

Vercel にデプロイする場合は、GitHub などにリポジトリを用意して Vercel プロジェクトを作成し、環境変数を Vercel の管理画面に設定してください。開発時と同様に `GOOGLE_PRIVATE_KEY` は改行を `\n` に置き換えて登録します。# custumer-managiment
