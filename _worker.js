export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Novo bloco para camuflagem de URL com base64
    const hlsPathPattern = /^\/cdn\/hls\/([a-zA-Z0-9+/=]+)$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const base64Path = match[1];
      const decodedPath = atob(base64Path); // Decodifica o base64
      const [anime, episode] = decodedPath.split('/');

      if (anime && episode) {
        const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${anime}%2F${episode}.mp4?alt=media`;

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
      } else {
        return new Response('Caminho inválido.', { status: 400 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
