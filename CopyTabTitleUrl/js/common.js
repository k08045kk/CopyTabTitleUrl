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

// すべてのタブをクリップボードにコピー
function onCopyTabs(type, query) {
  // すべてのタブ: {}
  // カレントウィンドウのすべてのタブ: {currentWindow: true}
  browser.tabs.query(query)
    .then(function(tabs) {
      let text = '';
      for (let tab of tabs) {
        if (text.length != 0) {
          text += '\n';
        }
        switch (type) {
        case 0: text += tab.title + '\n' + tab.url; break;
        case 1: text += tab.title; break;
        case 2: text += tab.url; break;
        }
      }
      copyToClipboard(text);
    }, function() {
      //console.log('onCopyTabs() error.');
    });
}

// ストレージの取得
function getStorageArea() {
  //return (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
  return chrome.storage.local;
}

// コンテキストメニュー更新
function updateContextMenus() {
  // 削除
  chrome.contextMenus.remove("contextMenu_CopyTabTitleUrl");
  chrome.contextMenus.remove("contextMenu_CopyTabTitle");
  chrome.contextMenus.remove("contextMenu_CopyTabUrl");
  chrome.contextMenus.remove("contextMenu_CopyTabAllTitleUrl");
  chrome.contextMenus.remove("contextMenu_CopyTabAllTitle");
  chrome.contextMenus.remove("contextMenu_CopyTabAllUrl");
  
  // 追加
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
      var contexts = [];
      if (item.menu_all) { contexts.push('all'); }
      if (item.menu_tab) { contexts.push('tab'); }
      
      if (contexts.length != 0 && item.item_CopyTabTitleUrl) {
        chrome.contextMenus.create({
          id: "contextMenu_CopyTabTitleUrl",
          title: chrome.i18n.getMessage("contextMenu_CopyTabTitleUrl"),
          contexts: contexts,
          "onclick": function(info, tab) {
            copyToClipboard(tab.title+'\n'+tab.url);
          }
        });
      }
      if (contexts.length != 0 && item.item_CopyTabTitle) {
        chrome.contextMenus.create({
          id: "contextMenu_CopyTabTitle",
          title: chrome.i18n.getMessage("contextMenu_CopyTabTitle"),
          contexts: contexts,
          "onclick": function(info, tab) {
            copyToClipboard(tab.title);
          }
        });
      }
      if (contexts.length != 0 && item.item_CopyTabUrl) {
        chrome.contextMenus.create({
          id: "contextMenu_CopyTabUrl",
          title: chrome.i18n.getMessage("contextMenu_CopyTabUrl"),
          contexts: contexts,
          "onclick": function(info, tab) {
            copyToClipboard(tab.url);
          }
        });
      }
      
      if (contexts.length != 0 && item.item_CopyTabAllTitleUrl) {
        chrome.contextMenus.create({
          id: "contextMenu_CopyTabAllTitleUrl",
          title: chrome.i18n.getMessage("contextMenu_CopyTabAllTitleUrl"),
          contexts: contexts,
          "onclick": function(info, tab) {
            onCopyTabs(0, {currentWindow: true});
          }
        });
      }
      if (contexts.length != 0 && item.item_CopyTabAllTitle) {
        chrome.contextMenus.create({
          id: "contextMenu_CopyTabAllTitle",
          title: chrome.i18n.getMessage("contextMenu_CopyTabAllTitle"),
          contexts: contexts,
          "onclick": function(info, tab) {
            onCopyTabs(1, {currentWindow: true});
          }
        });
      }
      if (contexts.length != 0 && item.item_CopyTabAllUrl) {
        chrome.contextMenus.create({
          id: "contextMenu_CopyTabAllUrl",
          title: chrome.i18n.getMessage("contextMenu_CopyTabAllUrl"),
          contexts: contexts,
          "onclick": function(info, tab) {
            onCopyTabs(2, {currentWindow: true});
          }
        });
      }
    });
}
