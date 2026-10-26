# FLPエントリーシート作成ナビ（GitHub Pages + Gemini）

## 公開手順

1. GitHubに新規 **public** リポジトリ `flp-entry-coach` を作成する。`index.html` をルートにアップロードしコミットする。個人情報やAPIキーは絶対に登録しない。
2. GitHubの **Settings → Pages → Build and deployment** で **Deploy from a branch** / **main** / **/(root)** を選び保存。ページURLは `https://YOUR_USERNAME.github.io/flp-entry-coach/`。
3. Cloudflareアカウントで `worker/` のコードをWorkerとして配置する（ローカル環境で `npm install -g wrangler`、`cd worker`、`wrangler login`、`wrangler deploy` など）。`worker/wrangler.toml` の `ALLOWED_ORIGIN` を `https://YOUR_USERNAME.github.io` に置き換える。パスは指定しない。
4. WorkerのSecretsに **GEMINI_API_KEY**（Google AI Studioから発行）とランダムな長い **ACCESS_TOKEN**（家族専用アクセスコード）を登録する。例: `wrangler secret put GEMINI_API_KEY` と `wrangler secret put ACCESS_TOKEN`。どちらもGitHubにコミットしない。
5. Workerの `https://...workers.dev` URLを `index.html` 内の `const API_ENDPOINT=''` に設定して再コミットする。
6. 公開ページでAI相談ボタンを押し、ACCESS_TOKENを入力して動作確認する。入力したアクセスコードはそのブラウザタブのセッション中のみ保存する。

## 注意
- GitHub PagesのHTMLやJSは公開される。APIキーを直接書かない。
- ブラウザ内で回答はlocalStorageに保存。Geminiへの相談時のみ対象項目と関連学業情報が送信される。
- アクセスコードは共有した相手が使える仕組み。強固な認証ではない。Cloudflare側でRate Limiting / Bot対策や利用上限を設定し、定期的にコードを更新することを推奨。
- サイトそのものは公開URLを知る人が閲覧できる。AI機能だけアクセスコードで制限する。プライベートサイトが必要なら別の認証ゲートが必要。
- Gemini APIのモデル名、料金、無料枠、データ利用条件はGoogle AI Studio / Googleの現行条件を確認する。