/**
 * options.js
 * chrome-extension://fpfdaednnjcmaofiihhjmkmicdfndblk/options/options.html
 */
'use strict';



const enFetchPromise = fetch('/_locales/en/messages.json');
let en = {};
const cmdPromise = chrome.storage.local.get(defaultStorage);



// オプション画面の更新
// 注意：ブラウザアクション更新後に実行すること
function updateOptionPage(cmd) {
  // 翻訳
  const lang = chrome.i18n.getMessage('lang');
  const i18n = lang !== 'en' && !ex3(cmd, 'use_english');
  const lang2 = i18n ? lang : 'en';
  if (document.body.dataset.lang != lang2) {
    const getMessage = (key, translate) => {
      return i18n && translate !== false 
           ? chrome.i18n.getMessage(key) 
           : en[key]?.message.replace(/\$\$/g, '$');
    };
    document.querySelectorAll('*[data-i18n]').forEach((element) => {
      const id = element.id || element.getAttribute('for') || '';
      const key = id.replace(/(^[a-z]|_[a-z])/g, m => m.at(-1).toUpperCase());
      const isTranslate =!(element.parentElement.classList.contains('notranslate')
                        || element.parentElement.classList.contains('exam'));
      
      //const innerText = getMessage('options'+key+'InnerText', isTranslate);
      //if (innerText) { element.innerText = innerText; }
      
      const content = getMessage('options'+key+'Content', isTranslate);
      if (content) { element.textContent = content; }
    });
    const reset = document.getElementById('reset');
    reset.dataset.reset = getMessage('optionsResetContent');
    reset.dataset.confirm = getMessage('optionsResetConfirmContent');
    reset.textContent = reset.dataset.reset;
    document.body.dataset.lang = lang2;
  }
  
  
  // 拡張モード選択時
  const exmode = ex3(cmd);
  const exedit = exmode && ex3(cmd, 'extended_edit');
  document.body.dataset.exmode = exmode;
  document.body.dataset.exedit = exedit;
  document.getElementById('programmable').dataset.text = ex3(cmd, 'copy_text');
  document.getElementById('copy_scripting_main').disabled = !ex3(cmd, 'copy_scripting');
  document.getElementById('copy_html').disabled = ex3(cmd, 'copy_clipboard_api');
  document.getElementById('extended_menus').disabled = 
                          !(ex3(cmd, 'copy_programmable') && ex3(cmd, 'copy_text'));
  
  
  // ブラウザアクション
  const popup = cmd.browser_action === 'popup';
  const action = !popup;
  document.getElementById('popup_format2').disabled = !popup;
  document.getElementById('popup_title').disabled = !(exmode && popup);
  document.getElementById('popup_tooltip').disabled = !(exmode && popup);
  document.getElementById('popup_remember').disabled = !(exmode && popup);
  document.getElementById('browser_action_target').disabled = !action;
  document.getElementById('popup_comlate').disabled = !action;
  
  
  // コンテキスト
  const all = ex3(cmd, 'context_all');
  const format9 = ex3(cmd, 'menus_format9');
  document.getElementById('context_page').disabled = all;
  document.getElementById('context_action').disabled = all;
  document.getElementById('context_selection').disabled = all || format9;
  document.getElementById('context_link').disabled = all || format9;
  document.getElementById('context_image').disabled = all || format9;
};



// オプション全般変更イベント
async function onUpdateOptions() {
  const cmd = await chrome.storage.local.get(defaultStorage);
  for (const key of Object.keys(defaultStorage.options)) {
    cmd.options[key] = document.getElementById(key).checked;
  }
  cmd.browser_action = [...document.getElementsByName('browser_action')].find(v => v.checked).value;
  cmd.browser_action_target = document.getElementById('browser_action_target').value;
  cmd.newline = document.getElementById('newline').value;
  
  // ストレージへ設定を保存
  await chrome.storage.local.set(cmd);
  await chrome.runtime.sendMessage({target:'background.update'});
  updateOptionPage(cmd);
};

// コンテキストメニュー更新イベント
async function onUpdateMenus() {
  const cmd = await chrome.storage.local.get({menus: defaultStorage.menus});
  for (let i=0; i<defaultStorage.menus.length; i++) {
    cmd.menus[i].enable = document.getElementById('menu'+i+'_enable').checked;
    cmd.menus[i].title = document.getElementById('menu'+i+'_title').value;
    cmd.menus[i].target = document.getElementById('menu'+i+'_target').value;
  }
  await chrome.storage.local.set(cmd);
  await chrome.runtime.sendMessage({target:'background.updateContextMenus'});
};

// 文字列更新イベント
async function onUpdateFormat() {
  const cmd = await chrome.storage.local.get({formats: defaultStorage.formats});
  for (let i=0; i<defaultStorage.formats.length; i++) {
    cmd.formats[i] = document.getElementById('format'+i).value;
  }
  await chrome.storage.local.set(cmd);
};

