import test from 'ava'

import { createBlog, mockGeneratedId } from '../src/restful-api'

mockGeneratedId(() => 3)

test('remove default array', async (t) => {
  const blog = await createBlog({
    body: {
      content: 'test'
    }
  })
  t.snapshot(blog)
})
