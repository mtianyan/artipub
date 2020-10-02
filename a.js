var LinvoDB = require("linvodb3");
var Promise = require("bluebird");
LinvoDB.defaults.store = { db: require('leveldown') };
LinvoDB.dbPath = '/Users/mtianyan/tyRepos/artipub/db'
const apiSchema = {
  url: String,
}

var Api = new LinvoDB('api', apiSchema)
Promise.promisifyAll(Api.find().__proto__);
Api.find().execAsync().then((docs) => {
  console.log(docs[0])
  apiEndpoint = docs[0].url
})
