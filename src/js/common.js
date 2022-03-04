/**
 * 共通処理
 */

// ブラウザ判定
function isFirefox() {
  return 'browser' in window;
};
function isChrome() {
  return !isFirefox();
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
  format_selected: true,                // v1.5.1+ v2.0.0+（初期設定をfalse→trueに変更）
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
  // linkText
  // linkUrl
  // srcUrl
  // tab
  checkbox__menus_contexts_all: false,
  checkbox__menus_contexts_page: false,
  checkbox__menus_contexts_selection: false,
  checkbox__menus_contexts_link: false,         // v2.1.0+
  checkbox__menus_contexts_image: false,        // v2.1.0+
  checkbox__menus_contexts_browser_action: true,
  checkbox__menus_contexts_tab: true,           // Firefox only
  checkbox__popup_comlate: false,
  checkbox__others_format2: false,
  checkbox__others_extend_menus: false,         // v2.0.0+
  checkbox__others_format9: false,              // v2.2.0+
  checkbox__others_edit_menu_title: false,      // v2.0.0+
  checkbox__others_decode: false,
  checkbox__others_punycode: false,
  checkbox__others_html: false,
  checkbox__others_clipboard_api: false,        // v2.2.0+ Firefox only
  checkbox__others_enter: true,
  checkbox__others_pin: false,
  checkbox__others_hidden: false,               // v2.1.1+
  checkbox__others_selected: true,
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
    {id:11, title:'format9', format:'[${linkSelectionTitle}](${linkSrcUrl})'},  // v2.2.0+
  ]
};
const defaultStorageValueSet = defaultStorageValueSetVersion2;

// URLのデコード
function decodeURL(data, isDecode, isPunycode) {
  try {
    const url = new URL(data);
    let protocol = url.protocol;
    let hostname = url.hostname;
    let port = url.port;
    let pathname = url.pathname;
    let search = url.search;
    let hash = url.hash;
    if (isPunycode) {
      try {
        hostname = punycode.toUnicode(hostname);
      } catch (e) {}
    }
    if (isDecode) {
      try {
        pathname = decodeURIComponent(pathname);
      } catch (e) {}
      try {
        search = decodeURIComponent(search);
      } catch (e) {}
      try {
        hash = decodeURIComponent(hash);
      } catch (e) {}
    }
    return protocol+'//'+hostname+(port != '' ? ':'+port : '')+pathname+search+hash;
  } catch (e) {
    return data;
  }
};

