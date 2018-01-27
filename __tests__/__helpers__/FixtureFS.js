const path = require('path')
const _fs = require('fs')
const pify = require('pify')
const BrowserFS = require('../../dist/browserfs.min.js')
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
  const fs = BrowserFS.BFSRequire('fs')
  return {
    fs,
    writable,
    readable
  }
}

const FixturePromise = FixtureFS()

async function makeFixture (dir) {
  return process.browser ? makeBrowserFixture(dir) : makeNodeFixture(dir)
}

async function makeBrowserFixture (dir) {
  const { fs, writable, readable } = await FixturePromise
  writable.empty()
  let gitdir = `${dir}.git`
  return { fs, dir, gitdir }
}

async function makeNodeFixture (fixture) {
  const {
    getFixturePath,
    createTempDir,
    copyFixtureIntoTempDir
  } = require('jest-fixtures')
  let testsDir = path.resolve(__dirname, '..')
  let dir = (await getFixturePath(testsDir, fixture))
    ? await copyFixtureIntoTempDir(testsDir, fixture)
    : await createTempDir()
  let gitdir = (await getFixturePath(testsDir, `${fixture}.git`))
    ? await copyFixtureIntoTempDir(testsDir, `${fixture}.git`)
    : await createTempDir()
  return { fs: _fs, dir, gitdir }
}

module.exports.FixtureFS = FixturePromise
module.exports.makeFixture = makeFixture
