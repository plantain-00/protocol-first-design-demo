import { BlogSchema, PostSchema } from "./db-schema"

/**
 * @method get
 * @path /api/blogs
 * @tags blog
 */
declare function getBlogs(
  query: PaginationFields & BlogIgnoredField & SortTypeField & {
    content?: string,
    /**
     * @default id
     */
    sortField?: 'id' | 'content',
    ids?: string[],
  },
): Promise<{ result: Blog[], count: integer }>

/**
 * @method get
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function getBlogById(
  path: IdField,
  query: BlogIgnoredField,
): Promise<{ result?: Blog }>

/**
 * @method post
 * @path /api/blogs
 * @tags blog
 */
declare function createBlog(
  query: BlogIgnoredField,
  body: {
    content: string,
  },
): Promise<{ result: Blog }>

/**
 * @method patch
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function patchBlog(
  path: IdField,
  query: BlogIgnoredField,
  body: {
    content?: string,
    meta?: unknown,
  },
): Promise<{ result: Blog }>

/**
 * @method delete
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function deleteBlog(
  path: IdField,
): Promise<{}>

/**
 * @method get
 * @path /api/blogs/{id}/download
 * @tags blog
 */
declare function downloadBlog(
  path: IdField,
  query: {
    attachmentFileName?: string,
  },
): Promise<File>

/**
 * @method post
 * @path /api/blogs/upload
 * @tags blog
 */
declare function uploadBlog(
  body: {
    file: File,
    id: number,
  },
): Promise<{}>

/**
 * @method get
 * @path /api/blogs/{id}/text
 * @tags blog
 */
declare function getBlogText(
  path: IdField,
): Promise<string>

export type BlogIgnorableField = 'posts' | 'meta'

type integer = number

export interface Blog extends BlogSchema {
  posts: Post[]
}

/**
 * @public
 */
export type Post = PostSchema

interface PaginationFields {
  /**
   * @default 0
   */
  skip?: integer,
  /**
   * @default 10
   */
  take?: integer,
}

interface SortTypeField {
  /**
   * @default asc
   */
  sortType?: 'asc' | 'desc',
}

interface IdField {
  id: integer,
}

interface BlogIgnoredField {
  ignoredFields?: BlogIgnorableField[],
}
