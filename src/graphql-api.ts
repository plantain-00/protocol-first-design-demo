import * as express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { buildSchema } from 'graphql'

import { countRows, getRow, insertRow, selectRows } from './db-access'
import { srcGeneratedDataGql } from './generated/variables'
import { Root } from './generated/root'
import { authorized } from './auth'
import { Request } from '.'

export function startGraphqlApi(app: express.Application) {
  const root: Root<Request> = {
    blogs: async ({ pagination }, req) => {
      await authorized(req, 'blog')
      const blogs = await selectRows('blogs', {
        pagination,
      })
      const total = await countRows('blogs')
      return {
        count: total,
        result: blogs
          .map((blog) => ({
            id: blog.id,
            content: () => blog.content,
            posts: ({ id }) => selectRows('posts', { filter: { blogId: id } }),
            meta: () => blog.meta
          }))
      }
    },
    blog: async ({ id }, req) => {
      await authorized(req, 'blog')
      const blog = await getRow('blogs', { filter: { id } })
      return {
        result: blog ? {
          id: blog.id,
          content: () => blog.content,
          posts: ({ id }) => selectRows('posts', { filter: { blogId: id } }),
          meta: () => blog.meta
        } : undefined
      }
    },
    createBlog: async ({ content }, req) => {
      await authorized(req, 'blog')
      const blog = await insertRow('blogs', {
        id: 3,
        content,
        meta: {
          baz: 222
        },
      })
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
