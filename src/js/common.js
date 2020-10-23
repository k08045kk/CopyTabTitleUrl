/**
 * 共通処理
 */
var page = 'common';

// ブラウザ判定
function isFirefox() {
  return 'browser' in window;
};
function isEdge() {
  return 'edge' in window;
};
function isChrome() {
  return !isFirefox();
};

// モバイル判定
function isMobile() {
  const ua = window.navigator.userAgent.toLowerCase();
  return ua.indexOf('android') != -1
      || ua.indexOf('mobile') != -1
      || ua.indexOf('iphone') != -1
      || ua.indexOf('ipod') != -1;
};

// Windows判定
function isWindows() {
  return window.navigator.platform.indexOf('Win') == 0;
};

// ストレージの取得
function getStorageArea() {
  //return (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
  return chrome.storage.local;
};

// 改行文字を取得
function getEnterCode() {
  return isWindows() ? '\r\n' : '\n';
};

function extension(valueSet, name, opt_extension) {
  return !!opt_extension 
          ? valueSet.checkbox__others_extension && valueSet['checkbox__'+name]
          : valueSet['checkbox__'+name];
};



// ストレージの初期値
const defaultStorageValueSetVersion1 = {
  menu_all: false,                      // v0.0.5+
  menu_page: false,                     // v0.0.5+
  menu_selection: false,                // v1.5.2+
  menu_browser_action: true,            // v1.5.1+
  menu_tab: true,                       // v0.0.5+ Firefox only
  item_CopyTabTitleUrl: true,           // v0.0.5+
  item_CopyTabTitle: true,              // v0.0.5+
  item_CopyTabUrl: true,                // v0.0.5+
  item_CopyTabFormat: false,            // v0.0.7+
  item_CopyTabFormat2: false,           // v1.5.0+
  item_CopyTabAllTitleUrl: false,       // v0.0.5+
  item_CopyTabAllTitle: false,          // v0.0.5+
  item_CopyTabAllUrl: false,            // v0.0.5+
  item_CopyTabAllFormat: false,         // v0.0.7+
  item_CopyTabAllFormat2: false,        // v1.5.0+
  item_CopyTabAll2TitleUrl: false,      // v1.5.1+
  item_CopyTabAll2Title: false,         // v1.5.1+
  item_CopyTabAll2Url: false,           // v1.5.1+
  item_CopyTabAll2Format: false,        // v1.5.1+
  item_CopyTabAll2Format2: false,       // v1.5.1+
  action: 'Popup',                      // v0.0.9+ Popup or Action
  action_target: 'CurrentTab',          // v0.0.9+ CurrentTab or CurrentWindow or AllWindow
  browser_ShowPopup: false,             // v1.4.0+
  shortcut_command: 'Alt+C',            // v1.3.0+
  shortcut_command2: '',                // v1.5.0+
  format_CopyTabFormat: '[${title}](${url})',             // v0.0.7+
  format_CopyTabFormat2:'<a href="${url}">${title}</a>',  // v1.5.0+
  format_enter: true,                   // v0.0.9+
  format_decode: false,                 // v1.5.2+
  format_punycode: false,               // v1.5.6+
  format_html: false,                   // v0.0.9+
  format_pin: false,                    // v1.1.0+
  format_selected: false,               // v1.5.1+
  format_format2: false,                // v1.5.0+
  format_language: false,               // v1.5.1+
  format_extension: false               // v0.0.9+
};
//{"menu_all":false,"menu_page":false,"menu_selection":false,"menu_browser_action":true,"menu_tab":true,"item_CopyTabTitleUrl":true,"item_CopyTabTitle":true,"item_CopyTabUrl":true,"item_CopyTabFormat":false,"item_CopyTabFormat2":false,"item_CopyTabAllTitleUrl":false,"item_CopyTabAllTitle":false,"item_CopyTabAllUrl":false,"item_CopyTabAllFormat":false,"item_CopyTabAllFormat2":false,"item_CopyTabAll2TitleUrl":false,"item_CopyTabAll2Title":false,"item_CopyTabAll2Url":false,"item_CopyTabAll2Format":false,"item_CopyTabAll2Format2":false,"action":"Popup","action_target":"CurrentTab","browser_ShowPopup":false,"shortcut_command":"Alt+C","shortcut_command2":"","format_CopyTabFormat":"[${title}](${url})","format_CopyTabFormat2":"<a href=\"${url}\">${title}</a>","format_enter":true,"format_decode":false,"format_punycode":false,"format_html":false,"format_pin":false,"format_selected":false,"format_format2":false,"format_language":false,"format_extension":false}
//{"menu_all":true,"menu_page":true,"menu_selection":true,"menu_browser_action":false,"menu_tab":false,"item_CopyTabTitleUrl":false,"item_CopyTabTitle":false,"item_CopyTabUrl":false,"item_CopyTabFormat":true,"item_CopyTabFormat2":true,"item_CopyTabAllTitleUrl":true,"item_CopyTabAllTitle":true,"item_CopyTabAllUrl":true,"item_CopyTabAllFormat":true,"item_CopyTabAllFormat2":true,"item_CopyTabAll2TitleUrl":true,"item_CopyTabAll2Title":true,"item_CopyTabAll2Url":true,"item_CopyTabAll2Format":true,"item_CopyTabAll2Format2":true,"action":"Action","action_target":"AllWindow","browser_ShowPopup":true,"shortcut_command":"","shortcut_command2":"Shift+A","format_CopyTabFormat":"<a href=\"${url}\">${title}</a>","format_CopyTabFormat2":"[${title}](${url})","format_enter":false,"format_decode":true,"format_punycode":true,"format_html":true,"format_pin":true,"format_selected":true,"format_format2":true,"format_language":true,"format_extension":true}
const defaultStorageValueSetVersion2 = {
  version: 2,                           // v2.0.0+
  // format
  // target
  // selectionText
  // tab
  checkbox__menus_contexts_all: false,
  checkbox__menus_contexts_page: false,
  checkbox__menus_contexts_selection: false,
  checkbox__menus_contexts_browser_action: true,
  checkbox__menus_contexts_tab: true,   // Firefox only
  checkbox__popup_comlate: false,
  //checkbox__others_clipboard_api: false,
  checkbox__others_format2: false,
  checkbox__others_extend_menus: false, // v2.0.0+
  checkbox__others_edit_menu_title: false,      // v2.0.0+
  checkbox__others_decode: false,
  checkbox__others_punycode: false,
  checkbox__others_html: false,
  checkbox__others_enter: true,
  checkbox__others_pin: false,
  checkbox__others_selected: true,      // v2.0.0から初期値変更
  checkbox__others_language: false,
  checkbox__others_extension: false,
  select__browser_action: 'popup',
  select__browser_action_target: 'tab',
  menus: [                              // v2.0.0+
    {id:0, title:'title and URL', target:'tab', format:0, enable:true},
    {id:1, title:'title', target:'tab', format:1, enable:true},
    {id:2, title:'URL', target:'tab', format:2, enable:true},
    {id:3, title:'format', target:'tab', format:3},
    {id:4, title:'format2', target:'tab', format:4},
    
    {id:5, title:'title and URL (window tabs)', target:'window', format:0},
    {id:6, title:'title (window tabs)', target:'window', format:1},
    {id:7, title:'URL (window tabs)', target:'window', format:2},
    {id:8, title:'format (window tabs)', target:'window', format:3},
    {id:9, title:'format2 (window tabs)', target:'window', format:4},
    
    {id:10, title:'title and URL (all tabs)', target:'all', format:0},
    {id:11, title:'title (all tabs)', target:'all', format:1},
    {id:12, title:'URL (all tabs)', target:'all', format:2},
    {id:13, title:'format (all tabs)', target:'all', format:3},
    {id:14, title:'format2 (all tabs)', target:'all', format:4},
    
    {id:15, title:'format3', target:'tab', format:5},
    {id:16, title:'format4', target:'tab', format:6},
    {id:17, title:'format5', target:'tab', format:7},
    {id:18, title:'format6', target:'tab', format:8},
    {id:19, title:'format7', target:'tab', format:9},
    {id:20, title:'format8', target:'tab', format:10},
    {id:21, title:'format9', target:'tab', format:11},
  ],
  formats: [                            // v2.0.0+
    {id:0, title:'title and URL', format:'${title}${enter}${url}'}, 
    {id:1, title:'title', format:'${title}'}, 
    {id:2, title:'URL', format:'${url}'}, 
    {id:3, title:'format1', format:'[${title}](${url})', shortcut:'Alt+C'}, 
    {id:4, title:'format2', format:'<a href="${url}">${title}</a>', shortcut:''}, 
    {id:5, title:'format3', format:'', shortcut:''}, 
    {id:6, title:'format4', format:'', shortcut:''}, 
    {id:7, title:'format5', format:''}, 
    {id:8, title:'format6', format:''}, 
    {id:9, title:'format7', format:''}, 
    {id:10, title:'format8', format:''}, 
    {id:11, title:'format9', format:''}, 
  ]
};
const defaultStorageValueSet = defaultStorageValueSetVersion2;



