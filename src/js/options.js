/**
 * オプションページ処理
 * chrome-extension://fpfdaednnjcmaofiihhjmkmicdfndblk/html/options.html
 */

function checkbox(id, bool) {
  const element = document.getElementById(id);
  if (!element) {
    return false;
  } else if (typeof bool === 'boolean') {
    return element.checked = bool;
  } else {
    return element.checked;
  }
};

function radio(name, valueSet) {
  const elements = document.getElementsByName(name);
  if (!elements.length) {
    return 'radio__error__error';
  } else if (valueSet) {
    const value = valueSet['select__'+name];
    for (var i=0; i<elements.length; i++) {
      if (elements[i].value == value) {
        elements[i].checked = true;
        break;
      }
    }
  } else {
    for (var i=0; i<elements.length; i++) {
      if (elements[i].checked) {
        return elements[i].value;
      }
    }
    return elements[0].value;
  }
};

// オプション画面の更新
// 注意：ブラウザアクション更新後に実行すること
function updateOptionPage() {
  // 翻訳
  const lang = checkbox('checkbox__others_language');
  document.querySelectorAll('*[data-i18n]').forEach((v, i, a) => {
    v.textContent = lang ? v.dataset.english : chrome.i18n.getMessage(v.dataset.i18n);
  });
  
  // ALL選択時は、PAGEを無効化
  const all = checkbox('checkbox__menus_contexts_all');
  document.getElementById('checkbox__menus_contexts_page').disabled = all;
  document.getElementById('checkbox__menus_contexts_selection').disabled = all;
  document.getElementById('checkbox__menus_contexts_link').disabled = all;
  document.getElementById('checkbox__menus_contexts_image').disabled = all;
  document.getElementById('checkbox__menus_contexts_browser_action').disabled = all;
  
  // コピー完了通知
  const action = document.getElementById('select__browser_action__action').checked;
  document.getElementById('checkbox__popup_comlate').disabled = !action;
  
  // BrowserActionのAction選択時のみアクション一覧表示
  document.getElementById('browser_action_target').hidden = !action;
  
  // コンテキストメニュー選択時
  const contexts = checkbox('checkbox__menus_contexts_all')
                || checkbox('checkbox__menus_contexts_page')
                || checkbox('checkbox__menus_contexts_selection')
                || checkbox('checkbox__menus_contexts_link')
                || checkbox('checkbox__menus_contexts_image')
                || checkbox('checkbox__menus_contexts_browser_action')
                || (isFirefox() && checkbox('checkbox__menus_contexts_tab'));
  document.getElementById('menu_item').hidden = !contexts;
  
  // 拡張モード選択時
  const extension = checkbox('checkbox__others_extension');
  document.querySelectorAll('.normal:not(.hide)').forEach((v, i, a) => {
    v.hidden = extension;
  });
  document.querySelectorAll('.extension:not(.hide)').forEach((v, i, a) => {
    v.hidden = !extension;
  });
  // フォーマット2
  const format2 = checkbox('checkbox__others_format2');
  document.querySelectorAll('.format2:not(.hide)').forEach((v, i, a) => {
    v.hidden = !(extension && format2);
  });
  // 拡張メニュー
  const exmenus = format2 && checkbox('checkbox__others_extend_menus');
  document.getElementById('checkbox__others_extend_menus').disabled = !format2;
  document.querySelectorAll('.extend_menus:not(.hide)').forEach((v, i, a) => {
    v.hidden = !(extension && exmenus);
  });
  // タイトル編集
  const edit = checkbox('checkbox__others_edit_menu_title');
  document.querySelectorAll('.menu_label').forEach((element) => {
    element.hidden = extension && edit;
  });
  document.querySelectorAll('.menu_title').forEach((element) => {
    element.hidden = !(extension && edit);
  });
  
  // ブラウザアクションの更新
  if (isMobile()) {
    if (action && !checkbox('checkbox__popup_comlate')) {
      // Android Firefoxでは、一度ポップアップを有効化すると、無効化できない
      // そのため、設定反映には再起動が必要
      chrome.browserAction.getPopup({}, (url) => {
        if (!(url == null || url == '')) {
          document.getElementById('browser_option').hidden = false;
        }
      });
    } else {
      document.getElementById('browser_option').hidden = true;
    }
  }
};

