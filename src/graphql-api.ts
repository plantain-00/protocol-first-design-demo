import * as express from 'express'
import graphqlHTTP = require('express-graphql')
import { buildSchema } from 'graphql'

import { Query } from './data'
import { srcDataGql } from './variables'

export function startGraphqlApi(app: express.Application) {
  const root = {
    blogs: Query.blogs,
    blog: (data: { id: number }) => {
      return Query.blog(data.id)
    }
  }

  app.use('/graphql', graphqlHTTP({
    schema: buildSchema(srcDataGql),
    rootValue: root,
    graphiql: true
  }))
}
