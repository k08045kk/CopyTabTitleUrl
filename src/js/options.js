/**
 * オプションページ処理
 */

if (isMobile()) {
  document.getElementById('context_menu').classList.add('hide');
  document.getElementById('format_pin_').classList.add('hide');
  document.getElementById('shortcut').classList.add('hide');
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
  let action = document.getElementById('ba_Action').checked? 'block': 'none';
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
  document.getElementById('item').style.display = menu? 'block': 'none';
  
  if (document.getElementById('format_extension').checked) {
    document.getElementById('format_FormatMessage').innerHTML = ''
        + '<p>${title}, ${url}, ${index}, ${tab}, ${enter}, ${CR}, ${LF}.<br/>example: [${title}](${url})</p>';
    document.querySelectorAll('.extension:not(.hide)').forEach(function(v, i, a) {
      v.style.display = 'block';
    });
  } else {
    document.getElementById('format_FormatMessage').innerHTML = ''
        + '<p>${title}, ${url}.<br/>example: [${title}](${url})</p>';
    document.querySelectorAll('.extension:not(.hide)').forEach(function(v, i, a) {
      v.style.display = 'none';
    });
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
      } else if (v.startsWith('format_') && v != 'format_CopyTabFormat') {
        document.getElementById(v).checked = valueSet[v];
      }
    });
    document.getElementById('format_CopyTabFormat').value = valueSet.format_CopyTabFormat;
    document.getElementById('ba_'+valueSet.action).checked = true;
    document.getElementById('bat_'+valueSet.action_target).checked = true;
    document.getElementById('baa_'+valueSet.action_action).checked = true;
    if (!isMobile()) {
      if (isFirefox()) {
        document.getElementById('shortcut_command').value = valueSet.shortcut_command;
      } else {
        document.getElementById('shortcut_command').style.display = 'none';
        document.getElementById('shortcut_message').innerText = 'You can change the shortcut command from the standard setting. <chrome://extensions/shortcuts>';
        chrome.commands.getAll(function(commands) {
          for (let i=0; i<commands.length; i++) {
            if (commands[i].shortcut != '') {
              document.getElementById('shortcut_message').innerText = ''
                + commands[i].name+': '+commands[i].shortcut + '\n'
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
          document.querySelector('#browser_option').style.display = 'inline-block';
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
    } else if (v.startsWith('format_') && v != 'format_CopyTabFormat') {
      valueSet[v] = document.getElementById(v).checked;
    }
  });
  valueSet.format_CopyTabFormat = document.getElementById('format_CopyTabFormat').value;
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
      document.querySelector('#browser_option').style.display = 'inline-block';
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
    format_CopyTabFormat: document.getElementById('format_CopyTabFormat').value
  }, function() {});
}
function onUpdateCommand() {
  if (isFirefox() && !isMobile()) {
    try {
      const command = document.getElementById('shortcut_command').value;
      if (command != '') {
        chrome.commands.update({
          'name': 'shortcut_action',
          'shortcut': command
        });
      } else {
        chrome.commands.reset('shortcut_action');
      }
      getStorageArea().set({
        shortcut_command: command
      }, function() {});
      document.getElementById('shortcut_command').style.background = '';
    } catch (e) {
      // 直前の成功状態に戻す
      getStorageArea().get(defaultStorageValueSet, function(valueSet) {
        if (valueSet.shortcut_command != '') {
          chrome.commands.update({
            'name': 'shortcut_action',
            'shortcut': valueSet.shortcut_command
          });
        } else {
          chrome.commands.reset('shortcut_action');
        }
      });
      document.getElementById('shortcut_command').style.background = '#ffeaee';
    }
  }
}
Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
  if (v == 'format_CopyTabFormat') {
    document.getElementById(v).addEventListener('input', onUpdateFormat);
  } else if (v == 'shortcut_command') {
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

// 追加機能
['CopyTabTitleUrl', 'CopyTabTitle', 'CopyTabUrl', 'CopyTabFormat'].forEach(function(v, i, a) {
  document.getElementById('current_'+v).addEventListener('click', function() {
    onCopyTabs(i, {currentWindow:true});
  });
  document.getElementById('all_'+v).addEventListener('click', function() {
    onCopyTabs(i, {});
  });
});
