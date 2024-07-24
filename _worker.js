export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Novo bloco para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/hls\/([^\/]+)\/([^\/]+)$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const anime = match[1];
      const episode = match[2];

      // URL do JSON
      const jsonUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${anime}%2Fmaster.json?alt=media`;

      try {
        // Buscar o JSON
        const jsonResponse = await fetch(jsonUrl);
        const jsonData = await jsonResponse.json();

        // Obter informações do episódio
        const episodeData = jsonData[episode];
        if (episodeData) {
          const token = episodeData.token;
          const realUrl = `https://cloud.anikodi.xyz/cdn/hls/${anime}/${token}`;

          // Buscar o vídeo real
          const videoResponse = await fetch(realUrl, {
            method: request.method,
            headers: request.headers,
          });

          return new Response(videoResponse.body, {
            status: videoResponse.status,
            statusText: videoResponse.statusText,
            headers: videoResponse.headers
          });
        } else {
          return new Response('Episódio não encontrado.', { status: 404 });
        }
      } catch (error) {
        return new Response('Erro ao acessar o conteúdo.', { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
