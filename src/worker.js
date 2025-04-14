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
  
  // 将 Workers 域名重定向到 Pages 域名
  // 修改为您的实际 Pages 域名
  const pagesUrl = "https://feishu-markdown-helper.pages.dev" + url.pathname + url.search
  
  return Response.redirect(pagesUrl, 301)
} 