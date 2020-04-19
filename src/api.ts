import { createServer, ServerResponse } from 'http'
import { URLSearchParams } from 'url'

import { Node } from './Node'

type RouteOpts = {
  response: ServerResponse
  node: Node
  body: any
  params: URLSearchParams
}

type Route = (opts: RouteOpts) => (Promise<void> | void)

const routes: { [key: string]: Route } = {
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

  'GET /replicate': async ({ response, node, params }) => {
    const key = params.get('key')
    const body = await node.createReplicateRequest({ storageKey: key || null })
    response.setHeader('content-type', 'application/json')
    response.write(JSON.stringify(body))
    response.end()
  }
}

export const startApi = (node: Node, port?: number) => createServer((request, response) => {
  const [ path ] = request.url?.split('?') ?? []
  const params = new URLSearchParams(request.url?.replace(path, ''))
  const route = routes[`${ request.method } ${ path }`]

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE',
    'Access-Control-Max-Age': 2592000
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, headers)
    response.end()
    return
  }
  Object.entries(headers).forEach(([ key, value ]) => response.setHeader(key, value))

  if (request.headers['node-path']) {
    const nodeIps = (request.headers['node-path'] as string).split(',')
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
      .then(() => route({ response, params, node, body: data }))
      .catch(error => {
        response.statusCode = 500
        response.setHeader('content-type', 'application/json')
        response.write(JSON.stringify({ error: error.message }))
        response.end()
      })
  })
}).listen(process.env.PORT || port)
