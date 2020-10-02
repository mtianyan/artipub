const LinvoDB = require('linvodb3');
var Promise = require("bluebird");
// const mongoose = require('mongoose')

// const articleSchema = new mongoose.Schema({
const articleSchema = {
    title: String,
    content: String,
    contentHtml: String,
    platformIds: Array,
    createTs: Date,
    updateTs: Date,
    readNum: Number,
    likeNum: Number,
    commentNum: Number,
}

// const Article = mongoose.model('articles', articleSchema)
var Article = new LinvoDB('articles', articleSchema)
Promise.promisifyAll(Article.find().__proto__);
module.exports = Article
