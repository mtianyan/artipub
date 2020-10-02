const LinvoDB = require('linvodb3');
var Promise = require("bluebird");
// const mongoose = require('mongoose')

const platformSchema = {
  name: String,
  label: String,
  editorType: String,
  description: String,
  url: String,
  enableImport: Boolean,
  enableLogin: Boolean,
  username: String,
  password: String,
  createTs: Date,
  updateTs: Date,
  loggedIn: Boolean,

  // 前端字段
  cookieStatus: String,
}

// const Platform = mongoose.model('platforms', platformSchema)
var Platform = new LinvoDB('platforms', platformSchema)
Promise.promisifyAll(Platform.find().__proto__);

module.exports = Platform
