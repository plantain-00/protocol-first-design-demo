import * as express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'
import { GraphQLResolveInfo } from 'graphql'

import { Pagination, blogs, Blog } from './data'
import { srcGeneratedDataGql } from './generated/variables'
import { authorized } from './auth'
import { Request } from '.'

interface Resolvers<TContext> {
  Query: {
    blogs: (parent: any, input: { pagination: Pagination }, context: TContext, info: GraphQLResolveInfo) => any,
    blog: (parent: any, input: { id: number }, context: TContext, info: GraphQLResolveInfo) => any
  },
  Mutation: {
    createBlog: (parent: any, input: { content: string }, context: TContext, info: GraphQLResolveInfo) => any
  },
  Blog?: {
    id?: (parent: any, input: {}, context: TContext, info: GraphQLResolveInfo) => any
    content?: (parent: any, input: {}, context: TContext, info: GraphQLResolveInfo) => any
    posts?: (parent: any, input: {}, context: TContext, info: GraphQLResolveInfo) => any
    meta?: (parent: any, input: {}, context: TContext, info: GraphQLResolveInfo) => any
  },
  BlogsResult?: {
    result?: (parent: any, input: {}, context: TContext, info: GraphQLResolveInfo) => Blog[] | Promise<Blog[]>
  }
}

export function startApolloApi(app: express.Application) {
  const resolvers: Resolvers<Request> = {
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
