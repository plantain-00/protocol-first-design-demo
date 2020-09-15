/* eslint-disable */
import { BlogsResult, BlogResult, CreateBlogResult } from '../src/data'
import { DeepReturnType } from '../src/generated/root'

export type RequestRestfulAPI = {
  (method: 'GET', url: '/api/blogs', args?: { query?: { skip?: number, take?: number, content?: string, sortField?: "id" | "content", sortType?: "asc" | "desc" } }): Promise<DeepReturnType<BlogsResult>>
  (method: 'GET', url: '/api/blogs/{id}', args: { path: { id: number } }): Promise<DeepReturnType<BlogResult>>
  (method: 'POST', url: '/api/blogs', args: { body: { content: string } }): Promise<DeepReturnType<CreateBlogResult>>
}
