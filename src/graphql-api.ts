import * as express from 'express'
import graphqlHTTP = require('express-graphql')
import { buildSchema } from 'graphql'

import { Query, Mutation } from './data'
import { srcGeneratedDataGql } from './generated/variables'
import { Root } from './generated/root'
import { Request } from '.'

export function startGraphqlApi(app: express.Application) {
  const root: Root = {
    blogs: Query.blogs,
    blog: ({ id }) => {
      return Query.blog(id)
    },
    createBlog: ({ content }, req: Request) => {
      console.info(req.user)
      return Mutation.createBlog(content)
    }
  }

  app.use('/graphql', graphqlHTTP({
    schema: buildSchema(srcGeneratedDataGql),
    rootValue: root,
    graphiql: true
  }))
}
