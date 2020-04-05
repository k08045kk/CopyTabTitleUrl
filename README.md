CopyTabTitleUrl
===============

It is a browser extension in WebExtension format.  
You can install it from the following site.

CopyTabTitleUrl – Add-ons for Firefox  
https://addons.mozilla.org/firefox/addon/copytabtitleurl/

CopyTabTitleUrl - Chrome Web Store  
https://chrome.google.com/webstore/detail/copytabtitleurl/lmgbdjfoaihhgdphombpgjpaohjfeapp



## Features
You can perform the following actions (copy to the clipboard).
+ Copy the title and URL
+ Copy the title
+ Copy the URL
+ Copy the format

You can perform actions on the following targets.
+ Current tab
+ Multiple selected tabs
+ Current window
+ All window

You can perform an action by doing the following.
+ Context menu (all, page, text selection, browser action, tab)
+ Browser action (popup, click)
+ Shortcut



## Usage
### Format
format    | description
---       | ---
${title}  | Page Title.
${text}   | Selection string, or page title.
${url}    | Page URL.
${enter}  | Newline characters (Windows:\r\n, Mac/Linux:\n)
${r}      | Carriage Return (\r)
${n}      | Line Feed (\n)
${t}      | Horizontal Tab (\t)
${index}  | Serial number from 0 per window
${id}     | Tab ID
${$}      | $

---

format          | description
---             | ---
${favIconUrl}   | Favicon URL (※1)

※1: If it does not exist, output `undefined`.

---

format    | description
---       | ---
${yyyy}   | 4-digit year
${yy}     | 2-digit year
${MM}     | month
${M}      | month
${dd}     | day
${d}      | day
${HH}     | hours (24 hours)
${H}      | hours (24 hours)
${hh}     | hours (12 hours)
${h}      | hours (12 hours)
${mm}     | minutes
${m}      | minutes
${ss}     | seconds
${s}      | seconds
${SSS}    | milliseconds
${S}      | milliseconds

※`${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${SSS}`  
　`2020-04-03T00:48:23.456`

---

format          | description
---             | ---
${protocol}     | protocol:
${username}     | (username)
${username@}    | (username@)
${password}     | (password)
${password@}    | (password@)
${username:password@} | (username:password@)
${host}         | hostname(:port)
${hostname}     | hostname
${port}         | (port)
${:port}        | (:port)
${pathname}     | /(pathname)
${search}       | (?param)
${hash}         | (#hash)
${origin}       | URL origin
${href}         | URL

※[window.URL - Web API | MDN](https://developer.mozilla.org/docs/Web/API/Window/URL)



## License
[MIT](https://github.com/k08045kk/CopyTabTitleUrl/blob/master/LICENSE)



## Author
[toshi](https://github.com/k08045kk)


