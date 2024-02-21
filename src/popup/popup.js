/**
 * ポップアップページ処理
 * chrome-extension://fpfdaednnjcmaofiihhjmkmicdfndblk/html/popup.html
 */
'use strict';


const cmdPromise = chrome.storage.local.get(defaultStorage);


document.addEventListener("DOMContentLoaded", async () => {
  const cmd = await cmdPromise;
  
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
    
    // popup_remember
    let target = 'tab';
    if (element.id == 'target_win_label' && !win.checked) { target = 'window'; }
    if (element.id == 'target_all_label' && !all.checked) { target = 'all'; }
    chrome.storage.local.set({popup: {target}});
    // 備考：無効でも覚える
  };
  document.getElementById('target_win_label').addEventListener('click', onClickCheckbox);
  document.getElementById('target_all_label').addEventListener('click', onClickCheckbox);
  
  
  // コピーイベント設定
  document.querySelectorAll('.copy').forEach((element) => {
    const id = element.id.match(/\d+$/)[0]-0;
    element.addEventListener('click', () => {
      // ポップアップ表示のイベント
      const win = document.getElementById('target_win');
      const all = document.getElementById('target_all');
      let target = 'tab';
      if (win.checked) {  target = 'window';  }
      if (all.checked) {  target = 'all';  }
      
      cmd.id = id;
      cmd.format = ex3(cmd, 'extended_edit') || 3<=id ? cmd.formats[id] : defaultStorage.formats[id];
      cmd.target = target;
      cmd.callback = 'close';
      chrome.runtime.sendMessage({target:'background', type:'copy', cmd});
    });
  });
  
  
  // アクション
  if (cmd.browser_action === 'popup') {
    // ポップアップ表示する
    if (ex3(cmd, 'popup_format2')) {
      document.querySelectorAll('.format2').forEach(v => v.hidden = false);
    }
    if (ex3(cmd, 'popup_title')) {
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
