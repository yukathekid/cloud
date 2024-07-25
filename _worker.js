export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Padrão para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/hls\/([^\/]+)\/([^\/]+)$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const animeMd5 = match[1];
      const md5hash = match[2];
      
      // URL do JSON principal que mapeia animeMd5 para animeName
      const jsonUrlMain = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2Fmaster.json?alt=media`;

      try {
        console.log(`Fetching main JSON from: ${jsonUrlMain}`);
        const jsonResponseMain = await fetch(jsonUrlMain);
        if (!jsonResponseMain.ok) {
          console.error(`Failed to fetch main JSON: ${jsonResponseMain.statusText}`);
          return new Response('Erro ao acessar o conteúdo principal.', { status: 500 });
        }

        const jsonDataMain = await jsonResponseMain.json();

        const realPathMain = jsonDataMain[animeMd5];
        if (!realPathMain) {
          console.error(`animeMd5 not found in main JSON: ${animeMd5}`);
          return new Response('Conteúdo não encontrado no JSON principal.', { status: 404 });
        }

        const animeName = realPathMain;
        console.log(`Anime name found: ${animeName}`);

        // URL do JSON específico do anime
        const jsonUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${animeName}%2Fmaster.json?alt=media`;
        console.log(`Fetching anime JSON from: ${jsonUrl}`);

        const jsonResponse = await fetch(jsonUrl);
        if (!jsonResponse.ok) {
          console.error(`Failed to fetch anime JSON: ${jsonResponse.statusText}`);
          return new Response('Erro ao acessar o conteúdo do anime.', { status: 500 });
        }

        const jsonData = await jsonResponse.json();

        const realPath = jsonData[md5hash];
        if (!realPath) {
          console.error(`md5hash not found in anime JSON: ${md5hash}`);
          return new Response('Conteúdo não encontrado no JSON do anime.', { status: 404 });
        }

        console.log(`Real path found: ${realPath}`);

        const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${realPath}.mp4?alt=media`;
        console.log(`Fetching video from: ${realUrl}`);

        const response = await fetch(realUrl, {
          method: request.method,
          headers: request.headers,
        });

        if (!response.ok) {
          console.error(`Failed to fetch video: ${response.statusText}`);
          return new Response('Erro ao acessar o vídeo.', { status: 500 });
        }

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (error) {
        console.error(`Catch error: ${error.message}`);
        return new Response('Erro ao acessar o conteúdo.', { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
