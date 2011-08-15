/*!
 * X weibo JavaScript Library v1.1
 * http://x.weibo.com/
 * 
 * Copyright 2010 SINA Inc.
 * Date: 2010/10/28 21:22:06
 */


/**
 * @class Xwb
 * 本类是所有Xweibo JavaScript交互应用的命名空间根目录。
 * @extends Xwb.ax.Eventable
 */
 
if(!window.Xwb)
    Xwb = {};

(function(X, $){

var 
    undefined,
    doc  = document,
    CFG = X.cfg,
	// 通用的disabled样式
    disabledCS = 'general-btn-disabled';
    
var String = window.String,
    trimReg = new RegExp("(?:^\\s*)|(?:\\s*$)", "g");

//debug开关
window.__debug = !!window.__debug;

var _uid = 0, ds = doc.selection;

/**
 * @class Xwb.util
 * 实用函数集
 * @singleton
 */
var Util = X.util = {

       /**
        * @param {String} templateString
        * @param {Object} dataMap
        * @param {Boolean} [urlencode] encodeURIComponent for value
        * @param {Boolean} [cascade] cascade apply template from value
        example:
        <pre>
            <code>
                var name = templ('My name is {name}', {name:'xweibo'});
                var url  = templ('http://www.server.com/getName?name={name}', {name:'微博'}, true);
            </code>
        </pre>
        */
       templ : function(str, map, urlencode, cascade){
            return str.replace(/\{([\w_$]+)\}/g, function(s, s1){
                var v = map[s1];
                if(cascade && typeof v === 'string')
                    v = argument.callee(v, map, urlencode, cascade);
                
                if(v === undefined || v === null) 
                    return '';
                return urlencode?encodeURIComponent(v) : v;
            });
       },
       /**
        * @param {Object} target
        * @param {Object} source
        */
        extendIf : function(des, src) {
            if(!des)
              des = {};
        
            if(src)
              for(var i in src){
                if(des[i] === undefined)
                  des[i] = src[i];
              }
        
            return des;
        },
       
        /**
         * 将源对象的所有属性复制到目标对象
         * @param {Object} target 目标对象,可为空
         * @param {Object} source 源对象
         * @param {Boolean} [override]
         * @return {Object} target
         */
        extend : function(target, src, override){
          if(!target)
            target = {};
          if(src){
            for(var i in src)
                if(target[i]===undefined || override)
                    target[i] = src[i];
          }
          return target;
        },
        
        /**
         * 移除字符串最左与最右边的空格
         * @param {String} string
         * @return {String}
         */
        trim : function(s){
            return s.replace(trimReg, "");
        },

        /**
         * 返回对象查询字符串表示形式.
         * <pre><code>
           var obj = {name:'xweibo', age:'25'};

           //显示 name=xweibo&age=25
           alert(queryString(obj));
           // 也可以双重键值对形式
           {"doAction":"interView","extra_params":{"interview_id":"27"}}
           => 'doAction=interView&extra_params['interview_id']=27'
         * </code></pre>
         * 提取url参数转为JS对象方法参见{@link #dequery}<br/>
         * 获得表单内所有元素提交参数字符串表示方法参见{@link #formQuery}
         * @param {Object} obj
         * @return {String} 对象的查询字符串表示形式
         */
        queryString : function(obj) {
            if(!obj)
                return '';
            var arr = [];
            for(var k in obj){
                var ov = obj[k], k = encodeURIComponent(k);
                var type = typeof ov;
                if(type === 'undefined'){
                    arr.push(k, "=&");
                }else if(type != "function" && type != "object"){
                    arr.push(k, "=", encodeURIComponent(ov), "&");
                }else if(ov instanceof Array){
                    if (ov.length) {
                        for(var i = 0, len = ov.length; i < len; i++) {
                            arr.push(k, "=", encodeURIComponent(ov[i] === undefined ? '' : ov[i]), "&");
                        }
                    } else {
                        arr.push(k, "=&");
                    }
                }else if(type === 'object'){
                    // 例如"extra_params":{"interview_id":"27"}形式
                    for(var kk in ov){
                        arr.push(k,'[',kk,']','=', encodeURIComponent(ov[kk]),'&');
                    }
                }
            }
            arr.pop();
            return arr.join("");
        },
        
        /**
         * 如果仅仅想切换this范围，而又使代理函数参数与原来参数一致的，可使用本方法。
         * @param {Function} sourceFunction
         * @param {Object} scope scope.func()
         * @return {Function}
         */
        bind : function(fn, scope){
          return function() {
              return fn.apply(scope, arguments);
          };
        },

        /**
         * @class Xwb.ax.AjaxConfig
         * {@link Xwb.util#ajax}方法的请求参数
         */
         /**
          * @cfg {String} url 请求目标URL
          */
         /**
          * @cfg {String} method 请求方法 POST/GET
          */
         /**
          * @cfg {String} encoding 发送内容的字符编码，未设置采用默认
          */
         /**
          * @cfg {String} dt dataType，返回内容类据类型，text或json，默认为json，系统根据该类型传递对应类型的数据到回调方法的参数中。
          */
         /**
          * @cfg {String|Object} data 请求时传递的数据，可为字符串，也可为键值对。
          */
          /**
           * @cfg {Boolean} cache 请求时是否应用缓存，默认忽略缓存
           */
         /**
          * @cfg {Object} scope 可指定回调方法调用时的this对象
          */
         /**
          * @cfg {Function} success 请求成功后回调方法
          * @param {Mixed} data 根据设定的数据类型传递不同的类型数据
          * @param {XMLHttpRequest} ajax 
          */
         /**
          * @cfg {Function} failure 请求失败后回调方法
          * @param {String} responseText 根据设定的数据类型传递不同的类型数据
          * @param {XMLHttpRequest} ajax 
          */
          
        /**
         * @class Xwb.util
         */
        /**
         * 发起一个ajax请求.
         * @param {Xwb.ax.AjaxConfig} param 请求参数
         * @return {XMLHttpRequest}
         */
        ajax : function(param){
            var ajax, url = param.url;
            
            if (window.XMLHttpRequest) {
                ajax = new XMLHttpRequest();
            } else {
                if (window.ActiveXObject) {
                    try {
                        ajax = new ActiveXObject("Msxml2.XMLHTTP");
                    } catch (e) {
                        try {
                            ajax = new ActiveXObject("Microsoft.XMLHTTP");
                        } catch (e) { }
                        }
                    }
            }
            
            
            if(ajax){
                param.method = param.method ? param.method.toUpperCase() : 'GET';
                // setup param

                var ps = param.data, ch = !param.cache;
                if(ps || ch){
                    var isQ = url.indexOf('?') >= 0;
                    if(ch){
                        if (isQ)
                            url = url + '&_=' + (+new Date());
                        else
                            url = url + '?_=' + (+new Date());
                    }
                    
                    // append data to url or parse post data to string
                    if(ps){
                        if(typeof ps === 'object')
                            ps = Util.queryString(ps);
                        if(param.method === 'GET'){
                            if(!isQ && !ch)
                                url = url+'?';
            
                            url = url + '&' + ps;
                        }
                    }
                }
                ajax.open(param.method, url, true);
                
                if (param.method === 'POST')
                    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset='+(param.encoding?param.encoding:''));
                
                ajax.onreadystatechange = function(){
                    if (ajax.readyState === 4) {
                        var ok = (ajax.status === 200);
                        if(ok && param.success){
                            try{
                                var data = (!param.dt || param.dt === 'json') ? eval("("+ajax.responseText+");") : ajax.responseText;
                            }catch(e){
                                if( __debug ) console.error('服务器返回JSON格式有误，请检查。\n',e,'\n', ajax.responseText);
                                ok = false;
                            }
                            if (ok)
                                param.success.call(param.scope||this, data, ajax);
                        }
                        
                        if(!ok && param.failure){
                            param.failure.call(param.scope||this, ajax.responseText, ajax);
                        }
                    }
                };
                
                // send POST data
                ajax.send("POST" === param.method ? ps : undefined);
                
                return ajax;
            }
        },
        
        /**
         * @class Xwb.ax.JSONPConfig
         * {@link Xwb.util#jsonp}方法的请求参数
         */
         
         /**
          * @cfg {String} url 请求目标URL
          */
         /**
          * @cfg {DOMElement} doc 可以指定生成JSONP脚本所在的document
          */
         
         /**
          * @cfg {Object} scope 可指定回调方法调用时的this对象
          */
          
         /**
          * @cfg {Object} data 作为提交参数的键值对
          */
          
          /**
           * @cfg {String} charset JSONP脚本字符编码
           */
           /**
            * @cfg {Object} script 进行JSONP请求的script标签的属性集，在请求前该属性集将被复制到script标签中
            */
         /**
          * @cfg {Function} success 请求成功后回调方法
          * @param {Object} data 根据设定的数据类型传递不同的类型数据
          * @param {XMLHttpRequest} ajax
          */
         /**
          * @cfg {Function} failure 请求失败后回调方法
          * @param {String} responseText 根据设定的数据类型传递不同的类型数据
          * @param {XMLHttpRequest} ajax 
          */
          /**
           * @cfg {String} jsonp 指定JSONP请求标识参数的名称，默认为'jsonp'
           */

        /**
         * @class Xwb.util
         */
         /**
          * 发起一个JSONP请求
         * @param {String} url 目标地址
         * @param {Xwb.ax.JSONPConfig} param 请求参数
         * @return {HTMLElement} scriptElement
         */
        jsonp : function(param){
            var fn  = 'jsonp_' + (+new Date()),
                doc = param.doc || document, 
                url = param.url,
                script = doc.createElement('script'),
                hd = doc.getElementsByTagName("head")[0],
                success;
            
            if(typeof param == 'function'){
                success = param;
                param = {};
            }else success = param.success;
            
            
            script.type = 'text/javascript';
            param.charset && (script.charset = param.charset);
            param.deffer  && (script.deffer  = param.deffer);
            
            url = url + ( url.indexOf('?')>=0 ? '&' + ( param.jsonp || 'jsonp')+'='+fn : '?'+( param.jsonp || 'jsonp')+'='+fn);
            
            if(param.data)
                url += '&'+Util.queryString(param.data);
            
            if(param.script){
                Util.extend(script, param.script);
                delete param.script;
            }
            
            script.src = url;

            var cleaned = false;
            
            function clean(){
                if(!cleaned){
                    try {
                        delete window[fn];
                        script.parentNode.removeChild(script);
                        script = null;
                    }catch(e){}
                    cleaned = true;
                }
            }
            
            window[fn] = function(){
                clean();
                if(success)
                  success.apply(param.scope||this, arguments);
            };

            script.onreadystatechange = script.onload = function(){
                var rs = this.readyState;
                // 
                if( !cleaned && (!rs || rs === 'loaded' || rs === 'complete') ){
                    clean();
                    if(param.failure)
                        param.failure.call(param.scope||this);
                }
            };
            
            hd.appendChild(script);
            
            return script;
        },
    
    /**
     * @property ie6
     * 当前是否IE6浏览器
     * @type Boolean
     */
    // ie6
    
    /**
     * 移除数组下标元素
     * <pre><code>
     var arr = ['a',2,'string'];
     Xwb.util.arrayRemove(arr, 2);
 </code></pre>
     * @param {Array} array
     * @param {Number} index
     */
    arrayRemove : function(arr, idx){
        arr.splice(idx, 1)[0];
    },
/**
 *  获得元素在数组中的下标，无则返回-1，通过===比较两个元素是否相等。
 * @param {Array} array
 * @param {Object} object
 * @return {Number} index, 或 -1
 */
    arrayIndexOf : function(arr, obj){
        for(var i=0,len=arr.length;i<len;i++)
            if(arr[i] === obj)
                return i;
        return -1;
    },
/**
 *  利用JavaScript中原型特性创建面向对象中的“类”。
 *  所有利用该方法创建的类都要实现或者说存在{@link #init}初始方法。
  <pre><code>
  function Base(){
  }
  
  Base.prototype = {
    init : function(){
        alert('init');
    },
    say : function(){
        alert('Base');
    },
    
    eat : function(){
        alert('eat');
    }
  };
  
  var A = Xwb.util.create(Base, {
        say : function(){
            Base.prototype.say.apply(this, arguments);
            alert('A');
        }
  });
  
  var a = new A();
  a.eat();
  a.say();
 </code></pre>
 * @param {String} [namespace] 名称，包含命名空间，可选
 * @param {Function} superclass 父类，无父类可置空
 * @param {Object} attributes 类(原型)属性，方法集
 * @return {Function} 新类
 */
    create : function(){
          var clazz = (function() {
            this.init.apply(this, arguments);
          });

          if (arguments.length === 0)
            return clazz;

          var absObj, base, type, ags = $.makeArray( arguments );

          if (typeof ags[0] === 'string') {
            type = ags[0];
            base = ags[1];
            ags.shift();
          } else base = ags[0];
          
          ags.shift();

          if (base)
            base = base.prototype;
          
          if (base) {
            function Bridge(){};
            Bridge.prototype = base;
            clazz.prototype = absObj = new Bridge();
          }

          if (type) {
            absObj.type = type;
            Util.ns(type, clazz);
          }
          
          for(var i=0,len=ags.length;i<len;i++)
            absObj = $.extend(absObj, typeof ags[i] === 'function' ? ags[i]( base ):ags[i]);
          
          absObj.constructor = clazz;
          return clazz;
    },
/**
 * 在DOM树中向上查找符合指定选择器的元素。
 * @param {HTMLElement} fromElement 开始元素(包含)
 * @param {HTMLElement} toElement 结束元素(不包含)，未设置时为document.body元素
 */    
    domUp : function(el, selector, end){
        end = end || doc.body;
        var isStr = typeof selector === 'string';
        while(el){
            if(isStr){
                if($(el).is(selector))
                    return el; 
            }else if(selector(el)){
                return el;
            }
            el = el.parentNode;
            if(el === end)
                return null;
        }
        return el;        
    },
/**
 *  根据字符串创建命名空间。
  <pre><code>
  Xwb.util.ns('Xwb.ux', {});
 </code></pre>
 * @param {String} namespace
 * @param {Object} object
 */
    ns : function(ns, v){
        var routes = ns.split('.'),p=window,key;
        for(var k=0,len=routes.length - 1;k<len;k++){
            key = routes[k];
            if(!p[key])
                p[key] = {};
            p = p[key];
        }
        p[routes[k]] = v;
    },
/**
 *  计算文本剩余字数，默认最大长度为微博最大长度。
 *  如果已超出最大限制字数，返回负值。
 * @param {String} text
 * @param {Number} [max] 可选，最大字数（一个字两个字符）
 * @return {Number} 
 */
    calWbText : function(text, max){
        if(max === undefined)
            max = 140;
        var cLen=0;
        var matcher = text.match(/[^\x00-\xff]/g),
            wlen  = (matcher && matcher.length) || 0;
        return Math.floor((max*2 - text.length - wlen)/2);
    },
    
/**
 *  返回占用字节长度（一个字两个字节）
 * @param {String} text
 * @return {Number}
 */
    byteLen : function(text){
        var len = text.length;
        var matcher = text.match(/[^\x00-\xff]/g);
        if(matcher)
            len += matcher.length;
        return len;
    },
    
    /**
     * 以字节为长度计算单位截取字符串，一个字两个字节
     * @param {String} text
     * @param {Number} length
     * @return {String} cutString
     */
    byteCut : function(str, length) {
      var wlen = Util.byteLen(str);
      if(wlen>length){
          // 所有宽字用&&代替
          var c = str.replace(/&/g, " ")
                     .replace(/[^\x00-\xff]/g, "&&");
          // c.slice(0, length)返回截短字符串位
          str = str.slice(0, c.slice(0, length)
                    // 由位宽转为JS char宽
                    .replace(/&&/g, " ")
                    // 除去截了半个的宽位
                    .replace(/&/g, "").length
                );
      }
      return str;
    },
    /**
     *  替换源字符串中某段为指定向字符串
     * @param {String} source
     * @param {String} replacement
     * @param {Number} fromIndex
     * @param {Number} toIndex
     * @return {String} newString
     */
    stringReplace : function(source, text, from, to){
        return source.substring(0, from) + text + source.substring(to);
    },

/**
 *  将光标定位至指定下标，如下标未设置，定位至文本末尾
 * @param {HTMLElement} inputor
 * @param {Number} index
 */
    focusEnd : function(inputor, num){
        inputor.focus();
        if(num === undefined)
            num = inputor.value.length;
        if(doc.selection) {
            var cr = inputor.createTextRange();
            cr.collapse();
            cr.moveStart('character', num);
            cr.moveEnd('character', num);
            cr.select();
        }else {
            inputor.selectionStart = inputor.selectionEnd = num;
        }
    },
    
    selectionStart : function(elem){
        if(!ds)
            return elem.selectionStart;
        var range = ds.createRange(), 
            s, 
            bdyRange = doc.body.createTextRange();
            
            bdyRange.moveToElementText(elem);
            try{
                for(s=0;bdyRange.compareEndPoints("StartToStart", range) < 0;s++)
                    bdyRange.moveStart('character', 1);
            }catch(e){
                s = this.getCursorPos(elem);
            }
         return s;
    },
    
    selectionBefore : function(elem){
        return elem.value.slice(0, this.selectionStart(elem));
    },
/**
 * 选择输入框内指向范围内的文本
 * @param {HTMLElement} inputor
 * @param {Number} startIndex
 * @param {Number} endIndex
 */
    selectText : function(elem, start, end){
        elem.focus();
        if(!ds){
            elem.setSelectionRange(start, end);
            return;
        }
        
        var range = elem.createTextRange();
        range.collapse(1);
        range.moveStart('character', start);
        range.moveEnd('character', end - start);
        range.select();
    },
/**
 *  检测是当前浏览器是否是支持W3C标准选择范围的浏览器
 * @return {Boolean}
 */
    hasSelectionSupport : function(){
      return !$.browser.msie;
    },
    
/**
 * 获得输入框内光标下标
 * @param {HTMLElement} element
 * @return {Number} index
 */
    getCursorPos : function(elem){
        var pos = 0;
        if(!this.hasSelectionSupport()){
            try{
                elem.focus();
                var range = null;
                range = ds.createRange();
                var tmpRange = range.duplicate();
                tmpRange.moveToElementText(elem);
                tmpRange.setEndPoint("EndToEnd", range);
                elem.selectionStart = tmpRange.text.length - range.text.length;
                elem.selectionEnd = elem.selectionStart + range.text.length;
                pos = elem.selectionStart;
            }catch(e) {};
        }else{
            if( elem.selectionStart || elem.selectionStart == '0' )
                pos = elem.selectionStart;
        }
        
        return pos;
    },
/**
 * 获得输入框内选择文本
 * @param {HTMLElement} element
 * @return {String} text
 */
    getSelectionText : function(elem){
        var selectedText = '';
        if(window.getSelection){
            selectedText = (function () {
                if (elem.selectionStart != undefined && elem.selectionEnd != undefined) {
                    return elem.value.substring(elem.selectionStart, elem.selectionEnd)
                }
                else {
                    return ""
                }
            })(elem);
        }else selectedText = ds.createRange().text;
        
        return selectedText;
    },
    
    setCursor : function(elem, pos, coverLen){
        pos = pos == null ? elem.value.length : pos;
        coverLen = coverLen == null ? 0 : coverLen;
        elem.focus();
        if(elem.createTextRange){
            var range = elem.createTextRange();
            range.move("character", pos);
            range.moveEnd("character", coverLen);
            range.select();
        }else {
            elem.setSelectionRange(pos, pos + coverLen);
        }
    },
    
    replaceSelection : function(elem, text){
        elem.focus();
        var start = this.selectionStart(elem),
            end   = this.getSelectionText(elem).length,
            val   = elem.value;
        end = end === 0 ? start : start+end;
        elem.value = Util.stringReplace(val, text, start, end);
        this.setCursor(elem, start+text.length);
        return start;
    },
/**
 * 转义文本中的HTML字符
 * @param {String} html
 * @return {String} escapedHtml
 */
    escapeHtml : function(html){
        return html?html.replace(/</g, '&lt;').replace(/>/g, '&gt;'):'';
    },
/** 
 *  利用CSS样式禁用或恢复指定html元素。
 * @param {HTMLElement} element
 * @param {Boolean} disabled
 * @param {String} [disabledCss] 可选，可自定义而不利用默认样式
 */
    disable : function(el , disabled, cs){
        disabled ? $(el).addClass(cs||disabledCS) : $(el).removeClass(cs||disabledCS);
    },
/**
 *  返回this为指定对象的函数，该方法会生成一个属性指定新函数，避免了每次调用时都产生新的函数。
  <pre><code>
  var a = {
     say : function(){ alert('say'); }
  };
  
  var wrappedSay = Xwb.util.getBind(a, 'say');
  // alert say
  wrappedSay();
  
  // 第二次调用时，返回原来已创建的闭包函数, true
  alert(wrappedSay === Xwb.util.getBind(a, 'say'))
 </code></pre>
 * @param {Object} object, this scope object
 * @param {String} functionName 函数名
 * @return {Function} closuredFunction
 */
    getBind : function(obj, funcName){
        var k = '_xwbbnd_'+funcName;
        var m = obj[k];
        if(!m)
           m = obj[k] = Util.bind(obj[funcName], obj);
        return m;
    },
    
/**
 *  返回运行时唯一ID
 * @return {Number}
 */
    uniqueId : function(){
    	return ++_uid;
    },
    
    /**
     * 获得一个表单所有表单元素的数据,并返回表单的查询字符串表示。
     * <br/>
     <code>
       &lt;form id=&quot;f&quot;&gt;
         &lt;input type=&quot;text&quot; name=&quot;username&quot; value=&quot;rock&quot;/&gt;
         &lt;input type=&quot;text&quot; name=&quot;password&quot; value=&quot;123&quot;/&gt;
       &lt;/form&gt;
       &lt;script&gt;
         //&gt;: username=rock&amp;password=123
         alert(formQuery('f'));
       &lt;/script&gt;
       </code>
     * @param {FormElement|String|jQuery} f form或form的id
     * @return {String} 所有表单元素的查询字符串表示
     */
    formQuery: function(f) {
        var formData = "", elem = "", f = $(f)[0], qid;
        var elements = f.elements;
        var length = elements.length;
        for (var s = 0; s < length; s++) {
            elem = elements[s];
            if (elem.tagName === 'INPUT') {
                if (elem.type === 'radio' || elem.type === 'checkbox') {
                    if (!elem.checked) {
                        continue;
                    }
                }
            }
            
            qid = elem.name||elem.id;
            
            if(qid){
	            if (formData != "") {
	                formData += "&";
	            }
	            formData += encodeURIComponent(elem.name||elem.id) + "=" + encodeURIComponent(elem.value);
            }
        }
        return formData;
    },
        
/**
 * 往URL追加提交参数
 * @param {String} url
 * @param {Object|String} param
 * @return {String}
 */
    appendParam : function(url, param){
        var qs = typeof param !== 'string' ? this.queryString(param):param;
        return url + ( url.indexOf('?') !== -1 ? '&'+qs : '?'+qs );
    },
/**
 * 分解URL中的参数到JS对象。<br/>
 * 将JS对象组装为参数字符串方法参见{@link #queryString}<br/>
 * 获得表单内所有元素提交参数字符串表示方法参见{@link #formQuery}
 * @param {String} url
 * @return {Object} 永远不会为空
 */
    dequery : function(url){
        var param = {};
        url = url.substr(url.indexOf('?')+1);
        if(url){
            url = url.split('&');
            for(var i=0,len=url.length;i<len;i++){
                var arr = url[i].split('=');
                param[arr[0]] = decodeURIComponent(arr[1]);
            }
        }
        return param;
    },
/**
 * 从路径中提取文件名
 * @param {String} pathName
 * @return {String}
 */
    getFileName : function(str, len){
		if (str.indexOf('\\')) {
			var parts = str.split('\\');
			str = parts.pop();
		}
			
		if (str.length > len) {
			str = str.substr(0, len-4) + '..' + str.substr(str.length-4);
		}
		return str;
    },
/**
 *  拆分字符串为数组。
 * @param {String} string
 * @param {String} splitChar 分隔字符
 * @param {String} escapeChar转义字符
 * @param {Array}  array
 */
    split : function(str, splitChar, escChar){
        var c, arr = [], tmp = [];
        if(!escChar)
            escChar = '\\';
    
        for(var i=0,len=str.length;i<len;i++){
            c = str.charAt(i);
            if(c === splitChar){
                arr.push(tmp.join(''));
                tmp.length = 0;
                continue;
            }
            else if(c === escChar && str.charAt(i+1) === splitChar){
                c = splitChar;
                i++;
            }
            tmp[tmp.length] = c;
        }
        if(tmp.length)
            arr.push(tmp.join(''));
        return arr;
    },
/**
 * 解释键值对字符串为JS对象，最常用法是解析html中rel属性。
 * @param {String} string
 * @return {Object} map
 */
    parseKnV : function(strRel){
        var map = {}, kv, kvs = this.split(strRel||'', ',');
        try {
            for( var i=0,len=kvs.length;i<len;i++){
                // if not contains ':'
                // set k = true
                if(kvs[i].indexOf(':') === -1){
                    map[kvs[i]] = true;
                }else {
                    // split : to k and v
                    kv = Util.split(kvs[i], ':');
                    // escape value
                    map[kv[0]] = kv[1];
                }
            }
        }catch(e) { 
            if(__debug) console.trace();
            throw 'Syntax Error:rel字符串格式出错。' + strRel; 
        }
    
        return map;
    },
/**
 * 测试两个HTML元素间是否存在包含关系
 * @param {HTMLElement} parentElement
 * @param {HTMLElement} childElement
 * @return {Boolean}
 */
    ancestorOf :function(v, a, depth){
      if (v.contains && !$.browser.webkit) {
         return v.contains(a);
      }else if (v.compareDocumentPosition) {
         return !!(v.compareDocumentPosition(a) & 16);
      }
    
      if(depth === undefined)
        depth = 65535;
      var p = a.parentNode, bd = doc.body;
      while(p!= bd && depth>0 && p !== null){
        if(p == v)
          return true;
        p = p.parentNode;
        depth--;
      }
      return false;
    },
    
/**
 * 根据样式类名得到样式实体
 *  @param {String|Array} sname
 *  @param {String|Array} cssName 指定样式表名称
 *  @return {Object}
 */
    getClassByName : function(sname,cssName){
    	var get = function(n){
    		var j = sname.length;
//		    console.log(sname)
//			console.log(sname.length);
    		for(var i=0;i<j;i++){
    			if(n.toLowerCase() == sname[i]){
//    				console.log(j);
//	    			j = sname.length;
//    				sname.splice(i,1);
    				return true;
    			}
    		}
    		return false;
    	};
    	
    	var isCss = function(href){
    		if(typeof cssName == 'string'){
    			return ( href.indexOf(cssName) < 0 )? false : true;
    		}else{

    			for (var j=0;j<cssName.length;j++) {
    				if(href.indexOf(cssName[j]) > -1){
    					return true;
    				}
    			}
    			return false;
    		}
    	};
    	var result = {};
    	for (var i=0;i<document.styleSheets.length;i++) {
    		var rules;
    		if(cssName){
    			if(!document.styleSheets[i].href || !isCss(document.styleSheets[i].href)) continue;
    		}
    		if (document.styleSheets[i].cssRules) {
    			rules = document.styleSheets[i].cssRules;
    		} else {
    			rules = document.styleSheets[i].rules;
    		}
    		if(typeof sname == 'string'){
        		for (var j=0;j<rules.length;j++) {
        			if (rules[j].selectorText && rules[j].selectorText.toLowerCase() == sname) {
        				result = rules[j].style;
        			}
        		}
    		}else{
	    		for (var j=0,k=rules.length;j<k;j++) {
	    			var n = (rules[j].selectorText&&rules[j].selectorText.toLowerCase())||'';
		    		if(n && get(n)){
		    			result[n] = rules[j].style;
		    		}
		    	}
    		}
    	}
	    return result;
    },
    
/**
 *  修改样式（class）属性
 *  @param {String|Array} sname
 *  @param {Object} attrObj 要修改的属性对象
 *  @param {String|Array} cssName 指定样式表名称
 */   
    setClassAttr : function(sname,attrObj,cssName){
    	var tempSname = sname.slice(0);
    	var cls = this.getClassByName(sname,cssName);
    	if(cls){
    		if(typeof sname == 'string'){
	    		for(var v in attrObj){
	    			cls[v] = attrObj[v];
	    		}
    		}else{
    			for(var i=0,j=sname.length;i<j;i++){
    				if(cls[sname[i]]){
    		    		for(var v in attrObj[i]){
    		    			cls[sname[i]][v] = attrObj[i][v];
    		    		}
    				}
    			}
    		}
    	}
    },
    
    //获取某字符在textarea或input中的坐标
    getCursorOffset : (function(){
        var font = "Tahoma,宋体";
        
        var isCss1 = false;
        
        if ($.browser.msie && $.browser.version < 8) {
            isCss1 = true
        }
        
        function format(h) {
            var a = /<|>|\'|\"|&|\\|\r\n|\n| /gi;
            var hash = {
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "\\": "&#92;",
                "&": "&amp;",
                "'": "&#039;",
                "\r": "",
                "\n": "<br>",
                " ": !isCss1 ? "<span style='white-space:pre-wrap;'> </span>" : "<pre style='overflow:hidden;display:inline;word-wrap:break-word;'> </pre>"
            };
            
            return h.replace(a, function (m) {
                return hash[m]
            });
        }
        
        //生成一个透明镜像
        function mirror($element) {
            this.ele = $element;
            
            this.init();
        }
        mirror.prototype = {
            //panel
            $p : null,
            
            //要测试的对象的位置
            $f : null,
            
            css : ["overflowY", "height", "width", "paddingTop", "paddingLeft", "paddingRight", "paddingBottom", "marginTop", "marginLeft", "marginRight", "marginBottom"
                ,'fontFamily', 'borderStyle', 'borderWidth', 'wordWrap', 'fontSize', 'lineHeight', 'overflowX'],
            
            init : function() {
                var $p = this.$p = $('<div></div>');
                
                var css = {opacity: 0, position: 'absolute', left: 0, top:0, zIndex: 20000}, 
                    $ele = this.ele;
                /*
                css = $.extend({
                    fontFamily: font,
                    borderStyle: "solid",
                    borderWidth: "0px",
                    wordWrap: "break-word",
                    fontSize: "14px",
                    lineHeight: "18px",
                    overflowX: "hidden"
                }, css);
                */
                $.each(this.css, function(i, p){
                    css[p] = $ele.css(p);
                });
                
                $p.css(css);
                $('body').append($p);
            },
            
            setContent : function(front, flag, end) {
                var $p = this.$p, $flag;
                $p.html('<span>' + format(front) + '</span>');
                this.$f = $flag = $('<span>' + format(flag) + '</span>');
                $p.append($flag);
                $p.append('<span>' + format(end) + '</span>');
            },
            
            getPos : function() {
                return this.$f.position();
            }
        }
        
        return function(textElem, flagCharAt) {
            var $textElem = $(textElem);
            if (!$textElem.data('mirror')) {
                $textElem.data('mirror', new mirror($textElem));
            }
            
            var $mirror = $textElem.data('mirror');
            
            if (!$mirror) {
                return {};
            }
            
            var text = $textElem.val(),
            frontContent = text.substring(0, flagCharAt),
            flag = text.charAt(flagCharAt),
            lastContent = text.substring(flagCharAt+1);
            $mirror.setContent(frontContent, flag, lastContent);
            
            return $mirror.getPos();
        }
    })()
    
};


if(window.__debug){

/**
 * @class console
 * 系统控制台,如果存在firebug,利用firebug输出调试信息,否则忽略.
 * 在firbug中可直接进行对某个对象进行监视,
 * 无console时就为空调用,可重写自定输出.
 * @singleton
 */
if(!window.console)
      window.console = {};

Util.extendIf(console,{
      /**
       * %o表示参数为一个对象
       * console.log('This an string "%s",this is an object , link %o','a string', CC);
       *@param {arguments} 类似C语言中printf语法
       *@method
       */
    debug : $.noop,

/**
 * @method trace
 */
    trace : $.noop,
/**
 * @method log
 */
    log : $.noop,
/**
 * @method warn
 */
    warn : $.noop,
/**
 * @method error
 */
    error : $.noop,

/**
 * @method group
 */
    group:$.noop,
/**
 * @method groupEnd
 */
    groupEnd:$.noop
});

}


if ( $.browser.msie && $.trim($.browser.version) == "6.0" ){
    Util.ie6 = true;
    doc.execCommand("BackgroundImageCache", false, true);
}

/**
 * @class Xwb.ax
 */
X.ax = {};

/**
 * @class Xwb.ax.Tpl
 * <p>HTML模板类，用于解析字符串HTML并生成对应的DOM元素。</p>
 * <p>HTML模板字符解析依赖两个数据：
    <ul><li>未解析的htmls字符串</li>
    <li>map(key,value)对象数据</li>
    </ul>
    htmls字符串是原始的数据，通过{@link #parse}方法解析。
   </p>
   <pre>
    模板文法描述：
    
    入口：
    parse(entry, dataMap)
    参数：
    dataMap: {  key : value, …}
    key : JavaScript标识符
    value:entry
    entry: html 文本，.keyFromDataMap，keyFromTemplates
    html文本: &lt;tag attribute="{.keyFromDataMap}"&gt;{keyFromTemplates}&lt;/tag&gt;, IfTest, ...
    IfTest : [?keyFromDataMap?html文本?],取反：[?!keyFromDataMap?html文本?]
    Templates : {key : html文本}
    
    例子：
    var map = { name:'Xweibo' };
    var templates = {
         Header : '&lt;h2&gt;{.name}&lt;/h2&gt;',
         Box:'{Header}&lt;div&gt;名称是{.name}&lt;/div&gt;'
    };
    alert( parse('Box', map) );
    结果是：&lt;h2&gt;Xweibo&lt;/h2&gt;&lt;div&gt;名称是Xweibo&lt;/div&gt;
    </pre>
  * @singleton
  */


var tplRegIf = /\[\?(!?)\.([\w_$]+?)\?([\S\s]*?)\?\]/g,
    tplReg   = /\{(\.?[\w_$]+)\}/g;

var T = X.ax.Tpl = {
    // 模板html缓存
    tpls:{},
    
/**
 * 键查找过程：模板 --> 对象 --> 模板
 <pre><code>
    var map = { name:'Xweibo' };
    var templates = {
         Header : ‘&lt;h2&gt;{.name}&lt;/h2&gt;',
         Box:'{Header}&lt;div&gt;名称是{.name}&lt;/div&gt;'
    };
    alert( parse(‘Box', map) );
    结果是：&lt;h2&gt;Xweibo&lt;/h2&gt;&lt;div&gt;名称是Xweibo&lt;/div&gt;
 </code></pre>
 * @param {String} htmls 模板字符串
 * @param {Object} map 值键对
 */    
    parse : function(htmls, map){
        if(!map)
            map = {};
        if(htmls.charAt(0) !== '<'){
            var tmp = T.tpls[htmls];
            if(tmp) 
                htmls = tmp;
        }
        
        // [?test?<img src="{src}">],当test置值时应用内容部份
        // example : [?right?output value {right}?]the left
        htmls = htmls.replace(tplRegIf, function(s, s0, s1, s2){
            if(s0 === '!')
                return !map[s1] ? s2:'';
    
            return map[s1] === undefined ? '' : s2;
        });
        
        return htmls.replace(tplReg, function(s, k){
            var v = k.charAt(0) === '.' ? map[k.substr(1)] : T.tpls[k];
            if(v === undefined || v === null)
                return '';
                
            // html text
            if(v.toString().charAt(0) === '<')
                return T.parse(v, map);
            
            // key of Tpl?
            if(T.tpls[v])
                return T.parse(T.tpls[v], map);
                
            return v;
        });
    },
   /**
    * 根据html模板创建HTML元素
    <pre>
        <code>
            var iframeElement = forNode(
              '&lt;{tag} class="{cls}" frameBorder="no" scrolling="auto" hideFocus=""&gt;&lt;/iframe&gt;',
              {tag:'iframe', cls:'ui-frame'}
            );
        </code>
    </pre>
    * @param {String} htmls
    * @param {Object|Array} map
    * @return {HTMLElement}
    */
    forNode : function(htmls, map){
        if(map)
            htmls = this.parse(htmls, map);
        return $(htmls).get(0);
    },
/**
 *  根据模板名称获得模板字符串。
 * @param {String} templateName
 * @return {String}
 */
    get : function(type){
        return this.tpls[type];
    },
    /**
     * 注册HTML模板
     * @param {Object} htmlTemplateMap
     */
    reg : function(map){
        $.extend(this.tpls, map);
    }
};


/**
 * @class Xwb.ax.Cache
 * 缓存类，可以将一些常用重用的数据纳入本类管理。<br/>
 * 内部数据结构为:<br>
 * <pre>
 * // 数据直接放在类下，名称不要与方法冲突了哦！
 * Cache[key] = [dataObjectArray||null, generator];
 * dataObjectArray[0] = 预留位,保存该key数据最大缓存个数, 默认为3.
 * generator = 生成数据回调
 * </pre>
 * @singleton
 */
var Cache = X.ax.Cache = {

    /**@cfg {Number} MAX_ITEM_SIZE 对每个类别设置的最大缓存数量，默认为3.*/
    MAX_ITEM_SIZE: 3,

/**
 * 注册数据产生方式回调函数,可重复赋值,函数返回键对应的数据.
 * @param {Object} key
 * @param {Function} callback
 * @param {Number} [max] 缓存该数据的最大值
 */
    reg: function(k, callback, max) {
       if(!this[k])
        this[k] = [null, callback];
       else this[k][1] = callback;

       if(max !== undefined)
        this.sizeFor(k, max);
    },
/**
 * 根据键获得对应的缓存数据.
 * @param {String} key
 * @return {Object}
 */
    get: function(k) {
        var a = this[k];
        if(a === undefined)
            return null;
        var b = a[1];
        a = a[0];

        if(a === null){
          return b();
        }
        //0位预留
        if(a.length > 1)
            return a.pop();
        if(b)
            return b();

        return null;
    },
/**
 * 缓存键值数据.
 * @param {Object} key
 * @param {Object} value
 */
    put: function(k, v) {
        var a = this[k];
        if(!a){
            this[k] = a = [[this.MAX_ITEM_SIZE, v]];
            return;
        }
        var c = a[0];
        if(!c)
          a[0] = c = [this.MAX_ITEM_SIZE];

        if (c.length - 1 >= c[0]) {
            return ;
        }

        c.push(v);
    },

/**
 * 移除缓存.
 * @param {Object} key 键值
 */
    remove : function(k){
      var a = this[k];
      if(a){
        delete this[k];
      }
    },
/**
 * 设置指定键值缓存数据的最大值.
 * @param {Object} key
 * @param {Number} max
 */
    sizeFor : function( k, max ) {
        var a = this[k];
        if(!a)
          this[k] = a = [[]];
        if(!a[0])
          a[0] = [];
        a[0][0] = max;
    }
};

/**
 * 缓存DIV结点.
 * <pre><code>
   var divNode = Xwb.Cache.get('div');
 * </code></pre>
 * @property div
 * @type DOMElement
 */
Cache.reg('div', function() {
    return doc.createElement('DIV');
});


/**
 * @class Xwb
 */

/**
 * 根据配置名称获得全局配置值
 * @param {String} key
 * @return {Object}
 * @type Function
 */
X.getCfg     = function(key){
	return X.cfg && X.cfg[key]; 
};

/**
 * 返回站点用户ID
 * @return {String} siteId
 * @type Function
 */
X.getSiteUid = function(){ return parseInt(X.getCfg('siteUid'));};

/**
 * 返回登录用户ID
 * @return {String} userId
 * @type Function
 */
X.getUid     = function(){
	var uid = X.getCfg('uid'); 
	return uid !== '0' && uid;
};

/**
 *  根据微博ID返回缓存中的微博数据
 * @type Function
 * @return {Object}
 */
X.getWb = function(id) {
	var wbList = X.getCfg('wbList');
	return id? wbList && wbList[id]: wbList;
};

/**
 *  缓存微博数据到全局缓存
 * @param {String} wid
 * @param {Object} wbData
 * @type Function
 */
X.setWb = function(id, data) {
	X.cfg.wbList && (X.cfg.wbList[id] = data);
};

//
//  以缩略名注册类
//
$.extend(X, {
	
	_cls : {},
	/**
	 * 为指定类或对象注册一个短命名标识，便于在其它地方通过{@link use}方法返回该类实例或该对象。<br/>
	 * @param {String} shortcut 标识，即该类的缩略名
	 * @param {Function|Object} target 类或对象
	 * @param {Boolean} [override] 默认如果已存在同名对象会抛出异常，但通过设置本标记可强制重定义类
	 * @return clazz
	 */
	reg : function(n, cls, override){
		if(this._cls[n] !== undefined && !override){
			if(__debug) console.trace();
			throw '已定义类' + n;
		}
		this._cls[n] = cls;
		return cls;
	},
	
	/**
	 * 使用短名类，可以将某个类或类实例通过{@link #reg}方法放到Xwb对象缓存中，
	 * 在任何地方调用本方法获得已缓存对象。
	 * @param {Object} name 根据键查找缓存对象
	 * @param {Object} [config] 假如缓存值为一个类(Function)，以config为参数实例化该类
	 * @return {Object} 如果缓存的是一个类(Function)，返回该类实例，否则直接返回缓存对象
	 */
	use : function(n){
		// instance( type, config )
		var cls = this._cls[n];
		if (cls) {
		    // object only
		    if(typeof cls === 'object')
		        return cls;
		    // instance class
		    var cfg = arguments[1];
		    if( typeof cfg === 'function' )
		        return new cls(cfg(cls.prototype));
		    return new cls(cfg);
		}
		return null;
	},
	
/**
 * 检测当前页面是否为指定模块的页面。
 * 通过BigPipe实现模块加载后该方法已被废弃。
 * @param {String} page
 * @param {Boolean}
 */
	isModule : function(name){
	    return this.getModule() === name;
	},
	
/**
 * 返回当前页面模块名称
 * @return {String}
 */
	getModule : function(){
	    if(this._mod === undefined)
	        this._mod = this.getCfg('page')||'';
	    return this._mod;
	}
});

/**
 * @class Xwb.ax
 */

/**
 * @class Xwb.ax.Uploader
 * 异步文件上传类，该类通过类似JSONP方式的隐藏IFRAME上传文件。IFRAME由类自动创建。
 <pre><code>
    X.use('Uploader', {
       form:$('#fileForm'),
       // 成功后回调 
       onload:function(e){
            if(e.isOk()){
                alert('uploaded!');
            }else {
                alert(e.getCode());
            }
       }
    });
    </code></pre>
 * @constructor
 * @param {Object} config 配置信息
 */

/**
 * @cfg {String} [action] 如果action未配置，则从form里提取action，如果form未置设action，默认action为Xwb.request.apiUrl('action', 'upload_pic')
 */
/**
 * @cfg {Function} onload 上传后的回调函数，参数为Xwb.ax.ResponseDefinition实例
 */
X.ax.Uploader = X.reg('Uploader', function(cfg){
    this.init(cfg);
});

X.ax.Uploader.prototype = {
    
    init : function( cfg ){
        $.extend( this, cfg );
        
        var form = this.form;
        var formEl = this.formEl = $(form)[0];
        var name = 'xwb_upload_frame_' + Util.uniqueId();
        this.iframe = T.forNode('<iframe src="about:blank" style="display:none;" id="'+name+'" name="'+name+'"></iframe>');
        
        //添加callback参数 ?? 为什么还要添加
        $('<input type="hidden" name="callback"/>').appendTo(form);
        
        $(this.iframe).appendTo( doc.body );
        
        formEl.target = name;
        
        if(!this.action)
            this.action = formEl.action || X.request.apiUrl('action', 'upload_pic');
    },
    
/**
 * 可重置action值
 * @param {String} action
 */
    setAction : function(action){
        this.action = action;
        return this;
    },
/**
 * 是否加载中
 */
    isLoading : function(){
        return !!this.jsonpFn;
    },
    
/**
 * @cfg {Function} beforeUpload 开始上传前调用，返回false取消上传，可实现该方法以在上传前检测表单。参数为 beforeUpload(jqForm)。
 */
    beforeUpload : $.noop,
    
/**
 *  开始上传
 * @param {Function} [callback]
 */
    upload : function( callback ){
        if(this.beforeUpload(this.form) !== false){
            if(this.isLoading())
                this.abort();
            
            var self = this,
                fn = this.jsonpFn = 'jsonp' + new Date().getTime();
            
            window[fn] = function(){
                window[fn] = null;
                delete self.jsonpFn;
                var e = X.request.parseProtocol(arguments[0]);
                (callback||self.onload).call(self, e);
                // fix a bug in IE7
                delete self.jsonpFn;
            };
            
            this.formEl.action = Util.appendParam(this.action, {callback:'parent.'+fn, '_':Util.uniqueId()});
            this.formEl.submit();
        }
    },

    onload : $.noop,
    
    abort : function(){
        if(this.isLoading()){
            var fn = this.jsonpFn;
            window[fn] = function(){
                window[fn] = null;
            };
        }
    }
};

})(Xwb, $);