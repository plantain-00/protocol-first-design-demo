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

class Blog {
  constructor(blog: { id: integer, content: string }) {
    this.id = blog.id
    this.content = blog.content
  }
  id: integer
  content: string
  posts(): Post[] {
    return posts.filter((p) => p.blogId === this.id)
  }
}

interface Post {
  id: integer
  content: string
}

export class Query {
  static blogs(): BlogsResult {
    return {
      result: blogs.map((b) => new Blog(b))
    }
  }
  static blog(id: integer): BlogResult {
    const blog = blogs.find((b) => b.id === id)
    return {
      result: blog ? new Blog(blog) : undefined
    }
  }
}

export interface BlogsResult {
  result: Blog[]
}

export interface BlogResult {
  result?: Blog
}
