import { TypeDeclaration, generateTypescriptOfType, generateTypescriptOfFunctionParameter } from 'types-as-schema'

export = (typeDeclarations: TypeDeclaration[]): string => {
  const result: string[] = []
  const references: string[] = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function' && declaration.method && declaration.path) {
      const parameters = [
        `method: '${declaration.method.toUpperCase()}'`,
        `url: '${declaration.path}'`,
      ]
      const type = generateTypescriptOfType(declaration.type)

      const params: { optional: boolean, value: string }[] = []
      for (const type of ['path', 'query', 'body']) {
        const parameter = declaration.parameters.filter((d) => d.in === type)
        if (parameter.length > 0) {
          const optional = parameter.every((q) => q.optional) ? '?' : ''
          params.push({
            optional: parameter.every((q) => q.optional),
            value: `${type}${optional}: { ${parameter.map((q) => generateTypescriptOfFunctionParameter(q)).join(', ')} }`
          })
        }
      }
      if (params.length > 0) {
        const optional = params.every((q) => q.optional) ? '?' : ''
        parameters.push(`args${optional}: { ${params.map((p) => p.value).join(', ')} }`)
      }

      references.push(type)
      result.push(`  (${parameters.join(', ')}): Promise<DeepReturnType<${type}>>`)
    }
  }
  return `/* eslint-disable */
import { ${references.join(', ')} } from '../src/data'
import { DeepReturnType } from '../src/generated/root'

export type RequestRestfulAPI = {
${result.join('\n')}
}
`
}
