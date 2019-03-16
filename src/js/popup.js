/**
 * ポップアップページ処理
 */

// コピー完了イベント
function onTabCopyComplete() {
  if (isMobile()) {
    document.getElementById('action').style.display = '';
    setTimeout(function() {
      document.getElementById('action').style.display = 'none';
    }, 1000);
  } else {
    window.close();
  }
}

// ページ読み込み完了イベント
function onInit() {
  // テキスト読込み(国際化)
  //document.querySelectorAll('*[data-label]').forEach(function(v, i, a) {
  //  v.textContent = chrome.i18n.getMessage(v.dataset.label);
  //});
  
  // オプション画面を表示する（右クリックメニューから表示できるため、不要では？）
  //document.getElementById('header').addEventListener('click', function() {
  //  chrome.runtime.openOptionsPage();
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
      onCopyTabs(3, getBrowserActionQuery(valueSet), valueSet, function() {
        setTimeout(onTabCopyComplete, 1000);
      });
      document.getElementById('action').style.display = '';
    } else {
      if (valueSet.format_extension && valueSet.format_format2) {
        document.querySelectorAll('.format2:not(.hide)').forEach(function(v, i, a) {
          v.style.display = '';
        });
      }
      // ポップアップを表示する
      document.getElementById('panel').style.display = '';
    }
  });
}

(function main() {
  document.addEventListener("DOMContentLoaded", onInit);
})();
