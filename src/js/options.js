/**
 * オプションページ処理
 */

if (isMobile()) {
  document.getElementById('context_menu').classList.add('hide');
  document.getElementById('format_pin_').classList.add('hide');
  document.getElementById('shortcut').classList.add('hide');
  document.getElementById('shortcut2').classList.add('hide');
}
if (isChrome()) {
  // Chromeのオプション画面の最小サイズを指定する
  // FirefoxAndroid版を考慮してCSSでの指定は行わない
  // ChromeAndroid版はない
  // Chromeの拡張機能画面は600px程度で固定画面のため、オプション画面が600px固定でも問題ない
  document.body.style.width = '600px';
}

function getRadioCheckItem(name) {
  let elements = document.getElementsByName(name);
  for (let i=0; i<elements.length; i++) {
    if (elements[i].checked) {
      return elements[i].value;
    }
  }
  return '';
}

// メニュー更新
function updateMenu() {
  // ALL選択時は、PAGEを無効化
  document.getElementById('menu_page').disabled = 
      document.getElementById('menu_all').checked;
  
  // コピー完了通知
  document.getElementById('browser_ShowPopup').disabled = 
      !document.getElementById('ba_Action').checked;
  
  // BrowserActionのAction選択時のみアクション一覧表示
  let action = document.getElementById('ba_Action').checked? '': 'none';
  document.getElementById('bat').style.display = action;
  document.getElementById('baa').style.display = action;
  if (action == 'block') {
    // 対象範囲次第で翻訳を変更
    let target = getRadioCheckItem('bat');
    document.querySelectorAll('#baa label[data-label]').forEach(function(v, i, a) {
      let t = v.dataset.label;
      if (target != 'CurrentTab') {
        // contextMenu_CopyTab... Allを挿入
        t = t.slice(0, 19) + 'All' + t.slice(19, t.length);
      }
      v.textContent = chrome.i18n.getMessage(t);
    });
  }
  
  // BrowserActionのAction選択時のみアクション一覧表示
  let menu = document.getElementById('menu_all').checked
          || document.getElementById('menu_page').checked
          || document.getElementById('menu_tab').checked;
  document.getElementById('item').style.display = menu? '': 'none';
  
  if (document.getElementById('format_extension').checked) {
    document.getElementById('format_FormatMessage').innerHTML = ''
        + '<p>${title}, ${url}, ${index}, ${tab}, ${enter}, ${CR}, ${LF}.<br/>example: [${title}](${url})</p>';
    document.querySelectorAll('.extension:not(.hide)').forEach(function(v, i, a) {
      v.style.display = '';
    });
    if (document.getElementById('format_format2').checked) {
      document.querySelectorAll('.format2:not(.hide)').forEach(function(v, i, a) {
        v.style.display = '';
      });
      if (isFirefox()) {
        onUpdateCommand.bind(document.getElementById('shortcut_command2'))();
      }
    } else {
      document.querySelectorAll('.format2:not(.hide)').forEach(function(v, i, a) {
        v.style.display = 'none';
      });
      if (isFirefox()) {
        chrome.commands.reset('shortcut_action2');
      }
    }
  } else {
    document.getElementById('format_FormatMessage').innerHTML = ''
        + '<p>${title}, ${url}.<br/>example: [${title}](${url})</p>';
    document.querySelectorAll('.extension:not(.hide)').forEach(function(v, i, a) {
      v.style.display = 'none';
    });
    if (isFirefox()) {
      chrome.commands.reset('shortcut_action2');
    }
  }
}

// ページ初期化
function onPageLoaded() {
  if (!isFirefox()) {   // Chrome or Edge or Opera
    getStorageArea().set({menu_tab: false});
    document.getElementById('menu_tab').parentNode.style.display = 'none';
  }
  
  // テキスト読込み(国際化)
  document.querySelectorAll('*[data-label]').forEach(function(v, i, a) {
    v.textContent = chrome.i18n.getMessage(v.dataset.label);
  });
  
  getStorageArea().get(defaultStorageValueSet, function(valueSet) {
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
    document.getElementById('baa_'+valueSet.action_action).checked = true;
    if (!isMobile()) {
      if (isFirefox()) {
        document.getElementById('shortcut_command').value = valueSet.shortcut_command;
        document.getElementById('shortcut_command2').value = valueSet.shortcut_command2;
      } else {
        document.getElementById('shortcut').classList.add('hide');
        document.getElementById('shortcut2').classList.add('hide');
        document.getElementById('shortcut_message').style.display = '';
        chrome.commands.getAll(function(commands) {
          for (let i=commands.length-1; i>=0; i--) {
            if (commands[i].shortcut != '') {
              document.getElementById('shortcut_message').innerText = ''
                + commands[i].description+': '+commands[i].shortcut + '\n'
                + document.getElementById('shortcut_message').innerText;
            }
          }
        });
      }
    } else if (!(valueSet.action == 'Popup' || valueSet.browser_ShowPopup)) {
      // Android Firefoxでは、一度ポップアップを有効化すると、無効化できない。
      // そのため、設定反映には再起動が必要
      chrome.browserAction.getPopup({}, function(url) {
        if (!(url == null || url == '')) {
          document.querySelector('#browser_option').style.display = '';
        }
      });
    }
    
    // メニュー更新
    updateMenu();
  });
}
onPageLoaded();

