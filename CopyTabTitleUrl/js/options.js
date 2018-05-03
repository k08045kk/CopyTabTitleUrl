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
      if (!v.startsWith('format_')) {
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
    if (!v.startsWith('format_')) {
      valueSet[v] = document.getElementById(v).checked;
    }
  });
  valueSet.format_CopyTabFormat = document.getElementById('format_CopyTabFormat').value;
  
  // ストレージへ設定を保存
  getStorageArea().set(valueSet, function() {
    updateContextMenus();
  });
}
Object.keys(defaultStorageValueSet).forEach(function(v, i, a) {
  if (!v.startsWith('format_')) {
    document.getElementById(v).addEventListener('click', onUpdateContextMenu);
  } else {
    document.getElementById(v).addEventListener('input', onUpdateContextMenu);
  }
});

// 追加機能(Firefox only)
['CopyTabAllTitleUrl', 'CopyTabAllTitle', 'CopyTabAllUrl', 'CopyTabAllFormat']
.forEach(function(v, i, a) {
  document.getElementById('current_'+v).addEventListener('click', function() {
    onCopyTabs(i, {currentWindow: true}, null);
  });
  document.getElementById('all_'+v).addEventListener('click', function() {
    onCopyTabs(i, {}, null);
  });
});
