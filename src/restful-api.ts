import * as express from 'express'

import { blogs, posts } from './data'
import { authorized } from './auth'

export function startRestfulApi(app: express.Application) {
  app.get('/api/blogs', (req, res) => {
    authorized(req, 'blog').then(() => {
      const pagination = { skip: 0, take: 10 }
      res.json({
        result: blogs.slice(pagination.skip, pagination.skip + pagination.take)
          .map((blog) => ({
            id: blog.id,
            content: blog.content,
            posts: posts.filter((p) => p.blogId === blog.id),
            meta: blog.meta
          }))
      })
    }, () => {
      res.status(403).end()
    })
  })

  app.get('/api/blogs/:id', (req, res) => {
    authorized(req, 'blog').then(() => {
      const id = +req.params.id
      const blog = blogs.find((b) => b.id === id)
      res.json({
        result: blog ? {
          id: blog.id,
          content: blog.content,
          posts: posts.filter((p) => p.blogId === blog.id),
          meta: blog.meta
        } : undefined
      })
    }, () => {
      res.status(403).end()
    })
  })

  app.post('/api/blogs', (req, res) => {
    authorized(req, 'blog').then(() => {
      const content = req.query.content
      const blog: any = {
        id: 3,
        content,
        meta: {
          baz: 222
        },
        posts: []
      }
      blogs.push(blog)
      res.json({
        result: blog
      })
    }, () => {
      res.status(403).end()
    })
  })
}
