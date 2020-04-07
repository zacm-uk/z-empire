const { createServer } = require('http')

const routes = {
  'GET /node/info': async ({ response, node }) => {
    response.setHeader('content-type', 'application/json')
    response.write(JSON.stringify(await node.getInfo()))
    response.end()
  },

  'GET /node/nodelist': ({ response, node }) => {
    response.setHeader('content-type', 'application/json')
    response.write(JSON.stringify([ ...node.nodeList ]))
    response.end()
  },

  'GET /data': async ({ response, node, params }) => {
    const storageKey = params.get('key')
    if (!storageKey) {
      throw new Error('No key')
    }
    response.setHeader('content-type', 'application/json')
    response.write(JSON.stringify(await node.getData(storageKey)))
    response.end()
  },

  'POST /data': async ({ response, node, body }) => {
    const { key, value } = body
    const { storageKey } = await node.setData(key, value)
    response.setHeader('content-type', 'application/json')
    response.write(JSON.stringify({ storageKey }))
    response.end()
  },

  'PUT /data': async ({ response, node, body }) => {
    const { storageKey, value } = body
    await node.updateData(storageKey, value)
    response.statusCode = 204
    response.end()
  },

  'DELETE /data': async ({ response, node, body }) => {
    const { storageKey } = body
    await node.removeData(storageKey)
    response.statusCode = 204
    response.end()
  },

  'POST /replicate': async ({ response, node, body }) => {
    await node.receiveUpdate(body)
    response.statusCode = 204
    response.end()
  },

  'GET /replicate': async ({ response, node }) => {
    const body = await node.createReplicateRequest()
    response.setHeader('content-type', 'application/json')
    response.write(JSON.stringify(body))
    response.end()
  }
}

const startApi = (node, port) => createServer((request, response) => {
  const [ path ] = request.url.split('?')
  const params = new URLSearchParams(request.url.replace(path, ''))
  const route = routes[`${ request.method } ${ path }`]

  if (request.headers['node-path']) {
    const nodeIps = request.headers['node-path'].split(',')
    for (const ip of nodeIps) {
      node.nodeList.add(ip)
    }
  }

  if (!route) {
    response.statusCode = 404
    response.setHeader('content-type', 'application/json')
    response.write(JSON.stringify({ error: 'Not found' }))
    response.end()
    return
  }

  let data = ''
  request.on('data', chunk => data += chunk)

  request.on('end', () => {
    Promise.resolve()
      .then(() => {
        const contentType = request.headers['content-type'] || ''
        if (/json/.test(contentType)) {
          data = JSON.parse(data)
        }
      })
      .then(() => route({ request, response, path, params, node, body: data }))
      .catch(error => {
        response.statusCode = 500
        response.setHeader('content-type', 'application/json')
        response.write(JSON.stringify({ error: error.message }))
        response.end()
      })
  })
}).listen(process.env.PORT || port)

module.exports = {
  startApi
}
