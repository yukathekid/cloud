export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Novo bloco para camuflagem de URL com MD5
    const hlsPathPattern = /^\/cdn\/hls\/([a-fA-F0-9]{32})$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const md5Hash = match[1];

      // URL para o arquivo JSON do Firebase
      const jsonUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2Fmaster.json?alt=media`;

      try {
        const jsonResponse = await fetch(jsonUrl);
        if (!jsonResponse.ok) {
          return new Response('Erro ao acessar o mapeamento de dados.', { status: 500 });
        }

        const jsonData = await jsonResponse.json();
        const animeEpisodeMapping = Object.values(jsonData).flat().find(entry => entry[md5Hash]);

        if (animeEpisodeMapping) {
          const decodedPath = animeEpisodeMapping[md5Hash];
          const [anime, episode] = decodedPath.split('/');
          const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${anime}%2F${episode}.mp4?alt=media`;

          const response = await fetch(realUrl, {
            method: request.method,
            headers: request.headers,
          });

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        } else {
          return new Response('Caminho inválido.', { status: 400 });
        }
      } catch (error) {
        return new Response('Erro ao acessar o conteúdo.', { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
