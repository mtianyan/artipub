// const mongoose = require('mongoose')
const LinvoDB = require('linvodb3');
var Promise = require('bluebird');

const environmentSchema = {
  _id: String,  // key
  label: String,  // label
  value: String,  // value
  updateTs: Date,
  createTs: Date,
};

var Environment = new LinvoDB('environments', environmentSchema);
Promise.promisifyAll(Environment.find().__proto__);
module.exports = Environment;
