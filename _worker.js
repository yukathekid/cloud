addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Verifique se o caminho da URL é exatamente '/cdn/hls'
  if (url.pathname === '/cdn/hls') {
    // Extraia o número do episódio e o token dos parâmetros da URL
    const ep = url.searchParams.get('ep') // Obtém o número do episódio
    const token = url.searchParams.get('token') // Obtém o token

    // Verifique se o número do episódio e o token foram extraídos corretamente
    if (ep && token) {
      // Construa a URL real com o número do episódio e o token extraídos
      const realUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2Fwind-breaker%2F${ep}.mp4?alt=media&token=${token}`

      try {
        // Requisição para a URL real
        const response = await fetch(realUrl, {
          method: request.method,
          headers: request.headers,
        })

        // Retorna a resposta mantendo a URL camuflada
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        })
      } catch (error) {
        // Log de erro
        console.error('Erro ao acessar a URL real:', error)
        return new Response('Erro ao acessar o conteúdo.', { status: 500 })
      }
    } else {
      // Se o número do episódio ou o token estiver ausente, retorne uma resposta de erro
      return new Response('Parâmetros inválidos', { status: 400 })
    }
  } else {
    // Se o caminho da URL não corresponder exatamente a '/cdn/hls', retorne uma resposta de erro
    return new Response('URL inválida', { status: 404 })
  }
}
