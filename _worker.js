export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Padrão para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/([^\/]+)\/([^\/]+)$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const animeName = match[1];
      const ep = match[2];

      // Construir a URL real do M3U8
      const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${animeName}%2F${ep}.m3u8?alt=media`;

      try {
        // Buscar o conteúdo do M3U8 original
        const response = await fetch(realUrl);
        if (!response.ok) {
          return new Response('Erro ao buscar o M3U8', { status: 500 });
        }

        const m3u8Content = await response.text();

        // Retornar o conteúdo do M3U8
        return new Response(m3u8Content, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.apple.mpegurl'
          }
        });
      } catch (error) {
        return new Response('Erro interno', { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
