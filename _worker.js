export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Padrão para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/hls\/([^\/]+)$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const anime = match[1];

      // Verifica se o URL termina com um hash Base64
      if (anime.endsWith('=')) {
        // Decodifica o URL Base64
        const decodedUrl = atob(anime);

        try {
          const response = await fetch(decodedUrl, {
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
        // Substitua essa parte pela lógica de geração de links de episódios reais
        const episodes = ['ep1', 'ep2', 'ep3']; // Exemplo de episódios

        // Gera a lista JSON com links em Base64
        const episodeLinks = episodes.map(ep => {
          const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${anime}%2F${ep}.mp4?alt=media`;
          const base64Url = btoa(realUrl);
          return { [ep]: `https://cloud.anikodi.xyz/cdn/hls/${base64Url}` };
        });

        // Retorna a lista JSON como resposta
        return new Response(JSON.stringify(episodeLinks), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
