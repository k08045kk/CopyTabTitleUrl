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
  return ua.indexOf('android') >= 0
      || ua.indexOf('mobile') >= 0
      || ua.indexOf('iphone') >= 0
      || ua.indexOf('ipod') >= 0;
}

// Windows判定
function isWindows() {
  return (window.navigator.platform.indexOf('Win') == 0);
}

// ストレージの初期値
var defaultStorageValueSet = {
  menu_all: false,
  menu_page: false,
  menu_selection: false,
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
  format_decode: false,
  format_punycode: false,
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
    decode: valueSet.format_decode,
    punycode: valueSet.format_punycode,
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

function _dateFormat(format, opt_date, opt_prefix, opt_suffix) {
  var pre = (opt_prefix != null)? opt_prefix: '';
  var suf = (opt_suffix != null)? opt_suffix: '';
  var fmt = {};
  fmt[pre+'yyyy'+suf] = function(date) { return ''  + date.getFullYear(); };
  fmt[pre+'MM'+suf]   = function(date) { return('0' +(date.getMonth() + 1)).slice(-2); };
  fmt[pre+'dd'+suf]   = function(date) { return('0' + date.getDate()).slice(-2); };
  fmt[pre+'hh'+suf]   = function(date) { return('0' +(date.getHours() % 12)).slice(-2); };
  fmt[pre+'HH'+suf]   = function(date) { return('0' + date.getHours()).slice(-2); };
  fmt[pre+'mm'+suf]   = function(date) { return('0' + date.getMinutes()).slice(-2); };
  fmt[pre+'ss'+suf]   = function(date) { return('0' + date.getSeconds()).slice(-2); };
  fmt[pre+'SSS'+suf]  = function(date) { return('00'+ date.getMilliseconds()).slice(-3); };
  fmt[pre+'yy'+suf]   = function(date) { return(''  + date.getFullYear()).slice(-2); };
  fmt[pre+'M'+suf]    = function(date) { return ''  +(date.getMonth() + 1); };
  fmt[pre+'d'+suf]    = function(date) { return ''  + date.getDate(); };
  fmt[pre+'h'+suf]    = function(date) { return ''  +(date.getHours() % 12); };
  fmt[pre+'H'+suf]    = function(date) { return ''  + date.getHours(); };
  fmt[pre+'m'+suf]    = function(date) { return ''  + date.getMinutes(); };
  fmt[pre+'s'+suf]    = function(date) { return ''  + date.getSeconds(); };
  fmt[pre+'S'+suf]    = function(date) { return ''  + date.getMilliseconds(); };
  
  var date = opt_date;
  if (date == null) {
    date = new Date();
  } else if (typeof date === 'number' && isFinite(date) && Math.floor(date) === date) {
    date = new Date(date);
  } else if (Object.prototype.toString.call(date) === '[object String]') {
    date = new Date(date);
  }
  
  var result = format;
  for (var key in fmt) {
    if (fmt.hasOwnProperty(key)) {
      result = result.split(key).join(fmt[key](date));
    }
  }
  return result;
};

function _urlFormat(format, url, command) {
  function decode(text) {
    return command.decode ? decodeURIComponent(text) : text;
  };
  const properties = 'hash host hostname href origin password pathname port protocol search username'.split(' ');
  if (command.punycode) {
    format = format.replace(/\${href}/g, '${protocol}//${username:password@}${host}${pathname}${search}${hash}')
                   .replace(/\${origin}/g, '${protocol}//${username:password@}${host}')
                   .replace(/\${host}/g, '${hostname}'+(url.host.indexOf(':') >= 0 ? ':'+url.host.split(':')[1] : ''));
    try {
      format = format.replace(/\${hostname}/g, punycode.toUnicode(url.hostname));
    } catch (e) {
      format = format.replace(/\${hostname}/g, url.hostname);
    }
  }
  for (let i=0; i<properties.length; i++) {
    const key = properties[i];
    format = format.replace(new RegExp('\\${'+key+'}', 'g'), decode(url[key]));
  }
  format = format.replace(/\${username:password@}/g, decode(url.username) + (url.username != '' && url.password != '' ? ':' : '') + decode(url.password) + (url.username != '' || url.password != '' ? '@' : ''));
  format = format.replace(/\${username@}/g, url.username != '' ? decode(url.username)+'@' : '');
  format = format.replace(/\${password@}/g, url.password != '' ? decode(url.password)+'@' : '');
  format = format.replace(/\${:port}/g, url.port != '' ? ':'+decode(url.port) : '');
  return format;
  // ${hash} ${host} ${hostname} ${href} ${origin} ${password} ${pathname} ${port} ${protocol} ${search} ${username}
  // ${protocol}//${username:password@}${hostname}${:port}${pathname}${search}${hash}
  // https://username:password@example.com:80/path/file?param1=data1&param2=data2#hash

};


// クリップボードにコピー
function copyToClipboard(command, tabs, info) {
  // コピー文字列作成
  let temp = [];
  let enter = getEnterCode();
  for (let i=0; i<tabs.length; i++) {
    let format = command.format;
    // URLのデコード
    let url = command.decode? decodeURIComponent(tabs[i].url): tabs[i].url;
    if (command.ex && command.punycode) {
      url = '${href}';
    }
    format = format.replace(/\${title}/ig, tabs[i].title)
                   .replace(/\${url}/ig, url)
                   .replace(/\${enter}/ig, enter);
    if (command.ex) {
      let stext = (tabs.length==1 && info && info.selectionText)? info.selectionText: tabs[i].title;
      format = format.replace(/\${(tab|\\t|t)}/ig, '\t')
                     .replace(/\${(cr|\\r|r)}/ig,  '\r')
                     .replace(/\${(lf|\\n|n)}/ig,  '\n')
                     .replace(/\${text}/ig, stext);
      format = format.replace(/\${index}/ig, tabs[i].index)
                     .replace(/\${id}/ig, tabs[i].id);
      format = _dateFormat(format, new Date(), '${', '}');
      format = _urlFormat(format, new URL(tabs[i].url), command);
    }
    temp.push(format.replace(/\${\$}/ig, '$'));
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
        // フォーマット以外は、HTML形式でコピーする必要性はない
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
  if (command.selected && query.active) {
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
      if (valueSet.format_selected) {
        chrome.tabs.query({currentWindow:true, highlighted:true}, function(tabs) {
          // 未選択のタブをクリックした場合、複数の選択タブとして扱わない
          let temp = [tab];
          for (let i=0; i<tabs.length; i++) {
            if (tabs[i].id == tab.id) {
              temp = tabs;
              break;
            }
          }
          copyToClipboard(createCommand(valueSet, type), temp, info);
        });
      } else {
        copyToClipboard(createCommand(valueSet, type), [tab], info);
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
  function onUpdateContextMenus(valueSet) {
    // メニュー追加
    let contexts = [];
    if (valueSet.menu_all) {  contexts.push('all'); }
    if (valueSet.menu_page) { contexts.push('page'); }
    if (valueSet.menu_selection) { contexts.push('selection'); }
    if (valueSet.menu_browser_action) { contexts.push('browser_action'); }
    if (valueSet.menu_tab && isFirefox()) {
      contexts.push('tab');
    }
    
    if (contexts.length != 0) {
      const isEnglish = valueSet.format_language;
      const titles = [
        'Copy the title and URL of the tab', 'Copy the title of the tab', 'Copy the URL of the tab', 'Copy the format of the tab', 'Copy the format 2 of the tab',
        'Copy the title and URL of the window tabs', 'Copy the title of the window tabs', 'Copy the URL of the window tabs', 'Copy the format of the window tabs', 'Copy the format 2 of the window tabs',
        'Copy the title and URL of the all tabs', 'Copy the title of the all tabs', 'Copy the URL of the all tabs', 'Copy the format of the all tabs', 'Copy the format 2 of the all tabs'
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
  }
  // モバイル以外 && メニュー削除 && ストレージ取得
  if (!isMobile()) {
    chrome.contextMenus.removeAll(function() {
      getStorageArea().get(defaultStorageValueSet, onUpdateContextMenus);
    });
  }
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
