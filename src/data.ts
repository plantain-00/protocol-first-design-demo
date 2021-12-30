export const blogs = [
  {
    id: 1,
    content: 'blog 1 content',
    meta: {
      foo: 'bar'
    } as any,
    posts: [11, 12, 13]
  },
  {
    id: 2,
    content: 'blog 2 content',
    meta: {
      bar: 123
    } as any,
    posts: [21, 22, 23]
  }
]

export const posts = [
  {
    id: 11,
    content: 'post 11 content',
    blogId: 1
  },
  {
    id: 12,
    content: 'post 12 content',
    blogId: 1
  },
  {
    id: 13,
    content: 'post 13 content',
    blogId: 1
  },
  {
    id: 21,
    content: 'post 21 content',
    blogId: 2
  },
  {
    id: 22,
    content: 'post 22 content',
    blogId: 2
  },
  {
    id: 23,
    content: 'post 23 content',
    blogId: 2
  }
]

import * as sqlite from 'sqlite3'

const db = new sqlite.Database(':memory:')

function run(sql: string, ...args: unknown[]) {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, args, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function all<T>(sql: string, ...args: unknown[]) {
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, args, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

(async () => {
  await run('CREATE TABLE IF NOT EXISTS blogs(id, content, meta)')
  await run('CREATE TABLE IF NOT EXISTS posts(id, content, blogId)')

  await run('INSERT INTO blogs (id, content, meta) VALUES (?, ?, ?)', 1, 'blog 1 content', JSON.stringify({
    foo: 'bar'
  }))
  await run('INSERT INTO blogs (id, content, meta) VALUES (?, ?, ?)', 2, 'blog 2 content', JSON.stringify({
    bar: 123
  }))

  await run('INSERT INTO posts (id, content, blogId) VALUES (?, ?, ?)', 11, 'post 11 content', 1)
  await run('INSERT INTO posts (id, content, blogId) VALUES (?, ?, ?)', 12, 'post 12 content', 1)
  await run('INSERT INTO posts (id, content, blogId) VALUES (?, ?, ?)', 13, 'post 13 content', 1)
  await run('INSERT INTO posts (id, content, blogId) VALUES (?, ?, ?)', 21, 'post 21 content', 2)
  await run('INSERT INTO posts (id, content, blogId) VALUES (?, ?, ?)', 22, 'post 22 content', 2)
  await run('INSERT INTO posts (id, content, blogId) VALUES (?, ?, ?)', 23, 'post 23 content', 2)

  console.info(await all('SELECT * FROM blogs'))
  console.info(await all('SELECT * FROM posts'))
})()
