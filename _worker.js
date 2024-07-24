export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Verifica se a URL é para um JSON de anime específico
    const animePattern = /^\/cdn\/hls\/([^\/]+)$/;
    const match = url.pathname.match(animePattern);

    if (match) {
      const anime = match[1];

      // Defina sua lógica de episódios aqui - exemplo estático para ilustração
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

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
