module.exports = {
  base: 'static',
  files: [
    'src/generated/data.gql'
  ],
  /**
   * @argument {string} file
   */
  handler: () => {
    return { type: 'text' }
  },
  out: 'src/generated/variables.ts'
}
