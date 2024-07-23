export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Novo bloco para camuflagem de URL
    if (url.pathname === '/cdn/hls') {
      const ep = url.searchParams.get('ep');
      const token = url.searchParams.get('token');

      if (ep && token) {
        const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2Fwind-breaker%2F${ep}.mp4?alt=media&token=${token}`;

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
        return new Response('Parâmetros inválidos', { status: 400 });
      }
    }

    // Let other requests be handled by Cloudflare Pages and _redirects
    return env.ASSETS.fetch(request);
  }
};
