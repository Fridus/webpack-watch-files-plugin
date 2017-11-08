
import glob from 'glob'
import compact from 'lodash/compact'
import uniq from 'lodash/uniq'

export default class WebpackWatchPlugin {
  constructor ({
    files = [],
    verbose,
    ...globOptions
  } = {}) {
    this.files = files
    this.verbose = !!verbose
    this.globOptions = {
      absolute: true,
      ...globOptions
    }

    this.filesAlreadyAdded = false
  }

  apply (compiler) {
    compiler.plugin('after-compile', (compilation, callback) => {
      const filesFound = []
      const filesFoundToEclude = []
      this.files.map(pattern => {
        if (pattern.substr(0, 1) !== '!') {
          glob.sync(pattern, this.globOptions)
            .map(file => filesFound.push(file))
        } else {
          glob.sync(pattern.substr(1), this.globOptions)
            .map(file => filesFoundToEclude.push(file))
        }
      })

      const files = uniq(compact(
        filesFound.map(file => {
          if (~filesFoundToEclude.indexOf(file)) {
            return
          }
          return file
        })
      ))

      if (this.verbose && !this.filesAlreadyAdded) {
        console.log('Additional files watched : ', JSON.stringify(files, null, 2))
      }

      files.map(file => compilation.fileDependencies.push(file))

      this.filesAlreadyAdded = true
      callback()
    })
  }
}
