/**
 * Scripting
 * see https://github.com/k08045kk/CopyTabTitleUrl/wiki/Options
 */
'use strict';


async function executeScript(tab, cmd) {
  let data = {};
  try {
    const target = {tabId:tab.id};
    const func = (isPrompt) => {
      return {
        pageTitle: document.title ?? '',
        pageURL: document.URL ?? '',
        pageCharset: document.characterSet ?? '',
        pageContentType: document.contentType ?? '',
        pageCookie: document.cookie ?? '',
        pageDir: document.dir ?? '',
        pageDoctype: document.doctype ?? '',
        pageLastModified: document.lastModified ?? '',
        pageReferrer: document.referrer ?? '',
        pageLang: document.documentElement.lang ?? '',
        
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
        //pageAhrefs: [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href).filter(href => !/(^$|^javascript:)/i.test(href)))].join('\n'),
        pageSelectionText: window.getSelection().toString(),
        pagePrompt: isPrompt ? window.prompt('Input string: ${pagePrompt}') ?? '' : '',
      };
    };
    const isPrompt = tab.active && !(isMobile() && cmd.callback) && /\${(?:(?<out>\w+)=)?pagePrompt(?<supp>\[(?<idx>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')\]|\.(?<fn>\w+)(?<args>\((?:(?<arg1>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')(?:,(?<arg2>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*'))?)?\))?)?}/.test(cmd.format);
    const args = [isPrompt];
    const results = await chrome.scripting.executeScript({target, func, args});
    Object.keys(results[0].result).forEach(key => data[key] = results[0].result[key]);
    data.ogpUrl = data.ogUrl || data.pageCanonicalUrl || '';
    data.ogpImage = data.ogImage || data.pageImageSrc || '';
    data.ogpTitle = data.ogTitle || data.metaTitle || data.pageTitle || '';
    data.pageDescription = data.metaDescription || data.ogDescription || '';
    data.ogpDescription = data.ogDescription || data.metaDescription || '';
    // 備考：URL 系は、以降の処理でデコードする（ここではデコードしない）
  } catch (e) {
    data = null;
    //console.log(e);
    // 備考：「chrome://」「about:」「mozilla.org」（特権ページ）では動作しない
  }
  
  try {
    if (data?.pageSelectionText == '') {
      const target = {tabId:tab.id, allFrames:true};
      const func = () => {
        return {
          pageSelectionText: window.getSelection().toString(),
        };
      };
      const results = await chrome.scripting.executeScript({target, func});
      data.pageSelectionText = results.find(v => v.result.pageSelectionText)?.result.pageSelectionText 
                            || '';
      // 備考：サブフレームの選択テキスト対応
    }
  } catch {}
  
  return data;
  // 備考：非アクティブ（タブコンテキストメニュー）で動作する（copy_scripting を実施できる）
  // 備考：非アクティブ（タブコンテキストメニュー）では、 ${pagePrompt} が動作しない
  // 備考：モバイルの ${pagePrompt} は、ポップアップ（完了通知含む）で非対応
  // 備考：separator では、動作しない
};
