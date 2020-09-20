import { Configuration } from 'file2variable-cli'

const config: Configuration = {
  base: 'static',
  files: [
    'src/generated/data.gql',
    'src/generated/ws-command.json',
    'src/generated/ws.proto'
  ],
  handler: (file) => {
    if (file.endsWith('.json')) {
      return { type: 'json' }
    }
    if (file.endsWith('.proto')) {
      return { type: 'protobuf' }
    }
    return { type: 'text' }
  },
  out: 'src/generated/variables.ts'
}

export default config
