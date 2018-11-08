import { BlogsResult, BlogResult, CreateBlogResult } from '../data'

export interface Root {
  blogs(): BlogsResult | Promise<BlogsResult>
  blog(input: { id: number }): BlogResult | Promise<BlogResult>
  createBlog(input: { content: string }): CreateBlogResult | Promise<CreateBlogResult>
}
