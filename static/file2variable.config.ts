import { Configuration } from 'file2variable-cli'

const config: Configuration = {
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
      type: 'vue3'
    }
  },
  out: 'static/variables.ts'
}

export default config
