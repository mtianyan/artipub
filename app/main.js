const { app,Menu, BrowserWindow,ipcMain } = require('electron');
const AppWindow = require("./AppWindow");
const isDev = require("electron-is-dev");
const { fork } = require('child_process');
const path = require('path');
const axios = require('axios');
const menuTemplate = require("./menuTemplate");

var pids = []
var platform = process.platform;
function killTask() {
  // try {
    if (platform === 'win32') {
      for (let pid of pids) {
        childProcess.exec('taskkill /pid ' + pid + ' /T /F');
      }
      pids = [];
    } else {
      for (let pid of pids) {
        process.kill(pid);
      }
      pids = [];
    }
    console.log("stop")
  // } catch (e) {
  //   console.log('pid not found');
  // }
}
function createServerProcess() {
  if (!isDev) {
    // 生产环境
    serverProcess = fork('./server.js', [], {
      cwd: path.join(__dirname, '../../'),
    });
    pids.push(serverProcess.pid)
  } else {
    // 开发环境
    serverProcess = fork(require.resolve('../server.js'));
    pids.push(serverProcess.pid)
    serverProcess.on('close', code => {
      console.log('子线程已经退出', code);
    }).on('uncaughtException', code =>{
      console.log('子进程发生异常', code)
    });

  }
  return serverProcess
}
const urlLoction = isDev
  ? "http://localhost:8000"
  : `file://${path.join(__dirname, "../index.html")}`;
app.on('ready', (event) => {
  // 新建一个窗口
  let mainWindow = new BrowserWindow({
    titleBarStyle: 'hidden',
    width: 1500,
    height: 956,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    show: false
  });
  mainWindow.on('ready-to-show', function () {
    mainWindow.show() // 初始化后再显示
  })
  const serverProcess = createServerProcess()
  serverProcess.on('message', (msg) => {
    console.log('Message from child', msg);
    if(msg === "setPortSuccess"){

      const Conf = require('conf');
      const config = new Conf();
      apiEndpoint = config.get("url")
      // 原有的项目开发环境下的 devServer 的端口是 3000 ，我们这里以 url 形式把原有项目加载进来
      mainWindow.loadURL(urlLoction);
      mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.send("api", apiEndpoint)
        mainWindow.reload();
      })
    }
  });
});
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform === 'darwin') {
    killTask()
    app.quit();
  }
});
// set the menu
const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

ipcMain.on("open-settings-window", () => {
  const settingsWindowConfig = {
    width: 532,
    height: 159
  };
  const settingsFileLocation = `file://${path.join(
    __dirname,
    "./settings/settings.html"
  )}`;
  settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation);
  settingsWindow.removeMenu();
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
});
ipcMain.on('preview', (event, data)=>{
  let preWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });
  preWindow.loadURL(data.url)
})

ipcMain.on('login', (event, data)=>{
  const name = data.platform.name
  console.log(name)
  if(name === "juejin"){
    loginJueJin()
  }else if(name === "jianshu"){
    loginJianShu()
  }else if(name === "segmentfault"){
    loginSegmentFault()
  }else if(name === "csdn"){
    loginCSDN()
  }else if(name === "zhihu"){
    loginZhiHu()
  } else if(name === "oschina"){
    loginOsChina()
  }else if(name === "cnblogs"){
    loginCnBlog()
  }
})

const {session} = require('electron');
const https = require('https');
const jsDom = require("jsdom");

//登录某网站获取Cookie通用方法
function getSiteCookie(url, callback) {
  let win = new BrowserWindow(
    {width: 700, height: 600, title: '【登陆成功后关闭窗口即可完成设置】'});
  win.loadURL(url).then();
  win.on('close', () => {
    // 查询所有与设置的 URL 相关的所有 cookies.
    session.defaultSession.cookies.get({url: url})
      .then((cookies) => {
        callback(cookies)
        // let cookieString = '';
        // for (let cookie of cookies) {
        //   cookieString += cookie.name + '=' + cookie.value + '; '
        // }
        // callback(cookieString.trim())
      }).catch((error) => {
      console.log(error)
    });
    win = null
  });
  win.on('page-title-updated', (e) => {
    //阻止窗口标题更改
    e.preventDefault()
  })
}

// 登录新浪图床
const loginWebBoPicture = function () {
  getSiteCookie('https://www.weibo.com/', (cookie) => {

    console.log(cookie)
  })
};
exports.loginWebBoPicture = loginWebBoPicture;

// 登录博客园
const loginCnBlog = function () {
  getSiteCookie('https://www.cnblogs.com/', (cookie) => {

    console.log(cookie)
  })
};
exports.loginCnBlog = loginCnBlog;

// 登录CSDN
const loginCSDN = function () {
  getSiteCookie('https://blog.csdn.net/', (cookie) => {
    console.log(cookie)
  })
};
exports.loginCSDN = loginCSDN;

// 登录掘金
const loginJueJin = function () {
  getSiteCookie('https://juejin.im/', (cookie) => {
    console.log(cookie)
  })
};
exports.loginJueJin = loginJueJin;

// 登录开源中国
const loginOsChina = function () {
  getSiteCookie('https://my.oschina.net/', (cookie) => {
    console.log(cookie)
  })
};
exports.loginOsChina = loginOsChina;

// 获取开源中国的g_user_code，获取g_user_id
function getOsChinaUserInfo() {
  https.get('https://www.oschina.net/', {
    headers: {
      'Cookie': dataStore.getOsChinaCookies()
    }
  }, res => {
    let str = '';
    res.on('data', function (buffer) {
      str += buffer;//用字符串拼接
    });
    res.on('end', () => {
      const dom = new jsDom.JSDOM(str);
      const g_user_code = dom.window.document.body.querySelector(
        'body > val[data-name=g_user_code]').dataset.value;
      const g_user_id = dom.window.document.body.querySelector(
        'body > val[data-name=g_user_id]').dataset.value;
      if (g_user_code && g_user_id) {
        dataStore.setOsChinaUserCode(g_user_code);
        dataStore.setOsChinaUserId(g_user_id)
      }
    });
  })
}

// 登录思否
const loginSegmentFault = function () {
  getSiteCookie('https://segmentfault.com', (cookie) => {
    console.log(cookie)
  })
};

exports.loginSegmentFault = loginSegmentFault;

// 登录知乎
const loginZhiHu = function () {
  getSiteCookie('https://www.zhihu.com', (cookie) => {
    console.log(cookie)
  })
};

exports.loginZhiHu = loginZhiHu;

// 登录简书
const loginJianShu = function () {
  getSiteCookie('https://www.jianshu.com/sign_in', (cookie) => {
    axios.post('http://localhost:3000/cookies', cookie)
  })
};

exports.loginJianShu = loginJianShu;
