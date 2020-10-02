const LinvoDB = require('linvodb3');
var Promise = require("bluebird");
// const ObjectId = require('bson').ObjectId
const ObjectId = (id)=>{
  return id
}
const tokenSchema = {
  accessToken: String,
  platformName: String,
  expiresTs: Date,
  createTs: Date,
  updateTs: Date,
}

// const Token = mongoose.model('tokens', tokenSchema)
var Token = new LinvoDB('tokens', tokenSchema)
Promise.promisifyAll(Token.find().__proto__);
module.exports = Token
