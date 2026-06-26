const port = 9333
const targets = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json())
const page = targets.find((target) => target.type === 'page')
if (!page) throw new Error('No Electron page target found')

const ws = new WebSocket(page.webSocketDebuggerUrl)
let id = 0
const pending = new Map()

ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message)
    pending.delete(message.id)
  }
})

await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }))

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const requestId = ++id
    pending.set(requestId, resolve)
    ws.send(JSON.stringify({ id: requestId, method, params }))
  })

async function value(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (result.error) throw new Error(result.error.message)
  if (result.result.exceptionDetails) {
    throw new Error(result.result.exceptionDetails.exception.description)
  }
  return result.result.result.value
}

const checks = {
  preload: await value('typeof window.ugkMarkdown'),
  openDialog: await value('typeof window.ugkMarkdown?.openDialog'),
  title: await value('document.title'),
  file: await value('document.querySelector("#file").textContent'),
  body: await value('document.querySelector(".markdown-body").innerText'),
  button: await value('document.querySelector("#open").tagName'),
}

if (checks.preload !== 'object') throw new Error(`preload missing: ${checks.preload}`)
if (checks.openDialog !== 'function') throw new Error(`openDialog missing: ${checks.openDialog}`)
if (!checks.title.includes('test-sample.md')) throw new Error(`file title missing: ${checks.title}`)
if (!checks.file.includes('test-sample.md')) throw new Error(`file label missing: ${checks.file}`)
if (!checks.body.includes('UGK Markdown Test')) throw new Error('markdown body missing')
if (checks.button !== 'BUTTON') throw new Error('open button missing')

console.log(JSON.stringify(checks, null, 2))
ws.close()
