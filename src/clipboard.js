/**
 * 共通処理
 */
'use strict';



// オフスクリーンの起動・停止処理
// Chrome 109+
// see https://developer.chrome.com/docs/extensions/reference/offscreen/
// see #example-maintaining-the-lifecycle-of-an-offscreen-document
let creatingOffscreenDocumentPromise = null;
async function hasOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  if (chrome.runtime.getContexts) {
    // Chrome 116+
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [offscreenUrl],
    });
    return !!contexts.length;
  } else {
    // Chrome 109-115
    // see #before-chrome-116-check-if-an-offscreen-document-is-open
    for (const client of await clients.matchAll()) {
      if (client.url === offscreenUrl) {
        return true;
      }
    }
    return false;
  }
};
async function setupOffscreenDocument(path) {
  if (await hasOffscreenDocument(path)) {
    // ...
  } else {
    if (creatingOffscreenDocumentPromise) {
      await creatingOffscreenDocumentPromise;
    } else {
      creatingOffscreenDocumentPromise = chrome.offscreen.createDocument({
        url: path,
        reasons: ['CLIPBOARD'],
        justification: 'Used for writing to the clipboard.',
      });
      await creatingOffscreenDocumentPromise;
    }
    creatingOffscreenDocumentPromise = null;
  }
};
async function closeOffscreenDocument() {
  await chrome.offscreen.closeDocument();
};
// 備考：オフスクリーンドキュメントは、１つしか開けない。
// 　　　そのため、正常にクローズされなければならない。
// 　　　別パスのオフスクリーンドキュメントが生存していてはならない。



// 改行文字の取得
const platformPromise = chrome.runtime.getPlatformInfo();
let platform = null;
const getEnterCode = async (cmd) => {
  const newline = ex2(cmd) ? cmd.newline : defaultStorage.newline;
  switch (newline) {
  case 'CRLF':  return '\r\n';
  case 'CR':    return '\r';
  case 'LF':    return '\n';
  case 'default':
  default:
    if (!platform) { platform = await platformPromise; }
    return platform.os === 'win' ? '\r\n' : '\n';
  }
};



// URL のデコード
const decodeURL = (data, isDecode, isPunycode) => {
  if (isDecode || isPunycode) {
    try {
      let {protocol, hostname, port, pathname, search, hash} = new URL(data);
      if (isPunycode) {
        try { hostname = punycode.toUnicode(hostname); } catch (e) {}
      }
      if (isDecode) {
        try { pathname = decodeURIComponent(pathname); } catch (e) {}
        try { search = decodeURIComponent(search); } catch (e) {}
        try { hash = decodeURIComponent(hash); } catch (e) {}
      }
      return protocol+'//'+hostname+(port != '' ? ':'+port : '')+pathname+search+hash;
    } catch (e) {}
  }
  return data;
};



// フォーマット文字列作成
const createFormatText = (cmd, tabs) => {
  // 前処理
  const isExtendedMode = ex2(cmd);
  const isDecode = ex2(cmd, 'others_decode');
  const isPunycode = ex2(cmd, 'others_punycode');
  const enter = cmd.enter;
  const keyset = {};
  let format = cmd.format;
  let separator = isExtendedMode ? cmd.separator : defaultStorage.separator;
  
  // Standard
  keyset['${enter}'] = enter;
  keyset['${$}'] = '$';
  format = format.replace(/\${(title|url|enter)}/ig, (m) => m.toLowerCase());
  separator = separator.replace(/\${(title|url|enter)}/ig, (m) => m.toLowerCase());
  
  if (isExtendedMode) {
    // Basic
    format = format.replace(/\${(text|index|id)}/ig, (m) => m.toLowerCase());
    separator = separator.replace(/\${(text|index|id)}/ig, (m) => m.toLowerCase());
    
    // Character code
    keyset['${cr}'] = '\r';
    keyset['${lf}'] = '\n';
    keyset['${tab}'] = '\t';
    format = format.replace(/\${(tab|\\t|t)}/ig, '${tab}')
                   .replace(/\${(cr|\\r|r)}/ig,  '${cr}')
                   .replace(/\${(lf|\\n|n)}/ig,  '${lf}')
    separator = separator.replace(/\${(tab|\\t|t)}/ig, '${tab}')
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
    if (isDecode || isPunycode) {
      // #35 ソースコード表示画面のURLが正常に取得できないことがある
      // ${origin} → ${protocol}//${host}
      format = format.replace(/\${url}/g, '${href}')
                     .replace(/\${href}/g, '${origin}${pathname}${search}${hash}')
                     .replace(/\${origin}/g, '${protocol}//${host}')
                     .replace(/\${host}/g, '${hostname}${:port}');
      // ${url}, ${href}, ${origin}, ${host} は存在しなくなる
      // ${protocol}//${hostname}${:port}${pathname}${search}${hash}
    }
  }
  const sep = separator.replace(/\${.*?}/ig, (m) => keyset.hasOwnProperty(m) ? keyset[m] : m);
  
  // 本処理
  const temp = [];
  const isSingle = tabs.length == 1;
  const urlkeys = 'hash host hostname href origin pathname port protocol search'.split(' ');
  for (const tab of tabs) {
    // Standard
    keyset['${title}'] = tab.title;
    keyset['${url}'] = tab.url;
    
    if (isExtendedMode) {
      // Basic
      keyset['${text}']     = isSingle && cmd.selectionText || tab.title;
      keyset['${selectedText}']  = isSingle && cmd.selectionText || '';
      keyset['${linkText}'] = isSingle && cmd.linkText || tab.title;
      keyset['${linkUrl}']  = isSingle && cmd.linkUrl || tab.url;
      keyset['${linkUrl}']  = decodeURL(keyset['${linkUrl}'], isDecode, isPunycode);
      keyset['${link}']     = keyset['${linkUrl}'];
      keyset['${src}']      = isSingle && cmd.srcUrl || tab.url;
      keyset['${src}']      = decodeURL(keyset['${src}'], isDecode, isPunycode);
      
      keyset['${linkSelectionTitle}']   = isSingle && (cmd.linkText || cmd.selectionText) || tab.title;
      keyset['${selectionLinkTitle}']   = isSingle && (cmd.selectionText || cmd.linkText) || tab.title;
      keyset['${linkSrcUrl}']    = isSingle && (cmd.linkUrl || cmd.srcUrl) || tab.url;
      keyset['${linkSrcUrl}']    = decodeURL(keyset['${linkSrcUrl}'], isDecode, isPunycode);
      keyset['${srcLinkUrl}']    = isSingle && (cmd.srcUrl || cmd.linkUrl) || tab.url;
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
      const url = new URL(tab.url);
      urlkeys.forEach(key => keyset['${'+key+'}'] = url[key]);
      keyset['${:port}'] = url.port != '' ? ':'+url.port : '';
      if (isDecode) {
        ['hash', 'pathname', 'search'].forEach((key) => {
          try {   keyset['${'+key+'}'] = decodeURIComponent(url[key]); } 
          catch { keyset['${'+key+'}'] = url[key]; }
        });
      }
      if (isPunycode) {
        try {   keyset['${hostname}'] = punycode.toUnicode(url.hostname); }
        catch { keyset['${hostname}'] = url.hostname; }
      }
    }
    
    // 変換
    const fmt = format.replace(/\${.*?}/ig, (m) => keyset.hasOwnProperty(m) ? keyset[m] : m);
    temp.push(fmt);
  }
  return temp.join(sep);
  // ${TITLE}${enter}${URL}${enter}ABCDEF abcdef あいうえお${CR}${LF}${test}${tab}${$}
  // ${index}, ${id}, ${tabId}, ${windowId}, ${favIconUrl}, ${markdown}
  // ${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${SSS}${enter}${yy}-${M}-${d}T${H}:${m}:${s}.${S}${enter}${hh}-${h}
  // ${url}${enter}${href}${enter}${protocol}//${hostname}${:port}${pathname}${search}${hash}${enter}${origin}${enter}${protocol}//${host}${enter}${protocol}//${hostname}${port}
};



