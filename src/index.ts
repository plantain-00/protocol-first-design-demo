import express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser'

import { startRestfulApi } from './restful-api'
import { startGraphqlApi } from './graphql-api'
import { startWsApi } from './ws-api'
import { verify } from './auth'

function printInConsole(message: string) {
  console.log(message)
}

const app = express()

app.use(bodyParser.json())
app.use(express.static(path.resolve(__dirname, '../static')))

app.use((req: Request, res: express.Response<{}>, next) => {
  const user = verify(req.headers.cookie)
  if (user) {
    req.user = user
    next()
  } else {
    res.status(403).end()
  }
})

startGraphqlApi(app)
startRestfulApi(app)
const server = startWsApi(app)

const port = 6767
server.listen(port, () => {
  printInConsole(`app started! http://localhost:${port}`)
})

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})

export interface Request extends express.Request {
  user?: string
}
