import { createApp, defineComponent } from 'vue'
import qs from 'qs'
import * as protobuf from 'protobufjs'
import produce from 'immer'
import { indexTemplateHtml, gqlBlogsGql, gqlBlogGql, gqlCreateBlogGql } from './variables'
import { ResolveResult } from '../src/generated/root'
import { RequestRestfulAPI, GetRequestApiUrl, validations } from './restful-api-declaration'
import { WsCommand, WsPush } from '../src/ws-api-schema'
import { srcGeneratedWsProto } from '../src/generated/variables'
import { ajv } from './restful-api-declaration-lib'

const root = protobuf.Root.fromJSON(srcGeneratedWsProto)
const commandType = root.lookup('WsCommand') as protobuf.Type
const pushType = root.lookup('WsPush') as protobuf.Type

async function fetchGraphql<T>(query: string, variables = {}) {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  })
  const data: { data: ResolveResult<T> } = await res.json()
  return data.data
}

const composeUrl = (
  url: string,
  args?: { path?: { [key: string]: string | number }, query?: {} }
) => {
  if (args) {
    if (args.path) {
      for (const key in args.path) {
        url = url.replace(`{${key}}`, args.path[key].toString())
      }
    }
    if (args.query) {
      url += '?' + qs.stringify(args.query, {
        arrayFormat: 'brackets',
      })
    }
  }
  return url
}

const getRequestApiUrl: GetRequestApiUrl = composeUrl

function validateByJsonSchema(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  ignoredFields: string[] | undefined,
  input: unknown,
) {
  const validation = validations.find((v) => v.method === method && v.url === url)
  if (validation) {
    if (ignoredFields && ignoredFields.length > 0) {
      const schemaWithoutIgnoredFields = produce(
        validation.schema as {
          definitions: {
            [key: string]: {
              properties: { [key: string]: unknown }
              required?: string[]
            }
          }
        },
        (draft) => {
          for (const omittedReference of validation.omittedReferences) {
            for (const ignoredField of ignoredFields) {
              delete draft.definitions[omittedReference].properties[ignoredField]
            }
            const required = draft.definitions[omittedReference].required
            if (required) {
              draft.definitions[omittedReference].required = required.filter((r) => !ignoredFields.includes(r))
            }
          }
        }
      )
      ajv.validate(schemaWithoutIgnoredFields, input)
      if (ajv.errors?.[0].message) {
        throw new Error(ajv.errors[0].message)
      }
    } else {
      validation.validate(input)
      if (validation.validate.errors?.[0].message) {
        throw new Error(validation.validate.errors[0].message)
      }
    }
  }
}

const requestRestfulAPI: RequestRestfulAPI = async (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  args?: {
    path?: { [key: string]: string | number },
    query?: { ignoredFields?: string[], attachmentFileName?: string },
    body?: {}
  }
) => {
  const composedUrl = composeUrl(url, args)
  let body: BodyInit | undefined
  let headers: HeadersInit | undefined
  if (args?.body) {
    if (typeof args.body === 'object' && Object.values(args.body).some((b) => b instanceof Blob)) {
      const formData = new FormData()
      for (const key in args.body) {
        formData.append(key, (args.body as { [key: string]: string | Blob })[key])
      }
      body = formData
    } else {
      body = JSON.stringify(args.body)
      headers = { 'content-type': 'application/json' }
    }
  }
  const result = await fetch(
    composedUrl,
    {
      method,
      body,
      headers,
    })
  const contentType = result.headers.get('content-type')
  if (contentType) {
    if (contentType.includes('application/json')) {
      const json = await result.json()
      validateByJsonSchema(method, url, args?.query?.ignoredFields, json)
      return json
    }
    if (contentType.includes('text/')) {
      const text = await result.text()
      validateByJsonSchema(method, url, args?.query?.ignoredFields, text)
      return text
    }
  }
  return result.blob()
}

(async () => {
  const ids: string[] = []
  for (let i = 0; i < 50; i++) {
    ids.push(Math.round(16 ** 11 * 15 * Math.random() + 16 ** 11).toString(16))
  }
  console.info(ids)
  const blogsResult = await requestRestfulAPI('GET', '/api/blogs', { query: { sortType: 'desc', ignoredFields: ['posts', 'meta'], ids } })
  console.info('rest blogs', blogsResult.result, blogsResult.count)

  const blogResult = await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } })
  console.info('rest blog', blogResult.result)

  const createBlogResult = await requestRestfulAPI('POST', '/api/blogs', { body: { content: 'test' }, query: { ignoredFields: ['posts'] } })
  console.info('rest create blog', createBlogResult.result)

  const patchBlogResult = await requestRestfulAPI('PATCH', '/api/blogs/{id}', { path: { id: 1 }, body: { content: 'test222' } })
  console.info('rest patch blog', patchBlogResult.result)

  const deleteBlogResult = await requestRestfulAPI('DELETE', '/api/blogs/{id}', { path: { id: 2 } })
  console.info('rest delete blog', deleteBlogResult)

  const graphqlBlogsResult = await fetchGraphql(gqlBlogsGql, { pagination: { skip: 1, take: 1 } })
  console.info('graphql blogs', graphqlBlogsResult.blogs.result)

  const graphqlBlogResult = await fetchGraphql(gqlBlogGql, { id: 1 })
  console.info('graphql blog', graphqlBlogResult.blog.result)

  const graphqlCreateBlogResult = await fetchGraphql(gqlCreateBlogGql, { content: 'test' })
  console.info('graphql create blog', graphqlCreateBlogResult.createBlog.result)

  const ws = new WebSocket(`ws://${location.host}`)
  ws.binaryType = 'arraybuffer'

  function sendWsCommand(command: WsCommand, binary?: boolean) {
    if (binary) {
      ws.send(commandType.encode(command).finish())
    } else {
      ws.send(JSON.stringify(command))
    }
  }

  ws.onmessage = (e: MessageEvent<WsPush | ArrayBuffer>) => {
    if (e.data instanceof ArrayBuffer) {
      const input = pushType.toObject(pushType.decode(new Uint8Array(e.data))) as WsPush
      console.info(input)
    } else {
      const input = e.data
      console.info(input)
    }
  }
  ws.onopen = () => {
    sendWsCommand({
      type: 'update blog',
      id: 1,
      content: 'test2'
    }, true)
  }
})()

const App = defineComponent({
  render: indexTemplateHtml,
  methods: {
    download() {
      window.open(getRequestApiUrl('/api/blogs/{id}/download', {
        path: { id: 1 },
        query: { attachmentFileName: 'a.txt' },
      }), '_blank')
    },
    downloadData() {
      requestRestfulAPI('GET', '/api/blogs/{id}/download', { path: { id: 1 } }).then((r) => {
        console.info(r)
      })
    },
    onChange(e: MouseEvent) {
      const input = e.target as HTMLInputElement
      if (input.files && input.files.length > 0) {
        requestRestfulAPI('POST', '/api/blogs/upload', {
          body: {
            id: 1,
            file: input.files[0],
          },
        })
      }
    },
    getRawText() {
      requestRestfulAPI('GET', '/api/blogs/{id}/text', { path: { id: 1 } }).then((r) => {
        console.info(r)
      })
    },
  }
})

createApp(App).mount('#container')
