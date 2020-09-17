import { Definition, FunctionParameter, generateTypescriptOfFunctionParameter, generateTypescriptOfType, getAllDefinitions, getJsonSchemaProperty, getReferencedDefinitions, getReferencesInType, Member, TypeDeclaration } from 'types-as-schema'

export = (typeDeclarations: TypeDeclaration[]): string => {
  const backendResult: string[] = []
  const frontendResult: string[] = []
  const references: string[] = []
  const jsonSchemas: Array<{ name: string, schema: string }> = []
  const registers: string[] = []
  const definitions = getAllDefinitions({ declarations: typeDeclarations, looseMode: true })
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function' && declaration.method && declaration.path && declaration.tags && declaration.tags.length > 0) {
      // register
      let path = declaration.path
      for (const parameter of declaration.parameters) {
        if (parameter.in === 'path') {
          path = path.split(`{${parameter.name}}`).join(`:${parameter.name}`)
        }
      }
      const interfaceName = declaration.name[0].toUpperCase() + declaration.name.substring(1)
      registers.push(`export const register${interfaceName} = (app: express.Application, handler: ${interfaceName}) => handleHttpRequest(app, '${declaration.method}', '${path}', '${declaration.tags[0]}', ${declaration.name}Validate, handler)`)

      // json schema
      const mergedDefinitions: { [name: string]: Definition } = {}
      const referenceNames: string[] = []
      for (const parameter of declaration.parameters) {
        referenceNames.push(...getReferencesInType(parameter.type).map((r) => r.name))
      }
      for (const referenceName of referenceNames) {
        const referencedName = getReferencedDefinitions(referenceName, definitions, [])
        Object.assign(mergedDefinitions, referencedName)
      }
      const members: Member[] = []
      for (const type of ['path', 'query', 'body']) {
        const params = declaration.parameters.filter((d) => d.in === type)
        members.push({
          name: type,
          type: {
            kind: 'object',
            members: params,
            minProperties: params.filter((p) => !p.optional).length,
            position: {
              file: '',
              line: 0,
              character: 0,
            }
          },
          optional: params.every((p) => p.optional),
        })
      }
      jsonSchemas.push({
        name: declaration.name,
        schema: JSON.stringify({
          ...getJsonSchemaProperty(
            {
              kind: 'object',
              members,
              minProperties: members.filter((m) => !m.optional).length,
              position: {
                file: '',
                line: 0,
                character: 0,
              }
            },
            { declarations: typeDeclarations, looseMode: true }
          ),
          definitions: mergedDefinitions
        }, null, 2)
      })

      // import reference
      references.push(...getReferencesInType(declaration.type).map((r) => r.name))
      for (const parameter of declaration.parameters) {
        references.push(...getReferencesInType(parameter.type).map((r) => r.name))
      }

      // backend / frontend types
      const backendParams: { optional: boolean, value: string }[] = []
      const frontendParams: { optional: boolean, value: string }[] = []
      for (const type of ['path', 'query', 'body']) {
        const parameter = declaration.parameters.filter((d) => d.in === type)
        if (parameter.length > 0) {
          frontendParams.push(getParam(type, parameter))
          parameter.forEach((q) => {
            if (q.type.default !== undefined) {
              q.optional = false
            }
          })
          backendParams.push(getParam(type, parameter))
        }
      }
      const frontendParameters = [
        `method: '${declaration.method.toUpperCase()}'`,
        `url: '${declaration.path}'`,
      ]
      if (frontendParams.length > 0) {
        const optional = frontendParams.every((q) => q.optional) ? '?' : ''
        frontendParameters.push(`args${optional}: { ${frontendParams.map((p) => p.value).join(', ')} }`)
      }
      const backendParameters: string[] = []
      if (backendParams.length > 0) {
        const optional = backendParams.every((q) => q.optional) ? '?' : ''
        backendParameters.push(`req${optional}: { ${backendParams.map((p) => p.value).join(', ')} }`)
      }
      const returnType = generateTypescriptOfType(declaration.type, (child) => child.kind === 'reference' ? `Omit<${child.name}, T>` : undefined)
      let ignorableField = ''
      for (const p of declaration.parameters) {
        if (p.name === 'ignoredFields' && p.type.kind === 'array' && p.type.type.kind === 'reference') {
          ignorableField = p.type.type.name
        }
      }
      if (ignorableField) {
        frontendResult.push(`  <T extends ${ignorableField} = never>(${frontendParameters.join(', ')}): Promise<${returnType}>`)
        backendResult.push(`export type ${interfaceName} = <T extends ${ignorableField} = never>(${backendParameters.join(', ')}) => Promise<${returnType}>`)
      } else {
        frontendResult.push(`  (${frontendParameters.join(', ')}): Promise<${returnType}>`)
        backendResult.push(`export type ${interfaceName} = (${backendParameters.join(', ')}) => Promise<${returnType}>`)
      }
    }
  }
  return `/* eslint-disable */

import { ${Array.from(new Set(references)).join(', ')} } from './restful-api-schema'

export type RequestRestfulAPI = {
${frontendResult.join('\n')}
}

${backendResult.join('\n')}

import Ajv from 'ajv'

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
})

${jsonSchemas.map((s) => `const ${s.name}Validate = ajv.compile(${s.schema})`).join('\n')}

import * as express from 'express'
import { handleHttpRequest } from './restful-api'

${registers.join('\n')}
`
}

function getParam(type: string, parameter: FunctionParameter[]) {
  const optional = parameter.every((q) => q.optional) ? '?' : ''
  return {
    optional: parameter.every((q) => q.optional),
    value: `${type}${optional}: { ${parameter.map((q) => {
      if (q.name === 'ignoredFields' && q.type.kind === 'array' && q.type.type.kind === 'reference') {
        return 'ignoredFields?: T[]'
      }
      return generateTypescriptOfFunctionParameter(q)
    }).join(', ')} }`
  }
}
