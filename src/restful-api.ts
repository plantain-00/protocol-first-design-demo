import * as express from 'express'
import { ValidateFunction } from 'ajv'
import * as fs from 'fs'
import * as path from 'path'

import { blogs, posts } from './data'
import { authorized, HttpError } from './auth'
import { CreateBlog, DeleteBlog, DownloadBlog, GetBlogById, GetBlogs, PatchBlog, registerCreateBlog, registerDeleteBlog, registerDownloadBlog, registerGetBlogById, registerGetBlogs, registerPatchBlog } from './restful-api-declaration'
import { Blog, BlogIgnorableField } from './restful-api-schema'

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
  return Math.round(Math.random() * 10000)
}

/**
 * @public
 */
export function mockGeneratedId(value: typeof generateId): void {
  generateId = value
}

/**
 * @public
 */
export const createBlog: CreateBlog = async ({ query, body: { content } }) => {
  if (!content) {
    throw new HttpError('invalid parameter: content', 400)
  }
  const blog = {
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

const patchBlog: PatchBlog = async ({ path: { id }, query, body }) => {
  const blog = blogs.find((b) => b.id === id)
  if (!blog) {
    throw new HttpError('invalid parameter: id', 400)
  }
  if (body) {
    if (body.content) {
      blog.content = body.content
    }
    if (body.meta) {
      blog.meta = body.meta
    }
  }
  return {
    result: getBlog(blog, query?.ignoredFields)
  }
}

const deleteBlog: DeleteBlog = async ({ path: { id } }) => {
  const index = blogs.findIndex((b) => b.id === id)
  if (index >= 0) {
    blogs.splice(index, 1)
  }
  return {}
}

const downloadBlog: DownloadBlog = async ({ path: { id } }, res: express.Response<{}>) => {
  console.info(id)
  res.set({
    'Content-Type': 'application/text',
  })
  fs.createReadStream(path.resolve(process.cwd(), 'README.md')).pipe(res)
}

export function handleHttpRequest(
  app: express.Application,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  tag: string,
  validate: ValidateFunction,
  handler: (input: any, res: express.Response<{}>) => Promise<{} | void>
): void {
  app[method](url, async (req: express.Request<{}, {}, {}>, res: express.Response<{}>) => {
    try {
      await authorized(req, tag)
      const input = { path: req.params, query: req.query, body: req.body }
      const valid = validate(input)
      if (!valid && validate.errors?.[0].message) {
        throw new HttpError(validate.errors[0].message, 400)
      }
      const result = await handler(input, res)
      if (result !== undefined) {
        res.json(result)
      }
    } catch (error: unknown) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500
      const message = error instanceof Error ? error.message : error
      res.status(statusCode)
        .json({ message })
        .end()
    }
  })
}

export function startRestfulApi(app: express.Application): void {
  registerGetBlogs(app, getBlogs)
  registerGetBlogById(app, getBlogById)
  registerCreateBlog(app, createBlog)
  registerPatchBlog(app, patchBlog)
  registerDeleteBlog(app, deleteBlog)
  registerDownloadBlog(app, downloadBlog)
}

function getBlog<T extends BlogIgnorableField = never>(
  blog: {
    id: number,
    content: string,
    meta: unknown,
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
