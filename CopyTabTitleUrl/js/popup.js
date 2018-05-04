/**
 * ポップアップページ処理
 */

// ページ読み込み完了イベント
function onPageLoaded() {
  // テキスト読込み(国際化)
  document.querySelectorAll('*[data-label]').forEach(function(v, i, a) {
    v.textContent = chrome.i18n.getMessage(v.dataset.label);
  });
}
//document.addEventListener('DOMContentLoaded', onPageLoaded);
onPageLoaded();

// アクション設定
function onTabCopyComplete() {
  window.close();
}
['CopyTabTitleUrl', 'CopyTabTitle', 'CopyTabUrl', 'CopyTabFormat'].forEach(function(v, i, a) {
  document.getElementById('item_'+v).addEventListener('click', function() {
    onCopyTabs(i, {currentWindow:true, active:true}, onTabCopyComplete);
  });
  document.getElementById('current_'+v).addEventListener('click', function() {
    onCopyTabs(i, {currentWindow:true}, onTabCopyComplete);
  });
  document.getElementById('all_'+v).addEventListener('click', function() {
    onCopyTabs(i, {}, onTabCopyComplete);
  });
});

