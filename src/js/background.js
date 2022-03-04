/**
 * バックグラウンド処理
 */

// ストレージバージョン2対応
function converteStorageVersion2(oldValueSet) {
  let newValueSet;
  if (oldValueSet && oldValueSet.version && oldValueSet.version >= 2) {
    newValueSet = oldValueSet;
  } else {
    try {
      const set = JSON.parse(JSON.stringify(defaultStorageValueSetVersion2));
      const old = oldValueSet && 'menu_all' in oldValueSet 
                  ? oldValueSet 
                  : defaultStorageValueSetVersion1;
      
      set.checkbox__menus_contexts_all = !!old.menu_all;
      set.checkbox__menus_contexts_page = !!old.menu_page;
      set.checkbox__menus_contexts_selection = !!old.menu_selection;
      set.checkbox__menus_contexts_browser_action = !!old.menu_browser_action;
      set.checkbox__menus_contexts_tab = !!old.menu_tab;
      set.checkbox__popup_comlate = !!old.browser_ShowPopup;
      set.checkbox__others_format2 = !!old.format_format2;
      set.checkbox__others_decode = !!old.format_decode;
      set.checkbox__others_punycode = !!old.format_punycode;
      set.checkbox__others_html = !!old.format_html;
      set.checkbox__others_enter = 'format_enter' in old ? old.format_enter : true;
      set.checkbox__others_pin = !!old.format_pin;
      set.checkbox__others_selected = 'format_selected' in old ? old.format_selected : true;
      set.checkbox__others_language = !!old.format_language;
      set.checkbox__others_extension = !!old.format_extension;
      
      const action = old.action || 'Popup';
      const target = old.action_target || 'CurrentTab';
      set.select__browser_action = 
          {'Popup':'popup', 'Action':'action'}[action];
      set.select__browser_action_target = 
          {'CurrentTab':'tab', 'CurrentWindow':'window', 'AllWindow':'all'}[target];
      
      !old.item_CopyTabTitleUrl       && (set.menus[0].enable = false);
      !old.item_CopyTabTitle          && (set.menus[1].enable = false);
      !old.item_CopyTabUrl            && (set.menus[2].enable = false);
      !!old.item_CopyTabTitleUrl      && (set.menus[0].enable = true);
      !!old.item_CopyTabTitle         && (set.menus[1].enable = true);
      !!old.item_CopyTabUrl           && (set.menus[2].enable = true);
      !!old.item_CopyTabFormat        && (set.menus[3].enable = true);
      !!old.item_CopyTabFormat2       && (set.menus[4].enable = true);
      
      !!old.item_CopyTabAllTitleUrl   && (set.menus[5].enable = true);
      !!old.item_CopyTabAllTitle      && (set.menus[6].enable = true);
      !!old.item_CopyTabAllUrl        && (set.menus[7].enable = true);
      !!old.item_CopyTabAllFormat     && (set.menus[8].enable = true);
      !!old.item_CopyTabAllFormat2    && (set.menus[9].enable = true);
      
      !!old.item_CopyTabAll2TitleUrl  && (set.menus[10].enable = true);
      !!old.item_CopyTabAll2Title     && (set.menus[11].enable = true);
      !!old.item_CopyTabAll2Url       && (set.menus[12].enable = true);
      !!old.item_CopyTabAll2Format    && (set.menus[13].enable = true);
      !!old.item_CopyTabAll2Format2   && (set.menus[14].enable = true);
      
      set.formats[3].format   = old.format_CopyTabFormat || '[${title}](${url})';
      set.formats[3].shortcut = old.shortcut_command || 'Alt+C';
      set.formats[4].format   = old.format_CopyTabFormat2 || '<a href="${url}">${title}</a>';
      set.formats[4].shortcut = old.shortcut_command2 || '';
      
      newValueSet = set;
    } catch (e) {
      newValueSet = JSON.parse(JSON.stringify(defaultStorageValueSetVersion2));;
    }
    getStorageArea().clear(() => {});
  }
  return newValueSet;
};

function main() {
  // ブラウザアクション
  chrome.browserAction.onClicked.addListener((info, tab) => {
    getStorageArea().get(defaultStorageValueSet, (valueSet) => {
      valueSet.id = 3;
      valueSet.format = valueSet.formats[3].format;
      valueSet.target = valueSet.select__browser_action_target;
      onCopyTab(valueSet, null);
    });
  });
  updateBrowserAction();
  
  // コンテキストメニュー更新
  updateContextMenus();
  
  // キーボードショートカット
  chrome.commands.onCommand.addListener((command) => {
    getStorageArea().get(defaultStorageValueSet, (valueSet) => {
      if (command == 'shortcut_action') {
        valueSet.id = 3;
        valueSet.format = valueSet.formats[3].format;
        valueSet.target = 'tab';
        onCopyTab(valueSet, null);
      } else if (valueSet.checkbox__others_extension) {
        if (valueSet.checkbox__others_format2) {
          if (command == 'shortcut_action2') {
            valueSet.id = 4;
            valueSet.format = valueSet.formats[4].format;
            valueSet.target = 'tab';
            onCopyTab(valueSet, null);
          }
        }
        /*
        // 未実装（要望があれば機能拡張する）
        if (valueSet.checkbox__others_extend_menus) {
          if (command == 'shortcut_action3') {
            valueSet.id = 5;
            valueSet.format = valueSet.formats[5].format;
            valueSet.target = valueSet.menus[15].target;
            onCopyTab(valueSet, null);
          }
          if (command == 'shortcut_action4') {
            valueSet.id = 6;
            valueSet.format = valueSet.formats[6].format;
            valueSet.target = valueSet.menus[16].target;
            onCopyTab(valueSet, null);
          }
        }
        */
      }
    });
  });
};

getStorageArea().get(null, (valueSet) => {
  // ストレージバージョン2対応
  valueSet = converteStorageVersion2(valueSet);
  getStorageArea().set(valueSet, main);
});
