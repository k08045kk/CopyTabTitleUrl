/**
 * オプションページ処理
 */

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
  
  let extension = document.getElementById('format_extension').checked;
  if (extension) {
    document.getElementById('format_FormatMessage').innerHTML = ''
        + '${title}, ${url}, ${index}, ${tab}, ${enter}, ${CR}, ${LF}.<br/>example: [${title}](${url})';
    document.getElementById('format_enter').parentNode.style.display = 'block';
    document.getElementById('format_html').parentNode.style.display = 'block';
  } else {
    document.getElementById('format_FormatMessage').innerHTML = ''
        + '${title}, ${url}.<br/>example: [${title}](${url})';
    document.getElementById('format_enter').parentNode.style.display = 'none';
    document.getElementById('format_html').parentNode.style.display = 'none';
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
  
  getStorageArea().get(defaultStorageValueSet, function(item) {
    // ストレージ内の値で初期化
    Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
      if (v.startsWith('menu_') || v.startsWith('item_')) {
        document.getElementById(v).checked = item[v];
      } else if (v.startsWith('format_') && v != 'format_CopyTabFormat') {
        document.getElementById(v).checked = item[v];
      }
    });
    document.getElementById('format_CopyTabFormat').value = item.format_CopyTabFormat;
    document.getElementById('ba_'+item.action).checked = true;
    document.getElementById('bat_'+item.action_target).checked = true;
    document.getElementById('baa_'+item.action_action).checked = true;
    
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
    if (v.startsWith('menu_') || v.startsWith('item_')) {
      valueSet[v] = document.getElementById(v).checked;
    } else if (v.startsWith('format_') && v != 'format_CopyTabFormat') {
      valueSet[v] = document.getElementById(v).checked;
    }
  });
  valueSet.format_CopyTabFormat = document.getElementById('format_CopyTabFormat').value
  valueSet.action = getRadioCheckItem('ba');
  valueSet.action_target = getRadioCheckItem('bat');
  valueSet.action_action = getRadioCheckItem('baa');
  
  // ストレージへ設定を保存
  getStorageArea().set(valueSet, function() {
    updateContextMenus();
  });
}
function onUpdateFormat() {
  // ストレージへ設定を保存
  getStorageArea().set({
    format_CopyTabFormat: document.getElementById('format_CopyTabFormat').value
  }, function() {});
}
Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
  if (v == 'format_CopyTabFormat') {
    document.getElementById(v).addEventListener('input', onUpdateFormat);
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
