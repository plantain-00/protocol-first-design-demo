export default {
  include: [
    'dist/**/*.js',
    'dist/package.json',
    'package.json',
    'yarn.lock'
  ],
  exclude: [
  ],
  postScript: [
    'cd "[dir]" && yarn --production && node dist/index.js'
  ]
}
