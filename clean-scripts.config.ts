import { executeScriptAsync, Program } from 'clean-scripts'
import { watch } from 'watch-then-execute'
import * as fs from 'fs'

const tsFiles = `"src/**/*.ts" "static/**/*.ts"`
const lessFiles = `"static/**/*.less"`

const tscSrcCommand = 'tsc -p src/'
const file2variableCommand = 'file2variable-cli --config static/file2variable.config.ts'
const webpackCommand = 'webpack --config static/webpack.config.ts'
const revStaticCommand = 'rev-static --config static/rev-static.config.ts'
const cssCommand = [
  'lessc static/index.less > static/index.css',
  'postcss static/index.css -o static/index.postcss.css',
  'cleancss -o static/index.bundle.css static/index.postcss.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css'
]
const schemaCommand = 'types-as-schema src/data.ts --graphql src/generated/data.gql --graphql-root-type src/generated/root.ts'
const graphqlSchemaVariableCommand = 'file2variable-cli --config file2variable.config.js'

export default {
  build: {
    back: [
      'rimraf dist/',
      tscSrcCommand,
      () => fs.copyFileSync('./src/package.json', './dist/package.json'),
    ],
    front: [
      {
        js: [
          file2variableCommand,
          webpackCommand
        ],
        css: cssCommand,
        clean: 'rimraf static/**/*.bundle-*.js static/**/*.bundle-*.css'
      },
      revStaticCommand
    ]
  },
  schema: [
    'DB_SCHEMA_PATH=./db-schema OUTPUT_PATH=./src/db-declaration.ts RESTFUL_API_SCHEMA_PATH=../src/restful-api-schema BACKEND_OUTPUT_PATH=./src/restful-api-declaration.ts FRONTEND_OUTPUT_PATH=./static/restful-api-declaration.ts types-as-schema ./src/restful-api-schema.ts ./src/db-schema.ts --swagger ./static/swagger.json --swagger-base static/swagger-base.json --config protocol-based-web-framework/db --config protocol-based-web-framework/restful-api',
    'types-as-schema src/graphql-api-schema.ts --graphql src/generated/data.gql --graphql-root-type src/generated/root.ts',
    'types-as-schema src/ws-api-schema.ts --json src/generated --protobuf src/generated/ws.proto --markdown src/generated/ws.md',
    'file2variable-cli --config file2variable.config.ts'
  ],
  lint: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles}`,
    export: `no-unused-export ${tsFiles} ${lessFiles} --exclude "src/generated/*.ts"`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src --strict --ignore-files src/generated/*.ts',
    typeCoverageStatic: 'type-coverage -p static --strict --ignore-files static/variables.ts'
  },
  test: {
    unit: 'TS_NODE_PROJECT="./src/tsconfig.json" ava --update-snapshots',
    start: new Program('clean-release --config clean-run.config.ts', 30000)
  },
  fix: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles} --fix`
  },
  watch: {
    back: `${tscSrcCommand} --watch`,
    template: `${file2variableCommand} --watch`,
    webpack: `${webpackCommand} --watch`,
    less: () => watch(['static/**/*.less'], [], () => executeScriptAsync(cssCommand)),
    rev: `${revStaticCommand} --watch`,
    schema: `${schemaCommand} --watch`,
    graphqlSchemaVariable: `${graphqlSchemaVariableCommand} --watch`
  }
}