function _dateFormat(format, opt_date, opt_prefix, opt_suffix) {
  var pre = (opt_prefix != null) ? opt_prefix : '';
  var suf = (opt_suffix != null) ? opt_suffix : '';
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

function _urlFormat(format, url, isDecode, isPunycode) {
  function decode(text) {
    return isDecode ? decodeURIComponent(text) : text;
  };
  const properties = 'hash host hostname href origin password pathname port protocol search username'.split(' ');
  if (isPunycode) {
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
function copyToClipboard(command, tabs) {
  // コピー文字列作成
  const temp = [];
  const enter = getEnterCode();
  const now = new Date();
  for (let i=0; i<tabs.length; i++) {
    let format = command.format;
    let url = tabs[i].url;
    if (extension(command, 'others_decode', true) || extension(command, 'others_punycode', true)) {
      url = '${href}';
    }
    format = format.replace(/\${title}/ig, tabs[i].title)
                   .replace(/\${url}/ig, url)
                   .replace(/\${enter}/ig, enter);
    if (command.checkbox__others_extension) {
      const stext = (tabs.length == 1 && command.selectionText) ? command.selectionText : tabs[i].title;
      format = format.replace(/\${(tab|\\t|t)}/ig, '\t')
                     .replace(/\${(cr|\\r|r)}/ig,  '\r')
                     .replace(/\${(lf|\\n|n)}/ig,  '\n')
                     .replace(/\${text}/ig, stext);
      format = format.replace(/\${index}/ig, tabs[i].index)
                     .replace(/\${id}/ig, tabs[i].id)
                     .replace(/\${favIconUrl}/g, tabs[i].favIconUrl != '' ? tabs[i].favIconUrl : void 0);
      format = _dateFormat(format, now, '${', '}');
      format = _urlFormat(format, new URL(tabs[i].url), 
                          command.checkbox__others_decode, 
                          command.checkbox__others_punycode);
    }
    temp.push(format.replace(/\${\$}/ig, '$'));
  }
  const text = temp.join((!command.checkbox__others_extension || command.checkbox__others_enter)
                          ? enter 
                          : '');
  
  // クリップボードコピー
  if (isMobile() && page == 'background') {
    // Clipboard API(Firefox63+実装)
    // Firefox63+ dom.events.asyncClipboard.dataTransfer=true が必須
    // Android Firefoxのバックグラウンドは、execCommand('copy')が動作しない。
    // そのため、対象環境のみClicpboard APIを使用する。
    navigator.clipboard.writeText(text).then(() => {
      /* success */
    }, () => {
      /* failure */
    });
  } else {
    // 通常のクリップボードコピー処理
    function oncopy(event) {
      document.removeEventListener('copy', oncopy, true);
      event.stopImmediatePropagation();
      event.preventDefault();
      
      if (extension(command, 'others_html', true)) {
        event.clipboardData.setData('text/html', text);
      }
      event.clipboardData.setData('text/plain', text);
    };
    document.addEventListener('copy', oncopy, true);
    
    document.execCommand('copy');
  }
};

// タブをクリップボードにコピー
function onCopyTab(command, callback) {
  const query = {
    'tab': {currentWindow:true, active:true}, 
    'window': {currentWindow:true}, 
    'all': {},
  }[command.target];
  
  if (extension(command, 'others_pin', true)) {
    query.pinned = false;
  }
  if (extension(command, 'others_selected', false) && command.target == 'tab') {
    query.highlighted = true;
    delete query.active;
  }
  
  // すべてのタブ: {}
  // カレントウィンドウのすべてのタブ: {currentWindow:true}
  // カレントウィンドウの選択中のタブ: {currentWindow:true, highlighted:true}
  // カレントウィンドウのアクティブタブ: {currentWindow:true, active:true}
  chrome.tabs.query(query, (tabs) => {
    let temp = tabs;
    if (command.tab && command.target == 'tab') {
      // 未選択タブのタブコンテキストメニューは、カレントタブとして扱わない
      temp = [command.tab];
      for (let i=0; i<tabs.length; i++) {
        if (tabs[i].id == command.tab.id) {
          temp = tabs;
          break;
        }
      }
    }
    copyToClipboard(command, temp);
    if (callback) {
      // 処理完了通知
      callback();
    }
  });
};

// コンテキストメニューイベント
function onContextMenus(info, tab) {
  const id = info.menuItemId.match(/\d+$/)[0];
  getStorageArea().get(defaultStorageValueSet, (valueSet) => {
    const menu = valueSet.menus.find((v) => {
      return v.id == id;
    });
    valueSet.format = valueSet.formats.find((v) => v.id == menu.format).format;
    //valueSet.format = valueSet.formats.find((v) => v.id == menu.format);
    //valueSet.format.checkbox__others_html = true; // みたいな？
    valueSet.target = menu.target;
    valueSet.selectionText = info.selectionText;
    valueSet.tab = tab;
    onCopyTab(valueSet, null);
  });
};

// コンテキストメニュー更新
function updateContextMenus() {
  function onUpdateContextMenus(valueSet) {
    // メニュー追加
    const contexts = [];
    if (valueSet.checkbox__menus_contexts_all) {  contexts.push('all'); }
    if (valueSet.checkbox__menus_contexts_page) { contexts.push('page'); }
    if (valueSet.checkbox__menus_contexts_selection) { contexts.push('selection'); }
    if (valueSet.checkbox__menus_contexts_browser_action) { contexts.push('browser_action'); }
    if (isFirefox() && valueSet.checkbox__menus_contexts_tab) { contexts.push('tab'); }
    
    if (contexts.length) {
      let menus = JSON.parse(JSON.stringify(valueSet.menus));
      if (!extension(valueSet, 'others_edit_menu_title', true)) {
        for (let i=0; i<menus.length; i++) {
          menus[i].title = defaultStorageValueSet.menus[i].title;
        }
      }
      menus.splice(15, 0, {type:'separator', format:-1, enable:true});
      menus.splice(10, 0, {type:'separator', format:-1, enable:true});
      menus.splice( 5, 0, {type:'separator', format:-1, enable:true});
      if (!extension(valueSet, 'others_format2', true) 
       || !extension(valueSet, 'others_extend_menus', true)) {
        menus = menus.filter((v) => {
          return v.format < 5;
        });
      }
      if (!extension(valueSet, 'others_format2', true)) {
        menus = menus.filter((v) => {
          return v.format != 4;
        });
      }
      let flag = true;
      for (let i=menus.length-1; i>=0; i--) {
        if (menus[i].type == 'separator') {
          if (flag) {
            menus.splice(i, 1);
          } else {
            flag = true;
          }
        } else if (!menus[i].enable) {
          menus.splice(i, 1);
        } else {
          flag = false;
        }
      }
      for (let i=0; i<menus.length; i++) {
        if (menus[i].type == 'separator') {
          // ブラウザアクションは、6個制限があるため、セパレータなし
          if (menus.length > 6 && !(contexts.length == 1 && contexts[0] == 'browser_action')) {
            chrome.contextMenus.create({
              type: menus[i].type,
              contexts: contexts.filter((v) => v != 'browser_action'),
            });
          } else if (menus.length <= 6) {
            chrome.contextMenus.create({
              type: menus[i].type,
              contexts: contexts,
            });
          }
        } else {
          chrome.contextMenus.create({
            id: 'menu'+menus[i].id,
            title: menus[i].title,
            contexts: contexts,
          });
        }
      }
      if (menus.length) {
        chrome.contextMenus.onClicked.addListener(onContextMenus);
      }
    }
  };
  
  // モバイル以外 && メニュー削除 && ストレージ取得
  if (!isMobile()) {
    chrome.contextMenus.removeAll(() => {
      getStorageArea().get(defaultStorageValueSet, onUpdateContextMenus);
    });
  }
};

// ブラウザアクションの更新
function updateBrowserAction() {
  getStorageArea().get(defaultStorageValueSet, (valueSet) => {
    if (valueSet.select__browser_action == 'popup' || valueSet.checkbox__popup_comlate) {
      chrome.browserAction.setPopup({popup: '/html/popup.html'});
    } else {
      chrome.browserAction.setPopup({popup: ''});
    }
  });
};
