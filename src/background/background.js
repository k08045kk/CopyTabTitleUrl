/**
 * バックグラウンド処理
 */
'use strict';


if (globalThis.importScripts) {
  importScripts('/common.js');
  // punycode.js - module
  // scripting.js - isMobile
  // clipboard.js - isFirefox, isWiki, ex3, exOptions, defaultStorage
  // background.js - isFirefox, ex3, exOptions, defaultStorage, converteStorageVersion3
  importScripts('/lib/punycode.js/punycode.js');
  // clipboard.js - punycode
  importScripts('/background/compiler.js');
  // format.js - compile, createDefaltKeyset
  // background.js - compile, createDefaltKeyset, getStringArray
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
  if (id < defaultStorage.formats.length) {
    cmd.format = ex3(cmd, 'extended_edit') || 3<=id ? cmd.formats[id] : defaultStorage.formats[id];
    cmd.target = ex3(cmd) && (ex3(cmd, 'extended_edit') || 3<=id) 
               ? cmd.menus[id].target 
               : defaultStorage.menus[id].target;
  } else {
    cmd.format = cmd.texts[id-defaultStorage.formats.length];
    cmd.target = info.menuItemId.match(/^exmenu_(\w+)_/)[1];
  }
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
  switch (data.target) {
  case 'background.update':             // options.js
    onUpdate();
    break;
  case 'background.updateAction':       // options.js
    onAction();
    break;
  case 'background.updateContextMenus': // options.js
    onUpdateContextMenus();
    break;
  case 'background.copy':               // popup.js
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
const createExContextMenu = (format, menu) => {
  const keyset = createDefaltKeyset();  // ${enter} = '\n'
  const text = compile(format, keyset);
  
  const exmenu = keyset['${menu}'];
  if (exmenu == 'true' || exmenu === true) {
    menu.type = {normal:'normal', separator:'separator'}[keyset['${menuType}']] ?? menu.type;
    menu.title = keyset['${menuTitle}'] ?? menu.title;
    menu.contexts = getStringArray(keyset['${menuContexts}'], menu.contexts);
    menu.documentUrlPatterns = 
        getStringArray(keyset['${menuDocumentUrlPatterns}'], menu.documentUrlPatterns);
    menu.targetUrlPatterns = 
        getStringArray(keyset['${menuTargetUrlPatterns}'], menu.targetUrlPatterns);
    
    const target = {tab:'tab', window:'window', all:'all'}[keyset['${menuTarget}']] ?? 'tab';
    menu.id = 'exmenu_'+target+'_'+menu.id;
    chrome.contextMenus.create(menu);
    // ${menu=true}
    // ${menu=true}${title}${enter}${url}
    // ${menu=true}${menuTitle='exmenu test'}${menuDocumentUrlPatterns='["*://*.example.com/*"]'}test:${title}${enter}${url}
  }
};
const updateContextMenus = async (cmd) => {
  if (!chrome.contextMenus) { return; }         // モバイル対策
  
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
  if (ex3(cmd, 'copy_programmable') && ex3(cmd, 'copy_text') && ex3(cmd, 'extended_menus')) {
    const id0 = defaultStorage.formats.length;
    const menu = {type:'normal', contexts, documentUrlPatterns:null, targetUrlPatterns:null};
    for (let i=0; i<cmd.texts.length; i++) {
      menu.id = (id0+i);
      menu.title = 'format'+(id0-2+i);
      createExContextMenu(cmd.texts[i], menu);
    }
  }
};


// 更新
const onUpdate = async () => {
  const cmd = await chrome.storage.local.get(defaultStorage);
  updateAction(cmd);
  updateContextMenus(cmd);
};
const onAction = async () => {
  const cmd = await chrome.storage.local.get(defaultStorage);
  updateAction(cmd);
};
const onUpdateContextMenus = async () => {
  const cmd = await chrome.storage.local.get(defaultStorage);
  updateContextMenus(cmd);
};



/* ========================================================================== */
/* main                                                                       */
/* ========================================================================== */
chrome.runtime.onInstalled.addListener(converteStorageVersion3);
//chrome.runtime.onStartup.addListener(onUpdate);
onUpdate();
// 備考：Chrome の有効・無効に対応
