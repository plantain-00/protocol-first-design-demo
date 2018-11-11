import * as express from 'express'

import { Query, Mutation } from './data'
import { authorized } from './auth'

export function startRestfulApi(app: express.Application) {
  app.get('/api/blogs', (req, res) => {
    authorized(req, 'blog').then(() => {
      res.json(Query.blogs({ skip: 0, take: 10 }))
    }, () => {
      res.status(403).end()
    })
  })

  app.get('/api/blogs/:id', (req, res) => {
    authorized(req, 'blog').then(() => {
      const id = +req.params.id
      res.json(Query.blog(id))
    }, () => {
      res.status(403).end()
    })
  })

  app.post('/api/blogs', (req, res) => {
    authorized(req, 'blog').then(() => {
      const content = req.query.content
      res.json(Mutation.createBlog(content))
    }, () => {
      res.status(403).end()
    })
  })
}
