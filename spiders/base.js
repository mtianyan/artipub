const PCR = require('puppeteer-chromium-resolver');
// const ObjectId = require('bson').ObjectId;
const ObjectId = (id)=>{
  return id
}
const models = require('../models');
const constants = require('../constants');
const config = require('./config');
const globalConfig = require('../config');
const logger = require('../logger');
const axios = require('axios');

class BaseSpider {
  constructor(taskId, platformId) {
    // 任务ID
    this.taskId = taskId;

    // 平台ID
    this.platformId = platformId;
  }

  async init() {
    // 任务
    this.task = await models.Task.findOne({ _id: ObjectId(this.taskId) }).execAsync();
    if (!this.task) {
      throw new Error(`task (ID: ${this.taskId}) cannot be found`);
    }

    // 文章
    this.article = await models.Article.findOne({ _id: this.task.articleId }).execAsync();;
    if (!this.article) {
      throw new Error(`article (ID: ${this.task.articleId.toString()}) cannot be found`);
    }

    // 平台
    this.platform = await models.Platform.findOne({ _id: this.task.platformId }).execAsync();;
    if (!this.platform) {
      throw new Error(`platform (ID: ${this.task.platformId.toString()}) cannot be found`);
    }

    // PCR
    this.pcr = await PCR({
      revision: '',
      detectionPath: '',
      folderName: '.chromium-browser-snapshots',
      hosts: ['https://storage.googleapis.com', 'https://npm.taobao.org/mirrors'],
      retry: 3,
      silent: false,
    });

    // 是否开启chrome浏览器调试
    const enableChromeDebugEnv = await models.Environment.findOne({ _id: constants.environment.ENABLE_CHROME_DEBUG });
    const enableChromeDebug = enableChromeDebugEnv.value;

    // 浏览器
    this.browser = await this.pcr.puppeteer.launch({
      executablePath: this.pcr.executablePath,
      //设置超时时间
      timeout: 120000,
      //如果是访问https页面 此属性会忽略https错误
      ignoreHTTPSErrors: true,
      // 打开开发者工具, 当此值为true时, headless总为false
      devtools: false,
      // 关闭headless模式, 不会打开浏览器
      headless: enableChromeDebug !== 'Y',
      args: [
        '--no-sandbox',
      ],
    });

    // 页面
    this.page = await this.browser.newPage();

    // 状态
    this.status = {
      loggedIn: false,
      completedEditor: false,
      published: false,
    };

    // 配置
    this.config = config[this.platform.name];
    if (!config) {
      throw new Error(`config (platform: ${this.platform.name}) cannot be found`);
    }

    // URL信息
    this.urls = this.config.urls;

    // 登陆选择器
    this.loginSel = this.config.loginSel;

    // 编辑器选择器
    this.editorSel = this.config.editorSel;

    // 隐藏navigator
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    // 脚注内容
    this.footerContent = {
      richText: `<br><b>本篇文章由一文多发平台<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动发布</b>`,
    };
  }

  async initForCookieStatus() {
    // platform
    this.platform = await models.Platform.findOne({ _id: ObjectId(this.platformId) }).execAsync();;

    // PCR
    this.pcr = await PCR({
      revision: '',
      detectionPath: '',
      folderName: '.chromium-browser-snapshots',
      hosts: ['https://storage.googleapis.com', 'https://npm.taobao.org/mirrors'],
      retry: 3,
      silent: false,
    });

    // 是否开启chrome浏览器调试
    const enableChromeDebugEnv = await models.Environment.findOne({ _id: constants.environment.ENABLE_CHROME_DEBUG });
    const enableChromeDebug = enableChromeDebugEnv.value;

    // 浏览器
    this.browser = await this.pcr.puppeteer.launch({
      executablePath: this.pcr.executablePath,
      //设置超时时间
      timeout: 120000,
      //如果是访问https页面 此属性会忽略https错误
      ignoreHTTPSErrors: true,
      // 打开开发者工具, 当此值为true时, headless总为false
      devtools: false,
      // 关闭headless模式, 不会打开浏览器
      headless: enableChromeDebug !== 'Y',
      args: [
        '--no-sandbox',
      ],
    });

    // 页面
    this.page = await this.browser.newPage();

    // // 设置屏幕大小
    // await this.page.setViewport({
    //   width: 2400,
    //   height: 1600,
    // });
  }

