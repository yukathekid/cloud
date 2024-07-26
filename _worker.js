export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Padrão para redirecionamento de URL
    const playPathPattern = /^\/cdn\/play\/([^\/]+)\/([^\/]+)$/;
    const match = url.pathname.match(playPathPattern);

    if (match) {
      const animeName = match[1];
      const episodeNumber = match[2];
      
      // URL do JSON principal que mapeia animeName para animeMd5
      const jsonUrlMain = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2Fmaster.json?alt=media`;

      try {
        console.log(`Fetching main JSON from: ${jsonUrlMain}`);
        const jsonResponseMain = await fetch(jsonUrlMain);
        if (!jsonResponseMain.ok) {
          console.error(`Failed to fetch main JSON: ${jsonResponseMain.statusText}`);
          return new Response('security error', { status: 500 });
        }

        const jsonDataMain = await jsonResponseMain.json();

        const animeMd5 = jsonDataMain[animeName];
        if (!animeMd5) {
          console.error(`animeName not found in main JSON: ${animeName}`);
          return new Response('not found', { status: 404 });
        }

        console.log(`Anime MD5 found: ${animeMd5}`);

        // URL do JSON específico do anime
        const jsonUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${animeMd5}%2Fmaster.json?alt=media`;
        console.log(`Fetching anime JSON from: ${jsonUrl}`);

        const jsonResponse = await fetch(jsonUrl);
        if (!jsonResponse.ok) {
          console.error(`Failed to fetch anime JSON: ${jsonResponse.statusText}`);
          return new Response('security error.', { status: 500 });
        }

        const jsonData = await jsonResponse.json();

        const md5hash = jsonData[episodeNumber];
        if (!md5hash) {
          console.error(`episodeNumber not found in anime JSON: ${episodeNumber}`);
          return new Response('security error.', { status: 404 });
        }

        console.log(`MD5 hash found: ${md5hash}`);

        // URL camuflada baseada no MD5 hash
        const camouflagedUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${animeMd5}%2F${md5hash}.mp4?alt=media`;
        
        console.log(`Redirecting to camouflaged URL: ${camouflagedUrl}`);

        return Response.redirect(camouflagedUrl, 302);
      } catch (error) {
        console.error(`Catch error: ${error.message}`);
        return new Response('security error', { status: 500 });
      }
    }

    // Padrão existente para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/hls\/([^\/]+)\/([^\/]+)$/;
    const hlsMatch = url.pathname.match(hlsPathPattern);

    if (hlsMatch) {
      const animeMd5 = hlsMatch[1];
      const md5hash = hlsMatch[2];
      
      // URL do JSON principal que mapeia animeMd5 para animeName
      const jsonUrlMain = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2Fmaster.json?alt=media`;

      try {
        console.log(`Fetching main JSON from: ${jsonUrlMain}`);
        const jsonResponseMain = await fetch(jsonUrlMain);
        if (!jsonResponseMain.ok) {
          console.error(`Failed to fetch main JSON: ${jsonResponseMain.statusText}`);
          return new Response('security error', { status: 500 });
        }

        const jsonDataMain = await jsonResponseMain.json();

        const realPathMain = jsonDataMain[animeMd5];
        if (!realPathMain) {
          console.error(`animeMd5 not found in main JSON: ${animeMd5}`);
          return new Response('not found', { status: 404 });
        }

        const animeName = realPathMain;
        console.log(`Anime name found: ${animeName}`);

        // URL do JSON específico do anime
        const jsonUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${animeName}%2Fmaster.json?alt=media`;
        console.log(`Fetching anime JSON from: ${jsonUrl}`);

        const jsonResponse = await fetch(jsonUrl);
        if (!jsonResponse.ok) {
          console.error(`Failed to fetch anime JSON: ${jsonResponse.statusText}`);
          return new Response('security error.', { status: 500 });
        }

        const jsonData = await jsonResponse.json();

        const realPath = jsonData[md5hash];
        if (!realPath) {
          console.error(`md5hash not found in anime JSON: ${md5hash}`);
          return new Response('security error.', { status: 404 });
        }

        console.log(`Real path found: ${realPath}`);

        const [folder, ep] = realPath.split('/');
        const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${folder}%2F${ep}.mp4?alt=media`;
        
        console.log(`Fetching video from: ${realUrl}`);

        const response = await fetch(realUrl, {
          method: request.method,
          headers: {
            ...request.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch video: ${response.statusText}`);
          return new Response(`security error`, { status: 500 });
        }

        console.log(`Video fetched successfully with status: ${response.status}`);

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (error) {
        console.error(`Catch error: ${error.message}`);
        return new Response('security error', { status: 500 });
      }
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
