/**
 * 共通処理
 */
'use strict';

/**
 * 最小対応バージョンの覚書
 * Firefox 115.0+
 *   manifest.json
 *   browser_specific_settings.strict_min_version = "115.0";
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



const extendedMode = [
  // checkbox
  //'menus_contexts_all',                       // standard
  //'menus_contexts_page',                      // standard
  'menus_contexts_selection',
  'menus_contexts_link',
  'menus_contexts_image',
  //'menus_contexts_browser_action',            // standard
  //'menus_contexts_tab',                       // standard
  
  //'popup_comlate',                            // standard
  
  //'others_format2',                           // standard v3.0.0+
  'others_extend_menus', 
  'others_format9', 
  'others_edit_menu_title',
  
  'others_decode',
  'others_punycode',
  'others_html',
  
  'others_pin',
  'others_hidden',
  
  //'others_extension',                         // standard
  
  // select
  //'browser_action',                           // standard
  //'browser_action_target',                    // standard
  
  // 
  //'separator',                                // extended
  //'newline',                                  // extended
];
const ex2 = (cmd, name) => {
  if (name) {
    return extendedMode.includes(name)
         ? cmd.checkbox__others_extension && cmd['checkbox__'+name]
         : cmd['checkbox__'+name];
  }
  return cmd.checkbox__others_extension;
};



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
  checkbox__others_extend_menus: false,         // v2.0.0+
  checkbox__others_format9: false,              // v2.2.0+
  checkbox__others_edit_menu_title: false,      // v2.0.0+
  checkbox__others_decode: false,
  checkbox__others_punycode: false,
  checkbox__others_html: false,
  //checkbox__others_clipboard_api: false,        // v2.2.0-v3.0.0 Firefox only （廃止済み）
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


const defaultStorage = defaultStorageVersion2;
