export default {
  async fetch(request, env, ctx) {
    // Extrai o caminho da URL
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Verifica se o caminho corresponde ao padrão esperado
    const match = pathname.match(/^\/cdn\/([^\/]+)\/(\d+)\/([^\/]+)$/);
    if (match) {
        const animeName = match[1];
        const folder = match[2];
        const tsFile = match[3];

        // Constrói a URL real do Firebase Storage
        const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2F${encodeURIComponent(animeName)}%2F${folder}%2F${tsFile}?alt=media`;

        // Faz a solicitação para a URL real
        const response = await fetch(firebaseUrl);

        if (!response.ok) {
            return new Response('Erro ao buscar o arquivo', { status: response.status });
        }

        // Copia os headers da resposta original e adiciona headers adicionais
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Type', 'video/mp2t');
        newHeaders.set('Access-Control-Allow-Origin', '*');

        // Retorna a resposta do Firebase Storage com os headers ajustados
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    }

    // Se a URL não corresponder ao padrão esperado, retorna 404
    return new Response('Not found', { status: 404 });
  }
};
