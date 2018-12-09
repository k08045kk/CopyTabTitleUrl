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

// アクション(ポップアップ表示なし時)
getStorageArea().get(defaultStorageValueSet, function(valueSet) {
  if (valueSet.action == 'Action') {
    // 2重にストレージを取得できないため、copyTabs関数を直呼びする
    let targetSet = {CurrentTab: {currentWindow:true, active:true}, 
                      CurrentWindow: {currentWindow:true}, 
                      AllWindow: {}};
    let actionSet = {CopyTabTitleUrl:0, CopyTabTitle:1, CopyTabUrl:2, CopyTabFormat:3};
    let type = actionSet[valueSet.action_action];
    let query = targetSet[valueSet.action_target];
    
    let msg = chrome.i18n.getMessage('optionsPage_CopyComplated');
    document.querySelector('.panel').innerHTML = '<p style="text-align:center;">'+msg+'</p>';
    copyTabs(type, query, valueSet, function() {
      setTimeout(function() {
        window.close();
      }, 1000);
    });
  }
});