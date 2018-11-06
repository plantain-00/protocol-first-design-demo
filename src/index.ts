import express = require('express')
import graphqlHTTP = require('express-graphql')
import { buildSchema } from 'graphql'

import { Query } from './data'
import { srcDataGql } from './variables'

function printInConsole(message: any) {
  console.log(message)
}

const app = express()

const root = {
  blogs: Query.blogs,
  blog: Query.blog
}

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(srcDataGql),
  rootValue: root,
  graphiql: true
}))

app.get('/api/blogs', (_req, res) => {
  res.json(Query.blogs())
})

app.get('/api/blogs/:id', (req, res) => {
  const id = +req.params.id
  res.json(Query.blog(id))
})

app.listen(8000, () => {
  printInConsole('app started!')
})

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})
