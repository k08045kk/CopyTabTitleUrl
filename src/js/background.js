/**
 * バックグラウンド処理
 */
page = 'background';

// ブラウザアクション
getStorageArea().get(defaultStorageValueSet, function(valueSet) {
  if (valueSet.action == 'Popup' || valueSet.browser_ShowPopup) {
    chrome.browserAction.setPopup({popup: '/html/popup.html'});
  } else {
    chrome.browserAction.setPopup({popup: ''});
  }
});
chrome.browserAction.onClicked.addListener(function(info, tab) {
  getStorageArea().get(defaultStorageValueSet, function(valueSet) {
    // アクションを実行
    let targetSet = {CurrentTab: {currentWindow:true, active:true}, 
                      CurrentWindow: {currentWindow:true}, 
                      AllWindow: {}};
    let actionSet = {CopyTabTitleUrl:0, CopyTabTitle:1, CopyTabUrl:2, CopyTabFormat:3};
    let type = actionSet[valueSet.action_action];
    let query = targetSet[valueSet.action_target];
    
    onCopyTabs(type, query, valueSet);
  });
});


// コンテキストメニュー更新
if (!isMobile()) {
  updateContextMenus();
}


// ショートカットアクション
if (!isMobile()) {
  if (isFirefox()) {
    getStorageArea().get(defaultStorageValueSet, function(valueSet) {
      if (valueSet.shortcut_command != '') {
        chrome.commands.update({
          'name': 'shortcut_action',
          'shortcut': valueSet.shortcut_command
        });
      }
      if (valueSet.shortcut_command2 != '') {
        chrome.commands.update({
          'name': 'shortcut_action2',
          'shortcut': valueSet.shortcut_command2
        });
      }
    });
  }
  chrome.commands.onCommand.addListener(function(command) {
    if (command == 'shortcut_action') {
      onCopyTabs(3, {currentWindow:true, active:true}, null);
    }
    if (command == 'shortcut_action2') {
      getStorageArea().get(defaultStorageValueSet, function(valueSet) {
        if (valueSet.format_extension && valueSet.format_format2) {
          onCopyTabs(4, {currentWindow:true, active:true}, null);
        }
      });
    }
  });
}
