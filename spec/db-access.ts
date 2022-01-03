import test from 'ava'
import { intializeDatabase, selectRow } from '../src/db-access'

test('select rows', async (t) => {
  await intializeDatabase()

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
