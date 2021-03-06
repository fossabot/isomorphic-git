/* global test describe expect */
const { makeFixture } = require('./__helpers__/FixtureFS.js')
const { assertSnapshot } = require('./__helpers__/assertSnapshot')
const snapshots = require('./__snapshots__/test-readObject.js.snap')

const { readObject } = require('..')

describe('readObject', () => {
  it('test missing', async () => {
    // Setup
    let { fs, gitdir } = await makeFixture('test-readObject')
    // Test
    try {
      var ref = await readObject({
        fs,
        gitdir,
        oid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      })
    } catch (err) {
      var ref = err
    }
    assertSnapshot(ref, snapshots, `readObject test missing 1`)
  })
  it('test shallow', async () => {
    // Setup
    let { fs, gitdir } = await makeFixture('test-readObject')
    // Test
    try {
      var ref = await readObject({
        fs,
        gitdir,
        oid: 'b8b1fcecbc6f5ea8bc915c3ac319e8c9eb204f95'
      })
    } catch (err) {
      var ref = err
    }
    assertSnapshot(ref, snapshots, `readObject test shallow 1`)
  })
  it('parsed', async () => {
    // Setup
    let { fs, gitdir } = await makeFixture('test-readObject')
    // Test
    let ref = await readObject({
      fs,
      gitdir,
      oid: 'e10ebb90d03eaacca84de1af0a59b444232da99e'
    })
    assertSnapshot(ref, snapshots, `readObject parsed 1`)
    expect(ref.format).toEqual('parsed')
    expect(ref.type).toEqual('commit')
  })
  it('content', async () => {
    // Setup
    let { fs, gitdir } = await makeFixture('test-readObject')
    // Test
    let ref = await readObject({
      fs,
      gitdir,
      oid: 'e10ebb90d03eaacca84de1af0a59b444232da99e',
      format: 'content'
    })
    assertSnapshot(ref, snapshots, `readObject content 1`)
    expect(ref.format).toEqual('content')
    expect(ref.type).toEqual('commit')
  })
  it('wrapped', async () => {
    // Setup
    let { fs, gitdir } = await makeFixture('test-readObject')
    // Test
    let ref = await readObject({
      fs,
      gitdir,
      oid: 'e10ebb90d03eaacca84de1af0a59b444232da99e',
      format: 'wrapped'
    })
    assertSnapshot(ref, snapshots, `readObject wrapped 1`)
    expect(ref.format).toEqual('wrapped')
    expect(ref.type).toEqual(undefined)
  })
  it('deflated', async () => {
    // Setup
    let { fs, gitdir } = await makeFixture('test-readObject')
    // Test
    let ref = await readObject({
      fs,
      gitdir,
      oid: 'e10ebb90d03eaacca84de1af0a59b444232da99e',
      format: 'deflated'
    })
    assertSnapshot(ref, snapshots, `readObject deflated 1`)
    expect(ref.format).toEqual('deflated')
    expect(ref.type).toEqual(undefined)
  })
  it('from packfile', async () => {
    // Setup
    let { fs, gitdir } = await makeFixture('test-readObject')
    // Test
    let ref = await readObject({
      fs,
      gitdir,
      oid: '0b8faa11b353db846b40eb064dfb299816542a46',
      format: 'deflated'
    })
    assertSnapshot(ref, snapshots, `readObject from packfile 1`)
    expect(ref.format).toEqual('content')
    expect(ref.type).toEqual('commit')
  })
})
