import { TypeDeclaration, generateTypescriptOfType, generateTypescriptOfFunctionParameter } from 'types-as-schema'

export = (typeDeclarations: TypeDeclaration[]): string => {
  const result: string[] = []
  const references: string[] = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function' && declaration.method && declaration.path) {
      const parameters = [
        `method: "${declaration.method.toUpperCase()}"`,
        `url: ${declaration.path}`,
      ]
      const type = generateTypescriptOfType(declaration.type)
      declaration.parameters.forEach((p) => {
        if (p.type.default !== undefined) {
          p.optional = true
        }
      })

      const path = declaration.parameters.filter((d) => d.in === 'path')
      parameters.push(...path.map((p) => generateTypescriptOfFunctionParameter(p)))

      const query = declaration.parameters.filter((d) => d.in === 'query')
      if (query.length > 0) {
        const optional = query.every((q) => q.optional) ? '?' : ''
        parameters.push(`query${optional}: { ${query.map((q) => generateTypescriptOfFunctionParameter(q)).join(', ')} }`)
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
