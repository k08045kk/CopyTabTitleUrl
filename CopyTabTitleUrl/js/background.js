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

// コンテキストメニューの作成
browser.contextMenus.create({
  id: "context-copytab-title-url",
  title: browser.i18n.getMessage("contextMenu_CopyTabTitleUrl"),
  contexts: ["tab"],
  "onclick": function(info, tab) {
    copyToClipboard(tab.title+'\n'+tab.url);
  }
});
browser.contextMenus.create({
  id: "context-copytab-title",
  title: browser.i18n.getMessage("contextMenu_CopyTabTitle"),
  contexts: ["tab"],
  "onclick": function(info, tab) {
    copyToClipboard(tab.title);
  }
});
browser.contextMenus.create({
  id: "context-copytab-url",
  title: browser.i18n.getMessage("contextMenu_CopyTabUrl"),
  contexts: ["tab"],
  "onclick": function(info, tab) {
    copyToClipboard(tab.url);
  }
});
