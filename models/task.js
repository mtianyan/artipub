const LinvoDB = require('linvodb3');
var Promise = require("bluebird");
const ObjectId = (id)=>{
  return id
}
// const ObjectId = require('bson').ObjectId

const taskSchema = {
  articleId: ObjectId,
  platformId: ObjectId,
  status: String,
  url: String,
  createTs: Date,
  updateTs: Date,
  error: String,
  checked: Boolean,
  ready: Boolean,
  authType: String,
  readNum: Number,
  likeNum: Number,
  commentNum: Number,

  // 配置信息
  category: String, // 类别: juejin
  tag: String, // 标签: juejin (单选), segmentfault (逗号分割)
  pubType: String, // 发布形式: csdn (单选)
  title: String, // 标题

  // 前端数据（不用设置）
  platform: Object,
}

// const Task = mongoose.model('tasks', taskSchema)
var Task = new LinvoDB('tasks', taskSchema)
Promise.promisifyAll(Task.find().__proto__);
module.exports = Task
