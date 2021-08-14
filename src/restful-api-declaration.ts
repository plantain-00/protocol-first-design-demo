/* eslint-disable */

import type { Application } from 'express'
import { Readable } from 'stream'
import { ajv, HandleHttpRequest } from './restful-api-declaration-lib'
import { Blog, BlogIgnorableField } from './restful-api-schema'

export type RequestRestfulAPI = {
  <T extends BlogIgnorableField = never>(method: 'GET', url: '/api/blogs', args?: { query?: { skip?: number, take?: number, content?: string, sortField?: "id" | "content", sortType?: "asc" | "desc", ignoredFields?: T[], ids?: string[] } }): Promise<{ result: Omit<Blog, T>[], count: number }>
  <T extends BlogIgnorableField = never>(method: 'GET', url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: T[] } }): Promise<{ result?: Omit<Blog, T> }>
  <T extends BlogIgnorableField = never>(method: 'POST', url: '/api/blogs', args: { query?: { ignoredFields?: T[] }, body: { content: string } }): Promise<{ result: Omit<Blog, T> }>
  <T extends BlogIgnorableField = never>(method: 'PATCH', url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: T[] }, body?: { content?: string, meta?: unknown } }): Promise<{ result: Omit<Blog, T> }>
  (method: 'DELETE', url: '/api/blogs/{id}', args: { path: { id: number } }): Promise<{  }>
  (method: 'GET', url: '/api/blogs/{id}/download', args: { path: { id: number } }): Promise<Readable>
}

export type GetRequestApiUrl = {
  <T extends BlogIgnorableField = never>(url: '/api/blogs', args?: { query?: { skip?: number, take?: number, content?: string, sortField?: "id" | "content", sortType?: "asc" | "desc", ignoredFields?: T[], ids?: string[] } }): string
  <T extends BlogIgnorableField = never>(url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: T[] } }): string
  <T extends BlogIgnorableField = never>(url: '/api/blogs', args?: { query?: { ignoredFields?: T[] } }): string
  <T extends BlogIgnorableField = never>(url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: T[] } }): string
  (url: '/api/blogs/{id}', args: { path: { id: number } }): string
  (url: '/api/blogs/{id}/download', args: { path: { id: number } }): string
}

export type GetBlogs = <T extends BlogIgnorableField = never>(req: { query: { skip: number, take: number, content?: string, sortField: "id" | "content", sortType: "asc" | "desc", ignoredFields?: T[], ids?: string[] } }) => Promise<{ result: Omit<Blog, T>[], count: number }>
export type GetBlogById = <T extends BlogIgnorableField = never>(req: { path: { id: number }, query?: { ignoredFields?: T[] } }) => Promise<{ result?: Omit<Blog, T> }>
export type CreateBlog = <T extends BlogIgnorableField = never>(req: { query?: { ignoredFields?: T[] }, body: { content: string } }) => Promise<{ result: Omit<Blog, T> }>
export type PatchBlog = <T extends BlogIgnorableField = never>(req: { path: { id: number }, query?: { ignoredFields?: T[] }, body?: { content?: string, meta?: unknown } }) => Promise<{ result: Omit<Blog, T> }>
export type DeleteBlog = (req: { path: { id: number } }) => Promise<{  }>
export type DownloadBlog = (req: { path: { id: number } }) => Promise<Readable>

