const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('elementaryDesktop', {
  platform: process.platform,
});
