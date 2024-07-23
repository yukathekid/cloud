export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Novo bloco para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/hls\/([^\/]+)\/([^\/]+)\.mp4$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const folder = match[1];
      const ep = match[2];
      const token = url.searchParams.get('token');

      if (token) {
        const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${folder}%2F${ep}.mp4?alt=media&token=${token}`;

        try {
          // Faz a requisição para o URL do Firebase com o token
          const response = await fetch(realUrl, {
            method: request.method,
            headers: request.headers,
          });

          if (response.ok) {
            // Se a resposta for bem-sucedida, repasse o conteúdo
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          } else {
            // Se a resposta do Firebase indicar erro (como 403 ou 404), trate como erro
            return new Response('Erro ao acessar o conteúdo.', { status: response.status });
          }
        } catch (error) {
          return new Response('Erro ao acessar o conteúdo.', { status: 500 });
        }
      } else {
        return new Response('Parâmetro "token" inválido', { status: 400 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
