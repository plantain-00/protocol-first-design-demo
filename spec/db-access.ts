import test from 'ava'
import { selectRow } from '../src/db-access.js'

test('select rows', async (t) => {
  const blog = await selectRow('blogs', {
  })
  t.snapshot(blog)

  const blog2 = await selectRow('blogs', {
    ignoredFields: ['meta'],
  })
  t.snapshot(blog2)

  const blog3 = await selectRow('blogs', {
    ignoredFields: ['content'],
  })
  t.snapshot(blog3)

  const blog4 = await selectRow('blogs', {
    ignoredFields: ['content', 'meta'],
  })
  t.snapshot(blog4)
})
