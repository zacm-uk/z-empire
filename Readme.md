# Z Empire
## What is it?
Z Empire is a decentralised data storage and replication system.

## Why is it called Z-Empire?
As I'm very bad at naming things, almost all of my projects start with Z. This is because my name is Zac.

I've called it an empire because in dreamland, this would end up being installed on thousands networks around the world, it may even take over the world. I seriously doubt this will happen, but I'm allowed to be wishful :)

## Why would I use it?
This project was inspired by a blog post I read about Cloudflare's data centers.

One use case I can see for this is to create a web of node's across multiple networks, possibly in different countries. This would ensure two things:

1) If one network goes down, the same data is accessible from all of the other nodes
2) Data can be retrieved from the location closest to the client, ensuring faster access times

## How does it work?
- Every instance of Z-Empire is a node, each node can be configured differently as detailed below.

- When a node starts, it can be configured to replicate all data from the nodes it knows about, or it can be configured to retrieve what it needs when it needs it.

- When data is modified, the node tells every node it knows about to update that data, ensuring redundancy.

- Data is stored as key/value pairs, however the key is hashed with a random salt to ensure that only people who know the hash can access the data. This also avoids someone accidentally overwriting data.

## Important security note
Z-Empire does not encrypt your data. To ensure correct data security, please encrypt data before storing it in a node, and avoid storing encryption information with the data.

Z-Empire allows nodes to use HTTP and the server created by a node is an HTTP server. This is designed to allow easy development and testing, however if using this in production PLEASE use a reverse proxy such as NGINX and disable HTTP.

If you do not want to create a reverse proxy, use a service such as Azure that allows forcing HTTPS.

## How do I configure it?
Configuration can be done using either a JSON file, an environment variable, or command line arguments.

All fields can be configured using each of these methods.

### Examples
A JSON config file looks like the following and must be specified in the command line args with ```config=config.json```:

```json
{
  "type": "STORAGE",
  "storageDriver": "memory",
  "port": 3001,
  "nodeList": [
    "https://empire.zacm.uk"
  ],
  "publicAddress": "http://blah.blah.blah.blah",
  "hidden": true
}
```

The same configuration via CLI args or environment variable look like the following:
```type=STORAGE storageDriver=memory port=3001 nodeList=https://empire.zacm.uk publicAddress=http://blah.blah.blah.blah hidden=true```

If using an environment variable, the following variable must contain the config string: ```EMPIRE_CONFIG```

### Config fields
The following fields can be specified in configuration:

#### type
```type``` is a string that can have the following values:

- ```STORAGE```
- ```CLIENT```

A storage node has a simple purpose: to store data. On startup it replicates data from it's known nodes, and starts a server to allow other nodes to push and pull data.

A client node is the same as a storage noe however it only pulls data from known nodes when that data is requested, and it does not start a server.

#### storageDriver
```storageDriver``` defines how the data will be stored, the following options are available:

- ```memory``` - data is stored in a JavaScript array, this method is most likely fastest however may require a large amount of memory
- ```sql``` - data is stored in an SQL database (specified through environment variables)

The following environment variables must be used to configure SQL storage:

- ```STORAGE_DIALECT``` - any dialect supported by [sequelize](https://sequelize.org/master/manual/getting-started.html)
- ```STORAGE_USERNAME``` - username to connect to the specified database
- ```STORAGE_PASSWORD``` - password to connect to the specified database
- ```STORAGE_DB``` - database to connect to
- ```STORAGE_HOST``` - the database hostname
- ```STORAGE_PORT``` - the database port, if not defined will default to the dialect default
- ```STORAGE_SSL``` - true/false, any value other than false will be treated as true

If dialect is ```sqlite```, all other values will be ignored and the following evaluation will be used to determine the database location:
```javascript
path.join(os.homedir(), '.z-empire.db')
```

#### port
```port``` is the port number is listen on, if this is not defined, the ```PORT``` environment variable will be used.

This only applies to storage nodes as client nodes do not start a server.

#### nodeList
```nodeList``` is a list of URLs for existing nodes.

In JSON, this is an array of strings.

In a config string, it is a comma delimited list of strings.

#### publicAddress
```publicAddress``` is a string containing the URL that can be used to access the node. This will be sent to other nodes if ```hidden``` is not false and will be used for other nodes to communicate with this one.

This only applies to storage nodes as client nodes do not start a server.

#### hidden
```hidden``` is a true/false value that decides if this node will broadcast itself to other nodes.

## Usage
### Storage node
To start a storage node you can do the following to start the node:

```bash
node src/main.js config=config.json
node src/main.js type=STORAGE storageDriver=memory port=3001 nodeList=https://empire.zacm.uk publicAddress=http://blah.blah.blah.blah hidden=true
EMPIRE_CONFIG="type=STORAGE storageDriver=memory port=3001 nodeList=https://empire.zacm.uk publicAddress=http://blah.blah.blah.blah hidden=true" node src/main.js

npm start -- config=config.json
npm start -- type=STORAGE storageDriver=memory port=3001 nodeList=https://empire.zacm.uk publicAddress=http://blah.blah.blah.blah hidden=true
EMPIRE_CONFIG="type=STORAGE storageDriver=memory port=3001 nodeList=https://empire.zacm.uk publicAddress=http://blah.blah.blah.blah hidden=true" npm start
```

### Client node
While it is possible to start a client node in the same way as a storage node, it will not be usable because a client node does not start a server.

A client node is intended to be used inside a JavaScript project.

For an example, see [z-web](https://github.com/zacm-uk/z-web) which uses Z-Empire to publish and browse websites without a physical server.

```javascript
process.env.EMPIRE_CONFIG = 'type=CLIENT storageDriver=memory nodeList=https://empire.zacm.uk hidden=true'

// Starts the node using the env for config
const { node } = require('@zacm-uk/z-empire')

const { storageKey } = await node.setData(key, value)
// Store storageKey somewhere

const { value } = await node.getDate(storageKey)

await node.updateData(storageKey, newValue)

await node.removeData(storageKey)
```
