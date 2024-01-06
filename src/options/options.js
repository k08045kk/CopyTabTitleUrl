/**
 * オプションページ処理
 * chrome-extension://fpfdaednnjcmaofiihhjmkmicdfndblk/html/options.html
 */
'use strict';



const LEN_FORMATS = 12;
//const LEN_RETEXT = 4;



const checkbox = (id) => document.getElementById('checkbox__'+id);



// オプション画面の更新
// 注意：ブラウザアクション更新後に実行すること
function updateOptionPage() {
  // ALL選択時は、PAGEを無効化
  const all = checkbox('menus_contexts_all').checked;
  checkbox('menus_contexts_page').disabled = all;
  checkbox('menus_contexts_browser_action').disabled = all;
  
  // コピー完了通知
  const action = document.getElementById('select__browser_action__action').checked;
  checkbox('popup_comlate').disabled = !action;
  
  // BrowserActionのAction選択時のみアクション一覧表示
  document.querySelectorAll('.browser_action:not(.hide)').forEach(v => v.hidden = !action);
  
  // コンテキストメニュー選択時
  const contexts = checkbox('menus_contexts_all').checked
                || checkbox('menus_contexts_page').checked
                || checkbox('menus_contexts_selection').checked
                || checkbox('menus_contexts_link').checked
                || checkbox('menus_contexts_image').checked
                || checkbox('menus_contexts_browser_action').checked
                || (isFirefox() && checkbox('menus_contexts_tab').checked);
  document.getElementById('menu_item').hidden = !contexts;
  
  // 拡張モード選択時
  const extension = checkbox('others_extension').checked;
  document.querySelectorAll('.normal:not(.hide)').forEach(v => v.hidden = extension);
  document.querySelectorAll('.extension:not(.hide)').forEach(v => v.hidden = !extension);
  // フォーマット2
  const format2 = checkbox('others_format2').checked;
  document.querySelectorAll('.format2:not(.hide)').forEach(v => v.hidden = !format2);
  // 拡張メニュー
  const exmenus = format2 && checkbox('others_extend_menus').checked;
  checkbox('others_extend_menus').disabled = !format2;
  document.querySelectorAll('.extend_menus:not(.hide)').forEach(v => v.hidden = !(extension && exmenus));
  const format9 = checkbox('others_format9').checked;
  checkbox('others_format9').disabled = !exmenus;
  checkbox('menus_contexts_selection').disabled = all || (exmenus && format9);
  checkbox('menus_contexts_link').disabled = all || (exmenus && format9);
  checkbox('menus_contexts_image').disabled = all || (exmenus && format9);
  // タイトル編集
  const edit = checkbox('others_edit_menu_title').checked;
  document.querySelectorAll('.menu_label').forEach(v => v.hidden = extension && edit);
  document.querySelectorAll('.menu_title').forEach(v => v.hidden = !(extension && edit));
  
//  // 正規表現
//  const regexp = checkbox('others_regexp').checked;
//  document.getElementById('regexp').hidden = !(extension && regexp);
};



// コンテキストメニュー変更イベント
async function onUpdateOptions() {
  const cmd = await chrome.storage.local.get(defaultStorage);
  Object.keys(cmd).forEach((v) => {
    if (v.startsWith('checkbox__')) {
      cmd[v] = document.getElementById(v).checked;
    } else if (v.startsWith('select__')) {
      
    } else {
      delete cmd[v];
    }
  });
  cmd['select__browser_action']
     = [...document.getElementsByName('browser_action')].find(v => v.checked).value;
  cmd['select__browser_action_target']
     = [...document.getElementsByName('browser_action_target')].find(v => v.checked).value;
  cmd.newline = document.getElementById('newline').value;
  
  // ストレージへ設定を保存
  await chrome.storage.local.set(cmd);
  await chrome.runtime.sendMessage({target:'background', type:'update'});
  updateOptionPage();
};



// コンテキストメニューの更新イベント
async function onUpdateMenus() {
  const cmd = await chrome.storage.local.get({menus: defaultStorage.menus});
  for (let i=0; i<cmd.menus.length; i++) {
    cmd.menus[i].enable = document.getElementById('menu'+i).checked;
    cmd.menus[i].title = document.getElementById('menu'+i+'_title').value;
    if (cmd.menus[i].format >= 5) {
      cmd.menus[i].target = document.getElementById('menu'+i+'_target').value;
    }
  }
  await chrome.storage.local.set(cmd);
  await chrome.runtime.sendMessage({target:'background', type:'update'});
};

// フォーマット文字列の更新イベント
async function onUpdateFormat() {
  const cmd = await chrome.storage.local.get({formats: defaultStorage.formats});
  for (let i=3; i<LEN_FORMATS; i++) {
    cmd.formats[i].format = document.getElementById('format'+i).value;
  }
  await chrome.storage.local.set(cmd);
};


async function onUpdateSeparator() {
  await chrome.storage.local.set({
    separator: document.getElementById('separator').value,
  });
};


//async function onUpdateText() {
//  const cmd = await chrome.storage.local.get({texts: defaultStorage.texts});
//  for (let i=0; i<LEN_RETEXT; i++) {
//    cmd.texts[i] = document.getElementById('retext'+(i+1)).value;
//  }
//  await chrome.storage.local.set(cmd);
//};