// ショートカットを更新
function updateShortcut() {
  // ショートカット2の有効と無効
  if (isFirefox() && !isMobile()) {
    let extension = checkbox('checkbox__others_extension');
    let format2 = checkbox('checkbox__others_format2');
    if (extension && format2) {
      onUpdateShortcut.bind(document.getElementById('shortcut4'))();
    } else {
      chrome.commands.reset('shortcut_action2');
    }
  }
};

// コンテキストメニュー変更イベント
function onUpdateOptions() {
  getStorageArea().get(defaultStorageValueSet, (valueSet) => {
    Object.keys(valueSet).forEach((v, i, a) => {
      if (v.startsWith('checkbox__')) {
        valueSet[v] = checkbox(v);
      } else if (v.startsWith('select__')) {
        
      } else {
        delete valueSet[v];
      }
    });
    valueSet['select__browser_action'] = radio('browser_action');
    valueSet['select__browser_action_target'] = radio('browser_action_target');
    
    // ストレージへ設定を保存
    getStorageArea().set(valueSet, () => {
      updateShortcut();
      updateBrowserAction();
      updateContextMenus();
      updateOptionPage();
    });
  });
};

// コンテキストメニューの更新イベント
function onUpdateMenus() {
  getStorageArea().get(['menus'], (valueSet) => {
    for (var i=0; i<valueSet.menus.length; i++) {
      valueSet.menus[i].enable = document.getElementById('menu'+i).checked;
      valueSet.menus[i].title = document.getElementById('menu'+i+'_title').value;
      if (valueSet.menus[i].format >= 5) {
        valueSet.menus[i].target = document.getElementById('menu'+i+'_target').value;
        //document.getElementById('format'+valueSet.menus[i].format+'_title').textContent = valueSet.menus[i].title;
      }
    }
    getStorageArea().set(valueSet, () => {
      updateContextMenus();
    });
  });
};

// フォーマット文字列の更新イベント
function onUpdateFormat() {
  getStorageArea().get(['formats'], (valueSet) => {
    for (var i=3; i<valueSet.formats.length; i++) {
      valueSet.formats[i].format = document.getElementById('format'+i).value;
    }
    getStorageArea().set(valueSet, () => {});
  });
};

// コマンド文字列の更新イベント
function onUpdateShortcut() {
  const element = this;
  if (isFirefox() && !isMobile()) {
    getStorageArea().get(['formats'], (oldValueSet) => {
      const newValueSet = {formats:JSON.parse(JSON.stringify(oldValueSet.formats))};
      const index = element.id.match(/\d+$/)[0];
      const name = 'shortcut_action'+(index>3 ? (index-2)+'' : '');
      try {
        newValueSet.formats[index].shortcut = element.value;
        if (element.value != '') {
          chrome.commands.update({name:name, shortcut:element.value});
        } else {
          chrome.commands.reset(name);
        }
        getStorageArea().set(newValueSet, () => {});
        element.style.background = '';
      } catch (e) {
        // 直前の成功状態に戻す
        if (oldValueSet.formats[index].shortcut != '') {
          chrome.commands.update({name:name, shortcut:oldValueSet.formats[index].shortcut});
        } else {
          chrome.commands.reset(name);
        }
        element.style.background = '#ffeaee';
      }
    });
  }
  // 制約：オプション画面表示中にショートカット変更画面からショートカットが変更された場合、
  //       オプション画面の設定には反映されない。
  //       その場合、オプション画面・ショートカット変更画面のどちらかで最後に設定したものが優先される。
  // ショートカット変更画面(https://support.mozilla.org/en-US/kb/manage-extension-shortcuts-firefox)
};

