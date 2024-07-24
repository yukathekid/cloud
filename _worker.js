export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Padrão para decodificação e redirecionamento do link camuflado
    const hlsEpisodePattern = /^\/cdn\/hls\/([^\/]+)\/([^\/]+)$/;
    const matchEpisode = url.pathname.match(hlsEpisodePattern);

    if (matchEpisode) {
      const anime = matchEpisode[1];
      const ep = matchEpisode[2];
      const token = url.searchParams.get('token');

      // Busca o arquivo master.json do anime
      const masterJsonUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${anime}%2Fmaster.json?alt=media`;
      let episodeData;

      try {
        const response = await fetch(masterJsonUrl);
        if (!response.ok) {
          throw new Error(`Erro ao buscar master.json: ${response.statusText}`);
        }
        episodeData = await response.json();
      } catch (error) {
        console.error(`Erro ao acessar o arquivo master.json: ${error.message}`);
        return new Response('Erro ao acessar o arquivo master.json.', { status: 500 });
      }

      const episodeInfo = episodeData[ep];

      // Verifica se o token corresponde ao do episódio
      if (episodeInfo && episodeInfo.token === token) {
        const realUrl = episodeInfo.URL;

        try {
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
        return new Response('Token inválido ou episódio não encontrado.', { status: 403 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
