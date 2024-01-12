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
    element.addEventListener('click', async () => {
      // ポップアップ表示のイベント
      const cmd = await chrome.storage.local.get(defaultStorage);
      const win = document.getElementById('target_win');
      const all = document.getElementById('target_all');
      let target = 'tab';
      if (win.checked) {  target = 'window';  }
      if (all.checked) {  target = 'all';  }
      
      cmd.id = id;
      cmd.format = cmd.formats[id];
      cmd.target = target;
      cmd.callback = 'close';
      chrome.runtime.sendMessage({target:'background', type:'copy', cmd});
    });
  });
  
  
  // アクション
  const cmd = await chrome.storage.local.get(defaultStorage);
  if (cmd.browser_action === 'popup') {
    // ポップアップ表示する
    if (ex3(cmd, 'popup_format2')) {
      document.querySelectorAll('.format2').forEach(v => v.hidden = false);
    }
    if (ex3(cmd, 'popup_title') && ex3(cmd, 'menus_edit_title')) {
      // [title and URL] のみ表示が特別なため
      if (cmd.menus[0].title !== defaultStorage.menus[0].title) {
        document.getElementById('format0').textContent = cmd.menus[0].title;
      }
      for (let i=1; i<5; i++) {
        document.getElementById('format'+i).textContent = cmd.menus[i].title;
      }
    }
    if (ex3(cmd, 'popup_tooltip')) {
      for (let i=0; i<5; i++) {
        document.getElementById('format'+i).setAttribute('title', cmd.formats[i]);
      }
    }
    document.getElementById('panel').hidden = false;
  } else {
    // アクションのみ(完了通知を表示する)
    const id = 3;
    cmd.id = id;
    cmd.format = cmd.formats[id];
    cmd.target = cmd.browser_action_target;
    cmd.callback = 'notice';
    chrome.runtime.sendMessage({target:'background', type:'copy', cmd});
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
