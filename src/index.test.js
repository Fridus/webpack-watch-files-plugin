/* global describe, it */

import { expect } from 'chai'
import webpack from 'webpack'
import WatchExternalFilesPlugin from './index'
import webpackConfig from '../test/webpack.config'
import path from 'path'

describe('Webpack watch file', () => {
  it('Should say ok', (done) => {
    const plugin = new WatchExternalFilesPlugin({
      files: [
        './test/*.include.js',
        '!./test/*.exclude.js'
      ]
    })

    const compiler = webpack(webpackConfig)
    compiler.apply(plugin)
    compiler.run(function (err, stats) {
      if (err) {
        throw err
      }

      const files = stats.compilation.fileDependencies
      expect(files)
        .to.be.an('array')
        .that.includes(path.join(process.cwd(), './test/file.include.js'))
        .that.not.includes(path.join(process.cwd(), './test/file.exclude.js'))
      done()
    })
  })
})
