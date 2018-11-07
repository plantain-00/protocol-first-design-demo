module.exports = {
  base: 'static',
  files: [
    'static/*.template.html',
    'static/gql/*.gql'
  ],
  /**
   * @argument {string} file
   */
  handler: file => {
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
