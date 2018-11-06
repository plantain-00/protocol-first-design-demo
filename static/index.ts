import Vue from 'vue'
import Component from 'vue-class-component'
import { indexTemplateHtml, indexTemplateHtmlStatic } from './variables'
import { Blog } from '../src/data'

fetch('/api/blogs').then((res) => res.json()).then((data: { result: Blog[] }) => {
  console.info(data.result)
})

fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    query: `query Blogs {
      blogs {
        result {
          id
          content
          posts {
            id
            content
          }
        }
      }
    }`,
    variables: {}
  })
}).then((res) => res.json()).then((data: { data: { blogs: { result: Blog[] } } }) => {
  console.info(data.data.blogs.result)
})

@Component({
  render: indexTemplateHtml,
  staticRenderFns: indexTemplateHtmlStatic
})
export class App extends Vue {
}

// tslint:disable-next-line:no-unused-expression
new App({ el: '#container' })
