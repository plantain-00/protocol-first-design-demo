import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions, getKeys } from "protocol-based-web-framework"
import { BlogSchema, PostSchema } from "./db-schema"

export type GetRow = {
  <TIgnored extends keyof BlogSchema = never, TPicked extends keyof BlogSchema = keyof BlogSchema>(tableName: 'blogs', options?: RowSelectOneOptions<BlogSchema> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<BlogSchema, TPicked>, TIgnored> | undefined>
  <TIgnored extends keyof PostSchema = never, TPicked extends keyof PostSchema = keyof PostSchema>(tableName: 'posts', options?: RowSelectOneOptions<PostSchema> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<PostSchema, TPicked>, TIgnored> | undefined>
}

export type SelectRow = {
  <TIgnored extends keyof BlogSchema = never, TPicked extends keyof BlogSchema = keyof BlogSchema>(tableName: 'blogs', options?: RowSelectOptions<BlogSchema> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<BlogSchema, TPicked>, TIgnored>[]>
  <TIgnored extends keyof PostSchema = never, TPicked extends keyof PostSchema = keyof PostSchema>(tableName: 'posts', options?: RowSelectOptions<PostSchema> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<PostSchema, TPicked>, TIgnored>[]>
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

export const tableNames = getKeys(tableSchemas)
