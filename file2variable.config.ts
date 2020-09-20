import { Configuration } from 'file2variable-cli'

const config: Configuration = {
  base: 'static',
  files: [
    'src/generated/data.gql',
    'src/generated/ws-command.json'
  ],
  handler: (file) => {
    if (file.endsWith('.json')) {
      return { type: 'json' }
    }
    return { type: 'text' }
  },
  out: 'src/generated/variables.ts'
}

export default config
