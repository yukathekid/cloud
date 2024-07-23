addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname.startsWith('/cdn/hls')) {
    const params = new URLSearchParams(url.search)
    const ep = params.get('ep')
    const token = params.get('token')

    if (ep && token) {
      // Construir a URL original
      const originalUrl = `https://firebasestorage.googleapis.com/v0/b/hwfilm23.appspot.com/o/Anikodi%2Fwind-breaker%2F${ep}.mp4?alt=media&token=${token}`
      return fetch(originalUrl)
    }

    return new Response('Missing parameters', { status: 400 })
  }

  return new Response('Not Found', { status: 404 })
}
