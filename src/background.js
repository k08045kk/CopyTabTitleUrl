/**
 * バックグラウンド処理
 */
'use strict';


if (globalThis.importScripts) {
  importScripts('/common.js');
  importScripts('/lib/punycode.js/punycode.js');
  importScripts('/clipboard.js');
}


// ブラウザアクション
const updateAction = (cmd) => {
  const popup = (cmd.browser_action == 'popup' || ex3(cmd, 'popup_comlate'))
              ? '/popup/popup.html'
              : '';
  chrome.action.setPopup({popup});
};
chrome.action.onClicked.addListener(async (info, tab) => {
  const cmd = await chrome.storage.local.get(defaultStorage);
  const id = 3;
  cmd.id = id;
  cmd.format = cmd.formats[id];
  cmd.target = cmd.browser_action_target;
  onCopy(cmd);
});


// コンテキストメニューイベント
const onContextMenus = async (info, tab) => {
  const cmd = await chrome.storage.local.get(defaultStorage);
  const id = info.menuItemId.match(/\d+$/)[0]-0;
  cmd.id = id;
  cmd.format = cmd.formats[id];
  cmd.target = ex3(cmd) ? cmd.menus[id].target : defaultStorage.menus[id].target;
  cmd.selectionText = info.selectionText;
  cmd.linkText = info.linkText;  // Firefox56+(Chromeは、対象外)
  cmd.linkUrl = info.linkUrl;
  cmd.srcUrl = info.srcUrl;
  cmd.tab = tab;
  onCopy(cmd);
};
chrome.contextMenus.onClicked.addListener(onContextMenus);



// コンテキストメニュー更新
const updateContextMenus = async (cmd) => {
  // メニュー削除 && ストレージ取得
  await chrome.contextMenus.removeAll();
  
  const extension = ex3(cmd);
  const format9 = ex3(cmd, 'menus_format9');
  const edit = ex3(cmd, 'menus_edit_title');
  
  // メニュー追加
  const contexts = [];
  if (ex3(cmd, 'context_all')) {  contexts.push('all'); }
  if (ex3(cmd, 'context_page')) { contexts.push('page'); }
  if (!format9 && ex3(cmd, 'context_selection')) {  contexts.push('selection'); }
  if (!format9 && ex3(cmd, 'context_link')) {   contexts.push('link'); }
  if (!format9 && ex3(cmd, 'context_image')) {  contexts.push('image'); }
  if (ex3(cmd, 'context_action')) {             contexts.push('action'); }
  if (isFirefox() && ex3(cmd, 'context_tab')) { contexts.push('tab'); }
  
  if (contexts.length) {
    const len = extension ? cmd.menus.length : 5;
    for (let i=0; i<len; i++) {
      if (cmd.menus[i].enable) {
        if (cmd.menus[i].target === 'separator') {
          chrome.contextMenus.create({
            id: 'separator'+i,
            type: 'separator',
            contexts,
          });
        } else {
          chrome.contextMenus.create({
            id: 'menu'+i,
            title: edit ? cmd.menus[i].title : defaultStorage.menus[i].title,
            contexts: contexts,
          });
        }
      }
    }
  }
  if (format9) {
    const id = 11;
    chrome.contextMenus.create({
      id: 'exmenu'+id,
      title: edit ? cmd.menus[id].title : defaultStorage.menus[id].title,
      contexts: ['selection', 'link', 'image'],
    });
  }
};



const update = async () => {
  const cmd = await chrome.storage.local.get(defaultStorage);
  updateAction(cmd);
  updateContextMenus(cmd);
};



// キーボードショートカット
chrome.commands.onCommand.addListener(async (command) => {
  const cmd = await chrome.storage.local.get(defaultStorage);
  if (command === 'shortcut_action') {
    const id = 3;
    cmd.id = id;
    cmd.format = cmd.formats[id];
    cmd.target = 'tab';
    onCopy(cmd);
  } else if (command === 'shortcut_action2') {
    const id = 4;
    cmd.id = id;
    cmd.format = cmd.formats[id];
    cmd.target = 'tab';
    onCopy(cmd);
  }
});



chrome.runtime.onMessage.addListener((data, sender) => {
  if (data.target !== 'background') { return; }
  switch (data.type) {
  case 'update':                // options.js
    update();
    break;
  case 'copy':                  // popup.js
    onCopy(data.cmd);
    break;
  }
});
//chrome.runtime.onStartup.addListener(update);
update(); // 拡張機能の有効・無効切り替え対策



chrome.runtime.onInstalled.addListener(converteStorageVersion3);
