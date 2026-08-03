/**
 * Decap CMS (旧Netlify CMS) 用の GitHub OAuth 認証プロキシ
 *
 * 環境変数として以下2つを Cloudflare の Settings > Variables and Secrets に登録してください
 *   GITHUB_CLIENT_ID     : GitHubのOAuth AppのClient ID
 *   GITHUB_CLIENT_SECRET : GitHubのOAuth AppのClient Secret（Encryptにチェック）
 *
 * デプロイ後、このWorkerのURLを admin/config.yml の base_url に設定してください
 * 例: base_url: https://nonoshiino-cms-auth.あなたのサブドメイン.workers.dev
 *
 * GitHub OAuth App側の Authorization callback URL には、このWorkerのURL + "/callback" を設定してください
 * 例: https://nonoshiino-cms-auth.あなたのサブドメイン.workers.dev/callback
 */
 
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
 
    if (url.pathname === "/auth") {
      return handleAuth(url, env);
    }
 
    if (url.pathname === "/callback") {
      return handleCallback(url, env);
    }
 
    return new Response("Decap CMS用のOAuth認証サーバーです。/auth または /callback にアクセスしてください。", {
      status: 200,
    });
  },
};
 
// 1. Decap CMSからのログイン開始リクエストを受けて、GitHubの認証画面へリダイレクトする
function handleAuth(url, env) {
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set("scope", "repo,user");
  githubAuthUrl.searchParams.set("redirect_uri", `${url.origin}/callback`);
 
  return Response.redirect(githubAuthUrl.toString(), 302);
}
 
// 2. GitHubからのコールバックを受け取り、アクセストークンと交換して、
//    管理画面(admin/index.html)を開いていた元のウィンドウにトークンを渡す
async function handleCallback(url, env) {
  const code = url.searchParams.get("code");
 
  if (!code) {
    return new Response("認証コード(code)が見つかりませんでした。もう一度ログインをやり直してください。", { status: 400 });
  }
 
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
 
  const tokenData = await tokenResponse.json();
 
  if (tokenData.error || !tokenData.access_token) {
    return new Response(
      `GitHubとの認証に失敗しました: ${tokenData.error_description || tokenData.error || "不明なエラー"}`,
      { status: 400 }
    );
  }
 
  const token = tokenData.access_token;
 
  // Decap CMSが期待する形式で、管理画面のウィンドウにpostMessageでトークンを送る
  const script = `
    <!doctype html>
    <html>
      <body>
        <script>
          (function() {
            function receiveMessage(e) {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify({ token, provider: "github" })}',
                e.origin
              );
              window.removeEventListener("message", receiveMessage, false);
            }
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          })();
        </script>
        <p>認証が完了しました。このウィンドウは自動的に閉じます。</p>
      </body>
    </html>
  `;
 
  return new Response(script, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
 