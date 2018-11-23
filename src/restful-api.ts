import * as express from 'express'

import { blogs, posts, BlogsResult, BlogResult, CreateBlogResult } from './data'
import { authorized, HttpError } from './auth'
import { DeepReturnType } from './generated/root'

// tslint:disable:no-duplicate-string

interface GetBlogsHandler {
  method: 'get'
  url: '/api/blogs'
  tag: 'blog'
  handler: (req: express.Request) => DeepReturnType<BlogsResult> | Promise<DeepReturnType<BlogsResult>>
}

interface GetBlogHandler {
  method: 'get'
  url: '/api/blogs/:id'
  tag: 'blog'
  handler: (req: express.Request) => DeepReturnType<BlogResult> | Promise<DeepReturnType<BlogResult>>
}

interface CreateBlogHandler {
  method: 'post'
  url: '/api/blogs'
  tag: 'blog'
  handler: (req: express.Request) => DeepReturnType<CreateBlogResult> | Promise<DeepReturnType<CreateBlogResult>>
}

type ExpressHandler = GetBlogsHandler | GetBlogHandler | CreateBlogHandler

const handlers: ExpressHandler[] = [
  {
    method: 'get',
    url: '/api/blogs',
    tag: 'blog',
    handler: () => {
      const pagination = { skip: 0, take: 10 }
      return {
        result: blogs.slice(pagination.skip, pagination.skip + pagination.take)
          .map((blog) => ({
            id: blog.id,
            content: blog.content,
            posts: posts.filter((p) => p.blogId === blog.id),
            meta: blog.meta
          }))
      }
    }
  },
  {
    method: 'get',
    url: '/api/blogs/:id',
    tag: 'blog',
    handler: (req) => {
      const id = +req.params.id
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
  },
  {
    method: 'post',
    url: '/api/blogs',
    tag: 'blog',
    handler: (req) => {
      const content = req.query.content
      const blog: any = {
        id: 3,
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
  }
]

export function startRestfulApi(app: express.Application) {
  for (const handler of handlers) {
    app[handler.method](handler.url, async(req, res) => {
      try {
        await authorized(req, handler.tag)
        const result = await handler.handler(req)
        res.json(result)
      } catch (error) {
        const statusCode = error instanceof HttpError ? error.statusCode : 500
        res.status(statusCode)
          .json({ message: error.message || error })
          .end()
      }
    })
  }
}
