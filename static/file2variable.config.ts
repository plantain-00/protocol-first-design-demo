export default {
  base: 'static',
  files: [
    'static/*.template.html',
    'static/gql/*.gql'
  ],
  handler: (file: string) => {
    if (file.endsWith('.gql')) {
      return { type: 'text' }
    }
    return {
      type: 'vue',
      name: 'App',
      path: './index'
    }
  },
  out: 'static/variables.ts'
}
