import Vue from 'vue'
import Component from 'vue-class-component'
import { indexTemplateHtml, indexTemplateHtmlStatic, gqlBlogsGql, gqlBlogGql } from './variables'
import { BlogsResult, BlogResult } from '../src/data'

fetch('/api/blogs').then((res) => res.json()).then((data: BlogsResult) => {
  console.info(data.result)
})

fetch('/api/blogs/1').then((res) => res.json()).then((data: BlogResult) => {
  console.info(data.result)
})

function fetchGraphql<T>(query: any, variables: any = {}) {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  }).then((res) => res.json()).then((data: { data: T }) => {
    return data.data
  })
}

fetchGraphql<{ blogs: BlogsResult }>(gqlBlogsGql, {}).then((data) => { console.info(data.blogs.result) })

fetchGraphql<{ blog: BlogResult }>(gqlBlogGql, { id: 1 }).then((data) => { console.info(data.blog.result) })

@Component({
  render: indexTemplateHtml,
  staticRenderFns: indexTemplateHtmlStatic
})
export class App extends Vue {
}

// tslint:disable-next-line:no-unused-expression
new App({ el: '#container' })
