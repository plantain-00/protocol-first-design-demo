import { GraphQLResolveInfo } from 'graphql'

import { BlogsResult, BlogResult, CreateBlogResult } from '../data'

export interface Root {
  blogs(input: {}, context: any, info: GraphQLResolveInfo): BlogsResult | Promise<BlogsResult>
  blog(input: { id: number }, context: any, info: GraphQLResolveInfo): BlogResult | Promise<BlogResult>
  createBlog(input: { content: string }, context: any, info: GraphQLResolveInfo): CreateBlogResult | Promise<CreateBlogResult>
}

export interface ResolveResult {
  blogs: BlogsResult
  blog: BlogResult
  createBlog: CreateBlogResult
}
