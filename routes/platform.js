// const ObjectId = require('bson').ObjectId
const ObjectId = (id)=>{
  return id
}
const constants = require('../constants')
const models = require('../models')
const axios = require('axios');

const getCookieStatus = async (platform) => {
  const cookies = await models.Cookie.find({ domain: { $regex: platform.name } }).execAsync();
  // console.log("cookies", cookies)
  if (!cookies || !cookies.length) return constants.cookieStatus.NO_COOKIE
  return constants.cookieStatus.EXISTS
}

const getOnePlatformCookies = async (platformName)=> {
  let cookies = await models.Cookie.find({ domain: { $regex: platformName } }).execAsync();
  if(platformName == constants.platform.TOUTIAO){
    cookies = await models.Cookie.find({ domain: {$in: ['.toutiao.com', 'www.toutiao.com', '.www.toutiao.com']}}).execAsync();
  }
  let cookieStr = '';
  for (let i = 0; i < cookies.length; i++) {
    const c = cookies[i];
    cookieStr += `${c.name}=${c.value}; `;
  }
  return cookieStr;
}
module.exports = {
  getPlatformList: async (req, res) => {
    const platforms = await models.Platform.find().execAsync();
    for (let i = 0; i < platforms.length; i++) {
      let cookieStatus = await getCookieStatus(platforms[i])
      console.log(cookieStatus)
      platforms[i].cookieStatus = cookieStatus
      platforms[i].cookieStr = await getOnePlatformCookies(platforms.name)
    }
    await res.json({
      status: 'ok',
      data: platforms
    })
  },
  getPlatform: async (req, res) => {
    const platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) }).execAsync();
    platform.cookieStatus = await getCookieStatus(d)
    await res.json({
      status: 'ok',
      data: platform
    })
  },
  addPlatform: async (req, res) => {
    let Platform = new models.Platform({
      name: req.body.name,
      label: req.body.label,
      editorType: req.body.editorType,
      description: req.body.description,
      enableImport: req.body.enableImport,
      enableLogin: req.body.enableLogin,
      username: req.body.username,
      password: req.body.password,
      createTs: new Date(),
      updateTs: new Date()
    })
    Platform = await Platform.save()
    await res.json({
      status: 'ok',
      data: Platform
    })
  },
  editPlatform: async (req, res) => {
    let platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) }).execAsync();
    if (!platform) {
      return await res.json({
        status: 'ok',
        error: 'not found'
      }, 404)
    }
    platform.name = req.body.name
    platform.label = req.body.label
    platform.editorType = req.body.editorType
    platform.description = req.body.description
    platform.enableImport = req.body.enableImport
    platform.enableLogin = req.body.enableLogin
    platform.username = req.body.username
    platform.password = req.body.password
    platform.updateTs = new Date()
    platform.save()
    await res.json({
      status: 'ok',
      data: platform
    })
  },
  deletePlatform: async (req, res) => {
    let platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) }).execAsync();
    if (!platform) {
      return await res.json({
        status: 'ok',
        error: 'not found'
      }, 404)
    }
    await models.Platform.remove({ _id: ObjectId(req.params.id) }).execAsync();
    await res.json({
      status: 'ok',
      data: platform
    })
  },
  getPlatformArticles: async (req, res) => {
    // 获取平台
    const platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) }).execAsync();

    // 如果平台不存在，返回404错误
    if (!platform) {
      return await res.json({
        status: 'ok',
        error: 'not found'
      }, 404)
    }

    // 获取导入爬虫类
    const ImportSpider = require('../spiders/import/' + platform.name)

    // 导入爬虫实例
    const spider = new ImportSpider(platform.name)

    // 获取网站文章列表
    const siteArticles = await spider.fetch()

    // 遍历网站文章列表
    for (let i = 0; i < siteArticles.length; i++) {
      // 当前网站文章
      const siteArticle = siteArticles[i]

      // 根据title查找数据库中文章
      const article = await models.Article.findOne({ title: siteArticle.title }).execAsync();

      // 网站文章是否存在
      siteArticles[i].exists = !!article

      // 尝试查找网站文章关联的任务
      let task
      if (article) {
        siteArticles[i].articleId = article._id
        task = await models.Task.findOne({ platformId: platform._id, articleId: article._id }).execAsync();
      }

      // 网站文章是否已关联
      siteArticles[i].associated = !!(task && task.url && task.url === siteArticle.url)
    }

    // 返回结果
    await res.json({
      status: 'ok',
      data: siteArticles
    })
  },
  importPlatformArticles: async (req, res) => {
    // 获取平台
    const platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) }).execAsync();

    // 如果平台不存在，返回404错误
    if (!platform) {
      return await res.json({
        status: 'ok',
        error: 'not found'
      }, 404)
    }

    // 获取导入爬虫类
    const ImportSpider = require('../spiders/import/' + platform.name)

    // 导入爬虫实例
    const spider = new ImportSpider(platform.name)

    // 获取网站文章列表
    const siteArticles = req.body

    // 开始导入
    await spider.import(siteArticles)

    // 返回结果
    await res.json({
      status: 'ok'
    })
  },
  checkPlatformCookieStatus: async (req, res) => {
    const platforms = await models.Platform.find().execAsync();
    let allRequest = []
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i]
      const Spider = require(`../spiders/${platform.name}`)
      const spider = new Spider(null, platform._id.toString())
      allRequest.push(spider.checkCookieStatus())
    }
    const promisesResolved = allRequest.map(promise => promise.catch(error => ({ error })))
    function checkFailed (then) {
      return function (responses) {
        const someFailed = responses.some(response => response.error)

        if (someFailed) {
          throw responses
        }

        return then(responses)
      }
    }
    axios.all(promisesResolved).then(checkFailed(async resList => {
      for (let i = 0; i < resList.length; i++) {
        let platform = platforms[i]
        // console.log(platform.url)
        // console.log(platform.name)
        if(platform.name === constants.platform.TOUTIAO){
          console.log(resList[i].data)
        }
        let text = resList[i].data;
        if (platform.name === constants.platform.TOUTIAO) {
          platform.loggedIn = text.includes('/pgc-image/');
        } else if (platform.name === constants.platform.CSDN) {
          text = text.message;
          platform.loggedIn = text.includes('成功');
        } else if (platform.name === constants.platform.JIANSHU) {
          platform.loggedIn = text.includes('current_user');
          let re = /"slug":"(.*?)"/;
          let slug = text.match(re)[1];
          console.log(slug)
          platform.slug = slug;
        } else if (platform.name === constants.platform.CNBLOGS) {
          platform.loggedIn = text.hasOwnProperty('spaceUserId');
        } else if (platform.name === constants.platform.SEGMENTFAULT) {
          platform.loggedIn = text.includes('user_id');
        } else if (platform.name === constants.platform.OSCHINA) {
          console.log(text)
          let re = /<val data-name="g_user_id" data-value="(\S*)"/;
          let userCode = text.match(re)[1];
          platform.userCode = userCode;
          platform.loggedIn = text.includes('开源豆');
        } else if (platform.name === constants.platform.V2EX) {
          platform.loggedIn = text.includes('登出');
        } else if (platform.name === constants.platform.ZHIHU) {
          platform.loggedIn = text.hasOwnProperty('name');
        } else {
          platform.loggedIn = !text.includes('登录');
        }
        console.log(platform.loggedIn);
        platform.save();
      }
      await res.json({
        status: 'ok'
      })
    })).catch(async errList =>{
      for (let i = 0; i < errList.length; i++) {
        if(errList[i].hasOwnProperty("error")){
          let curErrPlatUrl = errList[i].error.config.url
          let platform = await models.Platform.findOne({ url: curErrPlatUrl }).execAsync();
          if(!platform){
            if (curErrPlatUrl.includes(constants.platform.CSDN)) {
              platform = await models.Platform.findOne({ name: constants.platform.CSDN }).execAsync();
            } else if (curErrPlatUrl.includes(constants.platform.CNBLOGS)) {
              platform = await models.Platform.findOne({ name: constants.platform.CNBLOGS }).execAsync();
            } else if (curErrPlatUrl.includes(constants.platform.ZHIHU)) {
              platform = await models.Platform.findOne({ name: constants.platform.ZHIHU }).execAsync();
            }
          }
          console.log(platform.name, "err in check");
          platform.loggedIn = false
          platform.save();
        }
      }

    })
  }
}
