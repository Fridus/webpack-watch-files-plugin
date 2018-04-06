
import path from 'path'

export default {
  context: process.cwd(),
  entry: [ './test/main.js' ],
  output: { path: path.join(__dirname, 'output') }
}
