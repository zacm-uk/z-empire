import { resolve } from 'path'

import { NodeOpts, Node } from './Node'

let opts: any = {}

const configArray = process.env.EMPIRE_CONFIG && process.env.EMPIRE_CONFIG.split(' ')

for (const arg of (configArray || process.argv)) {
  let [ key, value ] = arg.split('=') as any[]
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
export const node = new Node(opts as NodeOpts)
