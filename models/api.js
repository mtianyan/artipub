const LinvoDB = require('linvodb3');
var Promise = require("bluebird");

const apiSchema = {
  url: String,
}

var Api = new LinvoDB('api', apiSchema)
Promise.promisifyAll(Api.find().__proto__);
module.exports = Api
