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

// 追加機能(Firefox only)
['CopyTabTitleUrl', 'CopyTabTitle', 'CopyTabUrl'].forEach(function(v, i, a) {
  document.getElementById('item_'+v).addEventListener('click', function() {
    onCopyTabs(i, {currentWindow:true, active:true});
    window.close();
  });
  document.getElementById('current_'+v).addEventListener('click', function() {
    onCopyTabs(i, {currentWindow:true});
    window.close();
  });
  document.getElementById('all_'+v).addEventListener('click', function() {
    onCopyTabs(i, {});
    window.close();
  });
});

