export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    console.log('Request URL:', request.url);

    // Novo bloco para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/hls\/([^\/]+)\/([^\/]+)$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const anime = match[1];
      const episode = match[2];

      // URL do JSON
      const jsonUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${anime}%2Fmaster.json?alt=media`;
      console.log('Fetching JSON URL:', jsonUrl);

      try {
        // Buscar o JSON
        const jsonResponse = await fetch(jsonUrl);
        if (!jsonResponse.ok) {
          console.error(`JSON fetch failed with status: ${jsonResponse.status}`);
          return new Response('Erro ao acessar o JSON.', { status: 500 });
        }
        const jsonData = await jsonResponse.json();
        console.log('JSON Data:', jsonData);

        // Obter informações do episódio
        const episodeData = jsonData[episode];
        if (episodeData) {
          const token = episodeData.token;
          const camouflagedUrl = `https://cloud.anikodi.xyz/cdn/hls/${anime}/${token}`;
          console.log('Camouflaged URL:', camouflagedUrl);

          // Redirecionar para a URL camuflada
          return Response.redirect(camouflagedUrl, 302);
        } else {
          return new Response('Episódio não encontrado.', { status: 404 });
        }
      } catch (error) {
        console.error('Error:', error.message);
        return new Response('Erro ao acessar o conteúdo.', { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
