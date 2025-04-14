/**
 * Cloudflare Worker 入口文件
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * 处理传入的请求
 * @param {Request} request
 */
async function handleRequest(request) {
  // 获取请求的 URL
  const url = new URL(request.url)
  
  // 如果请求的是根路径，返回 index.html
  if (url.pathname === '/') {
    const html = await fetch('index.html', { 
      cf: { cacheTtl: 3600 } 
    })
    return html
  }
  
  // 处理其他静态资源
  try {
    return await fetch(request)
  } catch (e) {
    return new Response('资源未找到', { status: 404 })
  }
} 