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

        // Cache the response in Cloudflare
        const cacheKey = new Request(request.url, request);
        const cache = caches.default;
        let response = await cache.match(cacheKey);

        if (!response) {
          const videoResponse = await fetch(realUrl);
          if (!videoResponse.ok) {
            return new Response('Video fetch error.', { status: 500 });
          }

          response = new Response(videoResponse.body, {
            status: videoResponse.status,
            headers: {
              'Content-Type': 'video/mp4',
              'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
            }
          });
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }

        return response;
      } catch (error) {
        return new Response(`security error`, { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
