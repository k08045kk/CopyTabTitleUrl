// クリップボードにコピー
function copyToClipboard(text) {
  function oncopy(event) {
    document.removeEventListener("copy", oncopy, true);
    // Hide the event from the page to prevent tampering.
    event.stopImmediatePropagation();

    // Overwrite the clipboard content.
    event.preventDefault();
    event.clipboardData.setData("text/plain", text);
  }
  document.addEventListener("copy", oncopy, true);

  // Requires the clipboardWrite permission, or a user gesture:
  document.execCommand("copy");
}

function getStorageArea() {
  return (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
}



// 設定を復元
function restoreOptions() {
//  getStorageArea()
//    .get({
//        'targetLang': "undefined"
//    }, function(result) {
//        var targetLang = result.targetLang;
//        document.getElementById('targetLang')
//            .value = targetLang;
//        //console.log ('Option restored: targetLang = ' + targetLang);
//    });
}

// 言語対応
function localizeOptionsPage() {
  document.getElementById("specialActionSettingsTitle")
    .textContent = browser.i18n.getMessage("optionsPage_SpecialActionSettingsTitle");
  
  document.getElementById("allWindow")
    .textContent = browser.i18n.getMessage("optionsPage_AllWindow");
  document.getElementById("all-copyalltab-title-url")
    .textContent = browser.i18n.getMessage("optionsPage_CopyAllTabTitleUrl");
  document.getElementById("all-copyalltab-title")
    .textContent = browser.i18n.getMessage("optionsPage_CopyAllTabTitle");
  document.getElementById("all-copyalltab-url")
    .textContent = browser.i18n.getMessage("optionsPage_CopyAllTabUrl");
  
  document.getElementById("currentWindow")
    .textContent = browser.i18n.getMessage("optionsPage_CurrentWindow");
  document.getElementById("current-copyalltab-title-url")
    .textContent = browser.i18n.getMessage("optionsPage_CopyAllTabTitleUrl");
  document.getElementById("current-copyalltab-title")
    .textContent = browser.i18n.getMessage("optionsPage_CopyAllTabTitle");
  document.getElementById("current-copyalltab-url")
    .textContent = browser.i18n.getMessage("optionsPage_CopyAllTabUrl");
}

// ページ読み込み完了イベント
function onPageLoaded() {
  restoreOptions();
  localizeOptionsPage();
}

function onCopyAllTab(type, query) {
  // すべてのタブ: {}
  // カレントウィンドウのすべてのタブ: {currentWindow: true}
  browser.tabs.query(query)
    .then(function(tabs) {
      var text = '';
      for (let tab of tabs) {
        if (text.length != 0) {
          text += '\n';
        }
        switch (type) {
        case 0: text += tab.title + '\n' + tab.url; break;
        case 1: text += tab.title; break;
        case 2: text += tab.url; break;
        }
      }
      copyToClipboard(text);
    }, function() {
      //console.log('onCopyAllTab() error.');
    });
}

document.addEventListener('DOMContentLoaded', onPageLoaded);
document.getElementById('all-copyalltab-title-url').addEventListener('click', function() {
  onCopyAllTab(0, {});
});
document.getElementById('all-copyalltab-title').addEventListener('click', function() {
  onCopyAllTab(1, {});
});
document.getElementById('all-copyalltab-url').addEventListener('click', function() {
  onCopyAllTab(2, {});
});
document.getElementById('current-copyalltab-title-url').addEventListener('click', function() {
  onCopyAllTab(0, {currentWindow: true});
});
document.getElementById('current-copyalltab-title').addEventListener('click', function() {
  onCopyAllTab(1, {currentWindow: true});
});
document.getElementById('current-copyalltab-url').addEventListener('click', function() {
  onCopyAllTab(2, {currentWindow: true});
});
