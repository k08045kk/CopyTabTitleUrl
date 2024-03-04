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
  importScripts('/background/scripting.js');
  // compile.js - executeConsoleLog, executePrompt
  // clipboard.js - executeScript
  importScripts('/background/compiler.js');
  // format.js - compile, createDefaltKeyset
  // background.js - compile, createDefaltKeyset, getStringArray
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
    // extended_menus_formats
//    const m = info.menuItemId.match(/^exmenu_(\w+)_/);
//    if (m) {
//      cmd.format = cmd.formats[id];
//      cmd.target = m[1];
//    }
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
const createExContextMenu = async (format, menu) => {
  const keyset = createDefaltKeyset();  // ${enter} = '\n'
  const text = compile(format, keyset);
  
  const exmenu = keyset['${menu}'];
  if (exmenu == 'true' || exmenu === true) {
    const contexts = ['all','action','audio','editable','frame','image','link','page','selection','video'];
    if (isFirefox()) { contexts.push('password', 'tab'); }
    // 備考：bookmark, password, tab, tools_menu（Firefox Only）
    // 備考：bookmark は、権限が必要（Firefox Only）
    // 備考：tools_menu は、 browser.menus.create() からアクセスする必要があります。
    // 備考：browser_action, page_action, launcher は、謎
    // see https://developer.chrome.com/docs/extensions/reference/api/contextMenus
    // see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/ContextType
    // ${menuContexts='["action","audio","editable","frame","image","link","password","selection","video"]'}
    
    menu.type = {separator:'separator'}[menu.target] ?? 'normal';
    menu.type = {separator:'separator'}[keyset['${menuTarget}']] ?? menu.type;
    menu.type = {normal:'normal', separator:'separator'}[keyset['${menuType}']] ?? menu.type;
    menu.title = keyset['${menuTitle}'] ?? menu.title;
    menu.contexts = getStringArray(keyset['${menuContexts}'], menu.contexts);
    menu.contexts = menu.contexts.filter(context => contexts.includes(context))
    menu.documentUrlPatterns = getStringArray(keyset['${menuDocumentUrlPatterns}'], null);
    menu.targetUrlPatterns = getStringArray(keyset['${menuTargetUrlPatterns}'], null);
    
    menu.target = {tab:'tab', window:'window', all:'all'}[menu.target] ?? 'tab';
    menu.target = {tab:'tab', window:'window', all:'all'}[keyset['${menuTarget}']] ?? menu.target;
    menu.id = 'exmenu_'+menu.target+'_'+menu.id;
    delete menu.target;
    
    if (0 < menu.contexts.length) {
      await chrome.contextMenus.create(menu);
      return true;
      // 備考："Invalid url pattern": documentUrlPatterns, targetUrlPatterns
      //       try / catch では確保できない
    }
    // ${menu=true}
    // ${menu=true}${title}${enter}${url}
    // ${menu=true}${menuTitle='exmenu test'}${menuDocumentUrlPatterns='["*://*.example.com/*"]'}test:${title}${enter}${url}
  }
  return false;
};
const updateContextMenus = async (cmd) => {
  if (!chrome.contextMenus) { return; }         // モバイル対策
  
  // メニュー削除 && ストレージ取得
  await chrome.contextMenus.removeAll();
  
  const exmode = ex3(cmd);
  const format9 = ex3(cmd, 'menus_format9');
  const exmenu = ex3(cmd, 'copy_programmable') 
              && ex3(cmd, 'copy_text') 
              && ex3(cmd, 'extended_menus');
//  const exmenu_formats = ex3(cmd, 'copy_programmable') 
//                      && ex3(cmd, 'extended_menus');
  
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
      // extended_menus_formats
      // 備考：storage.local.formats の変更監視が必要になる
      // 備考：extended_edit から独立する場合、 target の扱いに要注意
//      const menu = {
//        id: i,
//        title: exmode ? cmd.menus[i].title : defaultStorage.menus[i].title,
//        target: cmd.menus[i].target,
//        contexts, 
//      };
//      if (exmenu_formats && await createExContextMenu(cmd.formats[i], menu)) {
//        // 処理なし
//      } else 
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
      id: 'menu'+id,
      title: exmode ? cmd.menus[id].title : defaultStorage.menus[id].title,
      contexts: ['selection', 'link', 'image'],
    });
  }
  if (exmenu) {
    for (let i=0; i<cmd.texts.length; i++) {
      const menu = {
        id: (defaultStorage.formats.length + i),
        title: 'format'+(defaultStorage.formats.length - 3 + 1 + i),
        target: 'tab',
        contexts, 
      };
      await createExContextMenu(cmd.texts[i], menu);
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
const onInstalled = async () => {
//console.log('onInstalled');
  await converteStorageVersion3();
};
const onStartup = async () => {
//console.log('onStartup');
  await onUpdate();
};
const startuping = async () => {
//console.log('startuping');
  const sessionStorage = await chrome.storage.session?.get({startup:false});
  if (!sessionStorage?.startup) {
    await chrome.storage.session?.set({startup:true});
    
    const manifest = await chrome.runtime.getManifest();
    const localStorage = await chrome.storage.local.get({extension_version:''});
    if (manifest.version != localStorage.extension_version) {
      await chrome.storage.local.set({extension_version:manifest.version});
      
      await onInstalled();
    }
    // 備考：無効状態の拡張機能が更新しても chrome.runtime.onInstalled が呼ばれない対策（Chrome 限定？）
    //   see https://issues.chromium.org/issues/41116832
    
    await onStartup();
  }
  // 備考：有効無効時は chrome.runtime.onStartup が呼ばれない対策
  // 備考：chrome.storage.session
  //       更新時、内容は消える
  //       有効無効時、内容は消える
  //       Service Worker 復帰時、内容は残る
  //       対応時期：Chrome 102, Firefox115
  // 備考：onInstalled, onStartup の実行順・実行タイミングを保証します
  //       標準機能では、 onStartup > onInstalled の順で実行されることがあります
  //       また、並行（非同期）に実行されることがあります
};
let startupingPromise = null;
const startup = async () => {
//console.log('startup', startupingPromise);
  if (startupingPromise) {
    await startupingPromise;
  } else {
    startupingPromise = startuping();
    await startupingPromise;
    //startupingPromise = null;
  }
  // 備考：並行実行を阻止する。完了を待機する。シングルトン
};
//console.log('background.js');
chrome.runtime.onInstalled.addListener(startup);
chrome.runtime.onStartup.addListener(startup);
startup();
// 備考：chrome.runtime.onStartup を呼び出さないと、
//       起動時に background.js が動作しない対策（#67, Firefox 限定？）
// 備考：startup 関連問題のまとめ
//   see https://www.bugbugnow.net/2024/03/webextensions-onstartup.html
