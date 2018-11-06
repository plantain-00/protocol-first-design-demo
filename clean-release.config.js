module.exports = {
  include: [
    'dist/*.js',
    'static/*.bundle-*.js',
    'static/index.html',
    'LICENSE',
    'package.json',
    'yarn.lock',
    'README.md'
  ],
  exclude: [
  ],
  askVersion: true,
  releaseRepository: 'https://github.com/York Yao/graphql-demo-release.git',
  postScript: [
    'cd "[dir]" && rm -rf .git',
    'cp Dockerfile "[dir]"',
    'cd "[dir]" && docker build -t York Yao/graphql-demo . && docker push York Yao/graphql-demo'
  ]
}
