chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch (message.type) {
            case 'getOneCookie':
                var response = "getFormatOption" + message.value;
                chrome.cookies.getAllCookieStores(cookieStores => {
                    cookieStores.forEach(store => {
                        chrome.cookies.getAll({ storeId: store.id }, cookies => {
                            const data = cookies.filter(c => {
                                if (c.domain.match(message.value)) {
                                    return true
                                }
                                return false
                            })
                            response = data;
                            sendResponse(response)
                        })
                    });

                })
                return true;
                // sendResponse(response)
                break;
            case 'fetchUrl':
                    fetch(message.url, {
                            credentials: 'include'
                        })
                        .then(response => response.text())
                        .then(text => sendResponse(text))
                        .catch(error => sendResponse(error))
                    return true; // Will respond asynchronously.
          case 'postUrl':
            let init = {
              method: 'post',

              credentials: 'include',
              headers: {'content-type': 'application/json'
              }
            }
            if(message.data !== "null"){
              init["body"] = JSON.stringify(message.data)
            }
            fetch(message.url, init)
              .then(response => response.text())
              .then(text => sendResponse(text))
              .catch(error => sendResponse(error))
            return true; // Will respond asynchronously.
          default:
                console.error('Unrecognised message: ', message);
                sendResponse("Unrecognised message:");
        }
    }
);

// 简书请求头设置
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    details.requestHeaders.push({
      name: 'Referer', value: 'https://juejin.im/editor/drafts/6857487746525888520'
    })
    details.requestHeaders.push({
      name: 'Origin', value: 'https://juejin.im'
    })
    return { requestHeaders: details.requestHeaders }
  },
  { urls: ["https://apinew.juejin.im/*"] },
  ["blocking", "requestHeaders", "extraHeaders"]
);

// 掘金请求头设置
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    details.requestHeaders.push({
      name: 'Referer', value: 'https://juejin.im/editor/drafts/6857487746525888520'
    })
    details.requestHeaders.push({
      name: 'Origin', value: 'https://juejin.im'
    })
    return { requestHeaders: details.requestHeaders }
  },
  { urls: ["https://apinew.juejin.im/*"] },
  ["blocking", "requestHeaders", "extraHeaders"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    if (/article\/(.*?)\/delete/.exec(details.url)) {
      let id = /article\/(.*?)\/delete/.exec(details.url)[1];
      details.requestHeaders.push({name: 'Referer', value: `https://aijishu.com/a/${id}`});
    } else {
      details.requestHeaders.push({name: 'Referer', value: 'https://aijishu.com/write'});
    }
    details.requestHeaders.push({name: 'Origin', value: 'https://aijishu.com'});
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ["https://aijishu.com/api/*"]},
  ["blocking", "requestHeaders", "extraHeaders"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    if (/article\/(.*?)\/delete/.exec(details.url)) {
      let id = /article\/(.*?)\/delete/.exec(details.url)[1];
      details.requestHeaders.push({name: 'Referer', value: `https://segmentfault.com/a/${id}`});
    } else if (details.url.indexOf('articles/add') != -1) {
      details.requestHeaders.push({name: 'Referer', value: 'https://segmentfault.com/write?freshman=1'});
    }
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ["https://segmentfault.com/api/*"]},
  ["blocking", "requestHeaders", "extraHeaders"]
);

// 头条请求头设置
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    details.requestHeaders.push({
      name: 'Referer', value: 'http://mp.toutiao.com/profile_v4/graphic/publish'
    })
    details.requestHeaders.push({
      name: 'Origin', value: 'http://mp.toutiao.com'
    })
    return { requestHeaders: details.requestHeaders }
  },
  { urls: ["http://mp.toutiao.com/mp/*"] },
  ["blocking", "requestHeaders", "extraHeaders"]
)

// 微博请求头设置
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    details.requestHeaders.push({
      name: 'Referer', value: 'https://card.weibo.com/article/v3/editor'
    })
    details.requestHeaders.push({
      name: 'Origin', value: 'https://card.weibo.com'
    })
    return { requestHeaders: details.requestHeaders }
  },
  { urls: ["https://card.weibo.com/article/v3/*"] },
  ["blocking", "requestHeaders", "extraHeaders"]
)

// 百家号请求头配置
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    details.requestHeaders.push({
      name: 'Referer', value: 'https://baijiahao.baidu.com/builder/rc/edit?type=news'
    })
    details.requestHeaders.push({
      name: 'Origin', value: 'https://baijiahao.baidu.com'
    })
    return { requestHeaders: details.requestHeaders }
  },
  { urls: ["https://baijiahao.baidu.com/builder/author/article/*"] },
  ["blocking", "requestHeaders", "extraHeaders"]
)

// B站头部配置
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    details.requestHeaders.push({
      name: 'Referer', value: 'https://member.bilibili.com/article-text/home?'
    })
    details.requestHeaders.push({
      name: 'Origin', value: 'https://member.bilibili.com'
    })
    return { requestHeaders: details.requestHeaders }
  },
  { urls: ["https://baijiahao.baidu.com/builder/author/article/*"] },
  ["blocking", "requestHeaders", "extraHeaders"]
)
