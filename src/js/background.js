/**
 * バックグラウンド処理
 */

// コンテキストメニュー更新
updateContextMenus();

// ショートカットアクション
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
