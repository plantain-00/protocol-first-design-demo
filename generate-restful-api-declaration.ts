import { TypeDeclaration, generateTypescriptOfType, generateTypescriptOfFunctionParameter, getReferencesInType } from 'types-as-schema'

export = (typeDeclarations: TypeDeclaration[]): string => {
  const result: string[] = []
  const references: string[] = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function' && declaration.method && declaration.path) {
      const parameters = [
        `method: '${declaration.method.toUpperCase()}'`,
        `url: '${declaration.path}'`,
      ]

      const params: { optional: boolean, value: string }[] = []
      let ignorableField = ''
      for (const type of ['path', 'query', 'body']) {
        const parameter = declaration.parameters.filter((d) => d.in === type)
        if (parameter.length > 0) {
          const optional = parameter.every((q) => q.optional) ? '?' : ''
          params.push({
            optional: parameter.every((q) => q.optional),
            value: `${type}${optional}: { ${parameter.map((q) => {
              if (q.name === 'ignoredFields' && q.type.kind === 'array' && q.type.type.kind === 'reference') {
                references.push(q.type.type.name)
                ignorableField = q.type.type.name
                return 'ignoredFields?: T[]'
              }
              return generateTypescriptOfFunctionParameter(q)
            }).join(', ')} }`
          })
        }
      }
      if (params.length > 0) {
        const optional = params.every((q) => q.optional) ? '?' : ''
        parameters.push(`args${optional}: { ${params.map((p) => p.value).join(', ')} }`)
      }

      references.push(...getReferencesInType(declaration.type).map((r) => r.name))
      const returnType = generateTypescriptOfType(declaration.type, (child) => child.kind === 'reference' ? `Omit<${child.name}, T>` : undefined)
      if (ignorableField) {
        result.push(`  <T extends ${ignorableField} = never>(${parameters.join(', ')}): Promise<${returnType}>`)
      } else {
        result.push(`  (${parameters.join(', ')}): Promise<${returnType}>`)
      }
    }
  }
  return `/* eslint-disable */
import { ${Array.from(new Set(references)).join(', ')} } from '../src/restful-api-schema'

export type RequestRestfulAPI = {
${result.join('\n')}
}
`
}
