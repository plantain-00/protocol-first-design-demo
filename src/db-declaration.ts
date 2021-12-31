import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions } from "./db-declaration-lib"
import { BlogSchema, PostScheme } from "./db-schema"

export type GetRow = {
  (tableName: 'blogs', options?: RowSelectOneOptions<BlogSchema>): Promise<BlogSchema | undefined>
  (tableName: 'posts', options?: RowSelectOneOptions<PostScheme>): Promise<PostScheme | undefined>
}

export type SelectRow = {
  (tableName: 'blogs', options?: RowSelectOptions<BlogSchema>): Promise<BlogSchema[]>
  (tableName: 'posts', options?: RowSelectOptions<PostScheme>): Promise<PostScheme[]>
}

export type InsertRow = {
  (tableName: 'blogs', value: BlogSchema): Promise<BlogSchema>
  (tableName: 'posts', value: PostScheme): Promise<PostScheme>
}

export type UpdateRow = {
  (tableName: 'blogs', value?: Partial<BlogSchema>, options?: RowFilterOptions<BlogSchema>): Promise<void>
  (tableName: 'posts', value?: Partial<PostScheme>, options?: RowFilterOptions<PostScheme>): Promise<void>
}

export type DeleteRow = {
  (tableName: 'blogs', options?: RowFilterOptions<BlogSchema>): Promise<void>
  (tableName: 'posts', options?: RowFilterOptions<PostScheme>): Promise<void>
}

export type CountRow = {
  (tableName: 'blogs', options?: RowFilterOptions<BlogSchema>): Promise<number>
  (tableName: 'posts', options?: RowFilterOptions<PostScheme>): Promise<number>
}

export const tableSchemas = {
  blogs: {
    fieldNames: ['id', 'content', 'meta'],
    complexFields: ['meta'],
  },
  posts: {
    fieldNames: ['id', 'content', 'blogId'],
    complexFields: [],
  },
}
