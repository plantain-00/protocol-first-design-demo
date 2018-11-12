import { GraphQLResolveInfo } from 'graphql'

import { BlogsResult, Pagination, BlogResult, CreateBlogResult } from '../data'

export interface Root<TContext = any> {
  blogs(input: { pagination: Pagination }, context: TContext, info: GraphQLResolveInfo): BlogsResult | Promise<BlogsResult>
  blog(input: { id: number }, context: TContext, info: GraphQLResolveInfo): BlogResult | Promise<BlogResult>
  createBlog(input: { content: string }, context: TContext, info: GraphQLResolveInfo): CreateBlogResult | Promise<CreateBlogResult>
}

type ResolveFunctionResult<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? Array<ResolveFunctionResult<U>>
    : T[P] extends (...args: any[]) => infer R
      ? R
      : ResolveFunctionResult<T[P]>
}

export interface ResolveResult {
  blogs: ResolveFunctionResult<BlogsResult>
  blog: ResolveFunctionResult<BlogResult>
  createBlog: ResolveFunctionResult<CreateBlogResult>
}
