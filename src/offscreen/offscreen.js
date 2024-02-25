'use strict';

chrome.runtime.onMessage.addListener((data, sender) => {
  switch (data.target) {
  case 'offscreen.clipboardWrite':      // clipboard.js
/**/// a. document.execCommand('copy') ----------------------------------------
    window.addEventListener('copy', function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      
      event.clipboardData.setData('text/plain', data.text);
      if (data.html === true) {
        event.clipboardData.setData('text/html', data.text);
      }
    }, {capture:true, once:true});
    document.execCommand('copy');
/** // b. navigator.clipboard.writeText ---------------------------------------
    // 次のエラーが発生するため、この方法は使用できません。
    // 「DOMException: Document is not focused.」
    navigator.clipboard.writeText(data.text).then(() => {
      console.log('successfully');
    }).catch((error) => {
      console.log('failed', error);
    });
/**/// ------------------------------------------------------------------------
    break;
  }
});
