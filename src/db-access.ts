import * as sqlite from 'sqlite3'
import { CountRow, DeleteRow, GetRow, InsertRow, SelectRow, tableSchemas, UpdateRow } from './db-declaration'
import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions } from './db-declaration-lib'

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

function all<T>(sql: string, complexFields: string[], ...args: unknown[]) {
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, args, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        for (const row of rows) {
          restoreComplexFields(complexFields, row)
        }
        resolve(rows)
      }
    })
  })
}

function get<T>(sql: string, complexFields: string[], ...args: unknown[]) {
  return new Promise<T | undefined>((resolve, reject) => {
    db.get(sql, args, (err, row) => {
      if (err) {
        reject(err)
      } else {
        restoreComplexFields(complexFields, row)
        resolve(row)
      }
    })
  })
}

function restoreComplexFields(complexFields: string[], row: Record<string, unknown>) {
  for (const field of complexFields) {
    const value = row[field]
    if (value && typeof value === 'string') {
      row[field] = JSON.parse(value)
    }
  }
  return row
}

async function createTable(tableName: keyof typeof tableSchemas) {
  const fieldNames = tableSchemas[tableName].fieldNames
  await run(`CREATE TABLE IF NOT EXISTS ${tableName}(${fieldNames.join(', ')})`)
}

export const insertRow: InsertRow = async<T>(
  tableName: keyof typeof tableSchemas,
  value: T,
) => {
  const { values, fields } = getFieldsAndValues(tableName, value)
  await run(`INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${new Array(fields.length).fill('?').join(', ')})`, ...values)
  return value
}

export const updateRow: UpdateRow = async <T>(
  tableName: keyof typeof tableSchemas,
  value?: T,
  options?: RowFilterOptions<T>,
) => {
  const { values, fields } = getFieldsAndValues(tableName, value)
  const { sql, values: whereValues } = getWhereSql(tableName, options)
  await run(`UPDATE ${tableName} SET ${fields.map((f) => `${f} = ?`).join(', ')} ${sql}`, ...values, ...whereValues)
}

export const deleteRow: DeleteRow = async <T>(
  tableName: keyof typeof tableSchemas,
  options?: RowFilterOptions<T>,
) => {
  const { sql, values } = getWhereSql(tableName, options)
  await run(`DELETE FROM ${tableName} ${sql}`, ...values)
}

function getFieldsAndValues<T>(
  tableName: keyof typeof tableSchemas,
  value?: T,
) {
  const values: unknown[] = []
  const fields: string[] = []
  if (value) {
    for (const [key, fieldValue] of Object.entries(value)) {
      if (!tableSchemas[tableName].fieldNames.includes(key)) {
        continue
      }
      fields.push(key)
      values.push(fieldValue && tableSchemas[tableName].complexFields.includes(key) ? JSON.stringify(fieldValue) : fieldValue)
    }
  }
  return {
    fields,
    values,
  }
}

function getWhereSql<T>(
  tableName: keyof typeof tableSchemas,
  options?: RowFilterOptions<T>,
) {
  const allFields = tableSchemas[tableName].fieldNames
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
      if (!allFields.includes(key) || fieldValue === undefined) {
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
        values.push(fieldValue && tableSchemas[tableName].complexFields.includes(key) ? JSON.stringify(fieldValue) : fieldValue)
      }
    }
  }
  if (options?.fuzzyFilter) {
    for (const [key, fieldValue] of Object.entries(options.fuzzyFilter)) {
      if (!allFields.includes(key) || fieldValue === undefined) {
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
  tableName: keyof typeof tableSchemas,
  options?: RowSelectOptions<T>
) {
  const { sql, values } = getSelectOneSql(tableName, options)
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
  tableName: keyof typeof tableSchemas,
  options?: RowSelectOneOptions<T>
) {
  const { sql, values } = getWhereSql(tableName, options)
  let orderBy = ''
  if (options?.sort && options.sort.length > 0) {
    orderBy = 'ORDER BY ' + options.sort.map((s) => `${s.field} ${s.type}`).join(', ')
  }
  const fieldNames = tableSchemas[tableName].fieldNames.filter((f) => !options?.ignoredFields?.includes(f)).join(', ')
  return {
    sql: `SELECT ${fieldNames} FROM ${tableName} ${sql} ${orderBy}`,
    values,
  }
}

export const selectRows: SelectRow = async <T>(
  tableName: keyof typeof tableSchemas,
  options?: RowSelectOptions<T>
) => {
  const { sql, values } = getSelectSql(tableName, options)
  return all<T>(sql, tableSchemas[tableName].complexFields, ...values)
}

export const countRows: CountRow = async <T>(
  tableName: keyof typeof tableSchemas,
  options?: RowFilterOptions<T>
) => {
  const { sql, values } = getWhereSql(tableName, options)
  const result = await all<{ 'COUNT(1)': number }>(`SELECT COUNT(1) FROM ${tableName} ${sql}`, [], ...values)
  return result[0]!['COUNT(1)']
}

export const getRow: GetRow = async <T>(
  tableName: keyof typeof tableSchemas,
  options?: RowSelectOneOptions<T>
) => {
  const { sql, values } = getSelectSql(tableName, options)
  return get<T>(sql, tableSchemas[tableName].complexFields, ...values)
}

const getKeys: <T>(obj: T) => (keyof T)[] = Object.keys

export async function intializeDatabase() {
  for (const tableName of getKeys(tableSchemas)) {
    await createTable(tableName)
  }

  await insertRow('blogs', { id: 1, content: 'blog 1 content', meta: { foo: 'bar' } })
  await insertRow('blogs', { id: 2, content: 'blog 2 content', meta: { bar: 123 } })

  await insertRow('posts', { id: 11, content: 'post 11 content', blogId: 1 })
  await insertRow('posts', { id: 12, content: 'post 12 content', blogId: 1 })
  await insertRow('posts', { id: 13, content: 'post 13 content', blogId: 1 })
  await insertRow('posts', { id: 21, content: 'post 21 content', blogId: 2 })
  await insertRow('posts', { id: 22, content: 'post 22 content', blogId: 2 })
  await insertRow('posts', { id: 23, content: 'post 23 content', blogId: 2 })
}
