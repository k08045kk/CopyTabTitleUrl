/**
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
  // テキスト読込み(国際化)
  document.querySelectorAll('*[data-label]').forEach(function(v, i, a) {
    v.textContent = chrome.i18n.getMessage(v.dataset.label);
  });
  
  // ストレージから設定を読込み
  getStorageArea().get(defaultStorageValueSet, function(item) {
    Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
      document.getElementById(v).checked = item[v];
    });
    
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
    valueSet[v] = document.getElementById(v).checked;
  });
  
  // ストレージへ設定を保存
  getStorageArea().set(valueSet, function() {
    updateContextMenus();
  });
}
Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
  document.getElementById(v).addEventListener('click', onUpdateContextMenu);
});

// 追加機能(Firefox only)
['CopyTabAllTitleUrl', 'CopyTabAllTitle', 'CopyTabAllUrl'].forEach(function(v, i, a) {
  document.getElementById('current_'+v).addEventListener('click', function() {
    onCopyTabs(i, {currentWindow: true});
  });
  document.getElementById('all_'+v).addEventListener('click', function() {
    onCopyTabs(i, {});
  });
});
