localStorage.debug = 'isomorphic-git'
const { clone } = require('..')
const test = require('tape')
const { FixtureFS } = require('./__helpers__/FixtureFS.js')

test('clone', async t => {
  try {
    t.plan(6)
    let fs = await FixtureFS
    t.ok(fs, 'Loaded fs')
    let dir = 'isomorphic-git'
    await clone({
      fs: fs,
      dir,
      depth: 1,
      branch: 'master',
      url:
        'https://cors-buster-jfpactjnem.now.sh/github.com/isomorphic-git/isomorphic-git'
    })
    t.pass('clone')
    t.ok(fs.existsSync(`${dir}`))
    t.ok(fs.existsSync(`${dir}/.git/objects`))
    t.ok(fs.existsSync(`${dir}/.git/refs/remotes/origin/master`))
    t.ok(fs.existsSync(`${dir}/package.json`))
  } catch (err) {
    t.fail(err)
  }
})