  /**
   * 登陆网站
   */
  async login() {
    logger.info(`logging in... navigating to ${this.urls.login}`);
    await this.page.goto(this.urls.login);
    let errNum = 0;
    while (errNum < 10) {
      try {
        await this.page.waitFor(1000);
        const elUsername = await this.page.$(this.loginSel.username);
        const elPassword = await this.page.$(this.loginSel.password);
        const elSubmit = await this.page.$(this.loginSel.submit);
        await elUsername.type(this.platform.username);
        await elPassword.type(this.platform.password);
        await elSubmit.click();
        await this.page.waitFor(3000);
        break;
      } catch (e) {
        errNum++;
      }
    }

    // 查看是否登陆成功
    this.status.loggedIn = errNum !== 10;

    if (this.status.loggedIn) {
      logger.info('Logged in');
    }
  }

  /**
   * 设置Cookie
   */
  async setCookies() {
    const cookies = await models.Cookie.find({ domain: { $regex: this.platform.name } }).execAsync();
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i];
      await this.page.setCookie({
        name: c.name,
        value: c.value,
        domain: c.domain,
      });
    }
  }

  /**
   * 获取可给axios 使用的cookie
   */
  async getCookiesForAxios() {
    let cookies = await models.Cookie.find({ domain: { $regex: this.platform.name } }).execAsync();
    if(this.platform.name == constants.platform.TOUTIAO){
       cookies = await models.Cookie.find({ domain: {$in: ['.toutiao.com', 'www.toutiao.com', '.www.toutiao.com']}}).execAsync();
    }
    let cookieStr = '';
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i];
      cookieStr += `${c.name}=${c.value}; `;
    }
    return cookieStr;
  }

  /**
   * 导航至写作页面
   */
  async goToEditor() {
    logger.info(`navigating to ${this.urls.editor}`);
    await this.page.goto(this.urls.editor);
    await this.page.waitFor(5000);
    await this.afterGoToEditor();
  }

  /**
   * 导航至写作页面后续操作
   */
  async afterGoToEditor() {
    // 导航至写作页面的后续处理
    // 掘金等网站会先弹出Markdown页面，需要特殊处理
  }

  /**
   * 输入文章标题
   */
  async inputTitle(article, editorSel, task) {
    const el = document.querySelector(editorSel.title);
    el.focus();
    HTMLPreElement.prototype.select = function () {
      let range = document.createRange();
      range.selectNodeContents(this);

      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };
    HTMLTextAreaElement.prototype.select = function () {
      let range = document.createRange();
      range.selectNodeContents(this);

      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };
    el.select();
    document.execCommand('delete', false);
    document.execCommand('insertText', false, task.title || article.title);
  }

  /**
   * 输入文章内容
   */
  async inputContent(article, editorSel) {
    const el = document.querySelector(editorSel.content);
    el.focus();
    try {
      HTMLDivElement.prototype.select = function () {
        let range = document.createRange();
        range.selectNodeContents(this);

        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      };
      HTMLPreElement.prototype.select = function () {
        let range = document.createRange();
        range.selectNodeContents(this);

        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      };
      el.select();
    } catch (e) {
      // do nothing
    }
    document.execCommand('delete', false);
    document.execCommand('insertText', false, article.content);
  }

  /**
   * 输入文章脚注
   */
  async inputFooter(article, editorSel) {
    const footerContent = `\n\n> 本篇文章由一文多发平台[ArtiPub](https://github.com/crawlab-team/artipub)自动发布`;
    const el = document.querySelector(editorSel.content);
    el.focus();
    document.execCommand('insertText', false, footerContent);
  }

  /**
   * 输入编辑器
   */

  async inputEditor() {
    logger.info(`input editor title`);
    // 输入标题
    await this.page.evaluate(this.inputTitle, this.article, this.editorSel, this.task);
    await this.page.waitFor(3000);

    // 输入内容
    logger.info(`input editor  content`);
    await this.page.evaluate(this.inputContent, this.article, this.editorSel);
    await this.page.waitFor(3000);

    // 输入脚注
    await this.page.evaluate(this.inputFooter, this.article, this.editorSel);
    await this.page.waitFor(3000);

    await this.page.waitFor(10000);

    // 后续处理
    await this.afterInputEditor();
  }

  /**
   * 输入编辑器后续操作
   */
  async afterInputEditor() {
    // 输入编辑器内容的后续处理
    // 标签、分类输入放在这里
  }

  /**
   * 发布文章
   */
  async publish() {
    logger.info(`publishing article`);
    // 发布文章
    const elPub = await this.page.$(this.editorSel.publish);
    await elPub.click();
    await this.page.waitFor(10000);

    // 后续处理
    await this.afterPublish();
  }

  /**
   * 发布文章后续操作
   */
  async afterPublish() {
    // 提交文章的后续处理
    // 保存文章url等逻辑放在这里
  }

  /**
   * 运行爬虫
   */
  async run() {
    // 初始化
    await this.init();

    if (this.task.authType === constants.authType.LOGIN) {
      // 登陆
      await this.login();
    } else {
      // 使用Cookie
      await this.setCookies();
    }

    // 导航至编辑器
    await this.goToEditor();

    // 输入编辑器内容
    await this.inputEditor();

    // 发布文章
    await this.publish();

    // 关闭浏览器
    // await this.browser.close();
  }

  /**
   * 获取文章统计数据
   */
  async fetchStats() {
    // to be inherited
  }

  /**
   * 获取文章统计数据后续操作
   */
  async afterFetchStats() {
    // 统计文章总阅读、点赞、评论数
    const tasks = await models.Task.find({ articleId: this.article._id }).execAsync();
    let readNum = 0;
    let likeNum = 0;
    let commentNum = 0;
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      readNum += task.readNum || 0;
      likeNum += task.likeNum || 0;
      commentNum += task.commentNum || 0;
    }
    this.article.readNum = readNum;
    this.article.likeNum = likeNum;
    this.article.commentNum = commentNum;
    await this.article.save();
  }

  /**
   * 运行获取文章统计数据
   */
  async runFetchStats() {
    // 初始化
    await this.init();

    // 获取文章数据
    await this.fetchStats();

    // 后续操作
    await this.afterFetchStats();

    // 关闭浏览器
    await this.browser.close();
  }

  /**
   * 检查Cookie是否能正常登陆
   */
  async checkCookieStatus() {
    // platform
    this.platform = await models.Platform.findOne({ _id: ObjectId(this.platformId) }).execAsync();

    const cookie = await this.getCookiesForAxios();
    let url = this.platform.url;
    if (this.platform.name === constants.platform.CSDN) {
      url = 'https://me.csdn.net/api/user/getUserPrivacy';
    } else if (this.platform.name === constants.platform.CNBLOGS) {
      url = 'https://account.cnblogs.com/user/userinfo';
    } else if (this.platform.name === constants.platform.ZHIHU) {
      url = 'https://www.zhihu.com/api/v4/me?include=ad_type%2Cavailable_message_types%2Cdefault_notifications_count%2Cfollow_notifications_count%2Cvote_thank_notifications_count%2Cmessages_count%2Cdraft_count%2Cemail%2Caccount_status%2Cis_bind_phone%2Cfollowing_question_count%2Cis_force_renamed%2Crenamed_fullname'
    }
    const headerValue = {
      'Cookie': cookie,
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
    }
    console.log(url)
    console.log(headerValue)
    return axios.get(url, {
        headers: headerValue
      })
  }
}

module.exports = BaseSpider;
