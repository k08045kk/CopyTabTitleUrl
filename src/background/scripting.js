/**
 * Scripting
 * see https://github.com/k08045kk/CopyTabTitleUrl/wiki/Options
 */
'use strict';


async function executeScript(tab) {
  try {
    const target = {tabId:tab.id, allFrames:true};
    const func = () => {
      return {
        pageTitle: document.querySelector('title')?.textContent ?? '',
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
        
        pageSelectionText: window.getSelection().toString(),
        pageH1: document.querySelector('h1')?.textContent ?? '',
      };
    };
    const results = await chrome.scripting.executeScript({target, func});
//console.log(results);
    const data = {};
    Object.keys(results[0].result).forEach(key => data[key] = results[0].result[key]);
    data.pageSelectionText = results.find(v => v.result.pageSelectionText)?.result.pageSelectionText 
                          || '';
    data.ogpUrl = data.ogUrl || data.pageCanonicalUrl || '';
    data.ogpImage = data.ogImage || data.pageImageSrc || '';
    data.ogpTitle = data.ogTitle || data.metaTitle || data.pageTitle || '';
    data.pageDescription = data.metaDescription || data.ogDescription || '';
    data.ogpDescription = data.ogDescription || data.metaDescription || '';
    // URL 系は、以降の処理でデコードする（ここではデコードしない）
    return data;
//console.log(data);
  } catch (e) {
    //console.log(e);
    // 備考：タブコンテキストメニューで非アクティブタブを選択した場合
    //       非アクティブタブの情報でコピーする（copy_scripting を実施できる）
    // 備考：「chrome://」では動作しない
    // 備考：複数フレームがある場合、最初のフレームの選択テキストを使用する
  }
  return null;
};
