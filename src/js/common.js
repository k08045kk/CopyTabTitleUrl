/**
 * 共通処理
 */
var page = 'common';

// ブラウザ判定
function isFirefox() {
  try {
    browser;
    return true;
  } catch (e) {}
  return false;
}
function isChrome() {
  return !(isFirefox());
}

// モバイル判定
function isMobile() {
  let ua = window.navigator.userAgent.toLowerCase();
  return ua.indexOf('android') > 0
      || ua.indexOf('mobile') > 0
      || ua.indexOf('iphone') > 0
      || ua.indexOf('ipod') > 0;
}

// Windows判定
function isWindows() {
  return (window.navigator.platform.indexOf('Win') == 0);
}

// ストレージの初期値
var defaultStorageValueSet = {
  menu_all: false,
  menu_page: false,
  menu_tab: true,       // Firefox only
  item_CopyTabTitleUrl: true,
  item_CopyTabTitle: true,
  item_CopyTabUrl: true,
  item_CopyTabFormat: false,
  item_CopyTabAllTitleUrl: false,
  item_CopyTabAllTitle: false,
  item_CopyTabAllUrl: false,
  item_CopyTabAllFormat: false,
  action: 'Popup',
  action_target: 'CurrentTab',
  action_action: 'CopyTabTitleUrl',
  browser_ShowPopup: false,
  shortcut_command: 'Alt+C',
  format_CopyTabFormat: '[${title}](${url})',
  format_enter: true,
  format_html: false,
  format_pin: false,
  format_extension: false
};

// ストレージの取得
function getStorageArea() {
  //return (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
  return chrome.storage.local;
}

// 改行文字を取得
function getEnterCode() {
  return getEnterCode.code;
}
getEnterCode.code = isWindows()? '\r\n': '\n';

// コマンド作成
function createCommand(valueSet, type) {
  let command = {
    enter: valueSet.format_enter, 
    html: valueSet.format_html, 
    pin: valueSet.format_pin, 
    ex: valueSet.format_extension
  };
  command.format = ['${title}${enter}${url}', '${title}', '${url}', valueSet.format_CopyTabFormat][type];
  return command;
}

// クリップボードにコピー
function copyToClipboard(command, tabs) {
  // コピー文字列作成
  let temp = [];
  let enter = getEnterCode();
  for (let i=0; i<tabs.length; i++) {
    let format = command.format;
    if (command.ex) {
      format = format.replace(/\${index}/ig, i+1)
                     .replace(/\${tab}/ig, '\t')
                     .replace(/\${cr}/ig,  '\r')
                     .replace(/\${lf}/ig,  '\n');
    }
    format = format.replace(/\${title}/ig, tabs[i].title)
                 .replace(/\${url}/ig, tabs[i].url)
                 .replace(/\${enter}/ig, enter);
    temp.push(format);
  }
  let text = temp.join(command.enter? enter: '');
  
  // クリップボードコピー
  if (isMobile() && page == 'background') {
    // Android Firefox バックグラウンド限定処理
    // 補足
    // Android Firefox　バッググランドでは、execCommand('copy')が動作しない。
    // そのため、対象環境のみClicpboard APIを使用する。
    // なので、HTMLコピーできない。HTMLコピーには、about:configの設定が必要となる。
    // Clipboard API(Firefox63+実装)
    navigator.clipboard.writeText(text).then(function() {
      /* success */
    }, function() {
      /* failure */
    });
  } else {
    // 通常のクリップボードコピー処理
    function oncopy(event) {
      document.removeEventListener('copy', oncopy, true);
      event.stopImmediatePropagation();
      
      event.preventDefault();
      if (command.ex && command.html) {
        event.clipboardData.setData('text/html', text);
      } else {
        event.clipboardData.setData('text/plain', text);
      }
    }
    document.addEventListener('copy', oncopy, true);
    
    document.execCommand('copy');
  }
}

// タブをクリップボードにコピー
function onCopyTabs(type, query, valueSet, callback) {
  if (valueSet == null) {
    // valueSet未取得なら再起呼び出し(valueSetの2重取りはできない)
    getStorageArea().get(defaultStorageValueSet, function(valueSet) {
      onCopyTabs(type, query, valueSet, callback);
    });
    return;
  }
  
  let command = createCommand(valueSet, type);
  if (command.ex && command.pin) {
    query.pinned = false;
  }
  
  // すべてのタブ: {}
  // カレントウィンドウのすべてのタブ: {currentWindow:true}
  // カレントウィンドウのアクティブタブ: {currentWindow:true, active:true}
  chrome.tabs.query(query, function(tabs) {
    copyToClipboard(command, tabs);
    if (callback) {
      // 処理完了通知
      callback();
    }
  });
}

function onContextMenus(info, tab) {
  let type = 0;
  switch (info.menuItemId) {
  case 'contextMenu_CopyTabFormat':     type++;
  case 'contextMenu_CopyTabUrl':        type++;
  case 'contextMenu_CopyTabTitle':      type++;
  case 'contextMenu_CopyTabTitleUrl':
    getStorageArea().get(defaultStorageValueSet, function(valueSet) {
      // タブコンテキストメニューは、メニューを開いたタブの情報をコピーする
      // カレントタブではない
      copyToClipboard(createCommand(valueSet, type), [tab]);
    });
    break;
  case 'contextMenu_CopyTabAllFormat':  type++;
  case 'contextMenu_CopyTabAllUrl':     type++;
  case 'contextMenu_CopyTabAllTitle':   type++;
  case 'contextMenu_CopyTabAllTitleUrl':
    onCopyTabs(type, {currentWindow:true}, null);
    break;
  }
}

// コンテキストメニュー更新
function updateContextMenus() {
  // メニュー削除
  chrome.contextMenus.removeAll(function() {
    // ストレージ取得
    getStorageArea().get(defaultStorageValueSet, function(valueSet) {
      // メニュー追加
      let contexts = [];
      if (valueSet.menu_all) {  contexts.push('all'); }
      if (valueSet.menu_page) { contexts.push('page');}
      if (valueSet.menu_tab && isFirefox()) {
        contexts.push('tab');
      }
      
      if (contexts.length != 0) {
        [
          'CopyTabTitleUrl', 'CopyTabTitle', 'CopyTabUrl', 'CopyTabFormat', 
          'CopyTabAllTitleUrl', 'CopyTabAllTitle', 'CopyTabAllUrl', 'CopyTabAllFormat'
        ].forEach(function(v, i, a) {
          if (valueSet['item_'+v]) {
            chrome.contextMenus.create({
              id: 'contextMenu_'+v,
              title: chrome.i18n.getMessage('contextMenu_'+v),
              contexts: contexts
            });
          }
        });
        chrome.contextMenus.onClicked.addListener(onContextMenus);
      }
    });
  });
}
