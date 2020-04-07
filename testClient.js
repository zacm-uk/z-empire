process.env.EMPIRE_CONFIG = 'type=CLIENT storageDriver=memory nodeList=https://empire.zacm.uk hidden=true'

const { node } = require('./src/main')

node.getData('ff482d2b5fa312af83aae61c6a813700df3910fe')
  .then(console.log)
