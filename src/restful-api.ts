import * as express from 'express'

import { Query, Mutation } from './data'

export function startRestfulApi(app: express.Application) {
  app.get('/api/blogs', (_req, res) => {
    res.json(Query.blogs())
  })

  app.get('/api/blogs/:id', (req, res) => {
    const id = +req.params.id
    res.json(Query.blog(id))
  })

  app.post('/api/blogs', (req, res) => {
    const content = req.query.content
    res.json(Mutation.createBlog(content))
  })
}
