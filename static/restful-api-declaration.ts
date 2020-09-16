/* eslint-disable */
import { BlogIgnorableField, Blog } from '../src/restful-api-schema'

export type RequestRestfulAPI = {
  <T extends BlogIgnorableField = never>(method: 'GET', url: '/api/blogs', args?: { query?: { skip?: number, take?: number, content?: string, sortField?: "id" | "content", sortType?: "asc" | "desc", ignoredFields?: T[] } }): Promise<{ result: Omit<Blog, T>[], count: number }>
  <T extends BlogIgnorableField = never>(method: 'GET', url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: T[] } }): Promise<{ result?: Omit<Blog, T> }>
  <T extends BlogIgnorableField = never>(method: 'POST', url: '/api/blogs', args: { query?: { ignoredFields?: T[] }, body: { content: string } }): Promise<{ result: Omit<Blog, T> }>
}
