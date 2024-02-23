/**
 * Programmable Format
 * フォーマットをプログラム可能にします。
 * see https://github.com/k08045kk/CopyTabTitleUrl/wiki/Format
 */
'use strict';


//export 
function compile(format, keyset, now) {
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
        const idx = toValue(m.groups.idx);
        ret = keyset['${'+idx+'}'];
        success = true;
        // Deprecated: The feature will be deprecated if a better way to access the element is found.
        // ${out=globalThis["tab.status"]} => ${tab.status}
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
          case 'random':        // Math.random()
                                // Math.random(max)
                                // Math.random(max,min) or Math.random(min,max)
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
          // String.fromCharCode(num1: number)
          // String.fromCharCode(num1: number, num2: number)
          // ${String.fromCharCode(65,66)} => AB
        }
      } else if (m.groups.in === 'Date' && m.groups.args != null) {
        const arg1 = toValue(m.groups.arg1);
        const arg2 = toValue(m.groups.arg2);
        switch (m.groups.fn) {
        case 'toDateString':  ret = now.toDateString(); success = true; break;
        case 'toISOString':   ret = now.toISOString();  success = true; break;
        case 'toString':      ret = now.toString();     success = true; break;
        case 'toTimeString':  ret = now.toTimeString(); success = true; break;
        case 'toUTCString':   ret = now.toUTCString();  success = true; break;
        case 'toLocaleDateString':  ret = now.toLocaleDateString(arg1); success = true; break;
        case 'toLocaleString':      ret = now.toLocaleString(arg1);     success = true; break;
        case 'toLocaleTimeString':  ret = now.toLocaleTimeString(arg1); success = true; break;
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
                    : toProperty(m.groups.in);
        // ${'abc'.slice(1)} => bc
        // ${key}, ${key[idx]}, ${key.fn()}
        if (input == null) {
          // ありえない？
        } else if (m.groups.idx != null) {
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
        } else if (m.groups.args == null) {
          const func = m.groups.fn;
          switch (func) {
          case 'length':        // in.length
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
          case 'replace':       // in.replace(pattern: RegExp, replacement: string)
          case 'replaceAll':    // in.replaceAll(pattern: RegExp, replacement: string)
            if (arg1 != null && arg2 != null) {
              const flags = func === 'replace' ? '' : 'g';
              ret = input.replace(new RegExp(arg1, flags), arg2);
              success = true;
            }
            break;
          case 'match':         // in.match(regexp: RegExp, flags: string)
            if (arg1 != null) {
              const flags = arg2 == 'g' ? 'g' : '';
              ret = input[func](new RegExp(arg1, flags));
              ret = ret && JSON.stringify(ret) || '';
              success = true;
            }
            break;
          case 'search':        // in.search(regexp: RegExp)
            if (arg1 != null) {
              ret = input[func](new RegExp(arg1));
              success = true;
            }
            break;
          case 'substring':     // in.substring(indexStart: number)
                                // in.substring(indexStart: number, indexEnd: number)
          case 'slice':         // in.slice(indexStart: number)
                                // in.slice(indexStart: number, indexEnd: number)
            if (isInteger(arg1) && (arg2 == null || isInteger(arg2))) {
              ret = input[func](arg1, arg2);
              success = true;
            }
            break;
          case 'padStart':      // in.padStart(targetLength: number)
                                // in.padStart(targetLength: number, padString: string)
          case 'padEnd':        // in.padEnd(targetLength: number)
                                // in.padEnd(targetLength: number, padString: string)
            if (isInteger(arg1)) {
              ret = input[func](arg1, arg2);
              success = true;
            }
            break;
          case 'at':            // in.at(index: number)
          case 'charAt':        // in.charAt(index: number)
          case 'charCodeAt':    // in.charCodeAt(index: number)
          case 'codePointAt':   // in.codePointAt(index: number)
          case 'repeat':        // in.repeat(count: number)
            if (isInteger(arg1)) {
              ret = input[func](arg1);
              success = true;
            }
            break;
          case 'startsWith':    // in.startsWith(searchString: string)
                                // in.startsWith(searchString: string, position: number)
          case 'endsWith':      // in.endsWith(searchString: string)
                                // in.endsWith(searchString: string, endPosition: number)
          case 'includes':      // in.includes(searchString: string)
                                // in.includes(searchString: string, position: number)
          case 'indexOf':       // in.indexOf(searchString: string)
                                // in.indexOf(searchString: string, position: number)
          case 'lastIndexOf':   // in.lastIndexOf(searchString: string)
                                // in.lastIndexOf(searchString: string, position: number)
            if (arg1 != null) {
              ret = input[func](arg1, arg2);
              success = true;
            }
            break;
          case 'normalize':     // in.normalize()
                                // in.normalize(form: string)
            // RangeError: The normalization form should be one of NFC, NFD, NFKC, NFKD.
            ret = input[func](arg1);
            success = true;
            break;
          case 'concat':        // in.concat(str1: string)
                                // in.concat(str1: string, str2: string)
            ret = input[func](arg1 ?? '', arg2 ?? '');
            success = true;
            // ...args 非対応
            break;
          case 'split':         // in.split(separator: string)
                                // in.split(separator: string, limit: number)
            if (arg1 != null) {
              ret = JSON.stringify(input[func](arg1, arg2));
              success = true;
            }
            break;
          case 'isWellFormed':  // in.isWellFormed()
          case 'trim':          // in.trim()
          case 'trimStart':     // in.trimStart()
          case 'trimEnd':       // in.trimEnd()
          case 'toLocaleLowerCase': // in.toLocaleLowerCase()
          case 'toLocaleUpperCase': // in.toLocaleUpperCase()
          case 'toLowerCase':   // in.toLowerCase()
          case 'toString':      // in.toString()
          case 'toUpperCase':   // in.toUpperCase()
          case 'toWellFormed':  // in.toWellFormed()
          case 'valueOf':       // in.valueOf()
            ret = input[func]();
            success = true;
            break;
          //case 'localeCompare':
          //case 'matchAll':
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
