import * as express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'

import { Mutation, BlogsResult, BlogResult, CreateBlogResult, Pagination, blogs } from './data'
import { srcGeneratedDataGql } from './generated/variables'
import { authorized } from './auth'

import { GraphQLResolveInfo } from 'graphql'
import { Request } from '.'

interface Resolvers<TContext> {
  Query: {
    blogs: (parent: any, input: { pagination: Pagination }, context: TContext, info: GraphQLResolveInfo) => BlogsResult | Promise<BlogsResult>,
    blog: (parent: any, input: { id: number }, context: TContext, info: GraphQLResolveInfo) => BlogResult | Promise<BlogResult>
  },
  Mutation: {
    createBlog: (parent: any, input: { content: string }, context: TContext, info: GraphQLResolveInfo) => CreateBlogResult | Promise<CreateBlogResult>
  }
}

export function startApolloApi(app: express.Application) {
  const resolvers: Resolvers<Request> = {
    Query: {
      blogs: async(_, { pagination }, req) => {
        await authorized(req, 'blog')
        return {
          result: blogs.slice(pagination.skip, pagination.skip + pagination.take)
            .map((blog) => ({
              id: blog.id,
              content: () => blog.content,
              posts: () => req.dataloaders!.postsLoader.loadMany(blog!.posts) as any,
              meta: () => blog.meta
            }))
        }
      },
      blog: async(_, { id }, req) => {
        await authorized(req, 'blog')
        const blog = blogs.find((b) => b.id === id)
        return {
          result: blog ? {
            id: blog.id,
            content: () => blog.content,
            posts: () => req.dataloaders!.postsLoader.loadMany(blog!.posts) as any,
            meta: () => blog.meta
          } : undefined
        }
      }
    },
    Mutation: {
      createBlog: async(_, { content }, req) => {
        await authorized(req, 'blog')
        return Mutation.createBlog(content)
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
