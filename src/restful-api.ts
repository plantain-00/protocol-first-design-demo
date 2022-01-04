import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import stream from 'stream'
import multer from 'multer'

import { countRow, deleteRow, getRow, insertRow, selectRow, updateRow } from './db-access'
import { authorized, HttpError } from './auth'
import { apiSchemas, bindRestfulApiHandler, CreateBlog, DeleteBlog, DownloadBlog, GetBlogById, GetBlogs, GetBlogText, PatchBlog, UploadBlog } from './restful-api-declaration'
import { Blog, BlogIgnorableField } from './restful-api-schema'
import { RowFilterOptions, getAndValidateRequestInput, respondHandleResult } from 'protocol-based-web-framework'
import { BlogSchema } from './db-schema'
import { tableSchemas } from './db-declaration'

const getBlogs: GetBlogs = async ({ query: { sortField, sortType, content, skip, take, ignoredFields } }) => {
  const filter: RowFilterOptions<BlogSchema> = {
    fuzzyFilter: {
      content,
    },
  }
  const filteredBlogs = await selectRow('blogs', {
    ...filter,
    sort: [
      {
        field: sortField,
        type: sortType,
      }
    ],
    ignoredFields: extractDbIgnoredFieldsFromBlogIgnoredField(ignoredFields),
    pagination: {
      take,
      skip,
    },
  })
  const total = await countRow('blogs', filter)

  return {
    result: await Promise.all(filteredBlogs.map((blog) => getBlogWithoutIngoredFields(blog, ignoredFields))),
    count: total,
  }
}
bindRestfulApiHandler('GetBlogs', getBlogs)

const getBlogById: GetBlogById = async ({ query, path: { id } }) => {
  const blog = await getRow('blogs', { filter: { id }, ignoredFields: extractDbIgnoredFieldsFromBlogIgnoredField(query?.ignoredFields) })
  return {
    result: blog ? await getBlogWithoutIngoredFields(blog, query?.ignoredFields) : undefined
  }
}
bindRestfulApiHandler('GetBlogById', getBlogById)

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
bindRestfulApiHandler('CreateBlog', createBlog)

const patchBlog: PatchBlog = async ({ path: { id }, query, body }) => {
  await updateRow('blogs', body, { filter: { id } })
  const blog = await getRow('blogs', { filter: { id }, ignoredFields: extractDbIgnoredFieldsFromBlogIgnoredField(query?.ignoredFields) })
  if (!blog) {
    throw new HttpError('invalid parameter: id', 400)
  }
  return {
    result: await getBlogWithoutIngoredFields(blog, query?.ignoredFields)
  }
}
bindRestfulApiHandler('PatchBlog', patchBlog)

const deleteBlog: DeleteBlog = async ({ path: { id } }) => {
  await deleteRow('blogs', { filter: { id } })
  return {}
}
bindRestfulApiHandler('DeleteBlog', deleteBlog)

const downloadBlog: DownloadBlog = async ({ path: { id } }) => {
  console.info(id)
  return fs.createReadStream(path.resolve(process.cwd(), 'README.md'))
}
bindRestfulApiHandler('DownloadBlog', downloadBlog)

const getBlogText: GetBlogText = async ({ path: { id } }) => {
  console.info(id)
  return fs.readFileSync(path.resolve(process.cwd(), 'README.md')).toString()
}
bindRestfulApiHandler('GetBlogText', getBlogText)

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
bindRestfulApiHandler('UploadBlog', uploadBlog)

export function startRestfulApi(app: express.Application): void {
  for (const { method, url, validate, tags, handler } of apiSchemas) {
    if (!handler) {
      throw new HttpError('this api handler is not binded', 500)
    }
    app[method](url, upload.any(), async (req: express.Request<{}, {}, {}>, res: express.Response<{}>) => {
      try {
        await authorized(req, tags)
        const input = getAndValidateRequestInput(req, validate)
        if (typeof input === 'string') {
          throw new HttpError(input, 400)
        }
        const result = await handler(input)
        respondHandleResult(result, req, res)
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

type BlogDbIgnorableField = Extract<BlogIgnorableField, keyof BlogSchema>

function extractDbIgnoredFieldsFromBlogIgnoredField(ignoredFields?: BlogIgnorableField[]) {
  if (!ignoredFields) {
    return undefined
  }
  const result: BlogDbIgnorableField[] = []
  for (const item of ignoredFields) {
    for (const r of tableSchemas.blogs.fieldNames) {
      if (item === r) {
        result.push(item)
        break
      }
    }
  }
  return result
}

async function getBlogWithoutIngoredFields<T extends BlogIgnorableField = never>(
  blog: Pick<Partial<Blog>, BlogDbIgnorableField> & Omit<BlogSchema, BlogDbIgnorableField>,
  ignoredFields?: T[],
) {
  const fields: BlogIgnorableField[] | undefined = ignoredFields
  return {
    ...blog,
    posts: fields?.includes('posts') ? undefined : await selectRow('posts', { filter: { blogId: blog.id } }),
    meta: fields?.includes('meta') ? undefined : blog.meta,
  } as Omit<Blog, T>
}
