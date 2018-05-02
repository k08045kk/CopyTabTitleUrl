// ページ読み込み完了イベント
function onPageLoaded() {
  // 多言語化
  var labels = document.querySelectorAll('*[data-label]');
  for (var i=0; i<labels.length; i++) {
    labels[i].textContent = chrome.i18n.getMessage(labels[i].dataset.label);
  }
  
  // 設定の読み込み
  getStorageArea()
    .get({
      'menu_all': false,
      'menu_tab': true,
      'item_CopyTabTitleUrl': true,
      'item_CopyTabTitle': true,
      'item_CopyTabUrl': true,
      'item_CopyTabAllTitleUrl': false,
      'item_CopyTabAllTitle': false,
      'item_CopyTabAllUrl': false
    }, function(item) {
      document.getElementById("menu_all").checked = item.menu_all;
      document.getElementById("menu_tab").checked = item.menu_tab;
      document.getElementById("item_CopyTabTitleUrl").checked = item.item_CopyTabTitleUrl;
      document.getElementById("item_CopyTabTitle").checked = item.item_CopyTabTitle;
      document.getElementById("item_CopyTabUrl").checked = item.item_CopyTabUrl;
      document.getElementById("item_CopyTabAllTitleUrl").checked = item.item_CopyTabAllTitleUrl;
      document.getElementById("item_CopyTabAllTitle").checked = item.item_CopyTabAllTitle;
      document.getElementById("item_CopyTabAllUrl").checked = item.item_CopyTabAllUrl;
    });
}
document.addEventListener('DOMContentLoaded', onPageLoaded);

// コンテキストメニュー変更イベント
function onUpdateContextMenu() {
  getStorageArea()
    .set({
      'menu_all': document.getElementById("menu_all").checked,
      'menu_tab': document.getElementById("menu_tab").checked,
      'item_CopyTabTitleUrl': document.getElementById("item_CopyTabTitleUrl").checked,
      'item_CopyTabTitle': document.getElementById("item_CopyTabTitle").checked,
      'item_CopyTabUrl': document.getElementById("item_CopyTabUrl").checked,
      'item_CopyTabAllTitleUrl': document.getElementById("item_CopyTabAllTitleUrl").checked,
      'item_CopyTabAllTitle': document.getElementById("item_CopyTabAllTitle").checked,
      'item_CopyTabAllUrl': document.getElementById("item_CopyTabAllUrl").checked
    }, function() {
      updateContextMenus();
    });
}
document.getElementById('menu_all').addEventListener('click', onUpdateContextMenu);
document.getElementById('menu_tab').addEventListener('click', onUpdateContextMenu);
document.getElementById('item_CopyTabTitleUrl').addEventListener('click', onUpdateContextMenu);
document.getElementById('item_CopyTabTitle').addEventListener('click', onUpdateContextMenu);
document.getElementById('item_CopyTabUrl').addEventListener('click', onUpdateContextMenu);
document.getElementById('item_CopyTabAllTitleUrl').addEventListener('click', onUpdateContextMenu);
document.getElementById('item_CopyTabAllTitle').addEventListener('click', onUpdateContextMenu);
document.getElementById('item_CopyTabAllUrl').addEventListener('click', onUpdateContextMenu);

// 追加機能
document.getElementById('func_all_CopyTabAllTitleUrl').addEventListener('click', function() {
  onCopyTabs(0, {});
});
document.getElementById('func_all_CopyTabAllTitle').addEventListener('click', function() {
  onCopyTabs(1, {});
});
document.getElementById('func_all_CopyTabAllUrl').addEventListener('click', function() {
  onCopyTabs(2, {});
});
document.getElementById('func_current_CopyTabAllTitleUrl').addEventListener('click', function() {
  onCopyTabs(0, {currentWindow: true});
});
document.getElementById('func_current_CopyTabAllTitle').addEventListener('click', function() {
  onCopyTabs(1, {currentWindow: true});
});
document.getElementById('func_current_CopyTabAllUrl').addEventListener('click', function() {
  onCopyTabs(2, {currentWindow: true});
});
