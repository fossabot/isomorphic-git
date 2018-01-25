localStorage.debug = 'isomorphic-git'
const { models } = require('../dist/internal.umd.min.js')
const { GitPktLine } = models
const test = require('tape')

test('pkt-line encode string', t => {
  t.plan(2)
  let foo = GitPktLine.encode('hello world\n')
  t.ok(foo)
  t.ok(Buffer.compare(foo, Buffer.from('0010hello world\n')) === 0)
})

test('pkt-line encode empty', t => {
  t.plan(2)
  let foo = GitPktLine.encode('')
  t.ok(foo)
  t.ok(Buffer.compare(foo, Buffer.from('0004')) === 0)
})

test('pkt-line flush', t => {
  t.plan(2)
  let foo = GitPktLine.flush()
  t.ok(foo)
  t.ok(Buffer.compare(foo, Buffer.from('0000')) === 0)
})
