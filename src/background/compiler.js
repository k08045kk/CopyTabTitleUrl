/**
 * Programmable Format
 * フォーマットをプログラム可能にします。
 * see https://github.com/k08045kk/CopyTabTitleUrl/wiki/Format
 */
'use strict';


//export 
function compile(format, keyset, options) {
  const reInteger = /^[+\-]?\d+$/;
  const reString = /^("[^"}]*"|'[^'}]*')$/;
  const isInteger = (i) => {
    return Number.isInteger(i) && Number.MIN_SAFE_INTEGER <= i && i <= Number.MAX_SAFE_INTEGER;
  };
  const toProperty = (text) => keyset['${'+text+'}'];
  const toInteger = (text) => {
    const i = Number.parseInt(text);
    return isInteger(i) ? i  : void 0;
  };
  const toValue = (text) => {
    if (text == null) {
      return void 0;
    } else if (reInteger.test(text)) {
      return toInteger(text);
    } else if (reString.test(text)) {
      return text.slice(1, -1);
    } else if (keyset['${'+text+'}'] !== void 0) {
      if (reInteger.test(keyset['${'+text+'}'])) {
        const i = toInteger(keyset['${'+text+'}']);
        if (i != null) { return i; }
      }
      return keyset['${'+text+'}'];
    }
    return void 0;
  };
  const toBoolean = (value) => {
    return !!value;
    // false: false, undefined, null, NaN, 0, ''
    // true: true, -1, 'false', 'undefined', 'null', 'NaN', '0'
  };
  const reserved = [
    'globalThis', 'this', 'arguments',
    'Math', 'String', 'Date',
    'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
    '$', 'title', 'url', 'enter',
    'tabs', 'tab', 'scripting',
  ];
  
  const re = /^\${(?:(?<out>\w+)=)?(?<in>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')(?<supp>\[(?<idx>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')\]|\.(?<fn>\w+)(?<args>\((?:(?<arg1>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')(?:,(?<arg2>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*'))?)?\))?)?}$/;
  // ${(out=)in([idx]|.fn|.fn(args))}
  // ${in.fn(arg1,arg2)}
  // ${in.fn}
  // ${in[idx]}
  // ${in}
  // ${integer}
  // ${'string'}
  // ${'string'.fn()}
  // in = constant(Math, String, Date) | variable
  // fn = constant(replace, replaceAll, ...)
  // out | idx | arg1 | arg2 = variable
  // variable = property | integer | string
  
  // out = fn = (\w+)
  // in = idx = arg1 = arg2 = (\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')
  // re = /^\${(<out>=)?<in>(\[<idx>\]|\.<fn>(\((<arg1>(,<arg2>)?)?\))?)?}$/
  
  // 備考：次の要素にアクセスできない（名称に記号が含まれるため）
  //       ${$}, ${:port}, ${username@}, ${username:password@}
  //       すべて代用が可能なため、現状動作でよしとする。（${port} 等）
  // 備考：正規表現を変更する場合、次の場所も考慮する。
  //       scripting.js: isPrompt
  
  return format.replace(/\${.*?}/ig, (match) => {
    if (keyset.hasOwnProperty(match)) { return keyset[match]; }
    // ${title}, ${url}
    
    let ret = match;
    let success = false;
    const m = match.match(re);
    if (m == null) { return ret; }
    if (reserved.includes(m.groups.out)) {  return ret; }
//console.log('copy_programmable', m, keyset);
    
    try {
      if (m.groups.in === 'globalThis' && m.groups.idx != null) {
        const input = toValue(m.groups.idx);
        ret = toProperty(input);
        success = true;
        // Deprecated: The feature will be deprecated if a better way to access the element is found.
        // ${out=globalThis["tab.status"]} => ${tab.status}
      } else if (m.groups.in === 'System' && m.groups.args != null) {
        const arg1 = toValue(m.groups.arg1);
        switch (m.groups.fn) {
        case 'log':                     // System.log(msg: string): empty
          console.log(arg1);    // WebExtension background DevTools Console
          ret = '';
          success = true;
          break;
//        case 'compile':
//          if (arg1 != null && options?.compile !== true) {
//            const opt = structuredClone(options);
//            opt.compile = true;
//            ret = compile(arg1, keyset, opt);
//            success = true;
//            // 備考：${pageText0} と同時に実行してもセキュリティ的に問題ないか要検討
//            // 備考：再帰処理は、許容しない。
//          }
//          break;
        }
//      } else if ((m.groups.in === 'console' || m.groups.in === 'window') && m.groups.args != null) {
//        if (options?.cmd && options?.tab && options?.tabs?.length === 1) {
//          const arg1 = toValue(m.groups.arg1);
//          const arg2 = toValue(m.groups.arg2);
//          switch (m.groups.in+'.'+m.groups.fn) {
//          case 'console.log':
//            success = await executeConsoleLog(options.tab, options.cmd, [arg1]);
//            ret = '';
//            break;
//          case 'window.prompt':
//            ret = await executePrompt(options.tab, options.cmd, [arg1, arg2]);
//            success = ret != null;
//            ret = ret ?? '';
//            // 備考：string.replace async 問題あり
//            break;
//          }
//        }
      } else if (m.groups.in === 'Math' && m.groups.args != null) {
        const arg1 = toValue(m.groups.arg1);
        const arg2 = toValue(m.groups.arg2);
        if (isInteger(arg1) && isInteger(arg2)) {
          switch (m.groups.fn) {
          case 'add':   ret = arg1 + arg2;    success = true; break;
          case 'sub':   ret = arg1 - arg2;    success = true; break;
          case 'mul':   ret = arg1 * arg2;    success = true; break;
          case 'div':   ret = Math.floor(arg1 / arg2);  success = true; break;
          case 'mod':   ret = arg1 % arg2;    success = true; break;
          case 'lt':    ret = arg1 <  arg2;   success = true; break;
          case 'lte':   ret = arg1 <= arg2;   success = true; break;
          case 'gt':    ret = arg1 >  arg2;   success = true; break;
          case 'gte':   ret = arg1 >= arg2;   success = true; break;
          }
          // ${ampm=Math.div(H,12)}
        }
        if (arg1 !== void 0 && arg2 !== void 0) {
          switch (m.groups.fn) {
          case 'eq':    ret = arg1 == arg2;   success = true; break;
          case 'neq':   ret = arg1 != arg2;   success = true; break;
          case 'and':   ret = toBoolean(arg1) && toBoolean(arg2); success = true; break;
          case 'or':    ret = toBoolean(arg1) || toBoolean(arg2); success = true; break;
          }
          // ${x=Math.eq(text0,text1)}${Math.cond(x,text2)}${Math.condn(x,text3)}
        }
        if (arg1 !== void 0) {
          switch (m.groups.fn) {
          case 'not':   ret = !toBoolean(arg1); success = true; break;
          case 'cond':  success =  toBoolean(arg1); ret = success ? arg2 ?? arg1 : '';  break;
          case 'condn': success = !toBoolean(arg1); ret = success ? arg2 ?? arg1 : '';  break;
          }
        }
        if ((arg1 == null && arg2 == null) || (isInteger(arg1) && (arg2 == null || isInteger(arg2)))) {
          switch (m.groups.fn) {
          case 'random':        // Math.random(): number
                                // Math.random(max: number): number
                                // Math.random(max: number, min: number): number
                                // Math.random(min: number, max: number): number
            const max = isInteger(arg1) ? arg1 : 2_147_483_647;   // 32bit 符号付き整数の最大値
            const min = isInteger(arg2) ? arg2 : 0;
            ret = Math.floor(Math.random() * (max - min)) + min;  // min <= ret < max
            success = true;
            break;
          }
        }
      } else if (m.groups.in === 'String' && m.groups.args != null) {
        const arg1 = toValue(m.groups.arg1);
        const arg2 = toValue(m.groups.arg2);
        if (isInteger(arg1) && (arg2 == null || isInteger(arg2))) {
          const args = [arg1];
          if (arg2 != null) { args.push(arg2); }
          switch (m.groups.fn) {
          case 'fromCharCode':  ret = String.fromCharCode.apply(null, args);  success = true; break;
          case 'fromCodePoint': ret = String.fromCodePoint.apply(null, args); success = true; break;
          }
          // String.fromCharCode(num1: number): string
          // String.fromCharCode(num1: number, num2: number): string
          // ${String.fromCharCode(65,66)} => AB
        }
      } else if (m.groups.in === 'Date' && m.groups.args != null && options?.now) {
        const arg1 = toValue(m.groups.arg1);
        const arg2 = toValue(m.groups.arg2);
        switch (m.groups.fn) {
        case 'toDateString':  ret = options.now.toDateString(); success = true; break;
        case 'toISOString':   ret = options.now.toISOString();  success = true; break;
        case 'toString':      ret = options.now.toString();     success = true; break;
        case 'toTimeString':  ret = options.now.toTimeString(); success = true; break;
        case 'toUTCString':   ret = options.now.toUTCString();  success = true; break;
        case 'toLocaleDateString':  ret = options.now.toLocaleDateString(arg1); success = true; break;
        case 'toLocaleString':      ret = options.now.toLocaleString(arg1);     success = true; break;
        case 'toLocaleTimeString':  ret = options.now.toLocaleTimeString(arg1); success = true; break;
        }
        // Date.toLocaleString()
        // Date.toLocaleString(locales: string)
        // ${Date.toLocaleString("ja")}
      } else if (m.groups.supp == null) {
        const value = toValue(m.groups.in);
        if (value !== void 0) {
          ret = value;
          success = true;
        }
        // ${out=in}, ${integer}, ${'string'}, ${property}
        // ${x=-1}, ${x="string"}, ${title}
      } else {
        const input = reString.test(m.groups.in)
                    ? m.groups.in.slice(1, -1)
                    : toProperty(m.groups.in)+'';
        // ${'abc'.slice(1)} => bc
        // ${key}, ${key[idx]}, ${key.fn()}
        if (input == null) {
          // ありえない？
        } else if (m.groups.idx != null) {      // empty: empty
                                                // array[idx]: boolean|number|string|empty
                                                // object[idx]: boolean|number|string|empty
          const idx = toValue(m.groups.idx);
          if (input == '') {
            ret = '';
            success = true;
          } else {
            const obj = JSON.parse(input);
            if (typeof obj === "object" && obj !== null) {
              if (obj[idx] !== void 0) {
                ret = obj[idx];
              } else {
                ret = '';
              }
              success = true;
            }
          }
          // ${array[index]}, ${object[propety]}
          // ${x=array[0]}, ${x=object[propety]}
          // Error: ${'abc'[0]} -> ${'abc'.at(0)}
          // Error: ${'["abc","xyz"]'.length} -> 13 instead of 2
          // 備考：undefined / エラーを極力出力しない。空文字を出力する。
        } else if (m.groups.args == null) {
          const func = m.groups.fn;
          switch (func) {
          case 'length':        // in.length: number
            ret = input[func];
            success = true;
            break;
          }
          // ${in.fn}
          // ${title.length}
        } else if (m.groups.args != null) {
          const func = m.groups.fn;
          const arg1 = toValue(m.groups.arg1);
          const arg2 = toValue(m.groups.arg2);
//console.log('fn()', input, func, arg1, arg2);
          switch (func) {
          case 'replace':       // in.replace(pattern: RegExp, replacement: string): string
          case 'replaceAll':    // in.replaceAll(pattern: RegExp, replacement: string): string
            if (arg1 != null && arg2 != null) {
              const flags = func === 'replace' ? '' : 'g';
              ret = input.replace(new RegExp(arg1, flags), arg2);
              success = true;
            }
            break;
          case 'match':         // in.match(regexp: RegExp, flags: string): string[]|empty
            if (arg1 != null) {
              const flags = arg2 == 'g' ? 'g' : '';
              ret = input[func](new RegExp(arg1, flags));
              ret = ret && JSON.stringify(ret) || '';
              success = true;
              // '', '["abc","def"]'
              // 備考：マッチなしは、空文字を返す。 null を出力しない。
            }
            break;
          case 'search':        // in.search(regexp: RegExp): number
            if (arg1 != null) {
              ret = input[func](new RegExp(arg1));
              success = true;
            }
            break;
          case 'substring':     // in.substring(indexStart: number): string
                                // in.substring(indexStart: number, indexEnd: number): string
          case 'slice':         // in.slice(indexStart: number): string
                                // in.slice(indexStart: number, indexEnd: number): string
            if (isInteger(arg1) && (arg2 == null || isInteger(arg2))) {
              ret = input[func](arg1, arg2);
              success = true;
            }
            break;
          case 'padStart':      // in.padStart(targetLength: number): string
                                // in.padStart(targetLength: number, padString: string): string
          case 'padEnd':        // in.padEnd(targetLength: number): string
                                // in.padEnd(targetLength: number, padString: string): string
            if (isInteger(arg1)) {
              ret = input[func](arg1, arg2);
              success = true;
            }
            break;
          case 'at':            // in.at(index: number): string
          case 'charAt':        // in.charAt(index: number): string
          case 'charCodeAt':    // in.charCodeAt(index: number): number
          case 'codePointAt':   // in.codePointAt(index: number): number
          case 'repeat':        // in.repeat(count: number): string
            if (isInteger(arg1)) {
              ret = input[func](arg1);
              success = true;
            }
            break;
          case 'startsWith':    // in.startsWith(searchString: string): boolean
                                // in.startsWith(searchString: string, position: number): boolean
          case 'endsWith':      // in.endsWith(searchString: string): boolean
                                // in.endsWith(searchString: string, endPosition: number): boolean
          case 'includes':      // in.includes(searchString: string): boolean
                                // in.includes(searchString: string, position: number): boolean
          case 'indexOf':       // in.indexOf(searchString: string): number
                                // in.indexOf(searchString: string, position: number): number
          case 'lastIndexOf':   // in.lastIndexOf(searchString: string): number
                                // in.lastIndexOf(searchString: string, position: number): number
            if (arg1 != null) {
              ret = input[func](arg1, arg2);
              success = true;
            }
            break;
          case 'normalize':     // in.normalize(): string
                                // in.normalize(form: string): string
            // RangeError: The normalization form should be one of NFC, NFD, NFKC, NFKD.
            ret = input[func](arg1);
            success = true;
            break;
          case 'concat':        // in.concat(): string
                                // in.concat(str1: string): string
                                // in.concat(str1: string, str2: string): string
            ret = input[func](arg1 ?? '', arg2 ?? '');
            success = true;
            // ...args 非対応
            break;
          case 'split':         // in.split(separator: string): string[]
                                // in.split(separator: string, limit: number): string[]
            if (arg1 != null) {
              ret = JSON.stringify(input[func](arg1, arg2));
              success = true;
              // '[]', '["abc","def"]'
            }
            break;
          case 'isWellFormed':  // in.isWellFormed(): boolean
          case 'trim':          // in.trim(): string
          case 'trimStart':     // in.trimStart(): string
          case 'trimEnd':       // in.trimEnd(): string
          case 'toLocaleLowerCase': // in.toLocaleLowerCase(): string
          case 'toLocaleUpperCase': // in.toLocaleUpperCase(): string
          case 'toLowerCase':   // in.toLowerCase(): string
          case 'toString':      // in.toString(): string
          case 'toUpperCase':   // in.toUpperCase(): string
          case 'toWellFormed':  // in.toWellFormed(): string
          case 'valueOf':       // in.valueOf(): string
            ret = input[func]();
            success = true;
            break;
          //case 'localeCompare': // in.localeCompare(compareString: string): number
          //case 'matchAll':      // in.matchAll(regexp: RegExp): Iterator<string[]>
          // see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String
          }
        }
      }
    } catch (e) {
      ret = match+'['+e.toString()+']';
      success = false;
    }
//console.log('match', match);
//console.log('ret', ret, success, m.groups.out);
    
    if (m.groups.out != null && success) {
      keyset['${'+m.groups.out+'}'] = ret;
      ret = '';
    }
    return ret;
  });
};



function createDefaltKeyset(cmd) {
  const keyset = {};
  
  keyset['${enter}'] = cmd?.enter ?? '\n';
  keyset['${$}'] = '$';
  
  if (cmd?.exoptions?.extended_mode ?? true) {
    keyset['${TAB}'] = keyset['${t}'] = '\t';
    keyset['${CR}']  = keyset['${r}'] = '\r';
    keyset['${LF}']  = keyset['${n}'] = '\n';
  }
  if (cmd?.exoptions?.copy_programmable ?? true) {
    keyset['${undefined}'] = undefined;
    keyset['${null}'] = null;
    keyset['${true}'] = true;
    keyset['${false}'] = false;
    keyset['${NaN}'] = NaN;
    keyset['${Infinity}'] = Infinity;
  }
  return keyset;
  // 備考：cmd なしでも動作する
  //       cmd ありは、 format.js 用
};



function getStringArray(input, def) {
  try {
    const array = JSON.parse(input);
    const check = Array.isArray(array) && array.every((value) => typeof value === 'string');
    if (check) { return array; }
  } catch {};
  return def;
};
