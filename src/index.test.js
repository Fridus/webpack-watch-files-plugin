/* global describe, it */

import { expect } from 'chai'
import webpack from 'webpack'
import WatchExternalFilesPlugin from './index'
import webpackConfig from '../test/webpack.config'
import path from 'path'

process.traceDeprecation = true

describe('Webpack watch file', () => {
  it('Should has files in fileDependencies', (done) => {
    const plugin = new WatchExternalFilesPlugin({
      files: [
        './test/*.include.js',
        '!./test/*.exclude.js'
      ]
    })

    const compiler = webpack(webpackConfig)
    plugin.apply(compiler)
    compiler.run(function (err, stats) {
      if (err) {
        throw err
      }

      let files = []
      if (Array.isArray(stats.compilation.fileDependencies)) {
        files = stats.compilation.fileDependencies
      } else {
        stats.compilation.fileDependencies.forEach((value) => files.push(value))
      }

      expect(files)
        .to.be.an('array')
        .that.includes(path.join(process.cwd(), './test/file.include.js'))
        .that.not.includes(path.join(process.cwd(), './test/file.exclude.js'))
      done()
    })
  })
})