// オプション画面に値を設定する
function setOptionPageValues(cmd) {
  // ストレージ内の値で初期化
  Object.keys(defaultStorage).forEach((v) => {
    if (v.startsWith('checkbox__')) {
      document.getElementById(v).checked = cmd[v];
    }
  });
  [...document.getElementsByName('browser_action')]
              .find(v => v.value === cmd['select__browser_action']).checked = true;
  [...document.getElementsByName('browser_action_target')]
              .find(v => v.value === cmd['select__browser_action_target']).checked = true;
  document.getElementById('separator').value  = cmd.separator;
  document.getElementById('newline').value  = cmd.newline;
  
  for (let i=0; i<cmd.menus.length; i++) {
    document.getElementById('menu'+i).checked  = !!cmd.menus[i].enable;
    document.getElementById('menu'+i+'_title').value = cmd.menus[i].title;
    if (cmd.menus[i].format >= 5) {
      document.getElementById('menu'+i+'_target').value = cmd.menus[i].target;
    }
  }
  for (let i=3; i<LEN_FORMATS; i++) {
    document.getElementById('format'+i).value  = cmd.formats[i].format;
  }
//  for (let i=0; i<LEN_RETEXT; i++) {
//    document.getElementById('retext'+(i+1)).value  = cmd.texts[i];
//  }
};



// 初期化ボタンイベント
const onReset = async function() {
  const element = this;
  
  // ボタンを元に戻す
  const onStop = () => {
    clearInterval(element.dataset.id);
    element.dataset.id = 0;
    element.dataset.delay = 0;
    element.textContent = document.getElementById('optionPage_Reset').textContent;
  };
  
  // 2段階確認待ち
  const onDelay = () => {
    if (element.dataset.delay == 0) {
      onStop();
    } else {
      element.dataset.delay--;
      element.textContent = document.getElementById('optionPage_ConfirmReset').textContent;
    }
  };
  
  if (element.dataset.delay == 0) {
    // 2段階確認開始
    element.dataset.delay = 10;
    clearInterval(element.dataset.id);
    element.dataset.id = setInterval(onDelay, 1000);
    onDelay();
  } else {
    // 2段階確認の決定
    onStop();
    await chrome.storage.local.clear();
    await chrome.storage.local.set(defaultStorage);
    await chrome.runtime.sendMessage({target:'background', type:'update'});
    setOptionPageValues(defaultStorage);
    updateOptionPage();
  }
};



// ページ初期化
document.addEventListener("DOMContentLoaded", async () => {
  // 初期化ボタンの設定（最優先で設定する）
  document.getElementById('reset').dataset.id = 0;
  document.getElementById('reset').dataset.delay = 0;
  document.getElementById('reset').addEventListener('click', onReset);
  
  if (isFirefox()) {
    // Firefox非対応
    // キーボードショートカット（標準機能による設定）
    document.querySelectorAll('.chrome').forEach(v => v.classList.add('hide'));
  } else {
    // Chrome非対応
    // タブコンテキストメニュー
    // キーボードショートカット（拡張機能による設定）
    document.querySelectorAll('.firefox').forEach(v => v.classList.add('hide'));
  }
  
  // (storage内の)初期値を設定
  const cmd = await chrome.storage.local.get(defaultStorage);
  setOptionPageValues(cmd);
  updateOptionPage();
  
  // イベント設定
  document.getElementById('separator').addEventListener('input', onUpdateSeparator);
  document.getElementById('newline').addEventListener('change', onUpdateOptions);
  document.querySelectorAll('[type="checkbox"]:not(.menu)').forEach((element) => {
    element.addEventListener('click', onUpdateOptions);
  });
  document.querySelectorAll('[type="radio"]').forEach((element) => {
    element.addEventListener('click', onUpdateOptions);
  });
  document.querySelectorAll('.options').forEach((element) => {
    element.addEventListener('click', onUpdateOptions);
  });
  document.querySelectorAll('.menu').forEach((element) => {
    element.addEventListener('input', onUpdateMenus);
  });
  document.querySelectorAll('.menu_title').forEach((element) => {
    element.addEventListener('input', onUpdateMenus);
  });
  document.querySelectorAll('.menu_target').forEach((element) => {
    element.addEventListener('change', onUpdateMenus);
  });
  document.querySelectorAll('.format').forEach((element) => {
    element.addEventListener('input', onUpdateFormat);
  });
//  document.querySelectorAll('.retext').forEach((element) => {
//    element.addEventListener('input', onUpdateText);
//  });
  
  // 開発者用
  if (false) {
    document.getElementById('setting_get').addEventListener('click', async () => {
      const cmd = await chrome.storage.local.get();
      document.getElementById('setting_json').value = JSON.stringify(cmd, null, 2);
    });
    document.getElementById('setting_set').addEventListener('click', async () => {
      const json = JSON.parse(document.getElementById('setting_json').value);
      await chrome.storage.local.clear();
      await chrome.storage.local.set(json);
    });
    document.getElementById('setting_clear').addEventListener('click', async () => {
      await chrome.storage.local.clear();
    });
    document.getElementById('setting_run').addEventListener('click', async () => {
      //await converteStorageVersion3();
    });
    document.getElementById('setting').hidden = false;
  }
});
