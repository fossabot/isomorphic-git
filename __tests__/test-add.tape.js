const test = require('tape')
const { init, add, listFiles } = require('..')
const { FixtureFS } = require('./__helpers__/FixtureFS.js')

test('add file', async t => {
  try {
    t.plan(4)
    // Setup
    let fs = await FixtureFS
    window.fs = fs
    console.log(fs)
    let dir = 'test-add'
    // Test
    await init({ fs, dir })
    let orig = (await listFiles({ fs, dir })).length
    await add({ fs, dir, filepath: 'a.txt' })
    t.equals((await listFiles({ fs, dir })).length, 1)
    await add({ fs, dir, filepath: 'a.txt' })
    t.equals((await listFiles({ fs, dir })).length, 1)
    await add({ fs, dir, filepath: 'a-copy.txt' })
    t.equals((await listFiles({ fs, dir })).length, 2)
    await add({ fs, dir, filepath: 'b.txt' })
    t.equals((await listFiles({ fs, dir })).length, 3)
  } catch (err) {
    t.fail(err)
  }
})
