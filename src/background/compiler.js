/**
 * programmable format
 */
'use strict';


//export 
function compile(format, keyset) {
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
    } else if (keyset['${'+text+'}'] != null) {
      if (reInteger.test(keyset['${'+text+'}'])) {
        const i = toInteger(keyset['${'+text+'}']);
        if (i != null) { return i; }
      }
      return keyset['${'+text+'}'];
    }
    return void 0;
  };
  const toBoolean = (value) => {
    switch (value) {
    case 'false':
    case 'undefined':
    case 'null':
    case 'NaN':
    case '0':
    case '':      return false;
    //case 'true':
    default:      return !!value;
    }
  };
  const reserved = [
    'Math', 'String',
    'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
    '$', 'title', 'url',
  ];
  
  const re = /^\${(?:(?<out>\w+)=)?(?<in>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')(?<supp>\[(?<idx>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')\]|\.(?<fn>\w+)(?<args>\((?:(?<arg1>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')(?:,(?<arg2>\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*'))?)?\))?)?}$/;
  // ${(out=)in([idx]|.fn|.fn(args))}
  // ${in.fn(arg1,arg2)}
  // ${in.fn(arg1)}
  // ${in.fn}
  // ${in[idx]}
  // ${in}
  // ${integer}
  // ${'string'}
  // ${'string'.fn()}
  // in = constant(Math, String) | variable
  // fn = constant(replace, replaceAll, ...)
  // out | idx | arg1 | arg2 = variable
  // variable = property | integer | string
  
  // out = fn = (\w+)
  // in = idx = arg1 = arg2 = (\w+|[+\-]?\d+|"[^"}]*"|'[^'}]*')
  // re = /^\${(<out>=)?<in>(\[<idx>\]|\.<fn>(\((<arg1>(,<arg2>)?)?\))?)?}$/
  
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
      if (m.groups.in === 'Math' && m.groups.args != null) {
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
        if (arg1 != null && arg2 != null) {
          switch (m.groups.fn) {
          case 'cond':  ret =  toBoolean(arg1) ? arg2 : '';       success = true; break;
          case 'condn': ret = !toBoolean(arg1) ? arg2 : '';       success = true; break;
          case 'eq':    ret = arg1 == arg2;   success = true; break;
          case 'neq':   ret = arg1 != arg2;   success = true; break;
          case 'and':   ret = toBoolean(arg1) && toBoolean(arg2); success = true; break;
          case 'or':    ret = toBoolean(arg1) || toBoolean(arg2); success = true; break;
          }
          // ${x=Math.eq(text0,text1)}${Math.cond(x,text2)}${Math.condn(x,text3)}
        }
        if (arg1 != null) {
          switch (m.groups.fn) {
          case 'not':   ret = !toBoolean(arg1); success = true; break;
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
          // ${String.fromCharCode(65,66)} => AB
          // ${String.fromCodePoint(65,66)} => AB
        }
      } else if (m.groups.supp == null) {
        const value = toValue(m.groups.in);
        if (value != null) {
          ret = value;
          success = true;
        }
        // ${out=in}, ${integer}, ${'string'}, ${property}
        // ${x=-1}, ${x="string"}
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
          const obj = JSON.parse(input);
          if (typeof obj === "object" && obj !== null && obj[idx] != null) {
            ret = obj[idx];
            success = true;
          }
          // ${array[index]}, ${object[propety]}
          // ${x=array[0]}, ${x=object[propety]}
          // Error: $('abc'[0]} -> ${'abc'.at(0)}
        } else if (m.groups.args == null) {
          const func = m.groups.fn;
          switch (func) {
          case 'length':
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
          case 'replace':
          case 'replaceAll':
            const flags = func === 'replace' ? '' : 'g';
            if (arg1 != null && arg2 != null) {
              ret = input.replace(new RegExp(arg1, flags), arg2);
              success = true;
              // 備考：次の変換に失敗するため、正規表現を replace の入力に与える挙動とする
              //       'abc'.replace('[a]','x');  // abc
              //       'abc'.replace(new RegExp('[a]'),'x');  // xbc
            }
            break;
          case 'substring':
          case 'slice':
            if (isInteger(arg1) && (arg2 == null || isInteger(arg2))) {
              ret = input[func](arg1, arg2);
              success = true;
            }
            break;
          case 'padStart':
          case 'padEnd':
            if (isInteger(arg1) && arg2 != null) {
              ret = input[func](arg1, arg2);
              success = true;
            }
            break;
          case 'at':
          case 'charAt':
          case 'charCodeAt':
          case 'codePointAt':
          case 'repeat':
            if (isInteger(arg1)) {
              ret = input[func](arg1);
              success = true;
            }
            break;
          case 'startsWith':
          case 'endsWith':
          case 'includes':
          case 'indexOf':
          case 'lastIndexOf':
          case 'normalize':
            // RangeError: The normalization form should be one of NFC, NFD, NFKC, NFKD.
            if (arg1 != null) {
              ret = input[func](arg1);
              success = true;
            }
            break;
          case 'concat':
            ret = input[func](arg1 ?? '', arg2 ?? '');
            success = true;
            // ...args 非対応
            break;
          case 'split':
            if (arg1 != null) {
              ret = JSON.stringify(input[func](arg1));
              success = true;
            }
            break;
          case 'isWellFormed':
          case 'trim':
          case 'trimStart':
          case 'trimEnd':
          case 'toLocaleLowerCase':
          case 'toLocaleUpperCase':
          case 'toLowerCase':
          case 'toString':
          case 'toUpperCase':
          case 'toWellFormed':
          case 'valueOf':
            ret = input[func]();
            success = true;
            break;
          //case 'localeCompare':
          //case 'match':
          //case 'matchAll':
          //case 'search':
          // see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String
          }
        }
      }
    } catch (e) {
      ret = match+'['+e.toString()+']';
      success = false;
    }
//console.log('match', match);
//console.log('ret', ret, success);
    
    if (m.groups.out != null && success) {
      keyset['${'+m.groups.out+'}'] = ret;
      ret = '';
    }
    return ret;
  });
};
