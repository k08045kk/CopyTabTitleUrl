/**
 * Format
 * フォーマット文字列を作成します。
 * see https://github.com/k08045kk/CopyTabTitleUrl/wiki/Format
 */
'use strict';



// URL のデコード
const decodeURL = (data, isDecode, isPunycode) => {
  if (isDecode || isPunycode) {
    try {
      let {href, hostname, username, password} = new URL(data);
      const user = username != '' 
                 ? username+(password != '' ? ':'+password : '')+'@'
                 : '';
      if (isPunycode) {
        try { 
          const hostname2 = punycode.toUnicode(hostname);
          if (hostname != hostname2) {
            href = href.replace(user+hostname, user+hostname2);
          }
        } catch {}
      }
      if (isDecode) {
        try { href = decodeURIComponent(href); } catch {}
      }
      return href;
      // 備考：「view-source:」のピュニコード変換は未対応
      //       URL.hostname が取れない仕様のため
    } catch {}
  }
  return data;
};



// フォーマット文字列作成
const createFormatText = (cmd, tabs) => {
  // 前処理
  const isExtendedMode = cmd.exoptions.extended_mode;
  const isDecode = cmd.exoptions.copy_decode;
  const isPunycode = cmd.exoptions.copy_punycode;
  const isProgrammable = cmd.exoptions.copy_programmable;
  const isScripting = cmd.exoptions.copy_scripting;
  const isText = cmd.exoptions.copy_text;
  const enter = cmd.enter;
  const keyset = createDefaltKeyset(cmd);
  const now = new Date();
  let format = cmd.format;
  let separator = cmd.separator;
  
  // Standard
  //keyset['${enter}'] = enter;                 // createDefaltKeyset
  //keyset['${$}'] = '$';                       // createDefaltKeyset
  format = format.replace(/\${(title|url|enter)}/ig, (m) => m.toLowerCase());
  separator = separator.replace(/\${(title|url|enter)}/ig, (m) => m.toLowerCase());
  
  if (isExtendedMode) {
    // Basic
    format = format.replace(/\${(text|index|id)}/ig, (m) => m.toLowerCase());
    separator = separator.replace(/\${(text|index|id)}/ig, (m) => m.toLowerCase());
    
    // Character code
    //keyset['${TAB}'] = keyset['${t}'] = '\t'; // createDefaltKeyset
    //keyset['${CR}']  = keyset['${r}'] = '\r'; // createDefaltKeyset
    //keyset['${LF}']  = keyset['${n}'] = '\n'; // createDefaltKeyset
    format = format.replace(/\${(tab|\\t|t)}/ig, '${TAB}')
                   .replace(/\${(cr|\\r|r)}/ig,  '${CR}')
                   .replace(/\${(lf|\\n|n)}/ig,  '${LF}')
    separator = separator.replace(/\${(tab|\\t|t)}/ig, '${TAB}')
                         .replace(/\${(cr|\\r|r)}/ig,  '${CR}')
                         .replace(/\${(lf|\\n|n)}/ig,  '${LF}')
    
    // info
    keyset['${infoButton}'] = cmd.info?.button ?? 0;            // Firefox Only
    keyset['${infoEditable}'] = cmd.info?.editable;
    keyset['${infoFrameId}'] = cmd.info?.frameId ?? '';
    keyset['${infoFrameUrl}'] = cmd.info?.frameUrl ?? '';
    keyset['${infoLinkText}'] = cmd.info?.linkText ?? '';       // Firefox Only
    keyset['${infoLinkUrl}'] = cmd.info?.linkUrl ?? '';
    keyset['${infoMediaType}'] = cmd.info?.mediaType ?? '';
    keyset['${infoModifiers}'] = cmd.info?.modifiers && JSON.stringify(cmd.info.modifiers) || ''; // FF
    keyset['${infoPageUrl}'] = cmd.info?.pageUrl ?? '';
    keyset['${infoSelectionText}'] = cmd.info?.selectionText ?? '';
    keyset['${infoSrcUrl}'] = cmd.info?.srcUrl ?? '';
    keyset['${infoTargetElementId}'] = cmd.info?.targetElementId ?? ''; // Firefox Only
    
    // Date
    keyset['${yyyy}'] =('000'+ now.getFullYear()).slice(-4);
    keyset['${yy}']   =('0' + now.getFullYear()).slice(-2);
    keyset['${y}']    = ''  + now.getFullYear();
    keyset['${MM}']   =('0' +(now.getMonth() + 1)).slice(-2);
    keyset['${dd}']   =('0' + now.getDate()).slice(-2);
    keyset['${hh}']   =('0' +(now.getHours() % 12)).slice(-2);
    keyset['${HH}']   =('0' + now.getHours()).slice(-2);
    keyset['${mm}']   =('0' + now.getMinutes()).slice(-2);
    keyset['${ss}']   =('0' + now.getSeconds()).slice(-2);
    keyset['${SSS}']  =('00'+ now.getMilliseconds()).slice(-3);
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
    keyset['${day}']  = ''+now.getDay();
    keyset['${time}'] = ''+now.getTime();       // milliseconds
    keyset['${timezoneOffset}'] = ''+now.getTimezoneOffset(); // minute offset from UTC
    
    keyset['${YYYY}'] = keyset['${yyyy}'];
    keyset['${YY}']   = keyset['${yy}'];
    keyset['${Y}']    = keyset['${y}'];
    keyset['${DD}']   = keyset['${dd}'];
    keyset['${D}']    = keyset['${d}'];
    keyset['${dayOfWeek}']  = keyset['${day}'];
  }
  
  // Programmable Format
  if (isProgrammable) {
    //keyset['${undefined}'] = undefined;     // createDefaltKeyset
    //keyset['${null}'] = null;               // createDefaltKeyset
    //keyset['${true}'] = true;               // createDefaltKeyset
    //keyset['${false}'] = false;             // createDefaltKeyset
    //keyset['${NaN}'] = NaN;                 // createDefaltKeyset
    //keyset['${Infinity}'] = Infinity;       // createDefaltKeyset
    //keyset['${Math}'] = 'Math';
    //keyset['${String}'] = 'String';
    // 未定義の方が違和感がない？
    //keyset['${tabs.length}'] = tabs.length;
    keyset['${tabsLength}'] = tabs.length;
  }
  if (isText) {
    for (let i=0; i<cmd.texts.length; i++) {
      keyset['${text'+i+'}'] = cmd.texts[i];
    }
  }
  
  const sep = isProgrammable
            ? compile(separator, keyset, now)
            : separator.replace(/\${.*?}/ig, (m) => keyset.hasOwnProperty(m) ? keyset[m] : m);
  
  // 本処理
  const temp = [];
  const urlkeys = ['href', 'origin', 'protocol', 'username', 'password', 
                   'host', 'hostname', 'port', 'pathname', 'search', 'hash'];
  const tabkeys = ['active','attention','audible','autoDiscardable','cookieStoreId','discarded',
                   'favIconUrl','height','hidden','highlighted','id','incognito','index',
                   'isArticle','isInReaderMode','lastAccessed','mutedInfo','openerTabId','pinned',
                   'sessionId','status','successorId','title','url','width','windowId'];
  // see https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
  let idx = 0;  // ${tabsIndex}
  
  for (const tab of tabs) {
    // Standard
    keyset['${title}'] = tab.title;
    keyset['${url}'] = decodeURL(tab.url, isDecode, isPunycode);
    
    if (isExtendedMode) {
      // Basic
      const active = tabs.length == 1 && tab.id == cmd.tab?.id;
      keyset['${frameUrl}'] = active && cmd.info?.frameUrl || tab.url;
      keyset['${frameUrl}'] = decodeURL(keyset['${frameUrl}'], isDecode, isPunycode);
      keyset['${text}']     = active && cmd.selectionText || tab.title;
      keyset['${selectionText}'] = active && cmd.selectionText || '';
      keyset['${selectedText}']  = active && cmd.selectionText || '';
      keyset['${linkText}'] = active && cmd.info?.linkText || tab.title;
      keyset['${linkUrl}']  = active && cmd.info?.linkUrl || tab.url;
      keyset['${linkUrl}']  = decodeURL(keyset['${linkUrl}'], isDecode, isPunycode);
      keyset['${link}']     = keyset['${linkUrl}'];
      keyset['${src}']      = active && cmd.info?.srcUrl || tab.url;
      keyset['${src}']      = decodeURL(keyset['${src}'], isDecode, isPunycode);
      
      keyset['${linkSelectionTitle}'] = active && (cmd.info?.linkText || cmd.selectionText) || tab.title;
      keyset['${selectionLinkTitle}'] = active && (cmd.selectionText || cmd.info?.linkText) || tab.title;
      keyset['${linkSrcUrl}'] = active && (cmd.info?.linkUrl || cmd.info?.srcUrl) || tab.url;
      keyset['${linkSrcUrl}'] = decodeURL(keyset['${linkSrcUrl}'], isDecode, isPunycode);
      keyset['${srcLinkUrl}'] = active && (cmd.info?.srcUrl || cmd.info?.linkUrl) || tab.url;
      keyset['${srcLinkUrl}'] = decodeURL(keyset['${srcLinkUrl}'], isDecode, isPunycode);
      
      keyset['${index}']      = tab.index;
      keyset['${id}']         = tab.id;
      keyset['${tabId}']      = tab.id;
      keyset['${windowId}']   = tab.windowId;
      keyset['${favIconUrl}'] = tab.favIconUrl ?? '';
      
      // URL
      const url = new URL(tab.url);
      urlkeys.forEach(key => keyset['${'+key+'}'] = url[key]);
      keyset['${username@}'] = url.username != '' ? url.username+'@' : '';
      keyset['${username:password@}'] = url.username != '' 
                                      ? url.username+(url.password != '' ? ':'+url.password : '')+'@'
                                      : '';
      keyset['${:port}'] = url.port != '' ? ':'+url.port : '';
      if (isPunycode) {
        try { keyset['${hostname}'] = punycode.toUnicode(url.hostname); } catch {}
        if (url.hostname != keyset['${hostname}']) {
          const user = keyset['${username:password@}'];
          keyset['${href}'] = url.href.replace(user+url.hostname, user+keyset['${hostname}']);
          if (url.origin != 'null') {
            keyset['${origin}'] = url.origin.replace(url.hostname, keyset['${hostname}']);
          }
          keyset['${host}'] = url.host.replace(url.hostname, keyset['${hostname}']);
        }
        // https://日本語.jp/日本語.jp/xn--wgv71a119e.jp
        // ${title}${enter}${url}${enter}${href}${enter}${origin}${enter}${host}${enter}${hostname}
        // ${protocol}//${username:password@}${hostname}${:port}${pathname}${search}${hash}
      }
      if (isDecode) {
        ['${href}', '${username}', '${password}', '${username@}', '${username:password@}',
         '${pathname}', '${search}', '${hash}'].forEach((key) => {
          try { keyset[key] = decodeURIComponent(keyset[key]); } catch {}
        });
      }
      // 備考：username, password は、閲覧 URL としては出現しないはず（一応実装しておく）
    }
    
    // Scripting
    keyset['${scripting}'] = !!cmd.scripting;
    if (cmd.scripting) {
      Object.keys(cmd.scripting).forEach(key => keyset['${'+key+'}'] = cmd.scripting[key]);
    }
    if (isScripting && cmd.target === 'tab' && tabs.length === 1) {
      keyset['${canonicalUrl}'] = keyset['${pageCanonicalUrl}'] || keyset['${ogUrl}'] || tab.url;
      keyset['${canonicalUrl}'] = decodeURL(keyset['${canonicalUrl}'], isDecode, isPunycode);
      keyset['${ogpUrl}'] = keyset['${ogpUrl}'] || tab.url;
      keyset['${ogpUrl}'] = decodeURL(keyset['${ogpUrl}'], isDecode, isPunycode);
      keyset['${ogpImage}'] = keyset['${ogpImage}'] || '';
      keyset['${ogpImage}'] = decodeURL(keyset['${ogpImage}'], isDecode, isPunycode);
      keyset['${ogpTitle}'] = keyset['${ogpTitle}'] || tab.title;
      keyset['${ogpDescription}'] = keyset['${ogpDescription}'] || '';
    }
    
    // 変換
    if (isProgrammable) {
      keyset['${tabsIndex}'] = idx++;
      
      //tabkeys.forEach(key => keyset['${tab.'+key+'}'] = tab[key]);
      tabkeys.forEach(key => keyset['${tab'+(key.at(0).toUpperCase()+key.slice(1))+'}'] = tab[key]);
      // 備考：tab 情報をそのまま提供する（url のデコード等は、実施しない）
      
      temp.push(compile(format, keyset, now));
    } else {
      temp.push(format.replace(/\${.*?}/ig, (m) => keyset.hasOwnProperty(m) ? keyset[m] : m));
    }
  }
  return temp.join(sep);
  // ${TITLE}${enter}${URL}${enter}ABCDEF abcdef あいうえお${CR}${LF}${test}${tab}${$}
  // ${index}, ${id}, ${tabId}, ${windowId}, ${favIconUrl}
  // ${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${SSS}${enter}${yy}-${M}-${d}T${H}:${m}:${s}.${S}${enter}${hh}-${h}
  // ${url}${enter}${href}${enter}${protocol}//${hostname}${:port}${pathname}${search}${hash}${enter}${origin}${enter}${protocol}//${host}${enter}${protocol}//${hostname}${port}
};