const getBlogsValidate = ajv.compile({
  "type": "object",
  "properties": {
    "path": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "query": {
      "type": "object",
      "properties": {
        "skip": {
          "type": "integer",
          "default": 0
        },
        "take": {
          "type": "integer",
          "default": 10
        },
        "content": {
          "type": "string"
        },
        "sortField": {
          "type": "string",
          "enum": [
            "id",
            "content"
          ],
          "default": "id"
        },
        "sortType": {
          "type": "string",
          "enum": [
            "asc",
            "desc"
          ],
          "default": "asc"
        },
        "ignoredFields": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/BlogIgnorableField"
          }
        },
        "ids": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": []
    },
    "body": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  "required": [],
  "definitions": {
    "BlogIgnorableField": {
      "type": "string",
      "enum": [
        "posts",
        "meta"
      ]
    }
  }
})
const getBlogByIdValidate = ajv.compile({
  "type": "object",
  "properties": {
    "path": {
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        }
      },
      "required": [
        "id"
      ]
    },
    "query": {
      "type": "object",
      "properties": {
        "ignoredFields": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/BlogIgnorableField"
          }
        }
      },
      "required": []
    },
    "body": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  "required": [
    "path"
  ],
  "definitions": {
    "BlogIgnorableField": {
      "type": "string",
      "enum": [
        "posts",
        "meta"
      ]
    }
  }
})
const createBlogValidate = ajv.compile({
  "type": "object",
  "properties": {
    "path": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "query": {
      "type": "object",
      "properties": {
        "ignoredFields": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/BlogIgnorableField"
          }
        }
      },
      "required": []
    },
    "body": {
      "type": "object",
      "properties": {
        "content": {
          "type": "string"
        }
      },
      "required": [
        "content"
      ]
    }
  },
  "required": [
    "body"
  ],
  "definitions": {
    "BlogIgnorableField": {
      "type": "string",
      "enum": [
        "posts",
        "meta"
      ]
    }
  }
})
const patchBlogValidate = ajv.compile({
  "type": "object",
  "properties": {
    "path": {
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        }
      },
      "required": [
        "id"
      ]
    },
    "query": {
      "type": "object",
      "properties": {
        "ignoredFields": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/BlogIgnorableField"
          }
        }
      },
      "required": []
    },
    "body": {
      "type": "object",
      "properties": {
        "content": {
          "type": "string"
        },
        "meta": {}
      },
      "required": []
    }
  },
  "required": [
    "path"
  ],
  "definitions": {
    "BlogIgnorableField": {
      "type": "string",
      "enum": [
        "posts",
        "meta"
      ]
    }
  }
})
const deleteBlogValidate = ajv.compile({
  "type": "object",
  "properties": {
    "path": {
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        }
      },
      "required": [
        "id"
      ]
    },
    "query": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "body": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  "required": [
    "path"
  ],
  "definitions": {}
})
const downloadBlogValidate = ajv.compile({
  "type": "object",
  "properties": {
    "path": {
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        }
      },
      "required": [
        "id"
      ]
    },
    "query": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "body": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  "required": [
    "path"
  ],
  "definitions": {}
})

export const registerGetBlogs = (app: Application, handleHttpRequest: HandleHttpRequest, handler: GetBlogs) => handleHttpRequest(app, 'get', '/api/blogs', 'blog', getBlogsValidate, handler)
export const registerGetBlogById = (app: Application, handleHttpRequest: HandleHttpRequest, handler: GetBlogById) => handleHttpRequest(app, 'get', '/api/blogs/:id', 'blog', getBlogByIdValidate, handler)
export const registerCreateBlog = (app: Application, handleHttpRequest: HandleHttpRequest, handler: CreateBlog) => handleHttpRequest(app, 'post', '/api/blogs', 'blog', createBlogValidate, handler)
export const registerPatchBlog = (app: Application, handleHttpRequest: HandleHttpRequest, handler: PatchBlog) => handleHttpRequest(app, 'patch', '/api/blogs/:id', 'blog', patchBlogValidate, handler)
export const registerDeleteBlog = (app: Application, handleHttpRequest: HandleHttpRequest, handler: DeleteBlog) => handleHttpRequest(app, 'delete', '/api/blogs/:id', 'blog', deleteBlogValidate, handler)
export const registerDownloadBlog = (app: Application, handleHttpRequest: HandleHttpRequest, handler: DownloadBlog) => handleHttpRequest(app, 'get', '/api/blogs/:id/download', 'blog', downloadBlogValidate, handler)
