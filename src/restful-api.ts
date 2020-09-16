import * as express from 'express'
import { ParsedQs } from 'qs'

import { blogs, posts } from './data'
import { authorized, HttpError } from './auth'
import { CreateBlog, GetBlogById, GetBlogs } from './generated/restful-api-handler'
import { Blog, BlogIgnorableField } from './restful-api-schema'

interface ExpressHandler {
  method: 'get' | 'post'
  url: string
  tag: 'blog'
  handler: (req: express.Request<{ [key: string]: string }, {}, {}, ParsedQs>) => any
}

const getBlogs: GetBlogs = async ({ query: { sortField, sortType, content, skip, take, ignoredFields } }) => {
  const filteredBlogs = content ? blogs.filter((b) => b.content.includes(content)) : blogs
  filteredBlogs.sort((a, b) => {
    if (sortField === 'id') {
      return sortType === 'asc' ? a[sortField] - b[sortField] : b[sortField] - a[sortField]
    }
    return (sortType === 'asc' ? 1 : -1) * a[sortField].localeCompare(b[sortField])
  })

  return {
    result: filteredBlogs.slice(skip, skip + take).map((blog) => getBlog(blog, ignoredFields)),
    count: filteredBlogs.length,
  }
}

const getBlogById: GetBlogById = async ({ query, path: { id } }) => {
  const blog = blogs.find((b) => b.id === id)
  return {
    result: blog ? getBlog(blog, query?.ignoredFields) : undefined
  }
}

let generateId = () => {
  return Math.random()
}

// mock
generateId = () => 3

const createBlog: CreateBlog = async ({ query, body: { content } }) => {
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
    result: getBlog(blog, query?.ignoredFields)
  }
}

const handlers: ExpressHandler[] = [
  {
    method: 'get',
    url: '/api/blogs',
    tag: 'blog',
    handler: (req) => {
      const skip = req.query.skip ? +req.query.skip : 0
      const take = req.query.take ? +req.query.take : 10
      const content = typeof req.query.content === 'string' ? req.query.content : undefined
      const sortField = req.query.sortField === 'id' || req.query.sortField === 'content' ? req.query.sortField : 'id'
      const sortType = req.query.sortType === 'asc' || req.query.sortType === 'desc' ? req.query.sortType : 'asc'
      const ignoredFields = getIgnoredFields(req.query)
      return getBlogs({
        query: {
          take, skip, content, sortField, sortType, ignoredFields
        }
      })
    }
  },
  {
    method: 'get',
    url: '/api/blogs/:id',
    tag: 'blog',
    handler: (req) => {
      const id = +(req.params as { [name: string]: string }).id
      const ignoredFields = getIgnoredFields(req.query)
      return getBlogById({ path: { id }, query: { ignoredFields } })
    }
  },
  {
    method: 'post',
    url: '/api/blogs',
    tag: 'blog',
    handler: (req: express.Request<{}, {}, { content?: string }, ParsedQs>) => {
      const content = req.body.content
      if (!content) {
        throw new HttpError('invalid parameter: content', 400)
      }
      const ignoredFields = getIgnoredFields(req.query)
      return createBlog({ body: { content }, query: { ignoredFields } })
    }
  }
]

function getIgnoredFields(query: ParsedQs) {
  if (typeof query.ignoredFields === 'string') {
    return query.ignoredFields.split(',') as BlogIgnorableField[]
  }
  return Array.isArray(query.ignoredFields) ? query.ignoredFields as BlogIgnorableField[] : undefined
}

export function startRestfulApi(app: express.Application) {
  for (const handler of handlers) {
    app[handler.method](handler.url, async (req: express.Request<{}>, res: express.Response<{}>) => {
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

function getBlog<T extends BlogIgnorableField = never>(
  blog: {
    id: number,
    content: string,
    meta: any,
    posts: number[],
  },
  ignoredFields?: T[],
) {
  return {
    id: blog.id,
    content: blog.content,
    posts: ignoredFields && (ignoredFields as BlogIgnorableField[]).includes('posts') ? undefined : posts.filter((p) => p.blogId === blog.id),
    meta: ignoredFields && (ignoredFields as BlogIgnorableField[]).includes('meta') ? undefined : blog.meta,
  } as Omit<Blog, T>
}