// コンテキストメニュー変更イベント
function onUpdateContextMenu() {
  // メニュー更新
  updateMenu();
  
  // 設定を作成
  let valueSet = {};
  Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
    if (v.startsWith('menu_') || v.startsWith('item_') || v.startsWith('browser_')) {
      valueSet[v] = document.getElementById(v).checked;
    } else if (v.startsWith('format_') && !v.startsWith('format_CopyTabFormat')) {
      valueSet[v] = document.getElementById(v).checked;
    }
  });
  valueSet.format_CopyTabFormat  = document.getElementById('format_CopyTabFormat').value;
  valueSet.format_CopyTabFormat2 = document.getElementById('format_CopyTabFormat2').value;
  valueSet.shortcut_command  = document.getElementById('shortcut_command').value;
  valueSet.shortcut_command2 = document.getElementById('shortcut_command2').value;
  valueSet.action = getRadioCheckItem('ba');
  valueSet.action_target = getRadioCheckItem('bat');
  valueSet.action_action = getRadioCheckItem('baa');
  if (valueSet.action == 'Popup' || valueSet.browser_ShowPopup) {
    chrome.browserAction.setPopup({popup: '/html/popup.html'});
    document.querySelector('#browser_option').style.display = 'none';
  } else {
    chrome.browserAction.setPopup({popup: ''});
    if (isMobile()) {
      // Android Firefoxでは、一度ポップアップを有効化すると、無効化できない。
      // そのため、設定反映には再起動が必要
      document.querySelector('#browser_option').style.display = '';
    }
  }
  
  // ストレージへ設定を保存
  getStorageArea().set(valueSet, function() {
    if (!isMobile()) {
      updateContextMenus();
    }
  });
}
function onUpdateFormat() {
  // ストレージへ設定を保存
  getStorageArea().set({
    format_CopyTabFormat:  document.getElementById('format_CopyTabFormat').value,
    format_CopyTabFormat2: document.getElementById('format_CopyTabFormat2').value
  }, function() {});
}
function onUpdateCommand() {
  if (isFirefox() && !isMobile()) {
    const id = this.id;
    const name = this.id.replace('command', 'action');
    const cmd = this.value;
    try {
      if (cmd != '') {
        chrome.commands.update({
          'name': name,
          'shortcut': cmd
        });
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
          chrome.commands.update({
            'name': name,
            'shortcut': valueSet[id]
          });
        } else {
          chrome.commands.reset(name);
        }
      });
      this.style.background = '#ffeaee';
    }
  }
}
Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
  if (v.startsWith('format_CopyTabFormat')) {
    document.getElementById(v).addEventListener('input', onUpdateFormat);
  } else if (v.startsWith('shortcut_command')) {
    document.getElementById(v).addEventListener('input', onUpdateCommand);
  } else if (v == 'action' || v == 'action_target' || v == 'action_action') {
  } else {
    document.getElementById(v).addEventListener('click', onUpdateContextMenu);
  }
});
document.getElementById('ba_Popup').addEventListener('click', onUpdateContextMenu);
document.getElementById('ba_Action').addEventListener('click', onUpdateContextMenu);
['CurrentTab', 'CurrentWindow', 'AllWindow'].forEach(function(v, i, a) {
  document.getElementById('bat_'+v).addEventListener('click', onUpdateContextMenu);
});
['CopyTabTitleUrl', 'CopyTabTitle', 'CopyTabUrl', 'CopyTabFormat'].forEach(function(v, i, a) {
  document.getElementById('baa_'+v).addEventListener('click', onUpdateContextMenu);
});
