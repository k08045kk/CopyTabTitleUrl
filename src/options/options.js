/**
 * オプションページ処理
 * chrome-extension://fpfdaednnjcmaofiihhjmkmicdfndblk/html/options.html
 */
'use strict';



const MENUS_LEN = 12;
const FORMATS1 = 3;
const FORMATS9 = 11;
const FORMATS_LEN = 12;
const TEXTS_LEN = 10;



const checkbox = (id) => document.getElementById(id);


// オプション画面の更新
// 注意：ブラウザアクション更新後に実行すること
function updateOptionPage() {
  // Browser action
  const action = document.querySelector('[name="browser_action"][value="action"]').checked;
  checkbox('popup_format2').disabled = action;
  document.getElementById('browser_action_target').disabled = !action;
  checkbox('popup_comlate').disabled = !action;
  
  
  // コンテキスト
  const all = checkbox('context_all').checked;
  checkbox('context_page').disabled = all;
  checkbox('context_action').disabled = all;
  const format9 = checkbox('menus_format9').checked;
  checkbox('context_selection').disabled = all || format9;
  checkbox('context_link').disabled = all || format9;
  checkbox('context_image').disabled = all || format9;
  
  // コンテキストメニュー選択時
  const contexts = checkbox('context_all').checked
                || checkbox('context_page').checked
                || checkbox('context_selection').checked
                || checkbox('context_link').checked
                || checkbox('context_image').checked
                || checkbox('context_action').checked
                || (isFirefox() && checkbox('context_tab').checked);
  document.getElementById('menu_item').hidden = !contexts;
  
  
  // 拡張モード選択時
  const extension = checkbox('extended_mode').checked;
  document.body.dataset.mode = extension ? 'extended' : 'normal';
  document.body.dataset.edit = extension ? checkbox('extended_edit').checked : false;
  
  // タイトル編集
  const edit = checkbox('menus_edit_title').checked;
  document.getElementById('menus').dataset.edit = extension && edit;
  document.getElementById('popup_title').disabled = !(extension && edit && !action);
  document.getElementById('popup_tooltip').disabled = !(extension && !action);
  
  // フォーマット関数
  const program = checkbox('copy_programmable').checked;
  document.getElementById('program').hidden = !(extension && program);
};



// コンテキストメニュー変更イベント
async function onUpdateOptions() {
  const cmd = await chrome.storage.local.get(defaultStorage);
  Object.keys(defaultStorage.options).forEach((key) => {
    cmd.options[key] = document.getElementById(key).checked;
  });
  cmd.browser_action = [...document.getElementsByName('browser_action')].find(v => v.checked).value;
  cmd.browser_action_target = document.getElementById('browser_action_target').value;
  cmd.newline = document.getElementById('newline').value;
  
  // ストレージへ設定を保存
  await chrome.storage.local.set(cmd);
  await chrome.runtime.sendMessage({target:'background', type:'update'});
  updateOptionPage();
};



// コンテキストメニューの更新イベント
async function onUpdateMenus() {
  const cmd = await chrome.storage.local.get({menus: defaultStorage.menus});
  for (let i=0; i<MENUS_LEN; i++) {
    cmd.menus[i].enable = document.getElementById('menu'+i).checked;
    cmd.menus[i].title = document.getElementById('menu'+i+'_title').value;
    cmd.menus[i].target = document.getElementById('menu'+i+'_target').value;
  }
  await chrome.storage.local.set(cmd);
  await chrome.runtime.sendMessage({target:'background', type:'update'});
};

// フォーマット文字列の更新イベント
async function onUpdateFormat() {
  const cmd = await chrome.storage.local.get({formats: defaultStorage.formats});
  for (let i=0; i<FORMATS_LEN; i++) {
    cmd.formats[i] = document.getElementById('format'+i).value;
  }
  await chrome.storage.local.set(cmd);
};


async function onUpdateSeparator() {
  await chrome.storage.local.set({
    separator: document.getElementById('separator').value,
  });
};


