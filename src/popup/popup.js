/**
 * ポップアップページ処理
 * chrome-extension://fpfdaednnjcmaofiihhjmkmicdfndblk/html/popup.html
 */
'use strict';

document.addEventListener("DOMContentLoaded", async () => {
  // チェックボックスイベント設定
  const onClickCheckbox = function() {
    const element = this;
    const win = document.getElementById('target_win');
    const all = document.getElementById('target_all');
    
    if (element.id == 'target_win_label' && !win.checked && all.checked) {
      all.checked = false;
    }
    if (element.id == 'target_all_label' && !all.checked && win.checked) {
      win.checked = false;
    }
  };
  document.getElementById('target_win_label').addEventListener('click', onClickCheckbox);
  document.getElementById('target_all_label').addEventListener('click', onClickCheckbox);
  
  
  // コピーイベント設定
  document.querySelectorAll('.copy').forEach((element) => {
    const id = element.id.match(/\d+$/)[0]-0;
    const menuid = id >= 5 && element.dataset.menu.match(/\d+$/)[0]-0 || 0;
    element.addEventListener('click', async () => {
      // ポップアップ表示のイベント
      const cmd = await chrome.storage.local.get(defaultStorage);
      const win = document.getElementById('target_win');
      const all = document.getElementById('target_all');
      let target = 'tab';
      if (id >= 5) {      target = cmd.menus[menuid].target;  }
      if (win.checked) {  target = 'window';  }
      if (all.checked) {  target = 'all';  }
      
      cmd.id = id;
      cmd.format = cmd.formats[id].format;
      cmd.target = target;
      cmd.callback = 'close';
      chrome.runtime.sendMessage({target:'background', type:'copy', cmd});
    });
  });
  
  
  // アクション
  const cmd = await chrome.storage.local.get(defaultStorage);
  if (cmd.select__browser_action === 'action') {
    // アクションのみ(完了通知を表示する)
    cmd.id = 3;
    cmd.format = cmd.formats[3].format;
    cmd.target = cmd.select__browser_action_target;
    cmd.callback = 'notice';
    chrome.runtime.sendMessage({target:'background', type:'copy', cmd});
  } else {
    // ポップアップ表示する
    if (ex2(cmd, 'others_format2')) {
      document.querySelectorAll('.format2:not(.hide)').forEach(v => v.hidden = false);
    }
    document.getElementById('panel').hidden = false;
  }
});



chrome.runtime.onMessage.addListener((data, sender) => {
  if (data.target !== 'popup') { return; }
  switch (data.type) {
  case 'close':                         // clipboard.js
    window.close();
    break;
  case 'notice':                        // clipboard.js
    document.getElementById('action').hidden = false;
    setTimeout(() => window.close(), 1000);
    break;
  }
});
