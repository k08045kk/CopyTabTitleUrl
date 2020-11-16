﻿CopyTabTitleUrl
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

You can perform actions on the following tab.
+ Current tab
+ Multiple selected tabs (Option must be enabled)
+ Current window tabs
+ All window tabs

You can perform an action by doing the following.
+ Context menu (all, page, text selection, browser action, tab)
+ Browser action (popup, click)
+ Shortcut



## Format
### Basic
format          | description                           | version
---             | ---                                   | ---
${title}        | Page title                            | v0.0.7
${url}          | Page URL                              | v0.0.7
${markdown}     | ${title} markdown escapes             | v2.1.0 🧪
${text}         | Selection string or page title (※1)  | v1.5.2
${linkText}     | Link text or page title (※2)         | v2.1.0 (Firefox only)
${linkUrl}, ${link}     | Link URL or page URL (※2)    | v2.1.0
${src}          | "src" URL or page URL (※3)           | v2.1.0
${index}        | Serial number from 0 per window       | v1.5.2
${tabId}, $(id} | Tab ID                                | v2.1.0 🧪, v1.5.2
${windowId}     | Tab host window ID                    | v2.1.0 🧪
${favIconUrl}   | Favicon URL (※4)                     | v1.6.0 🧪

※1: Used in the selected text context menus.
※2: Used in the link context menu.
※3: Used in the image context menu.
※4: If it does not exist, output `undefined`.


### Character code
format          | description                           | version
---             | ---                                   | ---
${enter}        | Newline characters (Windows:\r\n, Mac/Linux:\n)       | v0.0.9
${CR}, ${r}     | Carriage Return (\r)                  | v1.1.1, v1.5.2
${LF}, ${n}     | Line Feed (\n)                        | v1.1.1, v1.5.2
${tab}, ${t}    | Horizontal Tab (\t)                   | v0.0.9, v1.5.2
${$}            | $                                     | v1.5.4
${xXX}          | Specify the character code in hexadecimal of "XX".    | v2.1.0 🧪


### Date
format          | description                           | version
---             | ---                                   | ---
${yyyy}, ${yy}  | year                                  | v1.5.4
${MM}, ${M}     | month                                 | v1.5.4
${dd}, ${d}     | day                                   | v1.5.4
${HH}, ${H}     | hours (24 hours)                      | v1.5.4
${hh}, ${h}     | hours (12 hours)                      | v1.5.4
${mm}, ${m}     | minutes                               | v1.5.4
${ss}, ${s}     | seconds                               | v1.5.4
${SSS}, ${S}    | milliseconds                          | v1.5.4

※`${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${SSS}`  
　`2020-04-03T00:48:23.456`


### URL
format          | description                           | version
---             | ---                                   | ---
${protocol}     | protocol:                             | v1.5.6
${username}     | (username)                            | v1.5.6
${username@}    | (username@)                           | v1.5.6
${password}     | (password)                            | v1.5.6
${password@}    | (password@)                           | v1.5.6
${username:password@} | (username:password@)            | v1.5.6
${host}         | hostname(:port)                       | v1.5.6
${hostname}     | hostname                              | v1.5.6
${port}         | (port)                                | v1.5.6
${:port}        | (:port)                               | v1.5.6
${pathname}     | /pathname                             | v1.5.6
${search}       | (?param)                              | v1.5.6
${hash}         | (#hash)                               | v1.5.6
${origin}       | URL origin                            | v1.5.6
${href}         | URL                                   | v1.5.6

※If `(data)` does not exist, it is treated as an empty string.
※[window.URL - Web API | MDN](https://developer.mozilla.org/docs/Web/API/URL)



## License
[MIT](https://github.com/k08045kk/CopyTabTitleUrl/blob/master/LICENSE)



## Author
[toshi](https://github.com/k08045kk)


