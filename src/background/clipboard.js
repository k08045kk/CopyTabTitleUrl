/**
 * clipboard.js
 * クリップボードへの書き込みを実施します。
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
      creatingOffscreenDocumentPromise = null;
    }
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
  const newline = ex3(cmd) ? cmd.newline : defaultStorage.newline;
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


// クリップボードにコピー
const copyToClipboard = async (cmd, tabs) => {
  const data = {
    target: 'offscreen.clipboardWrite',
    text: createFormatText(cmd, tabs),
    html: ex3(cmd, 'copy_html') && cmd.id >= 3 && /<.+>/.test(cmd.format),
    api: ex3(cmd, 'copy_clipboard_api'),
  };
  if (ex3(cmd, 'copy_empty') && data.text == '') {
    data.text = ' ';
    // 備考：空文字をコピーした場合、コピーは成功します。
    //       ですが、ペースト時に選択範囲を空文字で上書きせずに、元の文字列を残します。（Windows）
    //       スペースをコピーすることで、元の文字列を消すことができます。
    //       スペースよりも、良い文字列があれば再考する。（エラーメッセージとか？）
    // 備考：別途、コピータブなし時、アクティブタグをコピーする仕様あり
  }
  
  if (isFirefox()) {
    if (data.api) {
      // #61 dom.event.clipboardevents.enabled=false で document.execCommand('copy'); が動作しない対策
      navigator.clipboard.writeText(data.text).then(() => {
        //console.log('successfully');
      }, () => {
        //console.log('failed');
      });
    } else {
      window.addEventListener('copy', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        
        event.clipboardData.setData('text/plain', data.text);
        if (data.html === true) {
          event.clipboardData.setData('text/html', data.text);
        }
      }, {capture:true, once:true});
      document.execCommand('copy');
    }
  } else {
    // オフスクリーン方式（Chrome 109+）
    await setupOffscreenDocument('/offscreen/offscreen.html');
    await chrome.runtime.sendMessage(data);
    await closeOffscreenDocument();
  }
};


const tabsQuery = async (query) => {
  if (isKiwi()) {
    let tabs = await chrome.tabs.query(query);
    
    delete query.currentWindow;
    for (const key of Object.keys(query)) {
      tabs = tabs.filter(tab => tab[key] === query[key]);
    }
    
    const popupUrl = chrome.runtime.getURL('/popup/popup.html');
    tabs = tabs.filter(tab => tab.url !== popupUrl);
    return tabs;
    // 備考：Kiwi Browser が mv3 で常にすべてのタブをコピーする
    //       Yandex Browser も巻き込まれる（問題はないはず）
  } else {
    return await chrome.tabs.query(query);
  }
};

// コピーイベント（background.js）
const onCopy = async (cmd) => {
  cmd.enter = await getEnterCode(cmd);
  cmd.separator = ex3(cmd) ? cmd.separator : defaultStorage.separator;
  cmd.exoptions = exOptions(cmd);
  cmd.target = {tab:'tab', window:'window', all:'all'}[cmd.target] ?? 'tab';
  cmd.tab = cmd.tab ?? (await chrome.tabs.query({currentWindow:true, active:true}))[0];
  // 備考：ポップアップ用（ポップアップを開く、コピー完了通知）
  
  const targetQuery = {
    'tab': {currentWindow:true, highlighted:true}, 
    'window': {currentWindow:true}, 
    'all': {},
  }[cmd.target];
  if (ex3(cmd, 'exclude_pin')) {
    targetQuery.pinned = false;
  }
  if (cmd.info && cmd.target == 'window') {
    // 回避策：#20 ウィンドウのコピーができないことがある
    delete targetQuery.currentWindow;
  }
  
  // すべてのタブ: {}
  // カレントウィンドウのすべてのタブ:   {currentWindow:true}
  // カレントウィンドウの選択中のタブ:   {currentWindow:true, highlighted:true}
  // カレントウィンドウのアクティブタブ: {currentWindow:true, active:true}
  //const tabs = await chrome.tabs.query(targetQuery);
  const tabs = await tabsQuery(targetQuery);
  let temp = tabs;
  if (cmd.info && cmd.target == 'tab') {
    // 未選択タブのタブコンテキストメニューは、カレントタブとして扱わない
    if (!tabs.some(tab => tab.id === cmd.tab?.id)) {
      temp = [cmd.tab];
    }
    // 備考：複数選択タブ中であっても、未選択タブからのコピー対象は、未選択タブである。
    // 　　　複数選択タブ内に未選択タブが含まれない場合、未選択タブのみを選択したタブとして扱う。
  }
  if (cmd.info && cmd.target == 'window') {
    // 回避策：#20 ウィンドウのコピーができないことがある
    // 全ウィンドウを取得して、windowIdが一致するもののみとする
    temp = tabs.filter(tab => tab.windowId === cmd.tab?.windowId);
  }
  if (isFirefox() && ex3(cmd, 'exclude_hidden')) {
    temp = temp.filter(tab => !tab.hidden);
  }
  if (temp.length === 0 && ex3(cmd, 'copy_no_tab')) {
    // #24 コピーするタブがない場合、カレントタブをコピーする
    temp = cmd.tab ? [cmd.tab] : [];
    // 備考：タブコンテキストメニュー時は、タブコンテキストメニューを優先する
  }
  
  if (ex3(cmd, 'copy_scripting') && cmd.target === 'tab' && temp.length === 1 && temp[0].id === cmd.tab?.id) {
    // コンテンツスクリプト
    cmd.scripting = await executeScript(temp[0], cmd);
  }
  cmd.selectionText = cmd.info?.selectionText || cmd.scripting?.pageSelectionText || '';
  
  // クリップボードにコピー
  await copyToClipboard(cmd, temp);
  if (cmd.callback) {
    try {
      await chrome.runtime.sendMessage({target:'popup.'+cmd.callback});
    } catch {
      // 備考：window.prompt() でポップアップが閉じる
    }
  }
};
