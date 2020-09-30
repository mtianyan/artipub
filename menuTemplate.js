const { app, shell, ipcMain } = require('electron');

const Store = require('electron-store');
const settingsStore = new Store({ name: 'Settings' });


let template = [
  {
    label: '启动设置',
    submenu: [{
      label: '数据库设置',
      accelerator: 'CmdOrCtrl+,',
      click: () => {
        ipcMain.emit('open-settings-window');
      },
    }],
  },
  {
    label: '视图',
    submenu: [
      {
        label: '刷新当前页面',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        },
      },
      {
        label: '切换全屏幕',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Ctrl+Command+F';
          } else {
            return 'F11';
          }
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
      },
      {
        label: '切换开发者工具',
        accelerator: (function () {
          if (process.platform === 'darwin') {
            return 'Alt+Command+I';
          } else {
            return 'Ctrl+Shift+I';
          }
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        },
      },
    ],
  },
  {
    label: '窗口',
    role: 'window',
    submenu: [{
      label: '最小化',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize',
    }, {
      label: '关闭',
      accelerator: 'CmdOrCtrl+W',
      role: 'close',
    }],
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      {
        label: '学习更多',
        click: () => {
          shell.openExternal('');
        },
      },
    ],
  },
];

if (process.platform === 'darwin') {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [{
      label: `关于 ${name}`,
      role: 'about',
    }, {
      type: 'separator',
    }, {
      label: '设置',
      accelerator: 'Command+,',
      click: () => {
        ipcMain.emit('open-settings-window');
      },
    }, {
      label: '服务',
      role: 'services',
      submenu: [],
    }, {
      type: 'separator',
    }, {
      label: `隐藏 ${name}`,
      accelerator: 'Command+H',
      role: 'hide',
    }, {
      label: '隐藏其它',
      accelerator: 'Command+Alt+H',
      role: 'hideothers',
    }, {
      label: '显示全部',
      role: 'unhide',
    }, {
      type: 'separator',
    }, {
      label: '退出',
      accelerator: 'Command+Q',
      click: () => {
        app.quit();
      },
    }],
  });
} else {
  template[0].submenu.push({
    label: '设置',
    accelerator: 'Ctrl+,',
    click: () => {
      ipcMain.emit('open-settings-window')
    }
  })
}

module.exports = template
