const { remote, ipcRenderer } = require('electron')
const Store = require('electron-store')
const settingsStore = new Store({name: 'Settings'})
const qiniuConfigArr = ['#savedFileLocation','#accessKey', '#secretKey', '#bucketName']
const $ = (selector) => {
  const result = document.querySelectorAll(selector)
  return result.length > 1 ? result : result[0]
}

document.addEventListener('DOMContentLoaded', () => {
  let savedLocation = settingsStore.get('savedFileLocation')
  if (savedLocation) {
    $('#savedFileLocation').value = savedLocation
  }
  // get the saved config data and fill in the inputs
  qiniuConfigArr.forEach(selector => {
    const savedValue = settingsStore.get(selector.substr(1))
    if (savedValue) {
      $(selector).value = savedValue
    }
  })

  $('#select-new-location').addEventListener('click', () => {
    remote.dialog
      .showOpenDialog({
        title: '请选择文件夹',
        message: '请选择文件夹',
        properties: ['openDirectory']
      })
      .then(result => {
        const canceled = result.canceled
        const filePaths = result.filePaths
        if (!canceled && Array.isArray(filePaths) && filePaths.length > 0) {
          if(!savedLocation){
            $('#savedFileLocation').setAttribute('value', savedLocation)
          }else{
            savedLocation = filePaths[0]
            $('#savedFileLocation').value = savedLocation
          }   
        }
      })
  })
  $('#settings-form').addEventListener('submit', (e) => {
    e.preventDefault()
    qiniuConfigArr.forEach(selector => {
      if ($(selector)) {
        let { id, value } = $(selector)
        settingsStore.set(id, value ? value : '')
      }
    })
    settingsStore.set('savedFileLocation', savedLocation)
    alert('保存成功')
    // sent a event back to main process to enable menu items if qiniu is configed
    ipcRenderer.send('config-is-saved')
    remote.getCurrentWindow().close()

  })
  $('.nav-tabs').addEventListener('click', (e) => {
    e.preventDefault()
    $('.nav-link').forEach(element => {
      element.classList.remove('active')
    })
    e.target.classList.add('active')
    $('.config-area').forEach(element => {
      element.style.display = 'none'
    })
    $(e.target.dataset.tab).style.display = 'block'
  })
})