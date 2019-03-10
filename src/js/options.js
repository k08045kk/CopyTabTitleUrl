/**
 * オプションページ処理
 */

// ラジオボタンの選択値
function getRadioCheckItem(name) {
  let elements = document.getElementsByName(name);
  for (let i=0; i<elements.length; i++) {
    if (elements[i].checked) {
      return elements[i].value;
    }
  }
  return '';
}

// オプション画面の更新
// 注意：ブラウザアクション更新後に実行すること
function updateOptionPage() {
  let extension = document.getElementById('format_extension').checked;
  if (extension && document.getElementById('format_language').checked) {
    document.querySelectorAll('*[data-label]').forEach(function(v, i, a) {
      v.textContent = v.dataset.english;
    });
  } else {
    document.querySelectorAll('*[data-label]').forEach(function(v, i, a) {
      v.textContent = chrome.i18n.getMessage(v.dataset.label);
    });
  }
  
  // ALL選択時は、PAGEを無効化
  document.getElementById('menu_page').disabled = 
      document.getElementById('menu_all').checked;
  document.getElementById('menu_browser_action').disabled = 
      document.getElementById('menu_all').checked;
  
  // コピー完了通知
  document.getElementById('browser_ShowPopup').disabled = 
      !document.getElementById('ba_Action').checked;
  
  // BrowserActionのAction選択時のみアクション一覧表示
  document.getElementById('bat').style.display = 
      document.getElementById('ba_Action').checked? '': 'none';
  
  // コンテキストメニュー選択時
  let menu = document.getElementById('menu_all').checked
          || document.getElementById('menu_page').checked
          || document.getElementById('menu_browser_action').checked
          || (isFirefox() && document.getElementById('menu_tab').checked);
  document.getElementById('item').style.display = menu? '': 'none';
  
  // フォーマット拡張モード選択時
  let format2 = document.getElementById('format_format2').checked;
  document.getElementById('format_FormatMessage').style.display = extension? 'none': '';
  document.querySelectorAll('.extension:not(.hide)').forEach(function(v, i, a) {
    v.style.display = extension? '': 'none';
  });
  if (extension) {
    // フォーマット2選択時
    document.querySelectorAll('.format2:not(.hide)').forEach(function(v, i, a) {
      v.style.display = format2? '': 'none';
    });
  }
  
  // ブラウザアクションの更新
  let action = getRadioCheckItem('ba');
  if (action == 'Popup' || document.getElementById('browser_ShowPopup').checked) {
    document.getElementById('browser_option').style.display = 'none';
  } else if (isMobile()) {
    // Android Firefoxでは、一度ポップアップを有効化すると、無効化できない。
    // そのため、設定反映には再起動が必要
    chrome.browserAction.getPopup({}, function(url) {
      if (!(url == null || url == '')) {
        document.getElementById('browser_option').style.display = '';
      }
    });
  }
}

// ショートカットを更新
function updateShortcut() {
  // ショートカット2の有効と無効
  if (isFirefox() && !isMobile()) {
    let extension = document.getElementById('format_extension').checked;
    let format2 = document.getElementById('format_format2').checked;
    if (extension && format2) {
      onUpdateCommand.bind(document.getElementById('shortcut_command2'))();
    } else {
      chrome.commands.reset('shortcut_action2');
    }
  }
}

// コンテキストメニュー変更イベント
function onUpdateContextMenu() {
  // 設定を作成
  let valueSet = {};
  Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
    if (v.startsWith('menu_') || v.startsWith('item_') || v.startsWith('browser_')) {
      valueSet[v] = document.getElementById(v).checked;
    } else if (v.startsWith('format_') && !v.startsWith('format_CopyTabFormat')) {
      valueSet[v] = document.getElementById(v).checked;
    }
  });
  valueSet.action = getRadioCheckItem('ba');
  valueSet.action_target = getRadioCheckItem('bat');
  
  // ストレージへ設定を保存
  getStorageArea().set(valueSet, function() {
    updateShortcut();
    updateBrowserAction();
    if (!isMobile()) {
      updateContextMenus();
    }
    // メニュー更新
    updateOptionPage();
  });
}

// フォーマット文字列の更新イベント
function onUpdateFormat() {
  // ストレージへ設定を保存
  getStorageArea().set({
    format_CopyTabFormat:  document.getElementById('format_CopyTabFormat').value,
    format_CopyTabFormat2: document.getElementById('format_CopyTabFormat2').value
  }, function() {});
}

// コマンド文字列の更新イベント
function onUpdateCommand() {
  if (isFirefox() && !isMobile()) {
    const id = this.id;
    const name = this.id.replace('command', 'action');
    const cmd = this.value;
    try {
      if (cmd != '') {
        chrome.commands.update({name:name,shortcut:cmd});
      } else {
        chrome.commands.reset(name);
      }
      getStorageArea().set({
        shortcut_command:  document.getElementById('shortcut_command').value,
        shortcut_command2: document.getElementById('shortcut_command2').value
      }, function() {});
      this.style.background = '';
    } catch (e) {
      // 直前の成功状態に戻す
      getStorageArea().get(defaultStorageValueSet, function(valueSet) {
        if (valueSet[id] != '') {
          chrome.commands.update({name:name,shortcut:valueSet[id]});
        } else {
          chrome.commands.reset(name);
        }
      });
      this.style.background = '#ffeaee';
    }
  }
}

