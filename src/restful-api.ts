import * as express from 'express'
import { ParsedQs } from 'qs'

import { blogs, posts, BlogsResult, BlogResult, CreateBlogResult } from './data'
import { authorized, HttpError } from './auth'
import { DeepReturnType } from './generated/root'

interface ExpressHandler {
  method: 'get' | 'post'
  url: string
  tag: 'blog'
  handler: (req: express.Request<{ [key: string]: string; }, {}, {}, ParsedQs>) => any
}

/**
 * @method get
 * @path "/api/blogs"
 */
async function getBlogs(
  /**
   * @in query
   */
  skip = 0,
  /**
   * @in query
   */
  take = 10,
  /**
   * @in query
   */
  content?: string
): Promise<DeepReturnType<BlogsResult>> {
  const pagination = { skip, take }
  const filteredBlogs = content ? blogs.filter((b) => b.content.includes(content)) : blogs

  return {
    result: filteredBlogs.slice(pagination.skip, pagination.skip + pagination.take)
      .map((blog) => ({
        id: blog.id,
        content: blog.content,
        posts: posts.filter((p) => p.blogId === blog.id),
        meta: blog.meta
      })),
    count: filteredBlogs.length,
  }
}

/**
 * @method get
 * @path "/api/blogs/{id}"
 */
async function getBlogById(/** @in path */id: number): Promise<DeepReturnType<BlogResult>> {
  const blog = blogs.find((b) => b.id === id)
  return {
    result: blog ? {
      id: blog.id,
      content: blog.content,
      posts: posts.filter((p) => p.blogId === blog.id),
      meta: blog.meta
    } : undefined
  }
}

let generateId = () => {
  return Math.random()
}

// mock
generateId = () => 3

/**
 * @method post
 * @path "/api/blogs"
 */
async function createBlog(/** @in query */content: string): Promise<DeepReturnType<CreateBlogResult>> {
  const blog: any = {
    id: generateId(),
    content,
    meta: {
      baz: 222
    },
    posts: []
  }
  blogs.push(blog)
  return {
    result: blog
  }
}

const handlers: ExpressHandler[] = [
  {
    method: 'get',
    url: '/api/blogs',
    tag: 'blog',
    handler: (req) => {
      const take = req.query.take ? +req.query.take : undefined
      const skip = req.query.skip ? +req.query.skip : undefined
      const content = typeof req.query.content === 'string' ? req.query.content: undefined
      return getBlogs(take, skip, content)
    }
  },
  {
    method: 'get',
    url: '/api/blogs/:id',
    tag: 'blog',
    handler: (req) => {
      const id = +(req.params as { [name: string]: string }).id
      return getBlogById(id)
    }
  },
  {
    method: 'post',
    url: '/api/blogs',
    tag: 'blog',
    handler: (req) => {
      const content = req.query.content as string
      return createBlog(content)
    }
  }
]

export function startRestfulApi(app: express.Application) {
  for (const handler of handlers) {
    app[handler.method](handler.url, async (req, res) => {
      try {
        await authorized(req, handler.tag)
        const result = await handler.handler(req)
        res.json(result)
      } catch (error: unknown) {
        const statusCode = error instanceof HttpError ? error.statusCode : 500
        const message = error instanceof Error ? error.message : error
        res.status(statusCode)
          .json({ message })
          .end()
      }
    })
  }
}
