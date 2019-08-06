const { Service, executeScriptAsync, Program } = require('clean-scripts')
const { watch } = require('watch-then-execute')

const tsFiles = `"src/**/*.ts" "static/**/*.ts" "spec/**/*.ts" "static_spec/**/*.ts"`
const jsFiles = `"*.config.js" "static/**/*.config.js" "static_spec/**/*.config.js"`
const lessFiles = `"static/**/*.less"`

const tscSrcCommand = 'tsc -p src/'
const file2variableCommand = 'file2variable-cli --config static/file2variable.config.js'
const tscStaticCommand = 'tsc -p static/'
const webpackCommand = 'webpack --config static/webpack.config.js'
const revStaticCommand = 'rev-static --config static/rev-static.config.js'
const cssCommand = [
  'lessc static/index.less > static/index.css',
  'postcss static/index.css -o static/index.postcss.css',
  'cleancss -o static/index.bundle.css static/index.postcss.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css'
]
const schemaCommand = 'types-as-schema src/data.ts --graphql src/generated/data.gql --graphql-root-type src/generated/root.ts'
const graphqlSchemaVariableCommand = 'file2variable-cli --config file2variable.config.js'

module.exports = {
  build: {
    back: [
      'rimraf dist/',
      tscSrcCommand
    ],
    front: [
      {
        js: [
          file2variableCommand,
          tscStaticCommand,
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
    commit: `commitlint --from=HEAD~1`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src --strict',
    typeCoverageStatic: 'type-coverage -p static --strict'
  },
  test: {
    jasmine: [
      'tsc -p spec',
      'jasmine'
    ],
    karma: [
      'tsc -p static_spec',
      'karma start static_spec/karma.config.js'
    ],
    start: new Program('clean-release --config clean-run.config.js', 30000)
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
  },
  screenshot: [
    new Service('node ./dist/index.js'),
    'tsc -p screenshots',
    'node screenshots/index.js'
  ],
  prerender: [
    new Service('node ./dist/index.js'),
    'tsc -p prerender',
    'node prerender/index.js',
    revStaticCommand
  ]
}
