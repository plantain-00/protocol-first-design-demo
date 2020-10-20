
type integer = number

interface Blog {
  id: integer
  content(): string
  posts(id: integer): Post[]
  meta: unknown
}

interface Post {
  id: integer
  content: string
}

interface Pagination {
  take: integer
  skip: integer
}

/**
 * @public
 */
export interface Query {
  blogs(pagination: Pagination): BlogsResult
  blog(id: integer): BlogResult
}

/**
 * @public
 */
export interface Mutation {
  createBlog(content: string): CreateBlogResult
}

interface BlogsResult {
  result: Blog[]
  count: integer
}

interface BlogResult {
  result?: Blog
}

interface CreateBlogResult {
  result: Blog
}
