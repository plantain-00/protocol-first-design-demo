import * as express from 'express'
import graphqlHTTP = require('express-graphql')
import { buildSchema } from 'graphql'

import { Query, Mutation } from './data'
import { srcGeneratedDataGql } from './generated/variables'
import { Root } from './generated/root'
import { authorized } from './auth'

export function startGraphqlApi(app: express.Application) {
  const root: Root = {
    blogs: (_, req) => {
      authorized(req, 'blog')
      return Query.blogs()
    },
    blog: ({ id }, req) => {
      authorized(req, 'blog')
      return Query.blog(id)
    },
    createBlog: ({ content }, req) => {
      authorized(req, 'blog')
      return Mutation.createBlog(content)
    }
  }

  app.use('/graphql', graphqlHTTP({
    schema: buildSchema(srcGeneratedDataGql),
    rootValue: root,
    graphiql: true
  }))
}
