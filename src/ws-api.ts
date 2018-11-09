import * as express from 'express'
import * as http from 'http'
import * as WebSocket from 'ws'

export function startWsApi(app: express.Application) {
  const server = http.createServer()
  const wss = new WebSocket.Server({ server })

  wss.on('connection', (ws, req) => {
    console.info(req.headers.cookie)
    setTimeout(() => {
      ws.send('push message after 3s.')
    }, 3000)
  })

  server.on('request', app)
  return server
}
