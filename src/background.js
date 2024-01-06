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
  const popup = (cmd.select__browser_action == 'popup' || ex2(cmd, 'popup_comlate'))
              ? '/popup/popup.html'
              : '';
  chrome.action.setPopup({popup});
};
chrome.action.onClicked.addListener(async (info, tab) => {
  const command = await chrome.storage.local.get(defaultStorage);
  command.id = 3;
  command.format = command.formats[3].format;
  command.target = command.select__browser_action_target;
  onCopy(command);
});


// コンテキストメニューイベント
const onContextMenus = async (info, tab) => {
  const id = info.menuItemId.match(/\d+$/)[0];
  const cmd = await chrome.storage.local.get(defaultStorage);
  const menu = cmd.menus[id];
  cmd.id = menu.format;
  cmd.format = cmd.formats.find(v => v.id == menu.format).format;
  cmd.target = menu.target;
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
  
  const format9 = ex2(cmd, 'others_format9');
  
  // メニュー追加
  const contexts = [];
  if (ex2(cmd, 'menus_contexts_all')) {  contexts.push('all'); }
  if (ex2(cmd, 'menus_contexts_page')) { contexts.push('page'); }
  if (!format9 && ex2(cmd, 'menus_contexts_selection')) {  contexts.push('selection'); }
  if (!format9 && ex2(cmd, 'menus_contexts_link')) {       contexts.push('link'); }
  if (!format9 && ex2(cmd, 'menus_contexts_image')) {      contexts.push('image'); }
  if (ex2(cmd, 'menus_contexts_browser_action')) {     contexts.push('action'); }
  if (isFirefox() && ex2(cmd, 'menus_contexts_tab')) { contexts.push('tab'); }
  
  if (contexts.length) {
    let menus = structuredClone(cmd.menus);
    if (!ex2(cmd, 'others_edit_menu_title')) {
      for (let i=0; i<menus.length; i++) {
        menus[i].title = defaultStorage.menus[i].title;
      }
    }
    menus.splice(15, 0, {type:'separator', format:-1, enable:true});
    menus.splice(10, 0, {type:'separator', format:-1, enable:true});
    menus.splice( 5, 0, {type:'separator', format:-1, enable:true});
    if (!ex2(cmd, 'others_format2') 
     || !ex2(cmd, 'others_extend_menus')) {
      menus = menus.filter(menu => menu.format < 5);
    }
    if (!ex2(cmd, 'others_format2')) {
      menus = menus.filter(menu => menu.format !== 4);
    }
    let flag = true;
    for (let i=menus.length-1; i>=0; i--) {
      if (menus[i].type == 'separator') {
        if (flag) {
          menus.splice(i, 1);
        } else {
          flag = true;
        }
      } else if (!menus[i].enable) {
        menus.splice(i, 1);
      } else {
        flag = false;
      }
    }
    for (let i=0; i<menus.length; i++) {
      if (menus[i].type == 'separator') {
        // ブラウザアクションは、6個制限(ACTION_MENU_TOP_LEVEL_LIMIT)があるため、セパレータなし
        if (menus.length > chrome.contextMenus.ACTION_MENU_TOP_LEVEL_LIMIT) {
          if (!(contexts.length == 1 && contexts[0] == 'action')) {
            chrome.contextMenus.create({
              id: 'separator'+i,
              type: menus[i].type,
              contexts: contexts.filter((v) => v != 'action'),
            });
          }
        } else {
          chrome.contextMenus.create({
            id: 'separator'+i,
            type: menus[i].type,
            contexts: contexts,
          });
        }
      } else {
        chrome.contextMenus.create({
          id: 'menu'+menus[i].id,
          title: menus[i].title,
          contexts: contexts,
        });
      }
    }
  }
  if (format9) {
    chrome.contextMenus.create({
      id: 'exmenu21',
      title: ex2(cmd, 'others_edit_menu_title')
               ? cmd.menus[21].title
               : defaultStorage.menus[21].title,
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
    cmd.id = 3;
    cmd.format = cmd.formats[3].format;
    cmd.target = 'tab';
    onCopy(cmd);
  } else if (command === 'shortcut_action2' && ex2(cmd, 'others_format2')) {
    cmd.id = 4;
    cmd.format = cmd.formats[4].format;
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
//chrome.runtime.onInstalled.addListener(update);
//chrome.runtime.onStartup.addListener(update);
update(); // 拡張機能の有効・無効切り替え対策
