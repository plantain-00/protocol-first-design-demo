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

function all<T>(sql: string, complexFields: (keyof T)[], ...args: unknown[]) {
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, args, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows.map((row) => restoreComplexFields(complexFields, row)))
      }
    })
  })
}

function get<T>(sql: string, complexFields: (keyof T)[], ...args: unknown[]) {
  return new Promise<T | undefined>((resolve, reject) => {
    db.get(sql, args, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(restoreComplexFields(complexFields, row))
      }
    })
  })
}

function restoreComplexFields<T>(complexFields: (keyof T)[], row: T) {
  for (const field of complexFields) {
    const value = row[field]
    if (value && typeof value === 'string') {
      row[field] = JSON.parse(value)
    }
  }
  return row
}

export interface BlogSchema {
  id: number
  content: string
  meta: unknown
}

interface PostScheme {
  id: number
  content: string
  blogId: number
}

async function createTable(tableName: keyof typeof tableSchemas) {
  const fieldNames = tableSchemas[tableName].fieldNames
  await run(`CREATE TABLE IF NOT EXISTS ${tableName}(${fieldNames.join(', ')})`)
}

async function insertRow<T>(
  tableName: string,
  allFields: (keyof T)[],
  value: T,
) {
  const { values, fields } = getFieldsAndValues(allFields, value)
  await run(`INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${new Array(fields.length).fill('?').join(', ')})`, ...values)
  return value
}

async function updateRow<T>(
  tableName: string,
  allFields: (keyof T)[],
  value?: T,
  options?: RowFilterOptions<T>,
) {
  const { values, fields } = getFieldsAndValues(allFields, value)
  const { sql, values: whereValues } = getWhereSql(allFields, options)
  await run(`UPDATE ${tableName} SET ${fields.map((f) => `${f} = ?`).join(', ')} ${sql}`, ...values, ...whereValues)
}

async function deleteRow<T>(
  tableName: string,
  allFields: (keyof T)[],
  options?: RowFilterOptions<T>,
) {
  const { sql, values } = getWhereSql(allFields, options)
  await run(`DELETE FROM ${tableName} ${sql}`, ...values)
}

function getFieldsAndValues<T>(
  allFields: (keyof T)[],
  value?: T,
) {
  const values: unknown[] = []
  const fields: string[] = []
  if (value) {
    for (const [key, fieldValue] of Object.entries(value)) {
      if (!allFields.includes(key as keyof T)) {
        continue
      }
      fields.push(key)
      values.push(fieldValue && typeof fieldValue === 'object' || Array.isArray(fieldValue) ? JSON.stringify(fieldValue) : fieldValue)
    }
  }
  return {
    fields,
    values,
  }
}

const tableSchemas = {
  blogs: {
    fieldNames: ['id', 'content', 'meta']
  },
  posts: {
    fieldNames: ['id', 'content', 'blogId']
  },
}

/**
 * @public
 */
export const createTableBlogs = () => createTable('blogs')
const createTablePosts = () => createTable('posts')

export const insertBlog = (value: BlogSchema) => insertRow('blogs', ['id', 'content', 'meta'], value)
const insertPost = (value: PostScheme) => insertRow('posts', ['id', 'content', 'blogId'], value)

export const selectBlogs = (options?: RowSelectOptions<BlogSchema>) => selectRows('blogs', ['id', 'content', 'meta'], ['meta'], options)
export const selectPosts = (options?: RowSelectOptions<PostScheme>) => selectRows('posts', ['id', 'content', 'blogId'], [], options)

export const getBlog = (options?: RowSelectOneOptions<BlogSchema>) => getRow('blogs', ['id', 'content', 'meta'], ['meta'], options)

export const updateBlogs = (value?: Partial<BlogSchema>, options?: RowFilterOptions<BlogSchema>) => updateRow('blogs', ['id', 'content', 'meta'], value, options)

export const deleteBlogs = (options?: RowFilterOptions<BlogSchema>) => deleteRow('blogs', ['id', 'content', 'meta'], options)

export const countBlogs = (options?: RowFilterOptions<BlogSchema>) => countRows('blogs', ['id', 'content', 'meta'], options)

type RowSelectOptions<T> = Partial<{
  pagination: { take: number, skip: number }
}> & RowSelectOneOptions<T>

type RowSelectOneOptions<T> = Partial<{
  ignoredFields: (keyof T)[]
  sort: { field: keyof T, type: 'asc' | 'desc' }[]
}> & RowFilterOptions<T>

type RowFilterOptions<T> = Partial<{
  filter: { [P in keyof T]?: T[P] | readonly T[P][] }
  fuzzyFilter: { [P in keyof T]?: T[P] | readonly T[P][] }
}>

