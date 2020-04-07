const { resolve } = require('path')

const { Node } = require('./Node')

let opts = {}

const configArray = process.env.EMPIRE_CONFIG && process.env.EMPIRE_CONFIG.split(' ')

for (const arg of (configArray || process.argv)) {
  let [ key, value ] = arg.split('=')
  if (!key || !value) {
    continue
  }
  if (key === 'config') {
    opts = require(resolve(process.cwd(), value))
    continue
  }
  if (value === 'true' || value === 'false') {
    value = value === 'true'
  }
  if (key === 'nodeList') {
    value = value.split(',')
  }
  if (/^[0-9]*$/gm.test(value)) {
    value = Number(value)
  }
  opts[key] = value
}
const node = new Node(opts)

if (node.type === Node.TYPES.CLIENT) {
  module.exports = {
    node
  }
}