async function onUpdateText() {
  const cmd = await chrome.storage.local.get(defaultStorage);
  const cmdTexts = {texts:cmd.texts};
  for (let i=0; i<defaultStorage.texts.length; i++) {
    cmdTexts.texts[i] = document.getElementById('text'+i).value;
  }
  await chrome.storage.local.set(cmdTexts);
  
  if (ex3(cmd, 'copy_programmable') && ex3(cmd, 'copy_text') && ex3(cmd, 'extended_menus')) {
    await chrome.runtime.sendMessage({target:'background.updateContextMenus'});
  }
};

async function onUpdateSeparator() {
  await chrome.storage.local.set({
    separator: document.getElementById('separator').value,
  });
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
    await chrome.runtime.sendMessage({target:'background.update'});
    setupOptionPage(defaultStorage);
  }
};



// オプション画面に値を設定する
function setupOptionPage(cmd) {
  for (const key of Object.keys(defaultStorage.options)) {
    document.getElementById(key).checked = cmd.options[key];
  }
  
  document.querySelector('[name="browser_action"][value="'+cmd.browser_action+'"]').checked = true;
  document.getElementById('browser_action_target').value = cmd.browser_action_target;
  document.getElementById('newline').value  = cmd.newline;
  document.getElementById('separator').value  = cmd.separator;
  
  for (let i=0; i<defaultStorage.menus.length; i++) {
    document.getElementById('menu'+i+'_enable').checked  = !!cmd.menus[i].enable;
    document.getElementById('menu'+i+'_title').value = cmd.menus[i].title;
    document.getElementById('menu'+i+'_target').value = cmd.menus[i].target;
  }
  for (let i=0; i<defaultStorage.formats.length; i++) {
    document.getElementById('format'+i).value = cmd.formats[i];
  }
  for (let i=0; i<defaultStorage.texts.length; i++) {
    document.getElementById('text'+i).value  = cmd.texts[i];
  }
  
  updateOptionPage(cmd);
};


// オプション画面を起動する
function startupOptionPage() {
  // template: checkbox
  const checkbox = document.getElementById('template_checkbox');
  document.querySelectorAll('[data-template="checkbox"]').forEach((element) => {
    const clone = checkbox.content.cloneNode(true);
    clone.querySelector('input').id = element.dataset.id;
    clone.querySelector('label').setAttribute('for', element.dataset.id);
    element.appendChild(clone);
  });
  
  // template: menu
  const menu = document.getElementById('template_menu');
  document.querySelectorAll('[data-template="menu"]').forEach((element, index) => {
    const clone = menu.content.cloneNode(true);
    const id = element.dataset.id;
    clone.querySelector('.menu_enable').id = id+'_enable';
    clone.querySelector('.menu_label').setAttribute('for', id+'_enable');
    clone.querySelector('.menu_label').textContent = element.dataset.text;
    clone.querySelector('.menu_title').id = id+'_title';
    clone.querySelector('.menu_target').id = id+'_target';
    if (element.dataset.edit === 'exedit') {
      clone.querySelector('.menu_target').classList.add('exedit');
    }
    element.classList.add('clearfix');
    element.appendChild(clone);
  });
  
  // add: <input maxlength="...">
  document.querySelectorAll('input[type="text"]').forEach((element) => {
    // menu_title, format, text, separator
    const max = element.classList.contains('menu_title')
              ? "64" : "256";
    element.setAttribute('maxlength', max);
  });
  
  // ブラウザ
  document.body.dataset.browser = isFirefox() ? 'firefox' : 'chrome';
  
  // 翻訳
  document.getElementById('use_english').disabled = chrome.i18n.getMessage('lang') === 'en';
  
  // モバイル
  const isMobile = !chrome.contextMenus;
  document.body.dataset.mobile = isMobile;
  // 備考：モバイル環境は、コンテキストメニュー・キーボードショートカットが動作しない
  //       だが、ブラウザアクションのタイトル編集でコンテキストメニューの項目が必要になる。
  //       なので、 exedit 時のみ全項目にアクセスを許可する。
  //       （項目は変更できるが、動作部分は動かないため、動作しない項目を変更できるだけとなる）
  //       （非表示機能は、動作しない挙動を正とするが、例外的にタイトル編集だけ非表示でも動作する）
  // 備考：Kiwi Browser は、コンテキストメニュー・キーボードショートカットが動作する？
};



// ページ初期化
document.addEventListener("DOMContentLoaded", async () => {
  // ページ設定
  const response = await enFetchPromise;
  const enJsonPromise = response.json();
  startupOptionPage();
  const cmd = await cmdPromise;
  en = await enJsonPromise;
  setupOptionPage(cmd);
  // 備考：非同期処理の順序を考慮する
  
  
  // イベント設定
  document.querySelectorAll('[type="checkbox"]:not(.menu_enable)').forEach((element) => {
    element.addEventListener('change', onUpdateOptions);
  });
  document.querySelectorAll('[type="radio"], .action_target').forEach((element) => {
    element.addEventListener('change', onUpdateOptions);
  });
  document.getElementById('newline').addEventListener('change', onUpdateOptions);
  document.querySelectorAll('.menu_enable, .menu_target').forEach((element) => {
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
  
  
  document.querySelector('main').hidden = false;
  // 備考：Firefox で表示直後にスクロールバーを一瞬表示する対策
});
