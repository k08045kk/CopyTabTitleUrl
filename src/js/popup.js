/**
 * ポップアップページ処理
 */

// コピー完了イベント
function onTabCopyComplete() {
  window.close();
}

// ページ読み込み完了イベント
function onInit() {
  // テキスト読込み(国際化)
  //document.querySelectorAll('*[data-label]').forEach(function(v, i, a) {
  //  v.textContent = chrome.i18n.getMessage(v.dataset.label);
  //});
  
  // チェックボックスイベント設定
  function onClickCheckbox() {
    let win = document.getElementById('target_win');
    let all = document.getElementById('target_all');
    
    if (this.id == 'target_win_label' && !win.checked && all.checked) {
      all.checked = false;
    }
    if (this.id == 'target_all_label' && !all.checked && win.checked) {
      win.checked = false;
    }
  }
  document.getElementById('target_win_label').addEventListener('click', onClickCheckbox);
  document.getElementById('target_all_label').addEventListener('click', onClickCheckbox);
  
  // コピーイベント設定
  ['CopyTabTitleUrl', 'CopyTabTitle', 'CopyTabUrl', 'CopyTabFormat', 'CopyTabFormat2']
  .forEach(function(v, i, a) {
    document.getElementById('item_'+v).addEventListener('click', function() {
      let win = document.getElementById('target_win');
      let all = document.getElementById('target_all');
      let target = {currentWindow:true, active:true};
      if (win.checked) {  target = {currentWindow:true};  }
      if (all.checked) {  target = {};  }
      
      onCopyTabs(i, target, null, onTabCopyComplete);
    });
  });
  
  // アクション
  getStorageArea().get(defaultStorageValueSet, function(valueSet) {
    if (valueSet.action == 'Action') {
      // アクションのみ(完了通知を表示する)
      let targetSet = {CurrentTab: {currentWindow:true, active:true}, 
                        CurrentWindow: {currentWindow:true}, 
                        AllWindow: {}};
      let actionSet = {CopyTabTitleUrl:0, CopyTabTitle:1, CopyTabUrl:2, CopyTabFormat:3};
      let type = actionSet[valueSet.action_action];
      let query = targetSet[valueSet.action_target];
      
      onCopyTabs(type, query, valueSet, function() {
        setTimeout(onTabCopyComplete, 1000);
      });
      document.getElementById('action').style.display = '';
    } else {
      if (valueSet.format_extension && valueSet.format_format2) {
        document.getElementById('item_CopyTabFormat2').style.display = '';
      }
      // ポップアップを表示する
      document.getElementById('panel').style.display = '';
    }
  });
}

(function main() {
  document.addEventListener("DOMContentLoaded", onInit);
})();
