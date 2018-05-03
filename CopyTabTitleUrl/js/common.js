/**
 * 共通処理
 */

// ストレージの初期値
var defaultStorageValueSet = {
  'menu_all': false,  // Firefox only
  'menu_page': false, // Firefox only
  'menu_tab': true,   // Firefox only
  'item_CopyTabTitleUrl': true,
  'item_CopyTabTitle': true,
  'item_CopyTabUrl': true,
  'item_CopyTabFormat': false,
  'item_CopyTabAllTitleUrl': false, // Firefox only
  'item_CopyTabAllTitle': false,    // Firefox only
  'item_CopyTabAllUrl': false,      // Firefox only
  'item_CopyTabAllFormat': false,    // Firefox only
  'format_CopyTabFormat': '[${title}](${url})'
};

// ストレージの取得
function getStorageArea() {
  //return (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
  return chrome.storage.local;
}

// クリップボードにコピー
function copyToClipboard(text) {
  function oncopy(event) {
    document.removeEventListener("copy", oncopy, true);
    // Hide the event from the page to prevent tampering.
    event.stopImmediatePropagation();
    
    // Overwrite the clipboard content.
    event.preventDefault();
    event.clipboardData.setData("text/plain", text);
  }
  document.addEventListener("copy", oncopy, true);
  
  // Requires the clipboardWrite permission, or a user gesture:
  document.execCommand("copy");
}

function createCopyTabFormat(format, tab) {
  return format.replace(/\${title}/ig, tab.title)
               .replace(/\${url}/ig, tab.url);
}

// タブをクリップボードにコピー
function onCopyTabs(type, query, format, callback) {
  if (type == 3 && format == null) {
    getStorageArea().get(defaultStorageValueSet, function(item) {
      format = (item.format_CopyTabFormat == null)? '': item.format_CopyTabFormat;
      onCopyTabs(type, query, format, callback);
    });
  } else {
    // すべてのタブ: {}
    // カレントウィンドウのすべてのタブ: {currentWindow:true}
    // カレントウィンドウのアクティブタブ: {currentWindow:true, active:true}
    chrome.tabs.query(query, function(tabs) {
      let temp = [];
      for (let tab of tabs) {
        switch (type) {
        case 0: temp.push(tab.title+'\n'+tab.url);  break;
        case 1: temp.push(tab.title); break;
        case 2: temp.push(tab.url); break;
        case 3: temp.push(createCopyTabFormat(format, tab)); break;
        }
      }
      copyToClipboard(temp.join('\n'));
      if (callback) {
        // 処理完了通知
        callback();
      }
    });
  }
}

// コンテキストメニュー更新
function updateContextMenus() {
  // メニュー削除
  chrome.contextMenus.removeAll(function() {
    
    // ストレージ取得
    getStorageArea().get(defaultStorageValueSet, function(item) {
      // メニュー追加
      let contexts = [];
      if (item.menu_all) {  contexts.push('all'); }
      if (item.menu_page) { contexts.push('page');}
      if (item.menu_tab) {  contexts.push('tab'); }
      
      if (contexts.length != 0) {
        [
           'CopyTabTitleUrl', 'CopyTabTitle', 'CopyTabUrl', 'CopyTabFormat'
          ,'CopyTabAllTitleUrl', 'CopyTabAllTitle', 'CopyTabAllUrl', 'CopyTabAllFormat' // Firefox
        ].forEach(function(v, i, a) {
          if (item['item_'+v]) {
            chrome.contextMenus.create({
              id: 'contextMenu_'+v,
              title: chrome.i18n.getMessage('contextMenu_'+v),
              contexts: contexts
            });
          }
        });
        chrome.contextMenus.onClicked.addListener(function(info, tab) {
          let type = 0;
          switch (info.menuItemId) {
          case 'contextMenu_CopyTabTitleUrl': copyToClipboard(tab.title+'\n'+tab.url);  break;
          case 'contextMenu_CopyTabTitle':    copyToClipboard(tab.title);  break;
          case 'contextMenu_CopyTabUrl':      copyToClipboard(tab.url);  break;
          case 'contextMenu_CopyTabFormat':
             copyToClipboard(createCopyTabFormat(item.format_CopyTabFormat, tab));
             break;
          case 'contextMenu_CopyTabAllFormat':type++;   // Firefox only
          case 'contextMenu_CopyTabAllUrl':   type++;   // Firefox only
          case 'contextMenu_CopyTabAllTitle': type++;   // Firefox only
          case 'contextMenu_CopyTabAllTitleUrl':        // Firefox only
            onCopyTabs(type, {currentWindow:true}, item.format_CopyTabFormat);
            break;
          }
        });
      }
    });
  });
}
