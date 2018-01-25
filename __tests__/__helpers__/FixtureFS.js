const path = require('path')
const _fs = require('fs')
const pify = require('pify')
const BrowserFS = require('browserfs')
const index = require('../__fixtures__/index.json')

const HTTPRequestFS = pify(BrowserFS.FileSystem.HTTPRequest.Create)
const InMemoryFS = pify(BrowserFS.FileSystem.InMemory.Create)
const OverlayFS = pify(BrowserFS.FileSystem.OverlayFS.Create)

const FixtureFS = async function () {
  let readable = process.browser
    ? await HTTPRequestFS({
      index,
      baseUrl: 'http://localhost:9876/base/__tests__/__fixtures__/'
    })
    : _fs
  let writable = await InMemoryFS()
  let ofs = await OverlayFS({ readable, writable })
  BrowserFS.initialize(ofs)
  return BrowserFS.BFSRequire('fs')
}

const FixturePromise = FixtureFS()
module.exports.FixtureFS = FixturePromise
