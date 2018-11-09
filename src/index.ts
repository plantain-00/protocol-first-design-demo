import express = require('express')
import path = require('path')

import { startRestfulApi } from './restful-api'
import { startGraphqlApi } from './graphql-api'
import { startWsApi } from './ws-api'

function printInConsole(message: string) {
  console.log(message)
}

const app = express()

startGraphqlApi(app)
startRestfulApi(app)
const server = startWsApi(app)

app.use(express.static(path.resolve(__dirname, '../static')))

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
