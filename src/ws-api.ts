import * as express from 'express'
import * as http from 'http'
import * as WebSocket from 'ws'

export function startWsApi(app: express.Application) {
  const server = http.createServer()
  const wss = new WebSocket.Server({ server })

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      console.info(data)
    })
  })

  server.on('request', app)
  return server
}
