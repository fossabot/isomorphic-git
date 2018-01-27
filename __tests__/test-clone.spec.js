/* globals describe it expect */
localStorage.debug = 'isomorphic-git'
const { FixtureFS } = require('./__helpers__/FixtureFS.js')

const { clone } = require('..')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000

describe('clone', () => {
  if (process.env.CI) {
    it('clone', async () => {
      let fs = await FixtureFS
      let dir = 'isomorphic-git'
      await clone({
        fs: fs,
        dir,
        depth: 1,
        branch: 'master',
        url:
          'https://cors-buster-jfpactjnem.now.sh/github.com/isomorphic-git/isomorphic-git'
      })
      console.log('clone')
      expect(fs.existsSync(`${dir}`)).toBe(true)
      expect(fs.existsSync(`${dir}/.git/objects`)).toBe(true)
      expect(fs.existsSync(`${dir}/.git/refs/remotes/origin/master`)).toBe(true)
      expect(fs.existsSync(`${dir}/package.json`)).toBe(true)
    })
  } else {
    it('clone (skipped)', () => expect(true).toBe(true))
  }
})
