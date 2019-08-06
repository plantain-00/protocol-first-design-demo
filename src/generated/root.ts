/**
 * This file is generated by 'types-as-schema'
 * It is not mean to be edited by hand
 */
// tslint:disable

import { GraphQLResolveInfo } from 'graphql'



export type DeepPromisifyReturnType<T> = {
  [P in keyof T]: T[P] extends (infer U)[]
    ? DeepPromisifyReturnType<U>[]
    : T[P] extends (...args: infer P) => infer R
      ? (...args: P) => R | Promise<R>
      : DeepPromisifyReturnType<T[P]>
}

export type DeepReturnType<T> = {
  [P in keyof T]: T[P] extends (infer U)[]
    ? DeepReturnType<U>[]
    : T[P] extends (...args: any[]) => infer R
      ? R extends Promise<infer U>
        ? U
        : R
      : DeepReturnType<T[P]>
}

export interface Root<TContext = any> {
  blogs(input: { pagination: Pagination<TContext> }, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<BlogsResult<TContext>> | Promise<DeepPromisifyReturnType<BlogsResult<TContext>>>
  blog(input: { id: number }, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<BlogResult<TContext>> | Promise<DeepPromisifyReturnType<BlogResult<TContext>>>
  createBlog(input: { content: string }, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<CreateBlogResult<TContext>> | Promise<DeepPromisifyReturnType<CreateBlogResult<TContext>>>
}

export interface Blog<TContext = any> {
  id: number
  content(input: {}, context: TContext, info: GraphQLResolveInfo): string | Promise<string>
  posts(input: { id: number }, context: TContext, info: GraphQLResolveInfo): Post<TContext>[] | Promise<Post<TContext>[]>
  meta: any
}

export interface Post<TContext = any> {
  id: number
  content: string
}

export interface Pagination<TContext = any> {
  take: number
  skip: number
}

export interface BlogsResult<TContext = any> {
  result: Blog<TContext>[]
}

export interface BlogResult<TContext = any> {
  result?: Blog<TContext>
}

export interface CreateBlogResult<TContext = any> {
  result: Blog<TContext>
}

export interface ApolloResolvers<TContext = any> {
  Blog?: {
    id?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    content?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    posts?(parent: any, input: { id: number }, context: TContext, info: GraphQLResolveInfo): any,
    meta?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Post?: {
    id?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    content?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Pagination?: {
    take?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    skip?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Query: {
    blogs(parent: any, input: { pagination: Pagination<TContext> }, context: TContext, info: GraphQLResolveInfo): any,
    blog(parent: any, input: { id: number }, context: TContext, info: GraphQLResolveInfo): any,
  },
  Mutation: {
    createBlog(parent: any, input: { content: string }, context: TContext, info: GraphQLResolveInfo): any,
  },
  BlogsResult?: {
    result?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  BlogResult?: {
    result?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  CreateBlogResult?: {
    result?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
}

export interface ResolveResult<TContext = any> {
  blogs: DeepReturnType<BlogsResult<TContext>>
  blog: DeepReturnType<BlogResult<TContext>>
  createBlog: DeepReturnType<CreateBlogResult<TContext>>
}

// tslint:enable
