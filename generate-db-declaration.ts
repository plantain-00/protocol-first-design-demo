import { TypeDeclaration } from 'types-as-schema'

export = (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const schemas: { tableName: string, typeName: string, fields: string[], complexFields: string[] }[] = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'object' && declaration.entry) {
      schemas.push({
        tableName: declaration.entry,
        typeName: declaration.name,
        fields: declaration.members.map((m) => m.name),
        complexFields: declaration.members.filter((m) => m.type.kind !== 'string' && m.type.kind !== 'number' && m.type.kind !== 'boolean').map((m) => m.name),
      })
    }
  }

  const content = `import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions } from "./db-declaration-lib"
import { ${schemas.map((s) => s.typeName).join(', ')} } from "./db-schema"

export type GetRow = {
${schemas.map((s) => `  <T extends keyof ${s.typeName} = never>(tableName: '${s.tableName}', options?: RowSelectOneOptions<${s.typeName}> & { ignoredFields?: T[] }): Promise<Omit<${s.typeName}, T> | undefined>`).join('\n')}
}

export type SelectRow = {
${schemas.map((s) => `  <T extends keyof ${s.typeName} = never>(tableName: '${s.tableName}', options?: RowSelectOptions<${s.typeName}> & { ignoredFields?: T[] }): Promise<Omit<${s.typeName}, T>[]>`).join('\n')}
}

export type InsertRow = {
${schemas.map((s) => `  (tableName: '${s.tableName}', value: ${s.typeName}): Promise<${s.typeName}>`).join('\n')}
}

export type UpdateRow = {
${schemas.map((s) => `  (tableName: '${s.tableName}', value?: Partial<${s.typeName}>, options?: RowFilterOptions<${s.typeName}>): Promise<void>`).join('\n')}
}

export type DeleteRow = {
${schemas.map((s) => `  (tableName: '${s.tableName}', options?: RowFilterOptions<${s.typeName}>): Promise<void>`).join('\n')}
}

export type CountRow = {
${schemas.map((s) => `  (tableName: '${s.tableName}', options?: RowFilterOptions<${s.typeName}>): Promise<number>`).join('\n')}
}

export const tableSchemas = {
${schemas.map((s) => `  ${s.tableName}: {
    fieldNames: [${s.fields.map((f) => `'${f}'`).join(', ')}] as (keyof ${s.typeName})[],
    complexFields: [${s.complexFields.map((f) => `'${f}'`).join(', ')}] as string[],
  },`).join('\n')}
}
`
  return [
    {
      path: './src/db-declaration.ts',
      content: content,
    },
  ]
}
