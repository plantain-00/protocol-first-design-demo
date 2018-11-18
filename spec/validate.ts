import { parse } from 'graphql/language/parser'
import { validate } from 'graphql/validation'
import { buildSchema } from 'graphql'
import * as fs from 'fs'
import { srcGeneratedDataGql } from '../src/generated/variables'

const schema = buildSchema(srcGeneratedDataGql)

const files = fs.readdirSync('./static/gql/')
for (const file of files) {
  const gql = fs.readFileSync(`./static/gql/${file}`).toString()
  const documentNode = parse(gql)
  const errors = validate(schema, documentNode)
  if (errors.length > 0) {
    console.info(errors)
  }
}