// フォーマット文字列作成
function createFormatText(command, tabs) {
  // 前処理
  const enter = getEnterCode();
  const keyset = {};
  let format = command.format;
  
  // Standard
  keyset['${enter}'] = enter;
  keyset['${$}'] = '$';
  format = format.replace(/\${(title|url|enter)}/ig, (m) => { return m.toLowerCase(); });
  
  if (command.checkbox__others_extension) {
    // Basic
    format = format.replace(/\${(text|index|id)}/ig, (m) => { return m.toLowerCase(); })
    
    // Character code
    keyset['${cr}'] = '\r';
    keyset['${lf}'] = '\n';
    keyset['${tab}'] = '\t';
    format = format.replace(/\${(tab|\\t|t)}/ig, '${tab}')
                   .replace(/\${(cr|\\r|r)}/ig,  '${cr}')
                   .replace(/\${(lf|\\n|n)}/ig,  '${lf}')
    
    // Date
    const now = new Date();
    keyset['${yyyy}'] = ''  + now.getFullYear();
    keyset['${MM}']   =('0' +(now.getMonth() + 1)).slice(-2);
    keyset['${dd}']   =('0' + now.getDate()).slice(-2);
    keyset['${hh}']   =('0' +(now.getHours() % 12)).slice(-2);
    keyset['${HH}']   =('0' + now.getHours()).slice(-2);
    keyset['${mm}']   =('0' + now.getMinutes()).slice(-2);
    keyset['${ss}']   =('0' + now.getSeconds()).slice(-2);
    keyset['${SSS}']  =('00'+ now.getMilliseconds()).slice(-3);
    keyset['${yy}']   =(''  + now.getFullYear()).slice(-2);
    keyset['${M}']    = ''  +(now.getMonth() + 1);
    keyset['${d}']    = ''  + now.getDate();
    keyset['${h}']    = ''  +(now.getHours() % 12);
    keyset['${H}']    = ''  + now.getHours();
    keyset['${m}']    = ''  + now.getMinutes();
    keyset['${s}']    = ''  + now.getSeconds();
    keyset['${S}']    = ''  + now.getMilliseconds();
    keyset['${aa}']   = now.getHours()/12 < 1 ? 'am' : 'pm';
    keyset['${AA}']   = now.getHours()/12 < 1 ? 'AM' : 'PM';
    keyset['${aaaa}'] = now.getHours()/12 < 1 ? 'a.m.' : 'p.m.';
    keyset['${AAAA}'] = now.getHours()/12 < 1 ? 'A.M.' : 'P.M.';
    keyset['${W}']    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()];
    keyset['${WWW}']  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][now.getDay()];
    
    // URL
    if (command.checkbox__others_decode || command.checkbox__others_punycode) {
      // #35 ソースコード表示画面のURLが正常に取得できないことがある
      // ${origin} → ${protocol}//${host}
      format = format.replace(/\${url}/g, '${href}')
                     .replace(/\${href}/g, '${origin}${pathname}${search}${hash}')
                     .replace(/\${origin}/g, '${protocol}//${host}')
                     .replace(/\${host}/g, '${hostname}${:port}')
    }
  }
  
  // 本処理
  const temp = [];
  const isDecode = command.checkbox__others_decode;
  const isPunycode = command.checkbox__others_punycode;
  const isSingle = tabs.length == 1;
  const urlkeys = 'hash host hostname href origin pathname port protocol search'.split(' ');
  for (let i=0; i<tabs.length; i++) {
    const tab = tabs[i];
    
    // Standard
    keyset['${title}'] = tab.title;
    keyset['${url}'] = tab.url;
    
    if (command.checkbox__others_extension) {
      // Basic
      keyset['${text}']     = isSingle && command.selectionText || tab.title;
      keyset['${selectedText}']  = isSingle && command.selectionText || '';
      keyset['${linkText}'] = isSingle && command.linkText || tab.title;
      keyset['${linkUrl}']  = isSingle && command.linkUrl || tab.url;
      keyset['${linkUrl}']  = decodeURL(keyset['${linkUrl}'], isDecode, isPunycode);
      keyset['${link}']     = keyset['${linkUrl}'];
      keyset['${src}']      = isSingle && command.srcUrl || tab.url;
      keyset['${src}']      = decodeURL(keyset['${src}'], isDecode, isPunycode);
      
      keyset['${linkSelectionTitle}']   = isSingle && (command.linkText || command.selectionText) || tab.title;
      keyset['${selectionLinkTitle}']   = isSingle && (command.selectionText || command.linkText) || tab.title;
      keyset['${linkSrcUrl}']    = isSingle && (command.linkUrl || command.srcUrl) || tab.url;
      keyset['${linkSrcUrl}']    = decodeURL(keyset['${linkSrcUrl}'], isDecode, isPunycode);
      keyset['${srcLinkUrl}']    = isSingle && (command.srcUrl || command.linkUrl) || tab.url;
      keyset['${srcLinkUrl}']    = decodeURL(keyset['${srcLinkUrl}'], isDecode, isPunycode);
      
      keyset['${index}']    = tab.index;
      keyset['${id}']       = tab.id;
      keyset['${tabId}']    = tab.id;
      keyset['${windowId}'] = tab.windowId;
      keyset['${favIconUrl}'] = tab.favIconUrl != '' ? tab.favIconUrl : void 0;
      
      // see https://daringfireball.net/projects/markdown/syntax#backslash
      // + <> → &lt;&gt;
      keyset['${markdown}']
          = tab.title.replace(/([\\\`\*\_\{\}\[\]\(\)\#\+\-\.\!])/g, (c) => { return '\\'+c; })
                     .replace(/</g, '&lt;')
                     .replace(/>/g, '&gt;');
      
      // URL
      try {
        const url = new URL(tab.url);
        urlkeys.forEach((key) => {
          keyset['${'+key+'}'] = url[key];
        });
        keyset['${:port}'] = url.port != '' ? ':'+url.port : '';
        if (isDecode) {
          'hash pathname search'.split(' ').forEach((key) => {
            try {
              keyset['${'+key+'}'] = decodeURIComponent(url[key]);
            } catch (e) {
              keyset['${'+key+'}'] = url[key];
            }
          });
        }
        if (isPunycode) {
          try {
            keyset['${hostname}'] = punycode.toUnicode(url.hostname);
          } catch (e) {
            keyset['${hostname}'] = url.hostname;
          }
        }
      } catch (e) {
        //console.log(e);
        urlkeys.forEach((key) => {
          keyset['${'+key+'}'] = 'undefined';
        });
        keyset['${:port}'] = 'undefined';
      }
    }
    
    // 変換
    const fmt = format.replace(/\${.*?}/ig, (m) => {
      if (keyset.hasOwnProperty(m)) {
        return keyset[m];
      }
      return m;
    });
    temp.push(fmt);
  }
  return temp.join((!command.checkbox__others_extension || command.checkbox__others_enter)
                   ? enter 
                   : '');
  // ${TITLE}${enter}${URL}${enter}ABCDEF abcdef あいうえお${CR}${LF}${test}${tab}${$}
  // ${index}, ${id}, ${tabId}, ${windowId}, ${favIconUrl}, ${markdown}
  // ${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${SSS}${enter}${yy}-${M}-${d}T${H}:${m}:${s}.${S}${enter}${hh}-${h}
  // ${url}${enter}${href}${enter}${protocol}//${hostname}${:port}${pathname}${search}${hash}${enter}${origin}${enter}${protocol}//${host}${enter}${protocol}//${hostname}${port}
};

// クリップボードにコピー
function copyToClipboard(command, tabs) {
  const text = createFormatText(command, tabs);
  
  if (isFirefox() 
   && extension(command, 'others_clipboard_api', true) 
   && !extension(command, 'others_html', true)) {
    // クリップボードコピー（ClipboardAPI）
    navigator.clipboard.writeText(text).then(function() {
      //console.log('successfully');
    }, function() {
      //console.log('failed');
    });
  } else {
    // クリップボードコピー（execCommand）
    document.addEventListener('copy', function oncopy(event) {
      document.removeEventListener('copy', oncopy, true);
      event.stopImmediatePropagation();
      event.preventDefault();
      
      if (extension(command, 'others_html', true) && command.id >= 3) {
        event.clipboardData.setData('text/html', text);
      }
      event.clipboardData.setData('text/plain', text);
    }, true);
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
  if (command.tab && command.target == 'window') {
    // 回避策：#20 ウィンドウのコピーができないことがある
    delete query.currentWindow;
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
    if (command.tab && command.target == 'window') {
      // 回避策：#20 ウィンドウのコピーができないことがある
      // 全ウィンドウを取得して、windowIdが一致するもののみとする
      temp = [];
      for (let i=0; i<tabs.length; i++) {
        if (tabs[i].windowId == command.tab.windowId) {
          temp.push(tabs[i]);
        }
      }
    }
    if (isFirefox() && extension(command, 'others_hidden', true)) {
      for (let i=temp.length; --i; ) {
        if (temp[i].hidden) {
          temp.splice(i, 1);
        }
      }
    }
    if (temp.length == 0) {
      // #24 コピーするタブがない場合、カレントタブをコピーする
      chrome.tabs.query({currentWindow:true, active:true}, (tabs) => {
        copyToClipboard(command, tabs);
        if (callback) {
          // 処理完了通知
          callback();
        }
      });
    } else {
      copyToClipboard(command, temp);
      if (callback) {
        // 処理完了通知
        callback();
      }
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
    valueSet.id = menu.format;
    valueSet.format = valueSet.formats.find((v) => v.id == menu.format).format;
    //valueSet.format = valueSet.formats.find((v) => v.id == menu.format);
    //valueSet.format.checkbox__others_html = true; // みたいな？
    valueSet.target = menu.target;
    valueSet.selectionText = info.selectionText;
    valueSet.linkText = info.linkText;  // Firefox56+(Chromeは、対象外)
    valueSet.linkUrl = info.linkUrl;
    valueSet.srcUrl = info.srcUrl;
    valueSet.tab = tab;
    onCopyTab(valueSet, null);
  });
};

// コンテキストメニュー更新
function updateContextMenus() {
  function onUpdateContextMenus(valueSet) {
    const format9 = extension(valueSet, 'others_format9', true);
    
    // メニュー追加
    const contexts = [];
    if (valueSet.checkbox__menus_contexts_all) {  contexts.push('all'); }
    if (valueSet.checkbox__menus_contexts_page) { contexts.push('page'); }
    if (!format9 && extension(valueSet, 'menus_contexts_selection', true)) { contexts.push('selection'); }
    if (!format9 && extension(valueSet, 'menus_contexts_link', true)) { contexts.push('link'); }
    if (!format9 && extension(valueSet, 'menus_contexts_image', true)) { contexts.push('image'); }
    if (valueSet.checkbox__menus_contexts_browser_action) { contexts.push('browser_action'); }
    if (isFirefox() && valueSet.checkbox__menus_contexts_tab) { contexts.push('tab'); }
    
    let isMenu = false;
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
          // ブラウザアクションは、6個制限(ACTION_MENU_TOP_LEVEL_LIMIT)があるため、セパレータなし
          if (menus.length > chrome.contextMenus.ACTION_MENU_TOP_LEVEL_LIMIT) {
            if (!(contexts.length == 1 && contexts[0] == 'browser_action')) {
              chrome.contextMenus.create({
                type: menus[i].type,
                contexts: contexts.filter((v) => v != 'browser_action'),
              });
            }
          } else {
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
      isMenu = menus.length;
    }
    if (format9) {
      chrome.contextMenus.create({
        id: 'exmenu'+valueSet.menus[21].id,
        title: (extension(valueSet, 'others_edit_menu_title', true)
                ? valueSet.menus[21].title
                : defaultStorageValueSet.menus[21].title),
        contexts: ['selection', 'link', 'image'],
      });
    }
    if (isMenu || format9) {
      chrome.contextMenus.onClicked.addListener(onContextMenus);
    }
  };
  
  // メニュー削除 && ストレージ取得
  chrome.contextMenus.removeAll(() => {
    getStorageArea().get(defaultStorageValueSet, onUpdateContextMenus);
  });
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
