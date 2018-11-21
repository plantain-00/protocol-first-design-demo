import * as express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'

import { blogs } from './data'
import { srcGeneratedDataGql } from './generated/variables'
import { authorized } from './auth'
import { Request } from '.'
import { ApolloResolvers } from './generated/root'

export function startApolloApi(app: express.Application) {
  const resolvers: ApolloResolvers<Request> = {
    Blog: {
      posts: (blog, _, req) => req.dataloaders!.postsLoader.loadMany(blog.posts)
    },
    Query: {
      blogs: async(_, { pagination }, req) => {
        await authorized(req, 'blog')
        return {
          result: blogs.slice(pagination.skip, pagination.skip + pagination.take)
        }
      },
      blog: async(_, { id }, req) => {
        await authorized(req, 'blog')
        const blog = blogs.find((b) => b.id === id)
        return {
          result: blog
        }
      }
    },
    Mutation: {
      createBlog: async(_, { content }, req) => {
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
          result: blog
        }
      }
    }
  }
  const server = new ApolloServer({
    typeDefs: gql(srcGeneratedDataGql),
    resolvers: resolvers as any,
    context: ({ req }: any) => {
      return req
    }
  })
  server.applyMiddleware({ app })
}
