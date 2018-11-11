import { GraphQLResolveInfo } from 'graphql'

import { BlogsResult, Pagination, BlogResult, CreateBlogResult } from '../data'

export interface Root<TContext = any> {
  blogs(input: { pagination: Pagination }, context: TContext, info: GraphQLResolveInfo): BlogsResult | Promise<BlogsResult>
  blog(input: { id: number }, context: TContext, info: GraphQLResolveInfo): BlogResult | Promise<BlogResult>
  createBlog(input: { content: string }, context: TContext, info: GraphQLResolveInfo): CreateBlogResult | Promise<CreateBlogResult>
}

export interface ResolveResult {
  blogs: BlogsResult
  blog: BlogResult
  createBlog: CreateBlogResult
}
