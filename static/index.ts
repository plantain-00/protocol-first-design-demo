import Vue from 'vue'
import Component from 'vue-class-component'
import { indexTemplateHtml, indexTemplateHtmlStatic, gqlBlogsGql, gqlBlogGql, gqlCreateBlogGql } from './variables'
import { BlogsResult, BlogResult, CreateBlogResult, ResolveResult } from '../src/data'

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
  const data = await res.json()
  return data.data as T
}

(async() => {
  const blogsResult: BlogsResult = await fetch('/api/blogs').then((res) => res.json())
  console.info('rest blogs', blogsResult.result)

  const blogResult: BlogResult = await fetch('/api/blogs/1').then((res) => res.json())
  console.info('rest blog', blogResult.result)

  const createBlogResult: CreateBlogResult = await fetch('/api/blogs?content=test', { method: 'POST' }).then((res) => res.json())
  console.info('rest create blog', createBlogResult.result)

  const graphqlBlogsResult = await fetchGraphql<ResolveResult>(gqlBlogsGql, {})
  console.info('graphql blogs', graphqlBlogsResult.blogs.result)

  const graphqlBlogResult = await fetchGraphql<ResolveResult>(gqlBlogGql, { id: 1 })
  console.info('graphql blog', graphqlBlogResult.blog.result)

  const graphqlCreateBlogResult = await fetchGraphql<ResolveResult>(gqlCreateBlogGql, { content: 'test' })
  console.info('graphql create blog', graphqlCreateBlogResult.createBlog.result)
})()

@Component({
  render: indexTemplateHtml,
  staticRenderFns: indexTemplateHtmlStatic
})
export class App extends Vue {
}

// tslint:disable-next-line:no-unused-expression
new App({ el: '#container' })
