import * as express from 'express'
import graphqlHTTP = require('express-graphql')
import { buildSchema } from 'graphql'

import { blogs } from './data'
import { srcGeneratedDataGql } from './generated/variables'
import { Root, Blog } from './generated/root'
import { authorized } from './auth'
import { Request } from '.'

export function startGraphqlApi(app: express.Application) {
  const root: Root<Request> = {
    blogs: async({ pagination }, req) => {
      await authorized(req, 'blog')
      return {
        result: blogs.slice(pagination.skip, pagination.skip + pagination.take)
          .map((blog) => ({
            id: blog.id,
            content: () => blog.content,
            posts: ({ id }) => req.dataloaders!.postsLoader.loadMany(blog!.posts),
            meta: () => blog.meta
          } as Blog<Request>))
      }
    },
    blog: async({ id }, req) => {
      await authorized(req, 'blog')
      const blog = blogs.find((b) => b.id === id)
      return {
        result: blog ? {
          id: blog.id,
          content: () => blog.content,
          posts: ({ id }) => req.dataloaders!.postsLoader.loadMany(blog!.posts),
          meta: () => blog.meta
        } as Blog<Request> : undefined
      }
    },
    createBlog: async({ content }, req) => {
      await authorized(req, 'blog')
      const blog: any = {
        id: 3,
        content,
        meta: {
          baz: 222
        },
        posts: []
      }
      blogs.push(blog)
      return {
        result: { ...blog, content: () => blog.content, posts: () => [] }
      }
    }
  }

  app.use('/graphql', graphqlHTTP({
    schema: buildSchema(srcGeneratedDataGql),
    rootValue: root,
    graphiql: true
  }))
}
