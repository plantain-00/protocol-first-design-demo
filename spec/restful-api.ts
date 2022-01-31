import test from 'ava'
import '../src/db-access.js'

import { createBlog, mockGeneratedId } from '../src/restful-api.js'

mockGeneratedId(() => 3)

test('create blog', async (t) => {
  const blog = await createBlog({
    body: {
      content: 'test'
    }
  })
  t.snapshot(blog)

  const blog2 = await createBlog({
    body: {
      content: 'test'
    },
    query: {
      ignoredFields: ['meta'],
    },
  })
  t.snapshot(blog2)

  const blog3 = await createBlog({
    body: {
      content: 'test'
    },
    query: {
      ignoredFields: ['posts'],
    },
  })
  t.snapshot(blog3)

  const blog4 = await createBlog({
    body: {
      content: 'test'
    },
    query: {
      ignoredFields: ['posts', 'meta'],
    },
  })
  t.snapshot(blog4)
})
