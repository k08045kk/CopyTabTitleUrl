/**
 * バックグラウンド処理
 */

// ブラウザアクション
getStorageArea().get(defaultStorageValueSet, function(valueSet) {
  if (valueSet.action == 'Popup' || valueSet.browser_ShowPopup || isMobile()) {
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
    
    copyTabs(type, query, valueSet, function() {});
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
    });
  }
  chrome.commands.onCommand.addListener(function(command) {
    getStorageArea().get(defaultStorageValueSet, function(valueSet) {
      if (command == 'shortcut_action') {
        copyTabs(3, {currentWindow:true, active:true}, valueSet, function() {});
        //console.log('shortcut_action');
      }
    });
  });
}
