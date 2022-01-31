import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions, SqlRawFilter, getKeys } from "@protocol-based-web-framework/db"
import { BlogSchema, PostSchema } from "./db-schema"

export interface GetRow<T = SqlRawFilter> {
  <TIgnored extends keyof BlogSchema = never, TPicked extends keyof BlogSchema = keyof BlogSchema>(tableName: 'blogs', options?: RowSelectOneOptions<BlogSchema, T> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<BlogSchema, TPicked>, TIgnored> | undefined>
  <TIgnored extends keyof PostSchema = never, TPicked extends keyof PostSchema = keyof PostSchema>(tableName: 'posts', options?: RowSelectOneOptions<PostSchema, T> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<PostSchema, TPicked>, TIgnored> | undefined>
}

export interface SelectRow<T = SqlRawFilter> {
  <TIgnored extends keyof BlogSchema = never, TPicked extends keyof BlogSchema = keyof BlogSchema>(tableName: 'blogs', options?: RowSelectOptions<BlogSchema, T> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<BlogSchema, TPicked>, TIgnored>[]>
  <TIgnored extends keyof PostSchema = never, TPicked extends keyof PostSchema = keyof PostSchema>(tableName: 'posts', options?: RowSelectOptions<PostSchema, T> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<PostSchema, TPicked>, TIgnored>[]>
}

export interface InsertRow<T = number> {
  (tableName: 'blogs', value: BlogSchema): Promise<T>
  (tableName: 'posts', value: PostSchema): Promise<T>
}

export interface UpdateRow<T = SqlRawFilter> {
  (tableName: 'blogs', value?: Partial<BlogSchema>, options?: RowFilterOptions<BlogSchema, T>): Promise<number>
  (tableName: 'posts', value?: Partial<PostSchema>, options?: RowFilterOptions<PostSchema, T>): Promise<number>
}

export interface DeleteRow<T = SqlRawFilter> {
  (tableName: 'blogs', options?: RowFilterOptions<BlogSchema, T>): Promise<void>
  (tableName: 'posts', options?: RowFilterOptions<PostSchema, T>): Promise<void>
}

export interface CountRow<T = SqlRawFilter> {
  (tableName: 'blogs', options?: RowFilterOptions<BlogSchema, T>): Promise<number>
  (tableName: 'posts', options?: RowFilterOptions<PostSchema, T>): Promise<number>
}

export const tableSchemas = {
  blogs: {
    fieldNames: ['id', 'content', 'meta'] as (keyof BlogSchema)[],
    fieldTypes: ['real', 'text', 'jsonb'],
    complexFields: ['meta'] as string[],
    autoIncrementField: undefined as string | undefined,
    optionalFields: [] as string[],
    uniqueFields: [] as string[],
    indexFields: [] as string[],
  },
  posts: {
    fieldNames: ['id', 'content', 'blogId'] as (keyof PostSchema)[],
    fieldTypes: ['real', 'text', 'real'],
    complexFields: [] as string[],
    autoIncrementField: undefined as string | undefined,
    optionalFields: [] as string[],
    uniqueFields: [] as string[],
    indexFields: [] as string[],
  },
}

export const tableNames = getKeys(tableSchemas)
