
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

browser.contextMenus.create({
    id: "context-copytab-title-url",
    title: "タブのタイトルとURLをコピー",
    contexts: ["tab"],
});
browser.contextMenus.create({
    id: "context-copytab-title",
    title: "タブのタイトルをコピー",
    contexts: ["tab"],
});
browser.contextMenus.create({
    id: "context-copytab-url",
    title: "タブのURLをコピー",
    contexts: ["tab"],
});
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "context-copytab-title-url") {
        copyToClipboard(tab.title+'\n'+tab.url);
    }
    if (info.menuItemId === "context-copytab-title") {
        copyToClipboard(tab.title);
    }
    if (info.menuItemId === "context-copytab-url") {
        copyToClipboard(tab.url);
    }
});
