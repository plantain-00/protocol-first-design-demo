module.exports = {
  base: 'static',
  files: [
    'static/*.template.html'
  ],
  /**
   * @argument {string} file
   */
  handler: file => {
    return {
      type: 'vue',
      name: 'App',
      path: './index'
    }
  },
  out: 'static/variables.ts'
}
