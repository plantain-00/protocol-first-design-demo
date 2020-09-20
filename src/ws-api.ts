import * as express from 'express'
import * as http from 'http'
import * as WebSocket from 'ws'
import Ajv from 'ajv'
import { verify } from './auth'
import { WsCommand, WsPush } from './ws-api-schema'
import { srcGeneratedWsCommandJson } from './generated/variables'

const ajv = new Ajv()
const validateWsCommand = ajv.compile(srcGeneratedWsCommandJson)

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
        const valid = validateWsCommand(input)
        if (!valid && validateWsCommand.errors) {
          console.info(validateWsCommand.errors)
          return
        }
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
