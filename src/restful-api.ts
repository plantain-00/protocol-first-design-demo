import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import stream, { Readable } from 'stream'
import multer from 'multer'

import { countRows, deleteRow, getRow, insertRow, selectRows, updateRow } from './db-access'
import { authorized, HttpError } from './auth'
import { CreateBlog, DeleteBlog, DownloadBlog, GetBlogById, GetBlogs, GetBlogText, PatchBlog, registerCreateBlog, registerDeleteBlog, registerDownloadBlog, registerGetBlogById, registerGetBlogs, registerGetBlogText, registerPatchBlog, registerUploadBlog, UploadBlog } from './restful-api-declaration'
import { Blog, BlogIgnorableField } from './restful-api-schema'
import { HandleHttpRequest } from './restful-api-declaration-lib'
import { BlogSchema } from './db-schema'
import { tableSchemas } from './db-declaration'
import { RowFilterOptions } from './db-declaration-lib'

const getBlogs: GetBlogs = async ({ query: { sortField, sortType, content, skip, take, ignoredFields } }) => {
  const filter: RowFilterOptions<BlogSchema> = {
    fuzzyFilter: {
      content,
    },
  }
  const filteredBlogs = await selectRows('blogs', {
    ...filter,
    sort: [
      {
        field: sortField,
        type: sortType,
      }
    ],
    ignoredFields: extractDbIgnoredFields(ignoredFields),
    pagination: {
      take,
      skip,
    },
  })
  const total = await countRows('blogs', filter)

  return {
    result: await Promise.all(filteredBlogs.map((blog) => getBlogWithoutIngoredFields(blog, ignoredFields))),
    count: total,
  }
}

const getBlogById: GetBlogById = async ({ query, path: { id } }) => {
  const blog = await getRow('blogs', { filter: { id }, ignoredFields: extractDbIgnoredFields(query?.ignoredFields) })
  return {
    result: blog ? await getBlogWithoutIngoredFields(blog, query?.ignoredFields) : undefined
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
  const blog = await insertRow('blogs', {
    id: generateId(),
    content,
    meta: {
      baz: 222
    },
  })
  return {
    result: await getBlogWithoutIngoredFields(blog, query?.ignoredFields)
  }
}

const patchBlog: PatchBlog = async ({ path: { id }, query, body }) => {
  await updateRow('blogs', body, { filter: { id } })
  const blog = await getRow('blogs', { filter: { id }, ignoredFields: extractDbIgnoredFields(query?.ignoredFields) })
  if (!blog) {
    throw new HttpError('invalid parameter: id', 400)
  }
  return {
    result: await getBlogWithoutIngoredFields(blog, query?.ignoredFields)
  }
}

const deleteBlog: DeleteBlog = async ({ path: { id } }) => {
  await deleteRow('blogs', { filter: { id } })
  return {}
}

const downloadBlog: DownloadBlog = async ({ path: { id } }) => {
  console.info(id)
  return fs.createReadStream(path.resolve(process.cwd(), 'README.md'))
}

const getBlogText: GetBlogText = async ({ path: { id } }) => {
  console.info(id)
  return fs.readFileSync(path.resolve(process.cwd(), 'README.md')).toString()
}

const handleHttpRequest: HandleHttpRequest = (app, method, url, tag, validate, handler) => {
  app[method](url, upload.any(), async (req: express.Request<{}, {}, {}>, res: express.Response<{}>) => {
    try {
      await authorized(req, tag)
      const body: { [key: string]: unknown } = req.body
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
          body[file.fieldname] = file.stream
        }
      }
      const input = { path: req.params, query: req.query, body }
      const valid = validate(input)
      if (!valid && validate.errors?.[0]?.message) {
        throw new HttpError(validate.errors[0].message, 400)
      }
      const result = await handler(input)
      if (result !== null &&
        typeof result === 'object' &&
        typeof (result as Readable).pipe === 'function'
      ) {
        if (typeof req.query.attachmentFileName === 'string') {
          if (req.query.attachmentFileName) {
            res.set({
              'Content-Disposition': `attachment; filename="${req.query.attachmentFileName}"`,
            })
          } else {
            res.set({
              'Content-Disposition': 'attachment',
            })
          }
        }
        (result as Readable).pipe(res)
      } else if (typeof result === 'string') {
        res.set({
          'content-type': 'text/plain; charset=UTF-8',
        })
        res.send(result).end()
      } else {
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

class MultipartToStream implements multer.StorageEngine {
  public _handleFile(_req: express.Request<{}, {}, {}>, file: Express.Multer.File, cb: (error: Error | null, info?: Partial<Express.Multer.File>) => void) {
    const pass = new stream.PassThrough()
    file.stream.pipe(pass)
    cb(null, {
      stream: pass,
    })
  }
  public _removeFile(_req: express.Request<{}, {}, {}>, _file: Express.Multer.File, cb: (error: Error | null, info?: Partial<Express.Multer.File>) => void) {
    cb(null)
  }
}

const upload = multer({
  storage: new MultipartToStream(),
})

const uploadBlog: UploadBlog = async ({ body: { file, id } }) => {
  console.info(id)
  file.pipe(fs.createWriteStream('a.png'))
  return {}
}

export function startRestfulApi(app: express.Application): void {
  registerGetBlogs(app, handleHttpRequest, getBlogs)
  registerGetBlogById(app, handleHttpRequest, getBlogById)
  registerCreateBlog(app, handleHttpRequest, createBlog)
  registerPatchBlog(app, handleHttpRequest, patchBlog)
  registerDeleteBlog(app, handleHttpRequest, deleteBlog)
  registerDownloadBlog(app, handleHttpRequest, downloadBlog)
  registerUploadBlog(app, handleHttpRequest, uploadBlog)
  registerGetBlogText(app, handleHttpRequest, getBlogText)
}

type BlogDbIgnorableField = Extract<BlogIgnorableField, keyof BlogSchema>

function extractDbIgnoredFields(ignoredFields?: BlogIgnorableField[]) {
  return ignoredFields?.filter(tableSchemas.blogs.fieldNames.includes) as BlogDbIgnorableField[] | undefined
}

async function getBlogWithoutIngoredFields<T extends BlogIgnorableField = never>(
  blog: Pick<Partial<Blog>, BlogDbIgnorableField> & Omit<BlogSchema, BlogDbIgnorableField>,
  ignoredFields?: T[],
) {
  const fields: BlogIgnorableField[] | undefined = ignoredFields
  return {
    ...blog,
    posts: fields?.includes('posts') ? undefined : await selectRows('posts', { filter: { blogId: blog.id } }),
    meta: fields?.includes('meta') ? undefined : blog.meta,
  } as Omit<Blog, T>
}
