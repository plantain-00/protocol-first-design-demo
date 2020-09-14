/* eslint-disable */
import { BlogsResult, BlogResult, CreateBlogResult } from '../src/data'
import { DeepReturnType } from '../src/generated/root'

export type RequestRestfulAPI = {
  (method: "GET", url: "/api/blogs", query?: { skip?: number, take?: number, content?: string }): Promise<DeepReturnType<BlogsResult>>
  (method: "GET", url: "/api/blogs/{id}", id: number): Promise<DeepReturnType<BlogResult>>
  (method: "POST", url: "/api/blogs", query: { content: string }): Promise<DeepReturnType<CreateBlogResult>>
}
