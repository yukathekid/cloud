export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Novo bloco para camuflagem de URL com MD5
    const hlsPathPattern = /^\/cdn\/hls\/([^\/]+)\/([a-fA-F0-9]{32})$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const anime = match[1];  // Nome do anime
      const md5Hash = match[2];  // Hash MD5

      // URL para o arquivo JSON do Firebase, incluindo o nome do anime
      const jsonUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${anime}%2Fmaster.json?alt=media`;

      try {
        const jsonResponse = await fetch(jsonUrl);
        
        if (!jsonResponse.ok) {
          return new Response('Erro ao acessar o mapeamento de dados: ' + jsonResponse.statusText, { status: jsonResponse.status });
        }

        const jsonData = await jsonResponse.json();
        const animeData = jsonData[md5Hash];

        if (animeData) {
          const decodedPath = animeData[md5Hash];
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
          return new Response('Caminho inválido no mapeamento.', { status: 400 });
        }
      } catch (error) {
        return new Response('Erro ao acessar o mapeamento de dados: ' + error.message, { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
