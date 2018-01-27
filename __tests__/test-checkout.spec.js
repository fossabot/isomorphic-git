/* globals describe it expect */
const { expectjs, registerSnapshots } = require('jasmine-snapshot')
const { FixtureFS } = require('./__helpers__/FixtureFS.js')
registerSnapshots(require('./test-checkout.snap'), 'checkout')

const pify = require('pify')
const { checkout, listFiles } = require('..')

describe('checkout', () => {
  it('checkout', async () => {
    // Setup
    const fs = await FixtureFS
    const dir = 'test-checkout'
    const gitdir = 'test-checkout.git'
    await fs.mkdir(dir)
    await checkout({ fs, dir, gitdir, ref: 'test-branch' })
    let files = await pify(fs.readdir)(dir)
    expectjs(files.sort()).toMatchSnapshot()
    let index = await listFiles({ fs, dir, gitdir })
    expectjs(index).toMatchSnapshot()
  })
})
