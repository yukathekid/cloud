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

      try {
        // Fetch the content from the real URL
        const response = await fetch(realUrl);

        if (!response.ok) {
          return new Response('Error fetching content', { status: response.status });
        }

        // Return the fetched content with the original status and headers
        return new Response(response.body, {
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('Content-Type') || 'application/vnd.apple.mpegurl',
            'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
          }
        });
      } catch (error) {
        return new Response('Error fetching content', { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
