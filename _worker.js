export default {
  async fetch(request, env, ctx) {
    // Extrai o caminho da URL
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Verifica se o caminho corresponde ao padrão de arquivo .ts
    let match = pathname.match(/^\/cdn\/([^\/]+)\/(s\d+)\/(\d+)\/([^\/]+)$/);
    /*if (match) {
        const animeName = match[1];
        const season = match[2];
        const ep = match[3];
        const tsFile = match[4];

        // Constrói a URL real do Firebase Storage para .ts
        const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/anikodi-cdn.appspot.com/o/${encodeURIComponent(animeName)}%2F${encodeURIComponent(season)}%2F${encodeURIComponent(ep)}%2F${encodeURIComponent(tsFile)}?alt=media`;

        // Faz a solicitação para a URL real
        const response = await fetch(firebaseUrl);

        if (!response.ok) {
            return new Response('Erro ao buscar o arquivo .ts', { status: response.status });
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
    }*/

    // Verifica se o caminho corresponde ao padrão de arquivo .m3u8
    match = pathname.match(/^\/cdn\/([^\/]+)\/(s\d+)\/(\d+)\.m3u8$/);
    if (match) {
        const animeName = match[1];
        const season = match[2];
        const ep = match[3];

        // Constrói a URL real do Firebase Storage para .m3u8
        const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/anikodi-cdn.appspot.com/o/${encodeURIComponent(animeName)}%2F${encodeURIComponent(season)}%2F${encodeURIComponent(ep)}.m3u8?alt=media`;

        // Faz a solicitação para a URL real
        const response = await fetch(firebaseUrl);

        if (!response.ok) {
            return new Response('Erro ao buscar o arquivo .m3u8', { status: response.status });
        }

        // Copia os headers da resposta original e adiciona headers adicionais
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Type', 'application/vnd.apple.mpegurl');
        newHeaders.set('Access-Control-Allow-Origin', '*');

        // Retorna a resposta do Firebase Storage com os headers ajustados
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    }

    // Se a URL não corresponder a nenhum dos padrões esperados, retorna 404
    return new Response('Not found', { status: 404 });
  }
};
