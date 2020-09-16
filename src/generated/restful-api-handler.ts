/* eslint-disable */

// import { handlers } from '../restful-api'
import { BlogIgnorableField, Blog } from '../restful-api-schema'

export type GetBlogs = <T extends BlogIgnorableField = never>(req: { query: { skip: number, take: number, content?: string, sortField: "id" | "content", sortType: "asc" | "desc", ignoredFields?: T[] } }) => Promise<{ result: Omit<Blog, T>[], count: number }>
export type GetBlogById = <T extends BlogIgnorableField = never>(req: { path: { id: number }, query?: { ignoredFields?: T[] } }) => Promise<{ result?: Omit<Blog, T> }>
export type CreateBlog = <T extends BlogIgnorableField = never>(req: { query?: { ignoredFields?: T[] }, body: { content: string } }) => Promise<{ result: Omit<Blog, T> }>
