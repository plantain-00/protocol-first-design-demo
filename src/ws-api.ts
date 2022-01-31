import * as express from 'express'
import * as http from 'http'
import { WebSocketServer } from 'ws'
import Ajv from 'ajv'
import protobuf from 'protobufjs'
import { verify } from './auth.js'
import { WsCommand, WsPush } from './ws-api-schema.js'
import { srcGeneratedWsCommandJson, srcGeneratedWsProto } from './generated/variables.js'

const ajv = new Ajv()
const validateWsCommand = ajv.compile(srcGeneratedWsCommandJson)

export function startWsApi(app: express.Application) {
  const server = http.createServer()
  const wss = new WebSocketServer({ server })

  const root = protobuf.Root.fromJSON(srcGeneratedWsProto)
  const commandType = root.lookup('WsCommand') as protobuf.Type
  const pushType = root.lookup('WsPush') as protobuf.Type

  wss.on('connection', (ws, req) => {
    const user = verify(req.headers.cookie)
    if (!user) {
      ws.close()
      return
    }

    function sendWsPush(wsPush: WsPush, binary?: boolean) {
      if (binary) {
        ws.send(pushType.encode(wsPush).finish())
      } else {
        ws.send(JSON.stringify(wsPush))
      }
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
      } else if (Buffer.isBuffer(data)) {
        const input = commandType.toObject(commandType.decode(data)) as WsCommand
        console.info(input)
        if (input.type === 'update blog') {
          sendWsPush({
            type: 'blog change',
            id: input.id,
            content: input.content
          }, true)
        }
      }
    })
  })

  server.on('request', app)
  return server
}
