export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Padrão para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/([^\/]+)\/([^\/]+)$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const animeName = match[1];
      const ep = match[2];

      // Construir a URL real
      const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${animeName}%2F${ep}.m3u8?alt=media`;

      // Fazer o redirecionamento
      try {
        const videoResponse = await fetch(realUrl);
        
        if (!videoResponse.ok) {
          return new Response('Video fetch error.', { status: 500 });
        }

        // Retornar a resposta diretamente, preservando os headers e o corpo
        return new Response(videoResponse.body, {
          status: videoResponse.status,
          headers: videoResponse.headers
        });
      } catch (error) {
        return new Response(`Error fetching video: ${error.message}`, { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
