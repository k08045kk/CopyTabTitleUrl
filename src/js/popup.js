/**
 * ポップアップページ処理
 * chrome-extension://fpfdaednnjcmaofiihhjmkmicdfndblk/html/popup.html
 */

// コピー完了イベント
function onTabCopyComplete() {
  if (isMobile()) {
    document.getElementById('action').hidden = false;
    setTimeout(() => {
      document.getElementById('action').hidden = true;
    }, 1000);
  } else {
    window.close();
  }
};

// ページ読み込み完了イベント
function onInit() {
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
  };
  document.getElementById('target_win_label').addEventListener('click', onClickCheckbox);
  document.getElementById('target_all_label').addEventListener('click', onClickCheckbox);
  
  // コピーイベント設定
  document.querySelectorAll('.copy').forEach((element) => {
    element.addEventListener('click', (event) => {
      // ポップアップ表示のイベント
      const id = event.target.id.match(/\d+$/)[0]-0;
      getStorageArea().get(defaultStorageValueSet, (valueSet) => {
        const win = document.getElementById('target_win');
        const all = document.getElementById('target_all');
        let target = 'tab';
        if (id >= 5) {
          const menuid = event.target.dataset.menu.match(/\d+$/)[0]-0;
          target = valueSet.menus[menuid].target;
        }
        if (win.checked) {  target = 'window';  }
        if (all.checked) {  target = 'all';  }
        
        valueSet.format = valueSet.formats[id].format;
        valueSet.target = target;
        onCopyTab(valueSet, onTabCopyComplete);
      });
    });
  });
  
  // アクション
  getStorageArea().get(defaultStorageValueSet, (valueSet) => {
    if (valueSet.select__browser_action == 'action') {
      // アクションのみ(完了通知を表示する)
      valueSet.format = valueSet.formats[3].format;
      valueSet.target = valueSet.select__browser_action_target;
      onCopyTab(valueSet, () => {
        document.getElementById('action').hidden = false;
        setTimeout(onTabCopyComplete, 1000);
      });
    } else {
      // ポップアップ表示する
      if (extension(valueSet, 'others_format2', true)) {
        document.querySelectorAll('.format2:not(.hide)').forEach((v, i, a) => {
          v.hidden = false;
        });
      }
      /*
      // 時期未定（拡張コンテキストメニューのブラウザアクション対応）
      // タイトル編集 + 有効無効判定について要検討
      if (extension(valueSet, 'others_extend_menus', true)) {
        document.querySelectorAll('.extend_menus:not(.hide)').forEach((v, i, a) => {
          const id = v.dataset.menu.match(/\d+$/)[0]-0;
          v.hidden = !valueSet.menus[id].enable;
        });
      }
      */
      document.getElementById('panel').hidden = false;
    }
  });
};

(function main() {
  //document.addEventListener("DOMContentLoaded", onInit);
  onInit();
})();
