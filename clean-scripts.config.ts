import { executeScriptAsync, Program } from 'clean-scripts'
import { watch } from 'watch-then-execute'

const tsFiles = `"src/**/*.ts" "static/**/*.ts"`
const jsFiles = `"*.config.js"`
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
      tscSrcCommand
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
    'types-as-schema src/data.ts --graphql src/generated/data.gql --graphql-root-type src/generated/root.ts',
    'types-as-schema src/restful-api.ts src/data.ts --swagger static/swagger.json',
    'file2variable-cli --config file2variable.config.js'
  ],
  lint: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles} ${jsFiles}`,
    less: `stylelint ${lessFiles}`,
    export: `no-unused-export ${tsFiles} ${lessFiles} --exclude "src/generated/*.ts"`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src --strict',
    typeCoverageStatic: 'type-coverage -p static --strict'
  },
  test: {
    start: new Program('clean-release --config clean-run.config.ts', 30000)
  },
  fix: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles} ${jsFiles} --fix`,
    less: `stylelint --fix ${lessFiles}`
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
