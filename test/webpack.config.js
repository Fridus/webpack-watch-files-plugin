
import path from 'path'

export default {
  context: process.cwd(),
  entry: [ './main.js' ],
  output: { path: path.join(__dirname, 'output') }
}
