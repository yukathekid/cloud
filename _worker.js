export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Padrão para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/hls\/([^\/]+)$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const md5hash = match[1];

      // Busca o JSON do anime para obter o mapeamento
      const jsonUrlPattern = /^\/cdn\/hls\/([^\/]+)\/([^\/]+)$/;
      const animeMatch = url.pathname.match(jsonUrlPattern);

      if (animeMatch) {
        const animeName = animeMatch[1];
        const jsonUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${animeName}%2Fmaster.json?alt=media`;

        try {
          const jsonResponse = await fetch(jsonUrl);
          const jsonData = await jsonResponse.json();

          const realPath = jsonData[md5hash];
          if (!realPath) {
            return new Response('Conteúdo não encontrado.', { status: 404 });
          }

          const [folder, ep] = realPath.split('/');
          const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${folder}%2F${ep}.mp4?alt=media`;

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
        return new Response('Formato de URL inválido.', { status: 400 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
