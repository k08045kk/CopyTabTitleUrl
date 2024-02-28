/**
 * popup.js
 * chrome-extension://fpfdaednnjcmaofiihhjmkmicdfndblk/popup/popup.html
 */
'use strict';


const FORMATS_LEN = 5;
const cmdPromise = chrome.storage.local.get(defaultStorage);



document.addEventListener("DOMContentLoaded", async () => {
  const cmd = await cmdPromise;
  
  
  // チェックボックスイベント設定
  const win = document.getElementById('target_win');
  const all = document.getElementById('target_all');
  const getTarget = function() {
    let target = 'tab';
    if (win.checked) { target = 'window'; }
    if (all.checked) { target = 'all'; }
    return target;
  };
  const onChangeCheckbox = function() {
    const element = this;
    if (win.checked && all.checked) {
      if (element.id == 'target_win') { all.checked = false; }
      if (element.id == 'target_all') { win.checked = false; }
    }
    
    chrome.storage.local.set({popup: {target:getTarget()}});
    // 備考：無効でも覚える (popup_remember)
  };
  win.addEventListener('change', onChangeCheckbox);
  all.addEventListener('change', onChangeCheckbox);
  
  
  // コピーイベント設定
  document.querySelectorAll('.copy').forEach((element) => {
    const id = element.id.match(/\d+$/)[0]-0;
    element.addEventListener('click', () => {
      cmd.id = id;
      cmd.format = ex3(cmd, 'extended_edit') || 3<=id ? cmd.formats[id] : defaultStorage.formats[id];
      cmd.target = getTarget();
      cmd.callback = 'close';
      chrome.runtime.sendMessage({target:'background.copy', cmd});
    });
  });
  
  
  // アクション
  if (cmd.browser_action === 'popup') {
    // ポップアップ表示する
    if (ex3(cmd, 'popup_format2')) {
      document.querySelectorAll('.format2').forEach(element => element.hidden = false);
    }
    if (ex3(cmd, 'popup_title')) {
      // [title and URL] のみ表示が特別なため
      if (cmd.menus[0].title !== defaultStorage.menus[0].title) {
        document.getElementById('format0').textContent = cmd.menus[0].title;
      }
      for (let i=1; i<FORMATS_LEN; i++) {
        document.getElementById('format'+i).textContent = cmd.menus[i].title;
      }
    }
    if (ex3(cmd, 'popup_tooltip')) {
      for (let i=0; i<FORMATS_LEN; i++) {
        document.getElementById('format'+i).setAttribute('title', cmd.formats[i]);
      }
    }
    if (ex3(cmd, 'popup_remember')) {
      if (cmd.popup.target === 'window') {  document.getElementById('target_win').checked = true; }
      if (cmd.popup.target === 'all') {     document.getElementById('target_all').checked = true; }
    }
    document.getElementById('panel').hidden = false;
  } else {
    // アクションのみ(完了通知を表示する)
    const id = 3;
    cmd.id = id;
    cmd.format = cmd.formats[id];
    cmd.target = cmd.browser_action_target;
    cmd.callback = 'notice';
    chrome.runtime.sendMessage({target:'background.copy', cmd});
  }
});



chrome.runtime.onMessage.addListener((data, sender) => {
  switch (data.target) {
  case 'popup.close':                   // clipboard.js
    window.close();
    break;
  case 'popup.notice':                  // clipboard.js
    document.getElementById('action').hidden = false;
    setTimeout(() => window.close(), 1000);
    break;
  }
});
