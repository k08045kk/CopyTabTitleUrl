/**
 * バックグラウンド処理
 */
'use strict';


if (globalThis.importScripts) {
  importScripts('/common.js');
  // punycode.js - module
  // scripting.js - isMobile
  // clipboard.js - isFirefox, isWiki, ex3, defaultStorage
  // background.js - isFirefox, ex3, defaultStorage, converteStorageVersion3
  importScripts('/lib/punycode.js/punycode.js');
  // clipboard.js - punycode
  importScripts('/background/compiler.js');
  // format.js - compile
  importScripts('/background/scripting.js');
  // clipboard.js - executeScript
  importScripts('/background/format.js');
  // clipboard.js - createFormatText
  importScripts('/background/clipboard.js');
  // background.js - onCopy
}



/* ========================================================================== */
/* イベント                                                                   */
/* ========================================================================== */
// ブラウザアクション
chrome.action.onClicked.addListener(async (tab) => {
  const cmd = await chrome.storage.local.get(defaultStorage);
  const id = 3;
  cmd.id = id;
  cmd.format = cmd.formats[id];
  cmd.target = cmd.browser_action_target;
  cmd.tab = tab;
  onCopy(cmd);
});


// コンテキストメニュー
const onContextMenus = async (info, tab) => {
  const cmd = await chrome.storage.local.get(defaultStorage);
  const id = info.menuItemId.match(/\d+$/)[0]-0;
  cmd.id = id;
  cmd.format = ex3(cmd, 'extended_edit') || 3<=id ? cmd.formats[id] : defaultStorage.formats[id];
  cmd.target = ex3(cmd) && (ex3(cmd, 'extended_edit') || 3<=id) 
             ? cmd.menus[id].target 
             : defaultStorage.menus[id].target;
  cmd.tab = tab;
  cmd.info = info;
  onCopy(cmd);
  // 備考：標準モードは、ターゲット設定不可（セパレーターの扱いにこまるため）
};
chrome.contextMenus?.onClicked.addListener(onContextMenus);


// キーボードショートカット
chrome.commands?.onCommand.addListener(async (name, tab) => {
  const cmd = await chrome.storage.local.get(defaultStorage);
  const id = {'shortcut_action':3, 'shortcut_action2':4}[name] ?? -1;
  if (0 <= id) {
    cmd.id = id;
    cmd.format = cmd.formats[id];
    cmd.target = ex3(cmd, 'shortcut_target') ? cmd.menus[id].target : 'tab';
    cmd.tab = tab;
    onCopy(cmd);
  }
});


// メッセージ
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



/* ========================================================================== */
/* 更新                                                                       */
/* ========================================================================== */
// ブラウザアクション
const updateAction = (cmd) => {
  const popup = (cmd.browser_action == 'popup' || ex3(cmd, 'popup_comlate'))
              ? '/popup/popup.html'
              : '';
  chrome.action.setPopup({popup});
};


// コンテキストメニュー
const updateContextMenus = async (cmd) => {
  if (!chrome.contextMenus) { return; }
  
  // メニュー削除 && ストレージ取得
  await chrome.contextMenus.removeAll();
  
  const exmode = ex3(cmd);
  const format9 = ex3(cmd, 'menus_format9');
  
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
    const len = exmode ? cmd.menus.length : 5;
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
            title: exmode ? cmd.menus[i].title : defaultStorage.menus[i].title,
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
      title: exmode ? cmd.menus[id].title : defaultStorage.menus[id].title,
      contexts: ['selection', 'link', 'image'],
    });
  }
};


// 全体
const update = async () => {
  const cmd = await chrome.storage.local.get(defaultStorage);
  updateAction(cmd);
  updateContextMenus(cmd);
};



/* ========================================================================== */
/* main                                                                       */
/* ========================================================================== */
chrome.runtime.onInstalled.addListener(converteStorageVersion3);
//chrome.runtime.onStartup.addListener(update);
update();
