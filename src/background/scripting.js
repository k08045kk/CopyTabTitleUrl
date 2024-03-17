/**
 * Scripting (Content Script)
 * コンテンツスクリプトを実行します。
 * see https://github.com/k08045kk/CopyTabTitleUrl/wiki/Format
 */
'use strict';


function _executeScriptWithTimeout(obj, time) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(obj)
                    .then(results => resolve(results))
                    .catch((e) => reject(e));
    setTimeout(() => reject('Timeout error.'), time);
  });
  // 備考：現実的な時間で応答を返さない（#66）
  //       chrome.scripting.executeScript({target:{allFrames:true}})
  //       injectImmediately = true で解決済み
  //       本コードを一応残しておく。不要ならば、削除してよい。
};


async function executeScript(tab, cmd) {
  if (!cmd.exoptions.copy_scripting) { return null; }
  
  
  const data = {pageError:''};
  try {
    const world = 'ISOLATED';
    const injectImmediately = !cmd.exoptions.copy_scripting_wait;
    const target = {tabId:tab.id};
    const func = function() {
      return {
        pageTitle: String(document.title ?? ''),
        pageURL: String(document.URL ?? ''),
        pageCharset: String(document.characterSet ?? ''),
        pageContentType: String(document.contentType ?? ''),
        pageCookie: String(document.cookie ?? ''),
        pageDir: String(document.dir ?? ''),
        pageDoctype: String(document.doctype ?? ''),
        pageLastModified: String(document.lastModified ?? ''),
        pageReferrer: String(document.referrer ?? ''),
        pageLang: String(document.documentElement.lang ?? ''),
        
        pageCanonicalUrl: document.querySelector('link[rel="canonical" i]')?.href ?? '',
        pageImageSrc: document.querySelector('link[rel="image_src" i]')?.href ?? '',
        
        metaCharset: document.querySelector('meta[charset]')?.charset ?? '',
        metaDescription: document.querySelector('meta[name="description" i]')?.content ?? '',
        metaKeywords: document.querySelector('meta[name="keywords" i]')?.content ?? '',
        
        metaGenerator: document.querySelector('meta[name="generator" i]')?.content ?? '',
        metaAuthor: document.querySelector('meta[name="author" i]')?.content ?? '',
        metaCopyright: document.querySelector('meta[name="copyright" i]')?.content ?? '',
        metaReplyTo: document.querySelector('meta[name="reply-to" i]')?.content ?? '',
        metaTel: document.querySelector('meta[name="tel" i]')?.content ?? '',
        metaFax: document.querySelector('meta[name="fax" i]')?.content ?? '',
        metaCode: document.querySelector('meta[name="code" i]')?.content ?? '',
        metaTitle: document.querySelector('meta[name="title" i]')?.content ?? '',
        metaBuild: document.querySelector('meta[name="build" i]')?.content ?? '',
        metaCreationDate: document.querySelector('meta[name="creation date" i]')?.content ?? '',
        metaDate: document.querySelector('meta[name="date" i]')?.content ?? '',
        metaLanguage: document.querySelector('meta[name="language" i]')?.content ?? '',
        
        metaApplicationName: document.querySelector('meta[name="application-name" i]')?.content ?? '',
        metaThemeColor: 
            [...document.querySelectorAll('meta[name="theme-color" i]')]
            .find(theme => !theme.media || window.matchMedia(theme.media).matches)?.content ?? '',
            // 備考：theme-color のみ media 属性がある
        
        ogTitle: document.querySelector('meta[property="og:title" i]')?.content ?? '',
        ogType: document.querySelector('meta[property="og:type" i]')?.content ?? '',
        ogUrl: document.querySelector('meta[property="og:url" i]')?.content ?? '',
        ogImage: document.querySelector('meta[property="og:image" i]')?.content ?? '',
        ogSiteName: document.querySelector('meta[property="og:site_name" i]')?.content ?? '',
        ogDescription: document.querySelector('meta[property="og:description" i]')?.content ?? '',
        ogLocale: document.querySelector('meta[property="og:locale" i]')?.content ?? '',
        ogDeterminer: document.querySelector('meta[property="og:determiner" i]')?.content ?? '',
        ogAudio: document.querySelector('meta[property="og:audio" i]')?.content ?? '',
        ogVideo: document.querySelector('meta[property="og:video" i]')?.content ?? '',
        
        pageH1: document.querySelector('h1')?.textContent ?? '',
        //pageHs: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.textContent).join('\n'),
        //pageAhrefs: [...new Set([...document.links].map(a => a.href).filter(href => !/(^$|^javascript:)/i.test(href)))].join('\n'),
        //pageImages: [...new Set([...document.images].map(a => a.src).filter(src => !/(^$|^data:)/i.test(src)))].join('\n'),
        pageSelectionText: window.getSelection().toString(),
        // 備考：ShadowDOM を含む場合、始点のと同じ DOM 内のみ取得する。（ShadowDOM を越境して取得しない）
      };
    };
    const results = await chrome.scripting.executeScript({world, injectImmediately, target, func});
    Object.keys(results[0].result).forEach(key => data[key] = String(results[0].result[key]));
    data.ogpUrl = data.ogUrl || data.pageCanonicalUrl || '';
    data.ogpImage = data.ogImage || data.pageImageSrc || '';
    data.ogpTitle = data.ogTitle || data.metaTitle || data.pageTitle || '';
    data.pageDescription = data.metaDescription || data.ogDescription || '';
    data.ogpDescription = data.ogDescription || data.metaDescription || '';
    // 備考：URL 系は、以降の処理でデコードする（ここではデコードしない）
    // 備考：injectImmediately=true:  run_at=document_start?
    //       injectImmediately=false: run_at=document_idle
    //       copy_scripting_wait=true の場合、最初のスクリプトだけページ読み込みを待機します。
    //       ２番目以降のスクリプトは、既にページが読み込まれているはずです。
  } catch (e) {
    //console.log(e);
    data.pageError = e.toString();
    // 備考：「chrome://」「about:」「mozilla.org」（特権ページ）では動作しない
  }
  
  
  if (!data.pageError && cmd.exoptions.copy_scripting_main) {
    try {
      if (isFirefox()) {
        const world = 'ISOLATED';
        const injectImmediately = true;
        const target = {tabId:tab.id};
        const func = function() {
          const obj = XPCNativeWrapper(window.wrappedJSObject.CopyTabTitleUrl);
          return {
            pageText0: String(obj?.text0 ?? ''),
            pageText1: String(obj?.text1 ?? ''),
            pageText2: String(obj?.text2 ?? ''),
            pageText3: String(obj?.text3 ?? ''),
            pageText4: String(obj?.text4 ?? ''),
            pageText5: String(obj?.text5 ?? ''),
            pageText6: String(obj?.text6 ?? ''),
            pageText7: String(obj?.text7 ?? ''),
            pageText8: String(obj?.text8 ?? ''),
            pageText9: String(obj?.text9 ?? ''),
          };
        };
        const results = await chrome.scripting.executeScript({world, injectImmediately, target, func});
        Object.keys(results[0].result).forEach(key => data[key] = String(results[0].result[key]));
        // 備考：Firefox の MAIN world 対応待ち
        //   see https://bugzilla.mozilla.org/show_bug.cgi?id=1736575
        // 備考：次のコードは、 MAIN WORLD を直接参照します。
        //       window.wrappedJSObject.CopyTabTitleUrl
        // 備考：次のコードを許可します：XPCNativeWrapper()
        //       window.CopyTabTitleUrl = {text0:'main world'};
        // 備考：次のコードをブロックします：XPCNativeWrapper()
        //       window.CopyTabTitleUrl = new Proxy(window.CopyTabTitleUrl, {get:() => 'hack world'});
        //       これは、特権領域（ISOLATED）を保護するための措置です。
        //   see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts
      } else {
        const world = 'MAIN';
        const injectImmediately = true;
        const target = {tabId:tab.id};
        const func = function() {
          return {
            pageText0: window.CopyTabTitleUrl?.text0 ?? '',
            pageText1: window.CopyTabTitleUrl?.text1 ?? '',
            pageText2: window.CopyTabTitleUrl?.text2 ?? '',
            pageText3: window.CopyTabTitleUrl?.text3 ?? '',
            pageText4: window.CopyTabTitleUrl?.text4 ?? '',
            pageText5: window.CopyTabTitleUrl?.text5 ?? '',
            pageText6: window.CopyTabTitleUrl?.text6 ?? '',
            pageText7: window.CopyTabTitleUrl?.text7 ?? '',
            pageText8: window.CopyTabTitleUrl?.text8 ?? '',
            pageText9: window.CopyTabTitleUrl?.text9 ?? '',
          };
        };
        const results = await chrome.scripting.executeScript({world, injectImmediately, target, func});
        Object.keys(results[0].result).forEach(key => data[key] = String(results[0].result[key]));
        // 備考：ページスクリプトの String() を信用しない
      }
      // 備考：ユーザースクリプト（or 外部拡張機能）を想定する。
      //       Example: window.CopyTabTitleUrl = {text0: input};
      // 備考：ユーザー環境であるため、環境に破壊的変更が加えられていることを考慮する
    } catch (e) {
      data.pageError = e.toString();
    }
  }
  
  
  if (!data.pageError && cmd.exoptions.copy_scripting_all && data.pageSelectionText == '') {
    try {
      const world = 'ISOLATED';
      const injectImmediately = true;
      const target = {tabId:tab.id, allFrames:true};
      const func = function() {
        return {
          pageSelectionText: window.getSelection().toString(),
          
          //pageURL: String(document.URL ?? ''),
        };
      };
      const results = await chrome.scripting.executeScript({world, injectImmediately, target, func});
      //const results = await _executeScriptWithTimeout({world, injectImmediately, target, func}, 150);
      data.pageSelectionText = results.find(v => v.result?.pageSelectionText)?.result.pageSelectionText 
                            || '';
      data.pageSelectionText = String(data.pageSelectionText);
      // 備考：サブフレームの選択テキスト対応
      //data.pageURLs = results.map(v => String(v.result?.pageURL || ''));
      
      // 備考：現実的な時間で応答を返さない（#66）
      //       allFrames=true, injectImmediately=false の場合、 iframe loading=lazy で
      //       document_idle まで読み込みを無限に待機する。
      //       そのため、 allFrames=true の場合、 injectImmediately=true を確実に設定する
      // 備考：results[n].result = null を出力することがあります。
      //       injectImmediately=false, iframe loading=lazy
    } catch (e) {
      //console.log(e);
      data.pageError = e.toString();
    }
  }
  // 備考：allFrames が一番問題確率が高いため、後に実行する（#66）
  
  
  const isPrompt = tab.active && !(isMobile() && cmd.callback) && /\${(?:(?<out>\w+)=)?pagePrompt(?<supp>\[(?<idx>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')\]|\.(?<fn>\w+)(?<args>\((?:(?<arg1>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')(?:,(?<arg2>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*'))?)?\))?)?}/.test(cmd.format);
  if (!data.pageError && isPrompt) {
    try {
      const world = 'ISOLATED';
      const injectImmediately = true;
      const target = {tabId:tab.id};
      const func = function() {
        return {
          pagePrompt: window.prompt('Input string: ${pagePrompt}') ?? '',
        };
      };
      const results = await chrome.scripting.executeScript({world, injectImmediately, target, func});
      Object.keys(results[0].result).forEach(key => data[key] = String(results[0].result[key]));
    } catch (e) {
      //console.log(e);
      data.pageError = e.toString();
    }
  }
  // 備考：処理タイミングの関係でプロンプトを最後に実行する
  // 備考：プロンプトの挙動について
  //       [OK] or [Enter] の場合、入力文字列を出力する
  //       [Cancel] or [ESC] or [タブ移動] or [ウィンドウ移動] の場合、空文字を出力する。
  
  
  return data;
  // 備考：非アクティブ（タブコンテキストメニュー）で動作する（copy_scripting を実施できる）
  // 備考：非アクティブ（タブコンテキストメニュー）では、 ${pagePrompt} が動作しない
  // 備考：モバイルの ${pagePrompt} は、ポップアップ（完了通知含む）で非対応
  // 備考：separator では、動作しない
};



// ${console.log(msg)}
//async function executeConsoleLog(tab, cmd, args) {
//  if (cmd.exoptions.copy_scripting && cmd.exoptions.copy_scripting_main) {
//    const target = {tabId:tab.id};
//    const func = (msg) => console.log(msg);
//    const world = 'MAIN';
//    await chrome.scripting.executeScript({target, func, args, world});
//    return true;
//  }
//  return false;
//}
// ${window.prompt(msg, def)}
//async function executePrompt(tab, cmd, args) {
//  if (cmd.exoptions.copy_scripting) {
//    const target = {tabId:tab.id};
//    const func = (msg, def) => window.prompt(msg, def);
//    const results = await chrome.scripting.executeScript({target, func, args});
//    return results[0].result;
//  }
//  return null;
//}