// オプション画面に値を設定する
function setOptionPageValues(valueSet) {
  // ストレージ内の値で初期化
  Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
    if (v.startsWith('menu_') || v.startsWith('item_') || v.startsWith('browser_')) {
      document.getElementById(v).checked = valueSet[v];
    } else if (v.startsWith('format_') && !v.startsWith('format_CopyTabFormat')) {
      document.getElementById(v).checked = valueSet[v];
    }
  });
  document.getElementById('format_CopyTabFormat').value  = valueSet.format_CopyTabFormat;
  document.getElementById('format_CopyTabFormat2').value = valueSet.format_CopyTabFormat2;
  document.getElementById('ba_'+valueSet.action).checked = true;
  document.getElementById('bat_'+valueSet.action_target).checked = true;
  if (!isMobile()) {
    if (isFirefox()) {
      document.getElementById('shortcut_command').value  = valueSet.shortcut_command;
      document.getElementById('shortcut_command2').value = valueSet.shortcut_command2;
    } else {
      chrome.commands.getAll(function(commands) {
        let text = '';
        for (let i=0; i<commands.length; i++) {
          if (commands[i].shortcut != '') {
            text = text + commands[i].description + ': ' + commands[i].shortcut + '\n';
          }
        }
        // '\n'改行を挿入するため、innerTextとする
        document.getElementById('shortcut_commands').innerText = text;
      });
      document.getElementById('shortcut_message').style.display = '';
    }
  }
}

// 初期化ボタンイベント
function onReset() {
  let element = this;
  // ボタンを元に戻す
  function onStop() {
    onReset.delay = 0;
    clearInterval(onReset.id);
    element.textContent = document.getElementById('optionsPage_Reset').textContent;
  }
  // 2段階確認待ち
  function onDelay() {
    onReset.delay--;
    if (onReset.delay == 0) {
      // タイムアウト(元に戻す)
      onStop();
    } else {
      // カウントダウン
      element.textContent = document.getElementById('optionsPage_ConfirmReset').textContent;
    }
  }
  if (onReset.delay == 0) {
    // 2段階確認開始
    onReset.delay = 10;
    clearInterval(onReset.id);
    onReset.id = setInterval(onDelay, 1000, 1000);
    onDelay();
  } else {
    // 2段階確認の決定
    onStop();
    getStorageArea().set(defaultStorageValueSet, function() {
      setOptionPageValues(defaultStorageValueSet);
      updateShortcut();
      updateBrowserAction();
      if (!isMobile()) {
        updateContextMenus();
      }
      updateOptionPage();
    });
  }
}
onReset.id = 0;
onReset.delay = 0;

// ページ初期化
function onInit() {
  if (isMobile()) {
    document.getElementById('context_menu').classList.add('hide');
    document.getElementById('format_pin_').classList.add('hide');
    document.getElementById('format_selected_').classList.add('hide');
    document.getElementById('shortcut').classList.add('hide');
    document.getElementById('shortcut2').classList.add('hide');
  }
  if (isChrome()) {
    // Chromeのオプション画面の最小サイズを指定する
    // FirefoxAndroid版を考慮してCSSでの指定は行わない
    // ChromeAndroid版はない
    // Chromeの拡張機能画面は600px程度で固定画面のため、オプション画面が600px固定でも問題ない
    document.body.style.width = '600px';
    
    // タブコンテキストメニュー&ショートカット(Chrome非対応)
    getStorageArea().set({menu_tab: false});
    document.getElementById('menu_tab_').classList.add('hide');
    document.getElementById('shortcut').classList.add('hide');
    document.getElementById('shortcut2').classList.add('hide');
  }
  
  // テキスト読込み(国際化)
  if (chrome.i18n.getUILanguage().startsWith('en')) {
    document.getElementById('format_language_').classList.add('hide');
  }
  
  // (storage内の)初期値を設定
  getStorageArea().get(defaultStorageValueSet, function(valueSet) {
    setOptionPageValues(valueSet);
    updateOptionPage();
  });
  
  // イベント設定
  Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
    if (v.startsWith('format_CopyTabFormat')) {
      document.getElementById(v).addEventListener('input', onUpdateFormat);
    } else if (v.startsWith('shortcut_command')) {
      document.getElementById(v).addEventListener('input', onUpdateCommand);
    } else if (v == 'action' || v == 'action_target') {
    } else {
      document.getElementById(v).addEventListener('click', onUpdateContextMenu);
    }
  });
  document.getElementById('ba_Popup').addEventListener('click', onUpdateContextMenu);
  document.getElementById('ba_Action').addEventListener('click', onUpdateContextMenu);
  ['CurrentTab', 'CurrentWindow', 'AllWindow'].forEach(function(v, i, a) {
    document.getElementById('bat_'+v).addEventListener('click', onUpdateContextMenu);
  });
  document.getElementById('reset').addEventListener('click', onReset);
}

(function main() {
  document.addEventListener("DOMContentLoaded", onInit);
})();
