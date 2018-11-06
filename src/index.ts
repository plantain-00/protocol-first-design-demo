import express = require('express')
import path = require('path')

import { startRestfulApi } from './restful-api'
import { startGraphqlApi } from './graphql-api'

function printInConsole(message: any) {
  console.log(message)
}

const app = express()

startGraphqlApi(app)
startRestfulApi(app)

app.use(express.static(path.resolve(__dirname, '../static')))

app.listen(6767, () => {
  printInConsole('app started!')
})

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})
