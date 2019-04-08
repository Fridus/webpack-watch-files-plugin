
import glob from 'glob'
import compact from 'lodash/compact'
import uniq from 'lodash/uniq'
import { resolve as resolvePath } from 'path'

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
    // webpack 4 hooks
    (
      compiler.hooks
        ? compiler.hooks.afterCompile.tapAsync.bind(compiler.hooks.afterCompile, 'WebpackWatchPlugin')
        : compiler.plugin.bind(compiler, 'after-compile')
    )((compilation, callback) => {
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
        .map(file => resolvePath(file))

      if (this.verbose && !this.filesAlreadyAdded) {
        console.log('Additional files watched : ', JSON.stringify(files, null, 2))
      }

      if (Array.isArray(compilation.fileDependencies)) {
        files.map(file => compilation.fileDependencies.push(file))
      } else {
        files.map(file => compilation.fileDependencies.add(file))
      }

      this.filesAlreadyAdded = true
      callback()
    })
  }
}
