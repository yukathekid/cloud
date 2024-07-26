export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Padrão para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/hls\/([^\/]+)\/([^\/]+)$/;
    const m3uPathPattern = /^\/cdn\/play\/([^\/]+)\/([^\/]+)\.m3u8$/;

    let match = url.pathname.match(hlsPathPattern);

    if (match) {
      const animeMd5 = match[1];
      const md5hash = match[2];

      // URL do JSON principal que mapeia animeMd5 para animeName
      const jsonUrlMain = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2Fmaster.json?alt=media`;

      try {
        const jsonResponseMain = await fetch(jsonUrlMain);
        if (!jsonResponseMain.ok) {
          return new Response('security error', { status: 500 });
        }

        const jsonDataMain = await jsonResponseMain.json();

        const realPathMain = jsonDataMain[animeMd5];
        if (!realPathMain) {
          return new Response('not found', { status: 404 });
        }

        const animeName = realPathMain;

        // URL do JSON específico do anime
        const jsonUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${animeName}%2Fmaster.json?alt=media`;

        const jsonResponse = await fetch(jsonUrl);
        if (!jsonResponse.ok) {
          return new Response('security error.', { status: 500 });
        }

        const jsonData = await jsonResponse.json();

        const realPath = jsonData[md5hash];
        if (!realPath) {
          return new Response('security error.', { status: 404 });
        }

        const [folder, ep] = realPath.split('/');
        const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${folder}%2F${ep}.mp4?alt=media`;

        const response = await fetch(realUrl, {
          method: request.method,
          headers: {
            ...request.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });

        if (!response.ok) {
          return new Response(`security error`, { status: 500 });
        }

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (error) {
        return new Response(`security error`, { status: 500 });
      }
    }

    // Nova rota para gerar o arquivo M3U
    match = url.pathname.match(m3uPathPattern);
    if (match) {
      const animeName = match[1];
      const ep = match[2];

      try {
        // URL do JSON principal que mapeia animeMd5 para animeName
        const jsonUrlMain = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2Fmaster.json?alt=media`;

        const jsonResponseMain = await fetch(jsonUrlMain);
        if (!jsonResponseMain.ok) {
          return new Response('Erro ao acessar o conteúdo principal.', { status: 500 });
        }

        const jsonDataMain = await jsonResponseMain.json();

        const animeMd5 = Object.keys(jsonDataMain).find(key => jsonDataMain[key] === animeName);
        if (!animeMd5) {
          return new Response('Conteúdo não encontrado no JSON principal.', { status: 404 });
        }

        // URL do JSON específico do anime
        const jsonUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${animeName}%2Fmaster.json?alt=media`;

        const jsonResponse = await fetch(jsonUrl);
        if (!jsonResponse.ok) {
          return new Response('Erro ao acessar o conteúdo do anime.', { status: 500 });
        }

        const jsonData = await jsonResponse.json();

        const md5hash = Object.keys(jsonData).find(key => jsonData[key] === `${animeName}/${ep}`);
        if (!md5hash) {
          return new Response('Conteúdo não encontrado no JSON do anime.', { status: 404 });
        }

        const camouflagedUrl = `https://cloud.anikodi.xyz/cdn/hls/${animeMd5}/${md5hash}`;

        const m3uContent = `
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10,
${camouflagedUrl}
#EXT-X-ENDLIST
        `;

        return new Response(m3uContent.trim(), {
          headers: {
            'Content-Type': 'application/vnd.apple.mpegurl',
          },
        });
      } catch (error) {
        return new Response(`Erro ao acessar o conteúdo: ${error.message}`, { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