// クリップボードにコピー
const copyToClipboard = async (cmd, tabs) => {
  const data = {
    target: 'offscreen',
    type: 'clipboardWrite',
    text: await createFormatText(cmd, tabs),
    html: ex2(cmd, 'others_html') && cmd.id >= 3,
  };
  
  if (isFirefox()) {
    document.addEventListener('copy', () => {
      event.preventDefault();
      event.stopImmediatePropagation();
      
      event.clipboardData.setData('text/plain', data.text);
      if (data.html === true) {
        event.clipboardData.setData('text/html', data.text);
      }
    }, {capture:true, once:true});
    document.execCommand('copy');
  } else {
    // オフスクリーン方式（Chrome 109+）
    await setupOffscreenDocument('/offscreen/offscreen.html');
    await chrome.runtime.sendMessage(data);
    await closeOffscreenDocument();
  }
};



// コピーイベント（background.js）
const onCopy = async (cmd) => {
  cmd.enter = await getEnterCode(cmd);
  
  const targetQuery = {
    'tab': {currentWindow:true, highlighted:true}, 
    'window': {currentWindow:true}, 
    'all': {},
  }[cmd.target];
  if (ex2(cmd, 'others_pin')) {
    targetQuery.pinned = false;
  }
  if (cmd.tab && cmd.target == 'window') {
    // 回避策：#20 ウィンドウのコピーができないことがある
    delete targetQuery.currentWindow;
  }
  
  // すべてのタブ: {}
  // カレントウィンドウのすべてのタブ:   {currentWindow:true}
  // カレントウィンドウの選択中のタブ:   {currentWindow:true, highlighted:true}
  // カレントウィンドウのアクティブタブ: {currentWindow:true, active:true}
  const tabs = await chrome.tabs.query(targetQuery);
  let temp = tabs;
  if (cmd.tab && cmd.target == 'tab') {
    // 未選択タブのタブコンテキストメニューは、カレントタブとして扱わない
    if (!tabs.some(tab => tab.id === cmd.tab.id)) {
      temp = [cmd.tab];
    }
    // 備考：複数選択タブ中であっても、未選択タブからのコピー対象は、未選択タブである。
    // 　　　複数選択タブ内に未選択タブが含まれない場合、未選択タブのみを選択したタブとして扱う。
  }
  if (cmd.tab && cmd.target == 'window') {
    // 回避策：#20 ウィンドウのコピーができないことがある
    // 全ウィンドウを取得して、windowIdが一致するもののみとする
    temp = tabs.filter(tab => tab.windowId === cmd.tab.windowId);
  }
  if (isFirefox() && ex2(cmd, 'others_hidden')) {
    temp = temp.filter(tab => !tab.hidden);
  }
  if (temp.length === 0) {
    // #24 コピーするタブがない場合、カレントタブをコピーする
    temp = await chrome.tabs.query({currentWindow:true, active:true});
  }
  
  // クリップボードにコピー
  await copyToClipboard(cmd, temp);
  if (cmd.callback) {
    chrome.runtime.sendMessage({target:'popup', type:cmd.callback});
  }
};


