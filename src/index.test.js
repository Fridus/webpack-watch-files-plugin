/* global describe, it */

import { expect, assert } from 'chai'
import webpack from 'webpack'
import WatchExternalFilesPlugin from './index'
import webpackConfig from '../test/webpack.config'
import path from 'path'
import fs from 'fs'
import compareVersions from 'compare-versions'

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

  it('Should trig a compilation', (done) => {
    fs.writeFileSync(path.join(__dirname, '../test/output/a.txt'), 'hello')
    const plugin = new WatchExternalFilesPlugin({
      files: [
        './test/**/*.txt'
      ]
    })

    const compiler = webpack(webpackConfig)
    const compile = (compiler.hooks
      ? compiler.hooks.compile.tap.bind(compiler.hooks.compile, 'WatchExternalFilesPlugin')
      : compiler.plugin.bind(compiler, 'compile')
    )

    let compileCount = 0

    compile((params) => {
      compileCount++
    })

    plugin.apply(compiler)

    const watcher = compiler.watch({
      aggregateTimeout: 500,
      poll: 200
    }, (err, stats) => {
      if (err) {
        throw err
      }
    })

    if (!webpack.version || compareVersions(webpack.version, '5') < 0) {
      expect(compileCount).to.be.equal(1)
    }

    fs.writeFileSync(path.join(__dirname, '../test/output/a.txt'), 'hello world')

    setTimeout(() => {
      watcher.close(() => {
        assert(compileCount >= 2, 'No compilation catched')
        done()
      })
    }, 2500)
  })
})
