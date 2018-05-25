﻿/**
 * オプションページ処理
 */

// メニュー更新
function updateContextMenu() {
  // ALL選択時は、PAGEを無効化
  document.getElementById('menu_page').disabled = 
      document.getElementById('menu_all').checked;
}

// ページ読み込み完了イベント
function onPageLoaded() {
  if (!isFirefox()) {   // Chrome or Edge or Opera
    defaultStorageValueSet.menu_tab = false;
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
      }
    });
    document.getElementById('format_CopyTabFormat').value = item.format_CopyTabFormat;
    
    // メニュー更新
    updateContextMenu();
  });
}
//document.addEventListener('DOMContentLoaded', onPageLoaded);
onPageLoaded();

// コンテキストメニュー変更イベント
function onUpdateContextMenu() {
  // メニュー更新
  updateContextMenu();
  
  // 設定を作成
  let valueSet = {};
  Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
    if (v.startsWith('menu_') || v.startsWith('item_')) {
      valueSet[v] = document.getElementById(v).checked;
    }
  });
  valueSet.format_CopyTabFormat = document.getElementById('format_CopyTabFormat').value
  
  // ストレージへ設定を保存
  getStorageArea().set(valueSet, function() {
    updateContextMenus();
  });
}
function onUpdateFormat() {
  // ストレージへ設定を保存
  getStorageArea().set({
    format_CopyTabFormat: document.getElementById('format_CopyTabFormat').value
  }, function() {
  });
}
Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
  if (v.startsWith('format_')) {
    document.getElementById(v).addEventListener('input', onUpdateFormat);
  } else {
    document.getElementById(v).addEventListener('click', onUpdateContextMenu);
  }
});

// 追加機能
['CopyTabTitleUrl', 'CopyTabTitle', 'CopyTabUrl', 'CopyTabFormat']
.forEach(function(v, i, a) {
  document.getElementById('current_'+v).addEventListener('click', function() {
    onCopyTabs(i, {currentWindow:true});
  });
  document.getElementById('all_'+v).addEventListener('click', function() {
    onCopyTabs(i, {});
  });
});
