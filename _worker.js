export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Padrão para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/([^\/]+)\/([^\/]+)$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const animeName = match[1];
      const ep = match[2];

      // Construir a URL do arquivo M3U8 diretamente
      const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${animeName}%2F${ep}.m3u8?alt=media`;

      // Cache a resposta no Cloudflare
      const cacheKey = new Request(request.url, request);
      const cache = caches.default;
      let response = await cache.match(cacheKey);

      if (!response) {
        const playlistResponse = await fetch(realUrl);
        if (!playlistResponse.ok) {
          return new Response('Playlist fetch error.', { status: 500 });
        }

        response = new Response(playlistResponse.body, {
          status: playlistResponse.status,
          headers: {
            'Content-Type': 'application/vnd.apple.mpegurl', // MIME type para M3U8
            'Cache-Control': 'public, max-age=86400' // Cache por 24 horas
          }
        });
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }

      return response;
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
