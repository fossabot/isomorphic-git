localStorage.debug = 'isomorphic-git'
const { init, add, commit } = require('..')
const test = require('tape')
const { FixtureFS } = require('./__helpers__/FixtureFS.js')

test('things do not explode', async t => {
  try {
    t.plan(5)
    const fs = await FixtureFS
    t.ok(fs, 'Loaded fs')

    await init({ fs: fs, dir: '.' })
    t.pass('init')

    fs.writeFileSync('a.txt', 'Hello', 'utf8')
    await add({ fs: fs, dir: '.', filepath: 'a.txt' })
    t.pass('add a.txt')

    let oid = await commit({
      fs: fs,
      dir: '.',
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920
      },
      message: 'Initial commit'
    })
    t.pass('commit')

    t.equal(
      oid,
      '066daf8b7c79dca893d91ce0577dfab5ace80dbc',
      "- oid is '066daf8b7c79dca893d91ce0577dfab5ace80dbc'"
    )
  } catch (err) {
    t.fail(err)
  }
})
