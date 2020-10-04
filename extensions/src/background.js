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
