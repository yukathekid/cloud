export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Novo bloco para camuflagem de URL
    const hlsPathPattern = /^\/cdn\/hls\/([^\/]+)\/([^\/]+)$/;
    const match = url.pathname.match(hlsPathPattern);

    if (match) {
      const folder = match[1];
      const token = match[2];

      // URL para buscar os metadados do arquivo
      const metadataUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${folder}.mp4`;

      try {
        // Fetch para obter os metadados do arquivo
        const metadataResponse = await fetch(metadataUrl);
        if (!metadataResponse.ok) {
          return new Response('Erro ao acessar os metadados do conteúdo.', { status: 500 });
        }

        // Extrair metadados do arquivo
        const metadata = await metadataResponse.json();
        const actualToken = metadata.downloadTokens;

        // Verificar se o token na URL camuflada é o mesmo dos metadados
        if (actualToken !== token) {
          return new Response('Token de download inválido.', { status: 403 });
        }

        // Construir a URL real com o token de download
        const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${folder}.mp4?alt=media&token=${token}`;

        // Fetch para obter o vídeo
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
    }

    // Deixa outras requisições serem tratadas pelo Cloudflare Pages e _redirects
    return env.ASSETS.fetch(request);
  }
};
