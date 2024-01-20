/**
 * 共通処理
 */
'use strict';

/**
 * 備考
 * 最小対応バージョンの覚書
 * 
 * Firefox 115.0+
 *   manifest.json
 *     browser_specific_settings.strict_min_version = "115.0";
 *   109: Manifest V3 対応（既定で有効化）
 *   115: ESR
 *   ???: background module 対応
 *
 * Chrome 116+
 *   88:  Manifest v3 対応
 *   94:  structuredClone()
 *   103: chrome.i18n.getMessage 不具合対応
 *   109: chrome.offscreen
 *   116: chrome.runtime.getContexts({contextTypes:['OFFSCREEN_DOCUMENT']});
*/


// module.exports 対策 (punycode.js)
const module = {};


// ブラウザ判定
const isFirefox = () => 'browser' in globalThis;
const isChrome = () => !isFirefox();



// ストレージの初期値
const defaultStorageVersion1 = {
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
Object.freeze(defaultStorageVersion1);



const defaultStorageVersion2 = {
  version: 2,                           // v2.0.0+
  // id
  // format
  // target
  // selectionText
  // linkText
  // linkUrl
  // srcUrl
  // tab
  // enter
  checkbox__menus_contexts_all: false,
  checkbox__menus_contexts_page: false,
  checkbox__menus_contexts_selection: false,
  checkbox__menus_contexts_link: false,         // v2.1.0+
  checkbox__menus_contexts_image: false,        // v2.1.0+
  checkbox__menus_contexts_browser_action: true,
  checkbox__menus_contexts_tab: true,           // Firefox only
  checkbox__popup_comlate: false,
  checkbox__others_format2: false,              // v3.0.0 （標準モードへ移行）
  checkbox__others_extend_menus: false,         // v2.0.0-v3.0.0 （拡張モードと統合）
  checkbox__others_format9: false,              // v2.2.0+
  checkbox__others_edit_menu_title: false,      // v2.0.0+
  checkbox__others_decode: false,
  checkbox__others_punycode: false,
  checkbox__others_html: false,
  checkbox__others_clipboard_api: false,        // v2.2.0-v3.0.0 v3.1.0 Firefox only
  //checkbox__others_enter: true,               // v2.2.x-
  checkbox__others_pin: false,
  checkbox__others_hidden: true,                // v2.1.1+, v3.0.0 （初期設定をfalse→trueに変更）
  //checkbox__others_selected: true,              // -v3.0.0 （廃止済み）
  //checkbox__others_language: false,             // -v3.0.0 （廃止済み）
  checkbox__others_extension: false,
  select__browser_action: 'popup',              // popup / action
  select__browser_action_target: 'tab',         // tab / window / all
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
    {id:10,title:'format8', format:''}, 
    {id:11,title:'format9', format:'[${linkSelectionTitle}](${linkSrcUrl})'},  // v2.2.0+
  ],
  separator: '${enter}',                        // v2.3.1+
  newline: 'default',                           // v2.3.2+
};
Object.freeze(defaultStorageVersion2);



const defaultStorageVersion3 = {
  version: 3,                           // v3.1.0
  // id
  // format
  // target
  // selectionText
  // linkText
  // linkUrl
  // srcUrl
  // tab
  // enter
  browser_action: 'popup',              // popup / action
  browser_action_target: 'tab',         // tab / window / all
  newline: 'default',                   // default / CRLF / CR / LF
  separator: '${enter}',                // $text
  options: {
    popup_format2: false,               // v3.0.0 （標準モードへ移行）
    popup_title: false,                 // v3.1.0
    popup_tooltip: false,               // v3.1.0
    popup_comlate: true,                // v3.0.0 （初期設定を変更）
    
    context_all: false,
    context_page: false,
    context_selection: false,
    context_link: false,
    context_image: false,
    context_action: true,
    context_tab: true,                  // Firefox only
    
    copy_decode: false,                 // v3.1.0 （標準モードへ移行）
    copy_punycode: false,               // v3.1.0 （標準モードへ移行）
    copy_clipboard_api: false,
    copy_html: false,
    copy_programmable: false,           // v3.1.0
    exclude_pin: false,                 // v3.1.0 （標準モードへ移行）
    exclude_hidden: true,               // v3.0.0, v3.1.0 （初期設定を変更、標準モードへ移行）
    menus_edit_title: false,
    menus_format9: false,
    extended_edit: false,               // v3.1.0
    extended_mode: false,
  },
  menus: [
    {enable:true,  target:'tab', title:'title and URL'},
    {enable:true,  target:'tab', title:'title'},
    {enable:true,  target:'tab', title:'URL'},
    {enable:false, target:'tab', title:'format'},
    {enable:false, target:'tab', title:'format2'},
    
    {enable:false, target:'tab', title:'format3'},
    {enable:false, target:'tab', title:'format4'},
    {enable:false, target:'tab', title:'format5'},
    {enable:false, target:'tab', title:'format6'},
    {enable:false, target:'tab', title:'format7'},
    {enable:false, target:'tab', title:'format8'},
    {enable:false, target:'tab', title:'format9'},
  ],
  formats: [
    '${title}${enter}${url}',                   //  0: title and URL
    '${title}',                                 //  1: title
    '${url}',                                   //  2: URL
    '[${title}](${url})',                       //  3: Markdown
    '<a href="${url}">${title}</a>',            //  4: HTML Link
    
    '',                                         //  5
    '',                                         //  6
    '',                                         //  7
    '',                                         //  8
    '',                                         //  9
    '',                                         // 10
    '[${linkSelectionTitle}](${linkSrcUrl})',   // 11
  ],
  texts: [                                      // v3.1.0
    "[*_\\\\`#+\\-.!{}[\\]()]",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    // Markdown special characters [*_\`#+-.!{}[]()]
    // see https://daringfireball.net/projects/markdown/syntax#backslash
  ],
  
  // 備考：容量概算
  // 　　　(12[menus.title] x 64 x 2) + (12[formats] x 256 x 2) + (10[texts] x 256 x 2) = 33
  // 　　　1536 + 6144 + 5120 = 12800 = 13 KB
  // 　　　合計：5 + 17 = 22 KB
  // 　　　chrome.storage.local = 10 MB
  // 　　　chrome.storage.sync  = 100 KB
};
Object.freeze(defaultStorageVersion3);



