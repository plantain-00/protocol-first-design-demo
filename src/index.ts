import express = require('express')
import graphqlHTTP = require('express-graphql')
import { buildSchema } from 'graphql'

import { blogs } from './data'
import { srcDataGql } from './variables'

function printInConsole(message: any) {
  console.log(message)
}

const app = express()

const root = {
  blogs: () => {
    return { blogs }
  },
  blog: (id: number) => {
    const blog = blogs.find((b) => b.id === id)
    return { blog }
  }
}

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(srcDataGql),
  rootValue: root,
  graphiql: true
}))

app.get('/api/blogs', (_req, res) => {
  res.json({ blogs })
})

app.get('/api/blogs/:id', (req, res) => {
  const id = +req.params.id
  const blog = blogs.find((b) => b.id === id)
  res.json({ blog })
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
