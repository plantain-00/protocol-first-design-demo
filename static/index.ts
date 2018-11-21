import Vue from 'vue'
import Component from 'vue-class-component'
import { indexTemplateHtml, indexTemplateHtmlStatic, gqlBlogsGql, gqlBlogGql, gqlCreateBlogGql } from './variables'
import { BlogsResult, BlogResult, CreateBlogResult } from '../src/data'
import { ResolveResult, DeepReturnType } from '../src/generated/root'

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

(async() => {
  const blogsResult: DeepReturnType<BlogsResult> = await fetch('/api/blogs').then((res) => res.json())
  console.info('rest blogs', blogsResult.result)

  const blogResult: DeepReturnType<BlogResult> = await fetch('/api/blogs/1').then((res) => res.json())
  console.info('rest blog', blogResult.result)

  const createBlogResult: DeepReturnType<CreateBlogResult> = await fetch('/api/blogs?content=test', { method: 'POST' }).then((res) => res.json())
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

// tslint:disable-next-line:no-unused-expression
new App({ el: '#container' })
