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
  //       chrome.scripting.executeScript({target:allFrames:true})
};


async function executeScript(tab, cmd) {
  if (!cmd.exoptions.copy_scripting) { return null; }
  
  
  const data = {pageError:''};
  try {
    const world = 'ISOLATED';
    const target = {tabId:tab.id};
    const func = function() {
      return {
        pageTitle: (document.title ?? '')+'',
        pageURL: (document.URL ?? '')+'',
        pageCharset: (document.characterSet ?? '')+'',
        pageContentType: (document.contentType ?? '')+'',
        pageCookie: (document.cookie ?? '')+'',
        pageDir: (document.dir ?? '')+'',
        pageDoctype: (document.doctype ?? '')+'',
        pageLastModified: (document.lastModified ?? '')+'',
        pageReferrer: (document.referrer ?? '')+'',
        pageLang: (document.documentElement.lang ?? '')+'',
        
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
    const results = await chrome.scripting.executeScript({world, target, func});
    Object.keys(results[0].result).forEach(key => data[key] = results[0].result[key]);
    data.ogpUrl = data.ogUrl || data.pageCanonicalUrl || '';
    data.ogpImage = data.ogImage || data.pageImageSrc || '';
    data.ogpTitle = data.ogTitle || data.metaTitle || data.pageTitle || '';
    data.pageDescription = data.metaDescription || data.ogDescription || '';
    data.ogpDescription = data.ogDescription || data.metaDescription || '';
    // 備考：URL 系は、以降の処理でデコードする（ここではデコードしない）
  } catch (e) {
    //console.log(e);
    data.pageError = e.toString();
    // 備考：「chrome://」「about:」「mozilla.org」（特権ページ）では動作しない
  }
  
  
  const isPrompt = tab.active && !(isMobile() && cmd.callback) && /\${(?:(?<out>\w+)=)?pagePrompt(?<supp>\[(?<idx>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')\]|\.(?<fn>\w+)(?<args>\((?:(?<arg1>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')(?:,(?<arg2>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*'))?)?\))?)?}/.test(cmd.format);
  if (!data.pageError && isPrompt) {
    try {
      const world = 'ISOLATED';
      const target = {tabId:tab.id};
      const func = function() {
        return {
          pagePrompt: window.prompt('Input string: ${pagePrompt}') ?? '',
        };
      };
      const results = await chrome.scripting.executeScript({world, target, func});
      Object.keys(results[0].result).forEach(key => data[key] = results[0].result[key]);
    } catch (e) {
      //console.log(e);
      data.pageError = e.toString();
    }
  }
  
  
  if (!data.pageError && cmd.exoptions.copy_scripting_main) {
    try {
      const world = 'MAIN';
      const target = {tabId:tab.id};
      const func = function() {
        return {
          pageText0: window.CopyTabTitleUrl?.text0?.toString() ?? '',
          pageText1: window.CopyTabTitleUrl?.text1?.toString() ?? '',
          pageText2: window.CopyTabTitleUrl?.text2?.toString() ?? '',
          pageText3: window.CopyTabTitleUrl?.text3?.toString() ?? '',
          pageText4: window.CopyTabTitleUrl?.text4?.toString() ?? '',
          pageText5: window.CopyTabTitleUrl?.text5?.toString() ?? '',
          pageText6: window.CopyTabTitleUrl?.text6?.toString() ?? '',
          pageText7: window.CopyTabTitleUrl?.text7?.toString() ?? '',
          pageText8: window.CopyTabTitleUrl?.text8?.toString() ?? '',
          pageText9: window.CopyTabTitleUrl?.text9?.toString() ?? '',
          // 備考：ユーザースクリプト（or 外部拡張機能）を想定する。
          //       Example: window.CopyTabTitleUrl = {text0: input};
        };
      };
      const results = await chrome.scripting.executeScript({world, target, func});
      Object.keys(results[0].result).forEach(key => data[key] = results[0].result[key]);
    } catch {
      data.pageError = e.toString();
    }
  }
  
  
  if (!data.pageError && cmd.exoptions.copy_scripting_all && data.pageSelectionText == '') {
    try {
      const world = 'ISOLATED';
      const target = {tabId:tab.id, allFrames:true};
      const func = function() {
        return {
          pageSelectionText: window.getSelection().toString(),
          
          //pageURL: (document.URL ?? '')+'',
        };
      };
      //const results = await chrome.scripting.executeScript({world, target, func});
      const results = await _executeScriptWithTimeout({world, target, func}, 150);
      data.pageSelectionText = results.find(v => v.result.pageSelectionText)?.result.pageSelectionText 
                            || '';
      // 備考：サブフレームの選択テキスト対応
      //data.pageURLs = results.map(v => v.result.pageURL || '');
    } catch (e) {
      //console.log(e);
      data.pageError = e.toString();
    }
  }
  // 備考：allFrames が一番問題確率が高いため、最後に実行する（#66）
  
  
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
