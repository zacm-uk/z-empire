const { resolve } = require('path')

const { Node } = require('./Node')

let opts = {}

for (const arg of process.argv) {
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
