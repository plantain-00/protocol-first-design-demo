import Ajv, { ValidateFunction } from 'ajv'
import * as express from 'express'

export const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
})

export type HandleHttpRequest = (
  app: express.Application,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  tag: string,
  validate: ValidateFunction,
  handler: (input: any, res: express.Response<{}>) => Promise<{} | void>
) => void
