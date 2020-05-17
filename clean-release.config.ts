export default {
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
  releaseRepository: 'https://github.com/plantain-00/graphql-demo-release.git',
  postScript: [
    // 'cd "[dir]" && rm -rf .git',
    // 'cp Dockerfile "[dir]"',
    // 'cd "[dir]" && docker build -t plantain-00/graphql-demo . && docker push plantain-00/graphql-demo'
    'git add package.json',
    'git commit -m "[version]"',
    'git tag v[version]',
    'git push',
    'git push origin v[version]',
  ]
}