// オプション画面に値を設定する
function setOptionPageValues(valueSet) {
  // ストレージ内の値で初期化
  Object.keys(defaultStorageValueSet).forEach((v, i, a) => {
    if (v.startsWith('checkbox__')) {
      checkbox(v, valueSet[v]);
    }
  });
  radio('browser_action', valueSet);
  radio('browser_action_target', valueSet);
  
  for (let i=0; i<valueSet.menus.length; i++) {
    document.getElementById('menu'+i).checked  = !!valueSet.menus[i].enable;
    document.getElementById('menu'+i+'_title').value = valueSet.menus[i].title;
    if (valueSet.menus[i].format >= 5) {
      document.getElementById('menu'+i+'_target').value = valueSet.menus[i].target;
      //document.getElementById('format'+valueSet.menus[i].format+'_title').textContent = valueSet.menus[i].title;
    }
  }
  for (let i=3; i<valueSet.formats.length; i++) {
    document.getElementById('format'+i).value  = valueSet.formats[i].format;
  }
  if (!isMobile()) {
    if (isFirefox()) {
      const newValueSet = {formats:JSON.parse(JSON.stringify(valueSet.formats))};
      chrome.commands.getAll((commands) => {
        for (let i=0; i<commands.length; i++) {
          const id = commands[i].description.match(/\d+$/)[0]-0+2;
          document.getElementById('shortcut'+id).value  = commands[i].shortcut;
          newValueSet.formats[id].shortcut = commands[i].shortcut;
        }
        getStorageArea().set(newValueSet, () => {});
      });
    } else {
      chrome.commands.getAll((commands) => {
        const shortcuts = [];
        for (let i=0; i<commands.length; i++) {
          if (commands[i].description.startsWith('format') && commands[i].shortcut != '') {
            shortcuts.push(commands[i].description + ': ' + commands[i].shortcut);
          }
        }
        if (shortcuts.length) {
          // '\n'改行を挿入するため、innerTextとする
          document.getElementById('shortcut_commands').innerText = '\n\n'+shortcuts.join('\n');
        }
      });
    }
  }
};

// 初期化ボタンイベント
function onReset() {
  const element = this;
  // ボタンを元に戻す
  function onStop() {
    onReset.delay = 0;
    clearInterval(onReset.id);
    element.textContent = document.getElementById('optionPage_Reset').textContent;
  };
  // 2段階確認待ち
  function onDelay() {
    onReset.delay--;
    if (onReset.delay == 0) {
      onStop();
    } else {
      element.textContent = document.getElementById('optionPage_ConfirmReset').textContent;
    }
  };
  if (onReset.delay == 0) {
    // 2段階確認開始
    onReset.delay = 10;
    clearInterval(onReset.id);
    onReset.id = setInterval(onDelay, 1000, 1000);
    onDelay();
  } else {
    // 2段階確認の決定
    onStop();
    getStorageArea().clear(() => {
      getStorageArea().set(defaultStorageValueSet, () => {
        setOptionPageValues(defaultStorageValueSet);
        updateShortcut();
        updateBrowserAction();
        updateContextMenus();
        updateOptionPage();
      });
    });
  }
};
onReset.id = 0;
onReset.delay = 0;

// ページ初期化
function onInit() {
  // 初期化ボタンの設定（最優先で設定する）
  document.getElementById('reset').addEventListener('click', onReset);
  
  if (isMobile()) {
    // AndroidFirefox非対応
    // コンテキストメニュー
    // キーボードショートカット
    // ピン留めタブ
    // 選択タブ
    document.querySelectorAll('.desktop').forEach((v, i, a) => {
      v.classList.add('hide');
    });
  }
  if (isChrome()) {
    // Chrome非対応
    // タブコンテキストメニュー
    // キーボードショートカット（拡張機能による設定）
    document.querySelectorAll('.firefox').forEach((v, i, a) => {
      v.classList.add('hide');
    });
  }
  if (isFirefox()) {
    // Firefox非対応
    // キーボードショートカット（標準機能による設定）
    document.querySelectorAll('.chrome').forEach((v, i, a) => {
      v.classList.add('hide');
    });
  }
  // (storage内の)初期値を設定
  getStorageArea().get(defaultStorageValueSet, (valueSet) => {
    setOptionPageValues(valueSet);
    updateOptionPage();
  });
  
  // イベント設定
  document.querySelectorAll('[type="checkbox"]:not(.menu)').forEach((element) => {
    element.addEventListener('click', onUpdateOptions);
  });
  document.querySelectorAll('[type="radio"]').forEach((element) => {
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
  document.querySelectorAll('.shortcut').forEach((element) => {
    element.addEventListener('input', onUpdateShortcut);
  });
  // 開発者用
  if (false) {
    document.getElementById('setting').hidden = false;
    document.getElementById('setting_get').addEventListener('click', () => {
      getStorageArea().get(null, (valueSet) => {
        document.getElementById('setting_json').value = JSON.stringify(valueSet, null, 2);
      });
    });
    document.getElementById('setting_set').addEventListener('click', () => {
      const json = JSON.parse(document.getElementById('setting_json').value);
      getStorageArea().clear(() => {
        getStorageArea().set(json, () => {});
      });
    });
    document.getElementById('setting_clear').addEventListener('click', () => {
      getStorageArea().clear(() => {
      });
    });
  }
};

(function main() {
  //document.addEventListener("DOMContentLoaded", onInit);
  onInit();
})();
