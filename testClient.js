process.env.EMPIRE_CONFIG = 'type=CLIENT storageDriver=sql nodeList=https://empire.zacm.uk hidden=true'
process.env.STORAGE_DIALECT = 'sqlite'

const { node } = require('./src/main')

node.getData('2aac04113115b61bcffefd31aa1aaefa3015d1d3')
  .then(console.log)

// node.setData('test', '12345')
//   .then(console.log)
