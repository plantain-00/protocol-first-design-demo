import { ajv } from '@protocol-based-web-framework/restful-api-consumer'
import type { Readable } from 'stream'
import { Blog, BlogIgnorableField } from "../src/restful-api-schema"

export interface RequestRestfulAPI {
  <TIgnored extends BlogIgnorableField = never>(method: 'GET', url: `/api/blogs`, args?: { query?: { skip?: number, take?: number, ignoredFields?: TIgnored[], sortType?: "asc" | "desc", content?: string, sortField?: "id" | "content", ids?: string[] } }): Promise<{ result: Omit<Blog, TIgnored>[], count: number }>
  <TIgnored extends BlogIgnorableField = never>(method: 'GET', url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: TIgnored[] } }): Promise<{ result?: Omit<Blog, TIgnored> }>
  <TIgnored extends BlogIgnorableField = never>(method: 'GET', url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: TIgnored[] } }): Promise<{ result?: Omit<Blog, TIgnored> }>
  <TIgnored extends BlogIgnorableField = never>(method: 'POST', url: `/api/blogs`, args: { query?: { ignoredFields?: TIgnored[] }, body: { content: string } }): Promise<{ result: Omit<Blog, TIgnored> }>
  <TIgnored extends BlogIgnorableField = never>(method: 'PATCH', url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: TIgnored[] }, body?: { content?: string, meta?: unknown } }): Promise<{ result: Omit<Blog, TIgnored> }>
  <TIgnored extends BlogIgnorableField = never>(method: 'PATCH', url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: TIgnored[] }, body?: { content?: string, meta?: unknown } }): Promise<{ result: Omit<Blog, TIgnored> }>
  (method: 'DELETE', url: `/api/blogs/${number}`): Promise<{  }>
  (method: 'DELETE', url: '/api/blogs/{id}', args: { path: { id: number } }): Promise<{  }>
  (method: 'GET', url: `/api/blogs/${number}/download`, args?: { query?: { attachmentFileName?: string } }): Promise<Blob>
  (method: 'GET', url: '/api/blogs/{id}/download', args: { path: { id: number }, query?: { attachmentFileName?: string } }): Promise<Blob>
  (method: 'POST', url: `/api/blogs/upload`, args: { body: { file: File | Buffer | Readable, id: number } }): Promise<{  }>
  (method: 'GET', url: `/api/blogs/${number}/text`): Promise<string>
  (method: 'GET', url: '/api/blogs/{id}/text', args: { path: { id: number } }): Promise<string>
}

export interface GetRequestApiUrl {
  <TIgnored extends BlogIgnorableField = never>(url: `/api/blogs`, args?: { query?: { skip?: number, take?: number, ignoredFields?: TIgnored[], sortType?: "asc" | "desc", content?: string, sortField?: "id" | "content", ids?: string[] } }): string
  <TIgnored extends BlogIgnorableField = never>(url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: TIgnored[] } }): string
  <TIgnored extends BlogIgnorableField = never>(url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: TIgnored[] } }): string
  <TIgnored extends BlogIgnorableField = never>(url: `/api/blogs`, args?: { query?: { ignoredFields?: TIgnored[] } }): string
  <TIgnored extends BlogIgnorableField = never>(url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: TIgnored[] } }): string
  <TIgnored extends BlogIgnorableField = never>(url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: TIgnored[] } }): string
  (url: `/api/blogs/${number}`): string
  (url: '/api/blogs/{id}', args: { path: { id: number } }): string
  (url: `/api/blogs/${number}/download`, args?: { query?: { attachmentFileName?: string } }): string
  (url: '/api/blogs/{id}/download', args: { path: { id: number }, query?: { attachmentFileName?: string } }): string
  (url: `/api/blogs/upload`): string
  (url: `/api/blogs/${number}/text`): string
  (url: '/api/blogs/{id}/text', args: { path: { id: number } }): string
}

