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
  menu_browser_action: true,
  menu_tab: true,       // Firefox only
  item_CopyTabTitleUrl: true,
  item_CopyTabTitle: true,
  item_CopyTabUrl: true,
  item_CopyTabFormat: false,
  item_CopyTabFormat2: false,
  item_CopyTabAllTitleUrl: false,
  item_CopyTabAllTitle: false,
  item_CopyTabAllUrl: false,
  item_CopyTabAllFormat: false,
  item_CopyTabAllFormat2: false,
  item_CopyTabAll2TitleUrl: false,
  item_CopyTabAll2Title: false,
  item_CopyTabAll2Url: false,
  item_CopyTabAll2Format: false,
  item_CopyTabAll2Format2: false,
  action: 'Popup',
  action_target: 'CurrentTab',
  browser_ShowPopup: false,
  shortcut_command: 'Alt+C',
  shortcut_command2: '',
  format_CopyTabFormat: '[${title}](${url})',
  format_CopyTabFormat2:'<a href="${url}">${title}</a>',
  format_enter: true,
  format_html: false,
  format_pin: false,
  format_selected: false,
  format_format2: false,
  format_language: false,
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

// ブラウザアクションクエリー
function getBrowserActionQuery(valueSet) {
  return {
    CurrentTab: {currentWindow:true, active:true}, 
    CurrentWindow: {currentWindow:true}, 
    AllWindow: {}
  }[valueSet.action_target];
}

// コマンド作成
function createCommand(valueSet, type) {
  let command = {
    type: type, 
    enter: valueSet.format_enter, 
    html: valueSet.format_html, 
    pin: valueSet.format_pin, 
    selected: valueSet.format_selected, 
    ex: valueSet.format_extension
  };
  command.format = [
    '${title}${enter}${url}', 
    '${title}', 
    '${url}', 
    valueSet.format_CopyTabFormat,
    valueSet.format_CopyTabFormat2
  ][type];
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
    // Clipboard API(Firefox63+実装)
    // Android Firefoxのバックグラウンドは、execCommand('copy')が動作しない。
    // そのため、対象環境のみClicpboard APIを使用する。
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
      if (command.ex && command.html && command.type >= 3) {
        // フォーマット以外でHTML形式でコピーする必要性はまったくない
        event.clipboardData.setData('text/html', text);
      }
      event.clipboardData.setData('text/plain', text);
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
  if (command.ex && command.selected && query.active) {
    query.highlighted = true;
    delete query.active;
  }
  
  // すべてのタブ: {}
  // カレントウィンドウのすべてのタブ: {currentWindow:true}
  // カレントウィンドウの選択中のタブ: {currentWindow:true, highlighted:true}
  // カレントウィンドウのアクティブタブ: {currentWindow:true, active:true}
  chrome.tabs.query(query, function(tabs) {
    copyToClipboard(command, tabs);
    if (callback) {
      // 処理完了通知
      callback();
    }
  });
}

// コンテキストメニューイベント
function onContextMenus(info, tab) {
  let type = 0;
  switch (info.menuItemId) {
  case 'CopyTabFormat2':        type++;
  case 'CopyTabFormat':         type++;
  case 'CopyTabUrl':            type++;
  case 'CopyTabTitle':          type++;
  case 'CopyTabTitleUrl':
    getStorageArea().get(defaultStorageValueSet, function(valueSet) {
      // タブコンテキストメニューは、メニューを開いたタブの情報をコピーする
      // カレントタブではない
      if (valueSet.format_extension && valueSet.format_selected) {
        chrome.tabs.query({currentWindow:true, highlighted:true}, function(tabs) {
          // 未選択のタブをクリックした場合、複数の選択タブとして扱わない
          let temp = [tab];
          for (let i=0; i<tabs.length; i++) {
            if (tabs[i].id == tab.id) {
              temp = tabs;
              break;
            }
          }
          copyToClipboard(createCommand(valueSet, type), temp);
        });
      } else {
        copyToClipboard(createCommand(valueSet, type), [tab]);
      }
    });
    break;
  case 'CopyWindowTabsFormat2': type++;
  case 'CopyWindowTabsFormat':  type++;
  case 'CopyWindowTabsUrl':     type++;
  case 'CopyWindowTabsTitle':   type++;
  case 'CopyWindowTabsTitleUrl':
    onCopyTabs(type, {currentWindow:true}, null);
    break;
  case 'CopyWindowTabs2Format2': type++;
  case 'CopyWindowTabs2Format':  type++;
  case 'CopyWindowTabs2Url':     type++;
  case 'CopyWindowTabs2Title':   type++;
  case 'CopyWindowTabs2TitleUrl':
    onCopyTabs(type, {}, null);
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
      if (valueSet.menu_browser_action) { contexts.push('browser_action');}
      if (valueSet.menu_tab && isFirefox()) {
        contexts.push('tab');
      }
      
      if (contexts.length != 0) {
        const isEnglish = valueSet.format_extension && valueSet.format_language;
        const titles = [
          'Copy tab title and URL', 'Copy tab title', 'Copy tab URL', 'Copy tab format', 'Copy tab format2',
          'Copy the title and URL of a window tabs', 'Copy title of a window tabs', 'Copy URL of a window tabs', 'Copy tab format of a window tabs', 'Copy tab format2 of a window tabs',
          'Copy the title and URL of all tabs', 'Copy title of all tabs', 'Copy URL of all tabs', 'Copy tab format of all tabs', 'Copy tab format2 of all tabs'
        ];
        [
          'CopyTabTitleUrl', 'CopyTabTitle', 'CopyTabUrl', 'CopyTabFormat', 'CopyTabFormat2', 
          'CopyWindowTabsTitleUrl', 'CopyWindowTabsTitle', 'CopyWindowTabsUrl', 'CopyWindowTabsFormat', 'CopyWindowTabsFormat2',
          'CopyWindowTabs2TitleUrl', 'CopyWindowTabs2Title', 'CopyWindowTabs2Url', 'CopyWindowTabs2Format', 'CopyWindowTabs2Format2'
        ].forEach(function(v, i, a) {
          let id = 'item_'+v.replace('WindowTabs', 'TabAll');
          if (id.endsWith('2') && !(valueSet.format_extension && valueSet.format_format2)) {
          } else if (!valueSet[id]) {
          } else {
            chrome.contextMenus.create({
              id: v,
              title: (isEnglish? titles[i]: chrome.i18n.getMessage(v)),
              contexts: contexts
            });
          }
        });
        chrome.contextMenus.onClicked.addListener(onContextMenus);
      }
    });
  });
}

// ブラウザアクションの更新
function updateBrowserAction() {
  getStorageArea().get(defaultStorageValueSet, function(valueSet) {
    if (valueSet.action == 'Popup' || valueSet.browser_ShowPopup) {
      chrome.browserAction.setPopup({popup: '/html/popup.html'});
    } else {
      chrome.browserAction.setPopup({popup: ''});
    }
  });
}
