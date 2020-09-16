import { generateTypescriptOfFunctionParameter, generateTypescriptOfType, getReferencesInType, TypeDeclaration } from 'types-as-schema'

export = (typeDeclarations: TypeDeclaration[]): string => {
  const result: string[] = []
  const references: string[] = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function' && declaration.method && declaration.path) {
      //       const tag = declaration.tags && declaration.tags.length > 0 ? `\n  tag: '${declaration.tags[0]}',` : ''
      //       let path = declaration.path
      //       for (const parameter of declaration.parameters) {
      //         if (parameter.in === 'path') {
      //           path = path.split(`{${parameter.name}}`).join(`:${parameter.name}`)
      //         }
      //       }
      //       result.push(`handlers.push({
      //   method: '${declaration.method}',
      //   url: '${path}',${tag}
      //   handler: (req) => {
      //   }
      // })`)

      const parameters: string[] = []

      const params: { optional: boolean, value: string }[] = []
      let ignorableField = ''
      for (const type of ['path', 'query', 'body']) {
        const parameter = declaration.parameters.filter((d) => d.in === type)
        if (parameter.length > 0) {
          parameter.forEach((q) => {
            if (q.type.default !== undefined) {
              q.optional = false
            }
          })
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
        parameters.push(`req${optional}: { ${params.map((p) => p.value).join(', ')} }`)
      }

      references.push(...getReferencesInType(declaration.type).map((r) => r.name))
      const returnType = generateTypescriptOfType(declaration.type, (child) => child.kind === 'reference' ? `Omit<${child.name}, T>` : undefined)
      const interfaceName = declaration.name[0].toUpperCase() + declaration.name.substring(1)
      result.push(`export type ${interfaceName} = <T extends ${ignorableField} = never>(${parameters.join(', ')}) => Promise<${returnType}>`)
    }
  }
  return `/* eslint-disable */

// import { handlers } from '../restful-api'
import { ${Array.from(new Set(references)).join(', ')} } from '../restful-api-schema'

${result.join('\n')}
`
}