const extendedMode = [
  //'popup_format2',                    // standard v3.0.0+
  'popup_title',
  'popup_tooltip',
  //'popup_comlate',                    // standard
  
  //'context_all',                      // standard
  //'context_page',                     // standard
  'context_selection',
  'context_link',
  'context_image',
  //'context_action',                   // standard
  //'context_tab',                      // standard
  
  //'copy_decode',                      // standard v3.1.0+
  //'copy_punycode',                    // standard v3.1.0+
  'copy_clipboard_api',
  'copy_html',
  'copy_programmable',
  //'exclude_pin',                      // standard v3.1.0+
  //'exclude_hidden',                   // standard v3.1.0+
  'menus_edit_title',
  'menus_format9', 
  'extended_edit', 
  //'extended_mode',                    // standard
  
  
  //'newline',                          // extended
  //'separator',                        // extended
];
Object.freeze(extendedMode);
const ex3 = (cmd, name) => {
  if (name) {
    return extendedMode.includes(name)
         ?(cmd.options.extended_mode ? cmd.options[name] : defaultStorage.options[name])
         : cmd.options[name];
  }
  return cmd.options.extended_mode;
};



const defaultStorage = defaultStorageVersion3;



async function converteStorageVersion3() {
  const oldStorage = await chrome.storage.local.get();
  if (oldStorage && oldStorage.version && oldStorage.version >= 3) {
    // バージョン３　変更なし
  } else if (oldStorage && oldStorage.version && oldStorage.version == 2) {
    let newStorage = structuredClone(defaultStorageVersion3);
    try {
      newStorage.browser_action         = oldStorage.select__browser_action;
      newStorage.browser_action_target  = oldStorage.select__browser_action_target;
      newStorage.options.popup_format2  = oldStorage.checkbox__others_format2;
      newStorage.options.popup_comlate  = oldStorage.select__browser_action == 'popup'
                                        ? true
                                        : oldStorage.checkbox__popup_comlate;
      
      newStorage.options.context_all    = oldStorage.checkbox__menus_contexts_all;
      newStorage.options.context_page   = oldStorage.checkbox__menus_contexts_page;
      newStorage.options.context_selection = oldStorage.checkbox__menus_contexts_selection;
      newStorage.options.context_link   = oldStorage.checkbox__menus_contexts_link;
      newStorage.options.context_image  = oldStorage.checkbox__menus_contexts_image;
      newStorage.options.context_action = oldStorage.checkbox__menus_contexts_browser_action;
      newStorage.options.context_tab    = oldStorage.checkbox__menus_contexts_tab;
      
      newStorage.options.copy_decode    = oldStorage.checkbox__others_decode;
      newStorage.options.copy_punycode  = oldStorage.checkbox__others_punycode;
      newStorage.options.copy_clipboard_api = oldStorage.checkbox__others_clipboard_api;
      newStorage.options.copy_html      = oldStorage.checkbox__others_html;
      
      newStorage.newline    = oldStorage.newline;
      newStorage.separator  = oldStorage.separator;
      
      newStorage.options.exclude_pin    = oldStorage.checkbox__others_pin;
      newStorage.options.exclude_hidden = true;
      
      newStorage.options.menus_edit_title = oldStorage.checkbox__others_edit_menu_title;
      newStorage.options.menus_format9  = oldStorage.checkbox__others_format9;
      
      newStorage.options.extended_mode  = oldStorage.checkbox__others_extension;
      
      newStorage.menus = oldStorage.menus.map(menu => {
        return {enable:!!menu.enable, target:menu.target, title:menu.title};
      });
      newStorage.menus.splice(5, 10);
      
      newStorage.formats = oldStorage.formats.map(v => v.format);
    } catch {
      newStorage = structuredClone(defaultStorageVersion3);
    }
    
    await chrome.storage.local.clear();
    await chrome.storage.local.set(newStorage);
    // バージョン２→３
  } else {
    await chrome.storage.local.clear();
    await chrome.storage.local.set(defaultStorageVersion3);
    // バージョン１　想定外
  }
};
// 備考：メジャーバージョン４以降で廃止予定
//       最低でも１年程度（～２０２４年１２月）は、変換機能を維持する
