import * as express from 'express'

import { Query, Mutation } from './data'
import { authorized } from './auth'

export function startRestfulApi(app: express.Application) {
  app.get('/api/blogs', (req, res) => {
    authorized(req, 'blog', res).then(() => {
      res.json(Query.blogs())
    })
  })

  app.get('/api/blogs/:id', (req, res) => {
    authorized(req, 'blog', res).then(() => {
      const id = +req.params.id
      res.json(Query.blog(id))
    })
  })

  app.post('/api/blogs', (req, res) => {
    authorized(req, 'blog', res).then(() => {
      const content = req.query.content
      res.json(Mutation.createBlog(content))
    })
  })
}