function getWhereSql<T>(
  allFields: (keyof T)[],
  options?: RowFilterOptions<T>,
) {
  const values: unknown[] = []
  const filterValue: ({
    type: '='
    name: string
  } | {
    type: 'in'
    name: string
    count: number
  } | {
    type: 'like'
    name: string
  })[] = []
  if (options?.filter) {
    for (const [key, fieldValue] of Object.entries(options.filter)) {
      if (!allFields.includes(key as keyof T) || fieldValue === undefined) {
        continue
      }
      if (Array.isArray(fieldValue)) {
        filterValue.push({
          type: 'in',
          name: key,
          count: fieldValue.length,
        })
        values.push(...fieldValue)
      } else {
        filterValue.push({
          type: '=',
          name: key,
        })
        values.push(fieldValue && typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : fieldValue)
      }
    }
  }
  if (options?.fuzzyFilter) {
    for (const [key, fieldValue] of Object.entries(options.fuzzyFilter)) {
      if (!allFields.includes(key as keyof T) || fieldValue === undefined) {
        continue
      }
      filterValue.push({
        type: 'like',
        name: key,
      })
      values.push(String(fieldValue))
    }
  }
  let sql = ''
  if (filterValue.length > 0) {
    sql += 'WHERE ' + filterValue.map((f) => {
      if (f.type === 'in') {
        return `${f.name} IN (${new Array(f.count).fill('?').join(', ')})`
      }
      if (f.type === 'like') {
        return `${f.name} LIKE '%' || ? || '%'`
      }
      return `${f.name} = ?`
    }).join(' AND ')
  }
  return {
    sql,
    values,
  }
}

function getSelectSql<T>(
  tableName: string,
  allFields: (keyof T)[],
  options?: RowSelectOptions<T>
) {
  const { sql, values } = getSelectOneSql(tableName, allFields, options)
  let limit = ''
  if (options?.pagination) {
    limit = `LIMIT ${options.pagination.take} OFFSET ${options.pagination.skip}`
  }
  return {
    sql: `${sql} ${limit}`,
    values,
  }
}

function getSelectOneSql<T>(
  tableName: string,
  allFields: (keyof T)[],
  options?: RowSelectOneOptions<T>
) {
  const { sql, values } = getWhereSql(allFields, options)
  let orderBy = ''
  if (options?.sort && options.sort.length > 0) {
    orderBy = 'ORDER BY ' + options.sort.map((s) => `${s.field} ${s.type}`).join(', ')
  }
  const fieldNames = allFields.filter((f) => !options?.ignoredFields?.includes(f as keyof T)).join(', ')
  return {
    sql: `SELECT ${fieldNames} FROM ${tableName} ${sql} ${orderBy}`,
    values,
  }
}

async function selectRows<T>(
  tableName: string,
  allFields: (keyof T)[],
  complexFields: (keyof T)[],
  options?: RowSelectOptions<T>
) {
  const { sql, values } = getSelectSql(tableName, allFields, options)
  return all<T>(sql, complexFields, ...values)
}

async function countRows<T>(
  tableName: string,
  allFields: (keyof T)[],
  options?: RowFilterOptions<T>
) {
  const { sql, values } = getWhereSql(allFields, options)
  const result = await all<{ 'COUNT(1)': number }>(`SELECT COUNT(1) FROM ${tableName} ${sql}`, [], ...values)
  return result[0]!['COUNT(1)']
}

async function getRow<T>(
  tableName: string,
  allFields: (keyof T)[],
  complexFields: (keyof T)[],
  options?: RowSelectOneOptions<T>
) {
  const { sql, values } = getSelectSql(tableName, allFields, options)
  return get<T>(sql, complexFields, ...values)
}

(async () => {
  await createTableBlogs()
  await createTablePosts()

  await insertBlog({ id: 1, content: 'blog 1 content', meta: { foo: 'bar' } })
  await insertBlog({ id: 2, content: 'blog 2 content', meta: { bar: 123 } })

  await insertPost({ id: 11, content: 'post 11 content', blogId: 1 })
  await insertPost({ id: 12, content: 'post 12 content', blogId: 1 })
  await insertPost({ id: 13, content: 'post 13 content', blogId: 1 })
  await insertPost({ id: 21, content: 'post 21 content', blogId: 2 })
  await insertPost({ id: 22, content: 'post 22 content', blogId: 2 })
  await insertPost({ id: 23, content: 'post 23 content', blogId: 2 })

  console.info(await selectBlogs())
  console.info(await selectPosts())
})()
