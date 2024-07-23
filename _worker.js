export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Novo bloco para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/hls\/([^\/]+)\/([^\/]+)\.mp4$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const folder = match[1];
      const ep = match[2];

      const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${folder}%2F${ep}.mp4?alt=media`;

      try {
        const response = await fetch(realUrl, {
          method: request.method,
          headers: request.headers,
        });

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (error) {
        return new Response('Erro ao acessar o conteúdo.', { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
