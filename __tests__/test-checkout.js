/* globals describe test expect */
import fs from 'fs'
import { createTempDir, copyFixtureIntoTempDir } from 'jest-fixtures'
import pify from 'pify'
import { checkout, listFiles } from '..'

/** @test {checkout} */
describe('checkout', () => {
  test('checkout', async () => {
    let dir = await createTempDir()
    let gitdir = await copyFixtureIntoTempDir(__dirname, 'test-checkout.git')
    let repo = { fs, dir, gitdir }
    await checkout({ ...repo, ref: 'test-branch' })
    let files = await pify(fs.readdir)(dir)
    expect(files.sort()).toMatchSnapshot()
    let index = await listFiles(repo)
    expect(index).toMatchSnapshot()
  })
})
