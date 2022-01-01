import test from 'ava'
import { intializeDatabase, selectRows } from '../src/db-access'

test('select rows', async (t) => {
  await intializeDatabase()

  const blog = await selectRows('blogs', {
  })
  t.snapshot(blog)

  const blog2 = await selectRows('blogs', {
    ignoredFields: ['meta'],
  })
  t.snapshot(blog2)

  const blog3 = await selectRows('blogs', {
    ignoredFields: ['content'],
  })
  t.snapshot(blog3)

  const blog4 = await selectRows('blogs', {
    ignoredFields: ['content', 'meta'],
  })
  t.snapshot(blog4)
})
