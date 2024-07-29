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

      // Log para depuração
      console.log(`Fetching URL: ${realUrl}`);

      // Buscar o conteúdo do M3U8
      const response = await fetch(realUrl);

      if (!response.ok) {
        console.error(`Failed to fetch URL: ${realUrl} - Status: ${response.status}`);
        return new Response('Não foi possível obter o conteúdo do vídeo.', { status: 404 });
      }

      // Retornar o conteúdo do M3U8 com cabeçalhos CORS
      const contentType = response.headers.get('Content-Type') || 'application/vnd.apple.mpegurl';
      return new Response(await response.text(), {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*', // Adiciona cabeçalhos CORS
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
