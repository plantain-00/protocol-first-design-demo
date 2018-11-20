import { GraphQLResolveInfo } from 'graphql'

import { BlogsResult, Pagination, BlogResult, CreateBlogResult } from '../data'

export type DeepPromisifyReturnType<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? Array<DeepPromisifyReturnType<U>>
    : T[P] extends (...args: infer P) => infer R
      ? (...args: P) => R | Promise<R>
      : DeepPromisifyReturnType<T[P]>
}

export interface Root<TContext = any> {
  blogs(input: { pagination: Pagination }, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<BlogsResult> | Promise<DeepPromisifyReturnType<BlogsResult>>
  blog(input: { id: number }, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<BlogResult> | Promise<DeepPromisifyReturnType<BlogResult>>
  createBlog(input: { content: string }, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<CreateBlogResult> | Promise<DeepPromisifyReturnType<CreateBlogResult>>
}

export type DeepReturnType<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? Array<DeepReturnType<U>>
    : T[P] extends (...args: any[]) => infer R
      ? R
      : DeepReturnType<T[P]>
}

export interface ResolveResult {
  blogs: DeepReturnType<BlogsResult>
  blog: DeepReturnType<BlogResult>
  createBlog: DeepReturnType<CreateBlogResult>
}
