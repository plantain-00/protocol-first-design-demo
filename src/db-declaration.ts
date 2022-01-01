import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions } from "./db-declaration-lib"
import { BlogSchema, PostSchema } from "./db-schema"

export type GetRow = {
  <T extends keyof BlogSchema = never>(tableName: 'blogs', options?: RowSelectOneOptions<BlogSchema> & { ignoredFields?: T[] }): Promise<Omit<BlogSchema, T> | undefined>
  <T extends keyof PostSchema = never>(tableName: 'posts', options?: RowSelectOneOptions<PostSchema> & { ignoredFields?: T[] }): Promise<Omit<PostSchema, T> | undefined>
}

export type SelectRow = {
  <T extends keyof BlogSchema = never>(tableName: 'blogs', options?: RowSelectOptions<BlogSchema> & { ignoredFields?: T[] }): Promise<Omit<BlogSchema, T>[]>
  <T extends keyof PostSchema = never>(tableName: 'posts', options?: RowSelectOptions<PostSchema> & { ignoredFields?: T[] }): Promise<Omit<PostSchema, T>[]>
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
    fieldNames: ['id', 'content', 'meta'] as (keyof BlogSchema)[],
    complexFields: ['meta'] as string[],
  },
  posts: {
    fieldNames: ['id', 'content', 'blogId'] as (keyof PostSchema)[],
    complexFields: [] as string[],
  },
}
