const blogs = [
  {
    id: 1,
    content: 'blog 1 content'
  },
  {
    id: 2,
    content: 'blog 2 content'
  }
]

const posts = [
  {
    id: 11,
    content: 'post 11 content',
    blogId: 1
  },
  {
    id: 12,
    content: 'post 12 content',
    blogId: 1
  },
  {
    id: 13,
    content: 'post 13 content',
    blogId: 1
  },
  {
    id: 21,
    content: 'post 21 content',
    blogId: 2
  },
  {
    id: 22,
    content: 'post 22 content',
    blogId: 2
  },
  {
    id: 23,
    content: 'post 23 content',
    blogId: 2
  }
]

type integer = number

interface Blog {
  id: integer
  content: string
  posts(): Post[]
}

interface Post {
  id: integer
  content: string
}

function resolvePosts(id: integer): Post[] {
  return posts.filter((p) => p.blogId === id)
}

export class Query {
  static blogs(): BlogsResult {
    return {
      result: blogs.map((blog) => ({ ...blog, posts: () => resolvePosts(blog.id) }))
    }
  }
  static blog(id: integer): BlogResult {
    const blog = blogs.find((b) => b.id === id)
    return {
      result: blog ? { ...blog, posts: () => resolvePosts(blog.id) } : undefined
    }
  }
}

export class Mutation {
  static createBlog(content: string): CreateBlogResult {
    const blog = {
      id: 3,
      content
    }
    blogs.push(blog)
    return {
      result: { ...blog, posts: () => resolvePosts(blog.id) }
    }
  }
}

export interface BlogsResult {
  result: Blog[]
}

export interface BlogResult {
  result?: Blog
}

export interface CreateBlogResult {
  result: Blog
}

export interface ResolveResult {
  blogs: BlogsResult
  blog: BlogResult
  createBlog: CreateBlogResult
}
