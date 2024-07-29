export default {
  async fetch(request, env, ctx) {
    // Extrai o caminho da URL
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Verifica se o caminho corresponde ao padrão esperado
    const match = pathname.match(/^\/cdn\/([^\/]+)\/(\d+)$/);
    if (match) {
        const animeName = match[1];
        const ep = match[2];

        // Constrói a URL real do Firebase Storage
        const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${encodeURIComponent(animeName)}%2F${ep}.m3u8?alt=media`;

        // Faz a solicitação para a URL real
        const response = await fetch(firebaseUrl);

        // Retorna a resposta do Firebase Storage
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    }

    // Se a URL não corresponder ao padrão esperado, retorna 404
    return new Response('Not found', { status: 404 });
  }
};
