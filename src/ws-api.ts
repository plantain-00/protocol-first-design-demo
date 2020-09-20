import * as express from 'express'
import * as http from 'http'
import * as WebSocket from 'ws'
import { verify } from './auth'
import { WsCommand, WsPush } from './ws-api-schema'

export function startWsApi(app: express.Application) {
  const server = http.createServer()
  const wss = new WebSocket.Server({ server })

  wss.on('connection', (ws, req) => {
    const user = verify(req.headers.cookie)
    if (!user) {
      ws.close()
      return
    }

    function sendWsPush(wsPush: WsPush) {
      ws.send(JSON.stringify(wsPush))
    }

    ws.on('message', (data) => {
      if (typeof data === 'string') {
        const input: WsCommand = JSON.parse(data)
        console.info(input)
        if (input.type === 'update blog') {
          sendWsPush({
            type: 'blog change',
            id: input.id,
            content: input.content
          })
        }
      }
    })
  })

  server.on('request', app)
  return server
}
