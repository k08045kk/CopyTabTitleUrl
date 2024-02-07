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



let en = {};
const checkbox = (id) => document.getElementById(id);



// オプション画面の更新
// 注意：ブラウザアクション更新後に実行すること
function updateOptionPage() {
  // 翻訳
  const lang = chrome.i18n.getMessage('lang');
  if (lang === 'en') {
    checkbox('use_english').disabled = true;
  }
  const i18n = lang !== 'en' && !checkbox('use_english').checked;
  const getMessage = key => i18n ? chrome.i18n.getMessage(key) : en[key]?.message.replace(/\$\$/g, '$');
  document.querySelectorAll('*[data-i18n]').forEach(v => {
    const id = v.id || v.getAttribute('for');
    const key = id.replace(/(^[a-z]|_[a-z])/g, m => m.at(-1).toUpperCase());
    
    const content = getMessage('options'+key+'Content');
    if (content) { v.textContent =  content; }
    
    const title = getMessage('options'+key+'Title');
    if (title) { v.title = title; }
  });
  const reset = document.getElementById('reset');
  reset.dataset.reset = getMessage('optionsResetContent');
  reset.dataset.confirm = getMessage('optionsResetConfirmContent');
  reset.textContent = reset.dataset.reset;
  
  
  // ブラウザアクション
  const action = document.getElementById('browser_action_action').checked;
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
  const exmode = checkbox('extended_mode').checked;
  const exedit = exmode && checkbox('extended_edit').checked;
  document.body.dataset.exmode = exmode;
  document.body.dataset.exedit = exedit;
  
  document.getElementById('copy_html').disabled = isFirefox() && checkbox('copy_clipboard_api').checked;
  
  // タイトル編集
  const edit = checkbox('menus_edit_title').checked;
  document.getElementById('menus').dataset.edit = exmode && edit;
  document.getElementById('popup_title').disabled = !(exmode && edit && !action);
  document.getElementById('popup_tooltip').disabled = !(exmode && !action);
  
  // フォーマット関数
  const programmable = checkbox('copy_programmable').checked;
  document.getElementById('programmable').dataset.enable = programmable;
  
  // モバイル環境
  const isMobile = !chrome.contextMenus;
  if (isMobile) {
    if (exedit) {
      document.querySelectorAll('.mobile').forEach(v => v.classList.remove('hide'));
    } else {
      document.querySelectorAll('.mobile').forEach(v => v.classList.add('hide'));
    }
    // 備考：モバイル環境は、コンテキストメニュー・キーボードショートカットが動作しない
    //       だが、ブラウザアクションのタイトル編集でコンテキストメニューの項目が必要になる。
    //       なので、 exedit 時のみ全項目にアクセスを許可する。
    //       （項目は変更できるが、動作部分は動かないため、動作しない項目を変更できるだけとなる）
    //       （非表示機能は、動作しない挙動を正とするが、例外的にタイトル編集だけ非表示でも動作する）
  }
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
    cmd.menus[i].enable = document.getElementById('menu'+i+'_checkbox').checked;
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
    document.getElementById('menu'+i+'_checkbox').checked  = !!cmd.menus[i].enable;
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



function startupOptionPage() {
  // add: .menuitem
  const menu = document.getElementById('template_menuitem');
  document.querySelectorAll('.menuitem').forEach((element, index) => {
    const clone = menu.content.cloneNode(true);
    const id = element.id;
    clone.querySelector('.menu_checkbox').id = id+'_checkbox';
    clone.querySelector('.menu_label').setAttribute('for', id+'_checkbox');
    clone.querySelector('.menu_label').textContent = element.dataset.text;
    clone.querySelector('.menu_title').id = id+'_title';
    clone.querySelector('.menu_target').id = id+'_target';
    if (element.dataset.edit === 'exedit') {
      clone.querySelector('.menu_target').classList.add('exedit');
    }
    element.appendChild(clone);
  });
  
  // add: <input maxlength="...">
  document.querySelectorAll('input[type="text"]').forEach((element) => {
    // menu_title, format, text, separator
    const max = element.classList.contains('menu_title')
              ? "64" : "256";
    element.setAttribute('maxlength', max);
  });
  
  // hide: .chrome or .firefox 
  const query = isFirefox() ? '.chrome' : '.firefox';
  document.querySelectorAll(query).forEach(v => v.classList.add('hide'));
};



// ページ初期化
document.addEventListener("DOMContentLoaded", async () => {
  en = await (await fetch('/_locales/en/messages.json')).json();
  startupOptionPage();
  await setupOptionPage();
  
  // イベント設定
  document.querySelectorAll('[type="checkbox"]:not(.menu_checkbox)').forEach((element) => {
    element.addEventListener('change', onUpdateOptions);
  });
  document.querySelectorAll('[type="radio"], .action_target').forEach((element) => {
    element.addEventListener('change', onUpdateOptions);
  });
  document.getElementById('newline').addEventListener('change', onUpdateOptions);
  document.querySelectorAll('.menu_checkbox, .menu_target').forEach((element) => {
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
//  if (chrome.commands) {
//    const shortcuts = [];
//    for (const command of await chrome.commands.getAll()) {
//      if (command.description.startsWith('format')) {
//        shortcuts.push(command.description+': '+command.shortcut);
//      }
//    }
//    if (shortcuts.length) {
//      // '\n'改行を挿入するため、innerTextとする
//      document.getElementById('shortcut_commands').innerText = shortcuts.join('\n');
//    }
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
