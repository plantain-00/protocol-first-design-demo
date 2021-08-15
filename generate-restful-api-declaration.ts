import { Definition, FunctionParameter, generateTypescriptOfFunctionParameter, generateTypescriptOfType, getAllDefinitions, getJsonSchemaProperty, getReferencedDefinitions, getReferencesInType, Member, TypeDeclaration } from 'types-as-schema'

export = (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const backendResult: string[] = []
  const frontendResult: string[] = []
  const getRequestApiUrlResult: string[] = []
  const references: string[] = []
  const requestJsonSchemas: Array<{ name: string, schema: string }> = []
  const responseJsonSchemas: Array<{ name: string, url: string, method: string, schema: string, omittedReferences: string[] }> = []
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
      registers.push(`export const register${interfaceName} = (app: Application, handleHttpRequest: HandleHttpRequest, handler: ${interfaceName}) => handleHttpRequest(app, '${declaration.method}', '${path}', '${declaration.tags[0]}', ${declaration.name}Validate, handler)`)

      // json schema
      const requestMergedDefinitions: { [name: string]: Definition } = {}
      const requestReferenceNames: string[] = []
      for (const parameter of declaration.parameters) {
        requestReferenceNames.push(...getReferencesInType(parameter.type).map((r) => r.name))
      }
      for (const referenceName of requestReferenceNames) {
        const referencedName = getReferencedDefinitions(referenceName, definitions, [])
        Object.assign(requestMergedDefinitions, referencedName)
      }

      const responseMergedDefinitions: { [name: string]: Definition } = {}
      const responseReferenceNames = getReferencesInType(declaration.type).map((r) => r.name)
      for (const referenceName of responseReferenceNames) {
        const referencedName = getReferencedDefinitions(referenceName, definitions, [])
        Object.assign(responseMergedDefinitions, referencedName)
      }

      const members: Member[] = []
      for (const type of allTypes) {
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
      requestJsonSchemas.push({
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
          definitions: requestMergedDefinitions
        }, null, 2)
      })
      const responseJsonSchema = {
        name: declaration.name,
        method: declaration.method,
        url: declaration.path,
        omittedReferences: [] as string[],
        schema: JSON.stringify({
          ...getJsonSchemaProperty(
            declaration.type,
            { declarations: typeDeclarations, looseMode: true }
          ),
          definitions: responseMergedDefinitions
        }, null, 2)
      }
      responseJsonSchemas.push(responseJsonSchema)

      // import reference
      references.push(...getReferencesInType(declaration.type).map((r) => r.name))
      for (const parameter of declaration.parameters) {
        references.push(...getReferencesInType(parameter.type).map((r) => r.name))
      }

      // backend / frontend types
      const backendParams: { optional: boolean, value: string }[] = []
      const frontendParams: { optional: boolean, value: string }[] = []
      const getRequestApiUrlParam: { optional: boolean, value: string }[] = []
      for (const type of allTypes) {
        const parameter = declaration.parameters.filter((d) => d.in === type)
        if (parameter.length > 0) {
          if (type !== 'body') {
            getRequestApiUrlParam.push(getParam(type, parameter))
          }
          frontendParams.push(getParam(type, parameter))
          parameter.forEach((q) => {
            if (q.type.default !== undefined) {
              q.optional = false
            }
          })
          backendParams.push(getParam(type, parameter, true))
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
      const getRequestApiUrlParameters = [
        `url: '${declaration.path}'`,
      ]
      if (getRequestApiUrlParam.length > 0) {
        const optional = getRequestApiUrlParam.every((q) => q.optional) ? '?' : ''
        getRequestApiUrlParameters.push(`args${optional}: { ${getRequestApiUrlParam.map((p) => p.value).join(', ')} }`)
      }
      const backendParameters: string[] = []
      if (backendParams.length > 0) {
        const optional = backendParams.every((q) => q.optional) ? '?' : ''
        backendParameters.push(`req${optional}: { ${backendParams.map((p) => p.value).join(', ')} }`)
      }

      let returnType: string
      const omittedReferences = new Set<string>()
      if (declaration.type.kind === 'file') {
        returnType = 'Readable'
      } else {
        returnType = generateTypescriptOfType(declaration.type, (child) => {
          if (child.kind === 'reference') {
            omittedReferences.add(child.name)
            return `Omit<${child.name}, T>`
          }
          return undefined
        })
      }
      responseJsonSchema.omittedReferences = Array.from(omittedReferences)

      let ignorableField = ''
      for (const p of declaration.parameters) {
        if (p.name === 'ignoredFields' && p.type.kind === 'array' && p.type.type.kind === 'reference') {
          ignorableField = p.type.type.name
        }
      }
      if (ignorableField) {
        if (declaration.type.kind !== 'file') {
          frontendResult.push(`  <T extends ${ignorableField} = never>(${frontendParameters.join(', ')}): Promise<${returnType}>`)
        }
        getRequestApiUrlResult.push(`  <T extends ${ignorableField} = never>(${getRequestApiUrlParameters.join(', ')}): string`)
        backendResult.push(`export type ${interfaceName} = <T extends ${ignorableField} = never>(${backendParameters.join(', ')}) => Promise<${returnType}>`)
      } else {
        if (declaration.type.kind !== 'file') {
          frontendResult.push(`  (${frontendParameters.join(', ')}): Promise<${returnType}>`)
        }
        getRequestApiUrlResult.push(`  (${getRequestApiUrlParameters.join(', ')}): string`)
        backendResult.push(`export type ${interfaceName} = (${backendParameters.join(', ')}) => Promise<${returnType}>`)
      }
    }
  }
  const backendContent = `/* eslint-disable */

import type { Application } from 'express'
import { Readable } from 'stream'
import { ajv, HandleHttpRequest } from './restful-api-declaration-lib'
import { ${Array.from(new Set(references)).join(', ')} } from './restful-api-schema'

${backendResult.join('\n')}

${requestJsonSchemas.map((s) => `const ${s.name}Validate = ajv.compile(${s.schema})`).join('\n')}

${registers.join('\n')}
`
  const frontendContent = `import { ${Array.from(new Set(references)).join(', ')} } from '../src/restful-api-schema'
import { ajv } from './restful-api-declaration-lib'

export type RequestRestfulAPI = {
${frontendResult.join('\n')}
}

export type GetRequestApiUrl = {
${getRequestApiUrlResult.join('\n')}
}

${responseJsonSchemas.map((s) => `const ${s.name}JsonSchema = ${s.schema}`).join('\n')}

export const validations = [
${responseJsonSchemas.map((s) => `  {
    url: '${s.url}',
    method: '${s.method.toUpperCase()}',
    schema: ${s.name}JsonSchema,
    omittedReferences: [${s.omittedReferences.map((m) => `'${m}'`).join(',')}],
    validate: ajv.compile(${s.name}JsonSchema),
  },`).join('\n')}
]
`
  return [
    {
      path: './src/restful-api-declaration.ts',
      content: backendContent,
    },
    {
      path: './static/restful-api-declaration.ts',
      content: frontendContent,
    },
  ]
}

const allTypes = ['path', 'query', 'body'] as const

function getParam(type: typeof allTypes[number], parameter: FunctionParameter[], backend?: boolean) {
  const optional = parameter.every((q) => q.optional) ? '?' : ''
  return {
    optional: parameter.every((q) => q.optional),
    value: `${type}${optional}: { ${parameter.map((q) => {
      if (q.name === 'ignoredFields' && q.type.kind === 'array' && q.type.type.kind === 'reference') {
        return 'ignoredFields?: T[]'
      }
      if (backend && q.type.kind === 'file') {
        return `${q.name}${q.optional ? '?' : ''}: Readable`
      }
      return generateTypescriptOfFunctionParameter(q)
    }).join(', ')} }`
  }
}
