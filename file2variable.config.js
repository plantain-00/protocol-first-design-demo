module.exports = {
  base: 'static',
  files: [
    'src/data.gql'
  ],
  /**
   * @argument {string} file
   */
  handler: file => {
    return { type: 'text' }
  },
  out: 'src/variables.ts'
}
