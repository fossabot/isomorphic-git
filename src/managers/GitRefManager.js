// This is a convenience wrapper for reading and writing files in the 'refs' directory.
import path from 'path'
import { FileSystem } from '../models'

/** @ignore */
export class GitRefManager {
  /* ::
  updateRemoteRefs : ({
    gitdir: string,
    remote: string,
    refs: Map<string, string>,
    symrefs: Map<string, string>
  }) => Promise<void>
  */
  static async updateRemoteRefs ({
    fs: _fs,
    gitdir,
    remote,
    refs,
    symrefs,
    tags
  }) {
    const fs = new FileSystem(_fs)
    // Validate input
    for (let value of refs.values()) {
      if (!value.match(/[0-9a-f]{40}/)) {
        throw new Error(`Unexpected ref contents: '${value}'`)
      }
    }
    // Combine refs and symrefs giving symrefs priority
    let actualRefsToWrite = new Map()
    for (let [key, value] of refs) {
      actualRefsToWrite.set(key, value)
    }
    for (let [key, value] of symrefs) {
      let branch = value.replace(/^refs\/heads\//, '')
      actualRefsToWrite.set(key, `ref: refs/remotes/${remote}/${branch}`)
    }
    // Update files
    // TODO: For large repos with a history of thousands of pull requests
    // (i.e. gitlab-ce) it would be vastly more efficient to write them
    // to .git/packed-refs.
    // The trick is to make sure we a) don't write a packed ref that is
    // already shadowed by a loose ref and b) don't loose any refs already
    // in packed-refs. Doing this efficiently may be difficult. A
    // solution that might work is
    // a) load the current packed-refs file
    // b) add actualRefsToWrite, overriding the existing values if present
    // c) enumerate all the loose refs currently in .git/refs/remotes/${remote}
    // d) overwrite their value with the new value.
    // Examples of refs we need to avoid writing in loose format for efficieny's sake
    // are .git/refs/remotes/origin/refs/remotes/remote_mirror_3059
    // and .git/refs/remotes/origin/refs/merge-requests
    const normalizeValue = value => value.trim() + '\n'
    for (let [key, value] of actualRefsToWrite) {
      if (key.startsWith('refs/heads') || key === 'HEAD') {
        key = key.replace(/^refs\/heads\//, '')
        await fs.write(
          path.join(gitdir, 'refs', 'remotes', remote, key),
          normalizeValue(value),
          'utf8'
        )
      } else if (
        tags === true &&
        key.startsWith('refs/tags') &&
        !key.endsWith('^{}')
      ) {
        key = key.replace(/^refs\/tags\//, '')
        const filename = path.join(gitdir, 'refs', 'tags', key)
        // Git's behavior is to only fetch tags that do not conflict with tags already present.
        if (!await fs.exists(filename)) {
          await fs.write(filename, normalizeValue(value), 'utf8')
        }
      }
    }
  }
  static async resolve ({ fs: _fs, gitdir, ref, depth }) {
    const fs = new FileSystem(_fs)
    if (depth !== undefined) {
      depth--
      if (depth === -1) {
        return ref
      }
    }
    let sha
    // Is it a ref pointer?
    if (ref.startsWith('ref: ')) {
      ref = ref.slice('ref: '.length)
      return GitRefManager.resolve({ fs, gitdir, ref, depth })
    }
    // Is it a complete and valid SHA?
    if (ref.length === 40 && /[0-9a-f]{40}/.test(ref)) {
      return ref
    }
    // Is it a special ref?
    if (ref === 'HEAD' || ref === 'MERGE_HEAD') {
      sha = await fs.read(`${gitdir}/${ref}`, { encoding: 'utf8' })
      if (sha) {
        return GitRefManager.resolve({ fs, gitdir, ref: sha.trim(), depth })
      }
    }
    // Is it a full ref?
    if (ref.startsWith('refs/')) {
      sha = await fs.read(`${gitdir}/${ref}`, { encoding: 'utf8' })
      if (sha) {
        return GitRefManager.resolve({ fs, gitdir, ref: sha.trim(), depth })
      }
    }
    // Is it a (local) branch?
    sha = await fs.read(`${gitdir}/refs/heads/${ref}`, { encoding: 'utf8' })
    if (sha) {
      return GitRefManager.resolve({ fs, gitdir, ref: sha.trim(), depth })
    }
    // Is it a lightweight tag?
    sha = await fs.read(`${gitdir}/refs/tags/${ref}`, { encoding: 'utf8' })
    if (sha) {
      return GitRefManager.resolve({ fs, gitdir, ref: sha.trim(), depth })
    }
    // Is it remote branch?
    sha = await fs.read(`${gitdir}/refs/remotes/${ref}`, { encoding: 'utf8' })
    if (sha) {
      return GitRefManager.resolve({ fs, gitdir, ref: sha.trim(), depth })
    }
    // Is it a packed ref? (This must be last because refs in heads have priority)
    let text = await fs.read(`${gitdir}/packed-refs`, { encoding: 'utf8' })
    if (text && text.includes(ref)) {
      let candidates = text
        .trim()
        .split('\n')
        .filter(x => x.endsWith(ref))
        .filter(x => !x.startsWith('#'))
      if (candidates.length > 1) {
        throw new Error(`Could not resolve ambiguous reference ${ref}`)
      } else if (candidates.length === 1) {
        sha = candidates[0].split(' ')[0]
        return GitRefManager.resolve({ fs, gitdir, ref: sha.trim(), depth })
      }
    }
    // Do we give up?
    throw new Error(`Could not resolve reference ${ref}`)
  }
  static async packedRefs ({ fs: _fs, gitdir }) {
    const refs = new Map()
    const fs = new FileSystem(_fs)
    const text = await fs.read(`${gitdir}/packed-refs`, { encoding: 'utf8' })
    if (!text) return refs
    const lines = text
      .trim()
      .split('\n')
      .filter(line => !/^\s*#/.test(line))
    let key = null
    for (let line of lines) {
      const i = line.indexOf(' ')
      if (line.startsWith('^')) {
        // This is a oid for the commit associated with the annotated tag immediately preceding this line.
        // Trim off the '^'
        const value = line.slice(1, i)
        // The tagname^{} syntax is based on the output of `git show-ref --tags -d`
        refs.set(key + '^{}', value)
      } else {
        // This is an oid followed by the ref name
        const value = line.slice(0, i)
        key = line.slice(i + 1)
        refs.set(key, value)
      }
    }
    return refs
  }
  // List all the refs that match the `filepath` prefix
  static async listRefs ({ fs: _fs, gitdir, filepath }) {
    const fs = new FileSystem(_fs)
    let packedMap = GitRefManager.packedRefs({ fs, gitdir })
    let files = null
    try {
      files = await fs.readdirDeep(`${gitdir}/${filepath}`)
      files = files.map(x => x.replace(`${gitdir}/${filepath}/`, ''))
    } catch (err) {
      files = []
    }

    for (let key of (await packedMap).keys()) {
      // filter by prefix
      if (key.startsWith(filepath)) {
        // remove prefix
        key = key.replace(filepath + '/', '')
        // Don't include duplicates; the loose files have precedence anyway
        if (!files.includes(key)) {
          files.push(key)
        }
      }
    }
    return files
  }
  static async listBranches ({ fs: _fs, gitdir, remote }) {
    const fs = new FileSystem(_fs)
    if (remote) {
      return GitRefManager.listRefs({
        fs,
        gitdir,
        filepath: `refs/remotes/${remote}`
      })
    } else {
      return GitRefManager.listRefs({ fs, gitdir, filepath: `refs/heads` })
    }
  }
  static async listTags ({ fs: _fs, gitdir }) {
    const fs = new FileSystem(_fs)
    let tags = await GitRefManager.listRefs({
      fs,
      gitdir,
      filepath: `refs/tags`
    })
    tags = tags.filter(x => !x.endsWith('^{}'))
    return tags
  }
}