const getBlogsJsonSchema = {
  "type": "object",
  "properties": {
    "result": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Blog"
      }
    },
    "count": {
      "type": "integer"
    }
  },
  "required": [
    "result",
    "count"
  ],
  "definitions": {
    "Blog": {
      "type": "object",
      "properties": {
        "posts": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Post"
          }
        },
        "id": {
          "type": "integer"
        },
        "content": {
          "type": "string"
        },
        "meta": {}
      },
      "required": [
        "posts",
        "id",
        "content",
        "meta"
      ]
    },
    "Post": {
      "$ref": "#/definitions/PostSchema"
    },
    "PostSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "content": {
          "type": "string"
        },
        "blogId": {
          "type": "integer"
        }
      },
      "required": [
        "id",
        "content",
        "blogId"
      ]
    }
  }
}
const getBlogByIdJsonSchema = {
  "type": "object",
  "properties": {
    "result": {
      "$ref": "#/definitions/Blog"
    }
  },
  "required": [],
  "definitions": {
    "Blog": {
      "type": "object",
      "properties": {
        "posts": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Post"
          }
        },
        "id": {
          "type": "integer"
        },
        "content": {
          "type": "string"
        },
        "meta": {}
      },
      "required": [
        "posts",
        "id",
        "content",
        "meta"
      ]
    },
    "Post": {
      "$ref": "#/definitions/PostSchema"
    },
    "PostSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "content": {
          "type": "string"
        },
        "blogId": {
          "type": "integer"
        }
      },
      "required": [
        "id",
        "content",
        "blogId"
      ]
    }
  }
}
const createBlogJsonSchema = {
  "type": "object",
  "properties": {
    "result": {
      "$ref": "#/definitions/Blog"
    }
  },
  "required": [
    "result"
  ],
  "definitions": {
    "Blog": {
      "type": "object",
      "properties": {
        "posts": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Post"
          }
        },
        "id": {
          "type": "integer"
        },
        "content": {
          "type": "string"
        },
        "meta": {}
      },
      "required": [
        "posts",
        "id",
        "content",
        "meta"
      ]
    },
    "Post": {
      "$ref": "#/definitions/PostSchema"
    },
    "PostSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "content": {
          "type": "string"
        },
        "blogId": {
          "type": "integer"
        }
      },
      "required": [
        "id",
        "content",
        "blogId"
      ]
    }
  }
}
const patchBlogJsonSchema = {
  "type": "object",
  "properties": {
    "result": {
      "$ref": "#/definitions/Blog"
    }
  },
  "required": [
    "result"
  ],
  "definitions": {
    "Blog": {
      "type": "object",
      "properties": {
        "posts": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Post"
          }
        },
        "id": {
          "type": "integer"
        },
        "content": {
          "type": "string"
        },
        "meta": {}
      },
      "required": [
        "posts",
        "id",
        "content",
        "meta"
      ]
    },
    "Post": {
      "$ref": "#/definitions/PostSchema"
    },
    "PostSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "content": {
          "type": "string"
        },
        "blogId": {
          "type": "integer"
        }
      },
      "required": [
        "id",
        "content",
        "blogId"
      ]
    }
  }
}
const deleteBlogJsonSchema = {
  "type": "object",
  "properties": {},
  "required": [],
  "definitions": {}
}
const downloadBlogJsonSchema = {
  "definitions": {}
}
const uploadBlogJsonSchema = {
  "type": "object",
  "properties": {},
  "required": [],
  "definitions": {}
}
const getBlogTextJsonSchema = {
  "type": "string",
  "definitions": {}
}

export const validations = [
  {
    url: '/api/blogs',
    method: 'GET',
    schema: getBlogsJsonSchema,
    omittedReferences: ['Blog'] as string[],
    validate: ajv.compile(getBlogsJsonSchema),
    urlPattern: undefined as RegExp | undefined,
    responseType: 'json' as 'json' | 'text' | 'blob',
  },
  {
    url: '/api/blogs/{id}',
    method: 'GET',
    schema: getBlogByIdJsonSchema,
    omittedReferences: ['Blog'] as string[],
    validate: ajv.compile(getBlogByIdJsonSchema),
    urlPattern: /^\/api\/blogs\/[^\\/]+$/ as RegExp | undefined,
    responseType: 'json' as 'json' | 'text' | 'blob',
  },
  {
    url: '/api/blogs',
    method: 'POST',
    schema: createBlogJsonSchema,
    omittedReferences: ['Blog'] as string[],
    validate: ajv.compile(createBlogJsonSchema),
    urlPattern: undefined as RegExp | undefined,
    responseType: 'json' as 'json' | 'text' | 'blob',
  },
  {
    url: '/api/blogs/{id}',
    method: 'PATCH',
    schema: patchBlogJsonSchema,
    omittedReferences: ['Blog'] as string[],
    validate: ajv.compile(patchBlogJsonSchema),
    urlPattern: /^\/api\/blogs\/[^\\/]+$/ as RegExp | undefined,
    responseType: 'json' as 'json' | 'text' | 'blob',
  },
  {
    url: '/api/blogs/{id}',
    method: 'DELETE',
    schema: deleteBlogJsonSchema,
    omittedReferences: [] as string[],
    validate: ajv.compile(deleteBlogJsonSchema),
    urlPattern: /^\/api\/blogs\/[^\\/]+$/ as RegExp | undefined,
    responseType: 'json' as 'json' | 'text' | 'blob',
  },
  {
    url: '/api/blogs/{id}/download',
    method: 'GET',
    schema: downloadBlogJsonSchema,
    omittedReferences: [] as string[],
    validate: ajv.compile(downloadBlogJsonSchema),
    urlPattern: /^\/api\/blogs\/[^\\/]+\/download$/ as RegExp | undefined,
    responseType: 'blob' as 'json' | 'text' | 'blob',
  },
  {
    url: '/api/blogs/upload',
    method: 'POST',
    schema: uploadBlogJsonSchema,
    omittedReferences: [] as string[],
    validate: ajv.compile(uploadBlogJsonSchema),
    urlPattern: undefined as RegExp | undefined,
    responseType: 'json' as 'json' | 'text' | 'blob',
  },
  {
    url: '/api/blogs/{id}/text',
    method: 'GET',
    schema: getBlogTextJsonSchema,
    omittedReferences: [] as string[],
    validate: ajv.compile(getBlogTextJsonSchema),
    urlPattern: /^\/api\/blogs\/[^\\/]+\/text$/ as RegExp | undefined,
    responseType: 'text' as 'json' | 'text' | 'blob',
  },
]
