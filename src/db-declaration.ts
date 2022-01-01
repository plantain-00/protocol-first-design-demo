import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions } from "./db-declaration-lib"
import { BlogSchema, PostSchema } from "./db-schema"

export type GetRow = {
  (tableName: 'blogs', options?: RowSelectOneOptions<BlogSchema>): Promise<BlogSchema | undefined>
  (tableName: 'posts', options?: RowSelectOneOptions<PostSchema>): Promise<PostSchema | undefined>
}

export type SelectRow = {
  (tableName: 'blogs', options?: RowSelectOptions<BlogSchema>): Promise<BlogSchema[]>
  (tableName: 'posts', options?: RowSelectOptions<PostSchema>): Promise<PostSchema[]>
}

export type InsertRow = {
  (tableName: 'blogs', value: BlogSchema): Promise<BlogSchema>
  (tableName: 'posts', value: PostSchema): Promise<PostSchema>
}

export type UpdateRow = {
  (tableName: 'blogs', value?: Partial<BlogSchema>, options?: RowFilterOptions<BlogSchema>): Promise<void>
  (tableName: 'posts', value?: Partial<PostSchema>, options?: RowFilterOptions<PostSchema>): Promise<void>
}

export type DeleteRow = {
  (tableName: 'blogs', options?: RowFilterOptions<BlogSchema>): Promise<void>
  (tableName: 'posts', options?: RowFilterOptions<PostSchema>): Promise<void>
}

export type CountRow = {
  (tableName: 'blogs', options?: RowFilterOptions<BlogSchema>): Promise<number>
  (tableName: 'posts', options?: RowFilterOptions<PostSchema>): Promise<number>
}

export const tableSchemas = {
  blogs: {
    fieldNames: ['id', 'content', 'meta'],
    complexFields: ['meta'] as string[],
  },
  posts: {
    fieldNames: ['id', 'content', 'blogId'],
    complexFields: [] as string[],
  },
}
