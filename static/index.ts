import Vue from 'vue'
import Component from 'vue-class-component'
import qs from 'qs'
import { indexTemplateHtml, indexTemplateHtmlStatic, gqlBlogsGql, gqlBlogGql, gqlCreateBlogGql } from './variables'
import { ResolveResult } from '../src/generated/root'
import { RequestRestfulAPI } from './restful-api-declaration'

async function fetchGraphql(query: string, variables = {}) {
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
  const data = await res.json()
  return data.data as ResolveResult
}

const requestRestfulAPI: RequestRestfulAPI = async (
  method: 'GET' | 'POST',
  url: string,
  args?: { path?: { [key: string]: string | number }, query?: {}, body?: {} }
) => {
  if (args) {
    if (args.path) {
      for (const key in args.path) {
        url = url.replace(`{${key}}`, args.path[key].toString())
      }
    }
    if (args.query) {
      url = '?' + qs.stringify(args.query)
    }
  }
  const result = await fetch(
    url,
    {
      method,
      body: args?.body ? JSON.stringify(args.body) : undefined,
      headers: args?.body ? { 'content-type': 'application/json' } : undefined
    })
  return result.json()
}

(async () => {
  const blogsResult = await requestRestfulAPI('GET', '/api/blogs')
  console.info('rest blogs', blogsResult.result, blogsResult.count)

  const blogResult = await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } })
  console.info('rest blog', blogResult.result)

  const createBlogResult = await requestRestfulAPI('POST', '/api/blogs', { body: { content: 'test' } })
  console.info('rest create blog', createBlogResult.result)

  const graphqlBlogsResult = await fetchGraphql(gqlBlogsGql, { pagination: { skip: 1, take: 1 } })
  console.info('graphql blogs', graphqlBlogsResult.blogs.result)

  const graphqlBlogResult = await fetchGraphql(gqlBlogGql, { id: 1 })
  console.info('graphql blog', graphqlBlogResult.blog.result)

  const graphqlCreateBlogResult = await fetchGraphql(gqlCreateBlogGql, { content: 'test' })
  console.info('graphql create blog', graphqlCreateBlogResult.createBlog.result)

  const ws = new WebSocket(`ws://${location.host}`)
  ws.onmessage = (e) => {
    console.info(e.data)
  }
})()

@Component({
  render: indexTemplateHtml,
  staticRenderFns: indexTemplateHtmlStatic
})
export class App extends Vue {
}

new App({ el: '#container' })
