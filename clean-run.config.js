module.exports = {
  include: [
    'dist/*.js',
    'package.json',
    'yarn.lock'
  ],
  exclude: [
  ],
  postScript: [
    'cd "[dir]" && yarn --production && node dist/index.js'
  ]
}
