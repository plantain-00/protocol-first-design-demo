/**
 * @method get
 * @path /api/blogs
 * @tags blog
 */
declare function getBlogs(
  /**
   * @in query
   * @default 0
   */
  skip?: integer,
  /**
   * @in query
   * @default 10
   */
  take?: integer,
  /**
   * @in query
   */
  content?: string,
  /**
   * @in query
   * @default id
   */
  sortField?: 'id' | 'content',
  /**
   * @in query
   * @default asc
   */
  sortType?: 'asc' | 'desc',
  /**
   * @in query
   */
  ignoredFields?: BlogIgnorableField[],
  /**
   * @in query
   */
   ids?: string[],
): Promise<{ result: Blog[], count: integer }>

/**
 * @method get
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function getBlogById(
  /**
   * @in path
   */
  id: number,
  /**
   * @in query
   */
  ignoredFields?: BlogIgnorableField[],
): Promise<{ result?: Blog }>

/**
 * @method post
 * @path /api/blogs
 * @tags blog
 */
declare function createBlog(
  /**
   * @in body
   */
  content: string,
  /**
   * @in query
   */
  ignoredFields?: BlogIgnorableField[],
): Promise<{ result: Blog }>

/**
 * @method patch
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function patchBlog(
  /**
   * @in path
   */
  id: number,
  /**
   * @in body
   */
  content?: string,
  /**
   * @in body
   */
  meta?: unknown,
  /**
   * @in query
   */
  ignoredFields?: BlogIgnorableField[],
): Promise<{ result: Blog }>

/**
 * @method delete
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function deleteBlog(
  /**
   * @in path
   */
  id: number,
): Promise<{}>

/**
 * @method get
 * @path /api/blogs/{id}/download
 * @tags blog
 */
 declare function downloadBlog(
  /**
   * @in path
   */
  id: number,
): Promise<void>

export type BlogIgnorableField = 'posts' | 'meta'

type integer = number

export interface Blog {
  id: integer
  content: string
  posts: Post[]
  meta: unknown
}

/**
 * @public
 */
export interface Post {
  id: integer
  content: string
}
