/**
 * @public
 */
export const blogs: Blog[] = [
  {
    id: 1,
    content: 'blog 1 content',
    posts: [
      {
        id: 11,
        content: 'post 11 content'
      },
      {
        id: 12,
        content: 'post 12 content'
      },
      {
        id: 13,
        content: 'post 13 content'
      }
    ]
  },
  {
    id: 2,
    content: 'blog 2 content',
    posts: [
      {
        id: 21,
        content: 'post 21 content'
      },
      {
        id: 22,
        content: 'post 22 content'
      },
      {
        id: 23,
        content: 'post 23 content'
      }
    ]
  }
]

/**
 * @public
 */
export interface Blog {
  id: number
  content: string
  posts: Post[]
}

/**
 * @public
 */
export interface Post {
  id: number
  content: string
}

/**
 * @public
 */
export interface Query {
  blogs: BlogsResult
  blog(id: number): BlogResult
}

/**
 * @public
 */
export interface BlogsResult {
  blogs: Blog[]
}

/**
 * @public
 */
export interface BlogResult {
  blog?: Blog
}