async function onUpdateText() {
  const cmd = await chrome.storage.local.get({texts: defaultStorage.texts});
  for (let i=0; i<TEXTS_LEN; i++) {
    cmd.texts[i] = document.getElementById('text'+i).value;
  }
  await chrome.storage.local.set(cmd);
};



// オプション画面に値を設定する
async function setupOptionPage() {
  const cmd = await chrome.storage.local.get(defaultStorage);
  
  Object.keys(defaultStorage.options).forEach((key) => {
    checkbox(key).checked = cmd.options[key];
  });
  
  document.querySelector('[name="browser_action"][value="'+cmd.browser_action+'"]').checked = true;
  document.getElementById('browser_action_target').value = cmd.browser_action_target;
  document.getElementById('newline').value  = cmd.newline;
  document.getElementById('separator').value  = cmd.separator;
  
  for (let i=0; i<MENUS_LEN; i++) {
    document.getElementById('menu'+i).checked  = !!cmd.menus[i].enable;
    document.getElementById('menu'+i+'_title').value = cmd.menus[i].title;
    document.getElementById('menu'+i+'_target').value = cmd.menus[i].target;
  }
  for (let i=0; i<FORMATS_LEN; i++) {
    document.getElementById('format'+i).value = cmd.formats[i];
  }
  for (let i=0; i<TEXTS_LEN; i++) {
    document.getElementById('text'+i).value  = cmd.texts[i];
  }
  
  updateOptionPage();
};



// 初期化ボタンイベント
async function onReset() {
  const element = this;
  
  // ボタンを元に戻す
  const onStop = () => {
    clearInterval(element.dataset.id);
    element.dataset.id = 0;
    element.dataset.delay = 0;
    element.textContent = element.dataset.reset;
  };
  
  // 2段階確認待ち
  const onDelay = () => {
    if (element.dataset.delay == 0) {
      onStop();
    } else {
      element.dataset.delay--;
      element.textContent = element.dataset.confirm;
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
    await setupOptionPage();
  }
};



// ページ初期化
document.addEventListener("DOMContentLoaded", async () => {
  await setupOptionPage();
  
  if (isFirefox()) {
    document.querySelectorAll('.chrome').forEach(v => v.classList.add('hide'));
  } else {
    document.querySelectorAll('.firefox').forEach(v => v.classList.add('hide'));
  }
  
  // イベント設定
  document.querySelectorAll('[type="checkbox"]:not(.menu)').forEach((element) => {
    element.addEventListener('change', onUpdateOptions);
  });
  document.querySelectorAll('[type="radio"], .action_target').forEach((element) => {
    element.addEventListener('change', onUpdateOptions);
  });
  document.getElementById('newline').addEventListener('change', onUpdateOptions);
  document.querySelectorAll('.menu, .menu_target').forEach((element) => {
    element.addEventListener('change', onUpdateMenus);
  });
  document.querySelectorAll('.menu_title').forEach((element) => {
    element.addEventListener('input', onUpdateMenus);
  });
  document.querySelectorAll('.format').forEach((element) => {
    element.addEventListener('input', onUpdateFormat);
  });
  document.getElementById('separator').addEventListener('input', onUpdateSeparator);
  document.querySelectorAll('.text').forEach((element) => {
    element.addEventListener('input', onUpdateText);
  });
  document.getElementById('reset').addEventListener('click', onReset);
  
//  // ショートカット
//  const shortcuts = [];
//  for (const command of await chrome.commands.getAll()) {
//    if (command.description.startsWith('format')) {
//      shortcuts.push(command.description+': '+command.shortcut);
//    }
//  }
//  if (shortcuts.length) {
//    // '\n'改行を挿入するため、innerTextとする
//    document.getElementById('shortcut_commands').innerText = shortcuts.join('\n');
//  }
  
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
      await converteStorageVersion3();
    });
    document.getElementById('setting').hidden = false;
  }
});
