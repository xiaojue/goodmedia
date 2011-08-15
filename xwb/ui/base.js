(function(X, $){

var Util = X.util;
var undefined;
var T = X.ax.Tpl;
var doc = document;
    
// hidden style class
var hidCls   = 'hidden';
var jqWin = $(window);
var jqDoc = $(doc);
/**
 * @class Xwb.ui
 */
var ui   = X.ui = {
    Base : Util.create()
};

var Base = ui.Base;

/**
 * UI基类，提供如何生成和控制UI内HTML元素的基本方法。<br/>
 * 想了解生成UI视图的HTML如何组织，参见{@link Xwb.util.Tpl}类和{@link #view}属性。<br/>
 * @class Xwb.ui.Base
 * @constructor
 * @param {Object} config  该配置信息将被完全地复制到当前实例中，并会覆盖相同属性名的默认值。
 */
/**
 * @cfg {Boolean} closeable
 * 指示控件是否可关闭，可关闭的控件上存在一个{@link #clsNode}结点，
 * 当点击该元素时关闭控件，这过程由控件实现。
 */

/**
 * @cfg {String} titleNode 标题结点选择器，如果控件存在“标题”，
 * 调用{@link #setTitle}方法时会用标题结点选择器获得标题结点，
 * 并在该结点上打印标题。默认值为"#xwb_title"
 */

/**
 * @cfg {String} clsNode
 * 用该选择器查找关闭事件触发结点。默认值为"#xwb_cls"
 */
 
/**
 * @cfg {Function} onViewReady
 * 这是个接口方法，当控件html元素生成后回调该接口，参数传递控件html元素。
 
* <pre><code>
    {
        onViewReady : function(viewElement){
            alert(viewElement.tagName);
        }
    }
 </code></pre>

 */
 
/**
 * @cfg {String} title 存在标题值时，控件初始化时会调用{@link #setTitle}方法输出标题
 */

/**
 * @cfg {String|HTMLElement|HtmlTemplate} view
 * 指定控件生成html视图的模板，它可以是一段HTML字符串，也可以是HTML模板名称，也可为一个html元素。<br/>
 * 如果view来自字符串模板，将调用{@link Xwb.util.Tpl.parse}方法解析模板。<br/>
 * 如果未指定{@link #tplData}数据，将控件自身数据作为模板解析的key->value数据。
 */
 
/**
 * @cfg {Boolean} actionMgr
 * 指示是否启用{@link Xwb.ax.ActionMgr}动作处理，
 * 初始化后actionMgr属性指向实例化的{@link Xwb.ax.ActionMgr}类实例。
 */
/**
 * @cfg {Function} onactiontrig 接口方法，开始{@link #actionMgr}后，可实现该接口统一处理来自{@link #actionMgr}实例的各种动作
 
* <pre><code>
    {
        actionMgr : true,
        onactiontrig : function(act){
            switch(act.data.e){
                case 'sd' :
                // do something
                break;
                // ...
            }
        }
    }
 </code></pre>

 */
 
/**
 * @cfg {Boolean} destroyOnClose 当关闭控件时，
 * 是否销毁({@link #destroy})控件，否则只隐藏控件。默认值false，只隐藏。
 */

/**
 * @cfg {Function} onclose 接口方法，关闭控件({@link #close})时，将回调该方法，如果方法返回false值取消关闭
 */

/**
 * @cfg {Boolean} contexted 指示控件显示后是否具有“内外切换”类菜单的效果。“内外切换”即点击控件内部区域时一切正常，但点击非控件区域时就关闭控件。
 */

/**
 * @cfg {Boolean} hidden 初始化时是否显示控件，默认显示
 */

/**
 * @cfg {Boolean} autoRender
 * 指示是否在类初始化时生成视图元素，默认false，按需才生成。<br/>
 * 如果该项为false，即控件在初始化后，并未立即生成视图结点，触发{@link #onViewReady}回调，
 * 而是直至直接或间接调用{@link #getView}方法后生成，即按需时才生成HTML视图。<br/>
 * 如果未生成视图结点，{@link #onViewReady}方法是不会触发的，
 * 但有时候需要提前生成，此时就可以设置该项为true，即在初始化时就生成HTML视图，
 * 从而触发{@link #onViewReady}。
 */

/**
 * @property cacheId
 * 控件全局唯一ID
 * @type String
 */
 
// 该方法会覆盖原有getView()当view结点生成后。
function getReadyView(){
    return this.view;
}

ui.Base.prototype = {
        
        autoRender : false,
        
        titleNode : '#xwb_title',
        
        // 类初始化入口
        init : function(opt){
            this.cacheId = 'c' + Util.uniqueId();
            opt && $.extend(this, opt);
            // UI初始化入口
            this.initUI();
            
            if(this.autoRender)
                this.getView();
        },
        
        // 接口方法
        initUI : $.noop,
        
        clsNode : '#xwb_cls',
        
        // 绑定关闭事件
        initClsBehave : function(cls){
            this.jq(this.clsNode).click(Util.bind(this.onClsBtnClick, this));
            this.setCloseable(cls);
        },
        
        /**
         *  设置是否可关闭
         * @param {Boolean} closable
         */
        setCloseable : function(cls){
            $(this.clsNode).cssDisplay(cls);
            this.closeable = cls;
        },
        
        onClsBtnClick : function(){
            this.close(true);
            return false;
        },
/**
 * 关闭控件，关闭前触发{@link #onclose}回调，如果开始{@link #destroyOnClose}，关闭后销毁({@link #destroy})该控件
 */
        close : function(){
            if(!this.onclose || this.onclose() !== false){
                if(this.destroyOnClose)
                    this.destroy();
                else this.display(false);
            }
        },
/**
 *  @cfg {Object} tplData 默认控件的模板数据来自控件自身，也可以通过该属性重定义模板数据
 */
        tplData : false,
        
/**
 * 由html创建或选择器定位UI图视结点
 * @private
 */
        createView : function(){
            var v = this.view;
            if(typeof v === 'string'){
                v = this.view = T.forNode(T.get(v)||v, this.tplData || this, true);
            }else this.view = v = doc.createElement('DIV');
            return $(v)[0];
        },

/**
 * 子类应重载该方法替代onViewReady
 * @private
 */
        innerViewReady : $.noop,

/**
 * 设置控件标题。
 * 查找标题所在结点参见{@link #titleNode}配置。
 * @param {String} title
 * @return this
 */
        setTitle : function(tle){
            this.jq(this.titleNode).html(tle);
            return this;
        },
        
    /**
     * 获得窗口视图DOM结点，如果结点未创建，立即创建并返回结点，创建后触发{@link #onViewReady}接口回调。
     * 子类不能重写该方法。
     * @return {HTMLElement}
     */ 
        getView : function(){
          var v = this.view;
          
          // 未创建
          if(!v || !v.tagName)
            v = this.createView();

          // 重写，下载调用时就直接返回结点
          this.getView = getReadyView;
          
          if(this.appendTo){
              $(this.appendTo).append(v);
              delete this.appendTo;
          }
          
          if(this.closeable !== undefined)
              this.initClsBehave(this.closeable);

          if(this.actionMgr){
              this.actionMgr = X.use('ActionMgr', this.actionMgr);
              this.actionMgr.bind( v );
              if(this.onactiontrig){
                  var self = this;
                  this.actionMgr.addFilter(function(e){
                      return self.onactiontrig(e);
                  });
              }
          }
          
          // interval method
          this.innerViewReady(v);
          
          // config method，回调接口方法
          this.onViewReady && this.onViewReady(v);
          
          // 将display放到onViewReady之后，
          // 正常执行
          if(this.hidden !== undefined){
              var tmp = this.hidden;
              this.hidden = undefined;
              this.display(!tmp);
          }
          return v;
        },
/**
 * 将元素绑定到本类，快速利本类方法处理元素。
 * @param {HTMLElement|jQuery} view
 * @return this
 */
        fly : function(view){
            this.view = (view && view[0]) || view;
            return this;
        },

/**
 * @cfg {Function} beforeShow 接口方法，在控件显示前回调，如果子类实现该方法，请确保调用回父类方法。<br/>
 * 回调方法时，视图状态已是 visibility:'hidden', display:true，所以如果视图已在DOM上，控件在DOM流上占位，
 * 可以正确获得控件宽高和位置等等信息。
 */
        beforeShow : $.noop,
/**
 * @cfg {Function} afterShow 接口方法，控件显示后回调，如果子类实现该方法，请确保调用回父类方法
 */
        afterShow  : $.noop,

/**
 * @cfg {Function} beforeHide 接口方法，控件隐藏前回调，如果子类实现该方法，请确保调用回父类方法
 */
        beforeHide : $.noop,

/**
 * @cfg {Function} afterHide 接口方法，控件隐藏后回调，如果子类实现该方法，请确保调用回父类方法
 */        
        afterHide : $.noop,

/**
 * 以通用JavaScript变量命名风格生成ID元素对应的jq对象。
 * 如 
* <pre><code>
     this.jqExtra('inputor', 'title');
     alert( this.jqInputor );
     alert( this.jqTitle );
 </code></pre>
 * @param {Array} args 参数列表，它并不是一个数组，而是可变参数列表，如 jqExtra('a','b','c',...)
 * @return this
 */
        jqExtra : function(ids){
            for(var args = arguments,i=0,len=args.length;i<len;i++){
                var k    = args[i];
                var jqEl = this.jq('#'+k);
                if( jqEl ){
                    // 首字母大写
                    k = k.charAt(0).toUpperCase() + k.substring(1);
                    this['jq'+k] = jqEl;
                }
            }
            return this;
        },
/**@cfg {Boolean} contextable 设置是否开启显示后点击UI区域外后隐藏UI*/
/**
 * 显示/隐藏或获得UI的显示或隐藏属性
 * @param {Object} show
 * @return this
 */
        display : function(b){
            var j = this.jq();

            if(b === undefined)
                return !j.hasClass(hidCls);
            b = !b;
            if(this.hidden !== b){
                if(!b) {
                    this.hidden = b;
                    j.css('visibility', 'hidden').removeClass(hidCls);
                    this.beforeShow();
                    j.css('visibility', '');
                    if( this.contextable && !this.contexted)
                        this.setContexted(true);

                    this.afterShow();
                }else {
                    if(this.beforeHide() !== false){
                        this.hidden = b;
                        j.addClass(hidCls);
                        this.afterHide && this.afterHide();
                        // release contexted on hide
                        if(this.contexted)
                           this.setContexted(false);
                    }
                }
            }
			return this;
        },
        
        onContextRelease : function(){
            this.display(false);    
        },
/**
 * 控件视图追加到在指定jQuery对象中
 * @param {jQuery} jQuery对象
 */
        appendAt : function(a){
            $(a).append(this.getView());
            return this;
        },
        
    /**
     * 是否包含某元素
     * @param {Xwb.ui.Base|HTMLElement} target
     * @param {Number} [depth] 搜索深度
     */
        ancestorOf :function(a, depth){
          a = a.view || a;
          return Util.ancestorOf(this.view, a, depth);
        },
/**
 * 获得控件或控件子元素的jQuery对象
 * @param {jQuery} selector jQuery选择器，未设置时返回控件视图的jQuery对象
 * @return {jQuery}
 */
        jq : function(selector){
            return selector === undefined ? $(this.getView()) : $(this.getView()).find(selector);
        },
/**
 * 销毁控件，将视图从DOM上移除
 */
        destroy : function(){
            this.display(false);
            this.jq().remove();
        },

/**
 * 添加DOM事件处理，大部份事件可直接调用jQuery方法处理，但mousedown是例外的，如果想监听mousedown事件，请调用本方法进行绑定。<br/>
 * 为什么mousedown事件是例外的？参见{@link Xwb.ax.contextMgr}
 * @param {String} eventName
 * @param {Function} handler
 * @param {String|HTMLElement} [childElementToBind] 如果指定该项，事件将绑定到该项元素上
 */
        domEvent : function(evt, fn, child){
            if(evt === 'mousedown'){
                var comp = this;
                var wrapper = function(e){
    	           	if(!comp.contexted)
    					X.use('contextMgr').releaseAll(e);
    			    return fn.apply(comp, arguments);
                };
                
                if(!this._mousedownFns)
                    this._mousedownFns = {};
                this._mousedownFns[fn] = wrapper;
                
                this.jq(child).bind(evt, wrapper);
            }else this.jq(child).bind(evt, fn);
        },
/***
 * 移除由{@link #domEvent}绑定的事件
 * @param {String} eventName
 * @param {Function} handler
 * @param {String|HTMLElement} [childElementToBind]
 */
        unDomEvent : function(evt, fn, child){
            if(evt === 'mousedown'){
                var wrapper = this._mousedownFns[fn];
                this.jq(child).unbind(evt, wrapper);
                delete this._mousedownFns[fn];
            }else this.jq(child).unbind(evt, fn);
        },
     
        /**
         * 添加上下文切换效果,当点击控件区域以外的地方时隐藏控件。
         * @see #onContextRelease
         * @return {Xwb.ui.Base} this
         */
        setContexted : function(set){
        	if(this.contexted !== set)
        		set ? X.use('contextMgr').context(this) : 
        		      X.use('contextMgr').release(this);
        	return this;
        },
        /**
         * 批量对子元素应用innerHTML
         * @param {Object} childSelectorHtmlMap 结点为{childSelector:strHtml}
         
        * <pre><code>
            var data = {
                '#text_a':'字符串A',
                '#text_b':'字符串B',
                '#text_c':'字符串C'
            };
         </code></pre>

         */
        templ : function(obj){
            for(var selector in obj){
                this.jq(selector).html(obj[selector]);
            }
            return this;
        },
		
		offset : function(){
			if(arguments.length){
				this.jq().css(arguments[0]);
				return this;
			}
			return this.jq().offset();
		},
		
    /**
     * 得到相对目标元素的偏移量，假如参数为window元素，得到相对客户区视图偏移量
     * @param {DOMElement|jQuery} offsetToTarget
     * @return [offsetX, offsetY]
     */
        offsetsTo : function(tar){
            var tar = tar[0]||tar;
            var e;
            if(tar == window)
                e = {left:jqDoc.scrollLeft(),top:jqDoc.scrollTop()};
            else e = $(tar).offset();
            var o = this.jq().offset();
            return [o.left-e.left,o.top-e.top];
        },

/**
 * 滚动控件到指定视图
 * @param {DOMElement|Xwb.ui.Base|jQuery} ct 指定滚动到视图的结点
 * @param {Boolean} hscroll 是否水平滚动,默认只垂直滚动
 * @return {Object} this
 */
    scrollIntoView : function(ct, hscroll){
      var c = ct?ct.view||ct[0]||ct:doc.body;
        var off = this.getHiddenAreaOffsetVeti(c);
        if(off !== false)
          c.scrollTop = off;
        //c.scrollTop = c.scrollTop;

        if(hscroll){
          off = this.getHiddenAreaOffsetHori(ct);
          if(off !== false)
          c.scrollLeft = off;
        }

        return this;
    },
    
      /**
       * 检测元素是否在某个容器的可见区域内.
       * <br>如果在可见区域内,返回false,
       * 否则返回元素偏离容器的scrollTop,利用该scrollTop可将容器可视范围滚动到元素处。
* <pre><code>
    html:
    &lt;body&gt;
        &lt;input type=&quot;button&quot; onclick=&quot;b.scrollIntoView($('#a')[0], true);&quot; value=&quot;
M&iuml;&Aacute;&quot; /&gt;&lt;span id=&quot;t&quot;&gt;&lt;/span&gt;
        &lt;div id=&quot;a&quot; style=&quot;position:absolute;height:200px;width:300px;background:red;left:100px;top:200px;overflow:auto;&quot;&gt;
            &lt;div id=&quot;b&quot; style=&quot;position:absolute;height:50px;width:200px;background:black;left:120px;top:210px;&quot;&gt;
            &lt;/div&gt;
            &lt;div style=&quot;position:absolute;height:800px;width:2000px;left:20px;top:420px;&quot;&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/body&gt;
    script:
    var b = new Xwb.ui.Base({view:$('#b')[0]});
    var t = $('#t');
    $('#a').scroll(function(){
        var r = b.getHiddenAreaOffsetVeti(this);
        var text = (r === false?'垂直可见':'垂直遮罩');
        r = b.getHiddenAreaOffsetHori(this);
        text += (r === false?',水平可见':',水平遮罩');
        t.text(text);
    });
 </code></pre>
       * @param {DOMElement|Xwb.ui.Base|jQuery} container
       * @return {Boolean}
       */
      getHiddenAreaOffsetVeti : function(ct){
            var c = ct.view||ct[0]||ct;
            var el = this.view;

            var o = this.offsetsTo(c),
                ct = parseInt(c.scrollTop, 10),
                //相对ct的'offsetTop'
                t = o[1] + ct,
                eh = el.offsetHeight,
                //相对ct的'offsetHeight'
                b = t+eh,
    
                ch = c.clientHeight,
                //scrollTop至容器可见底高度
                cb = ct + ch;
            if(eh > ch || t < ct){
              return t;
            }else if(b > cb){
                b -= ch;
                if(ct != b){
                    return b;
                }
            }
    
        return false;
      },
      /**
       * 检测元素是否在某个容器的可见区域内.
       * <br>如果在可见区域内，返回false,
       * 否则返回元素偏离容器的scrollLeft,利用该scrollLeft可将容器可视范围滚动到元素处。
* <pre><code>
    html:
    &lt;body&gt;
        &lt;input type=&quot;button&quot; onclick=&quot;b.scrollIntoView($('#a')[0], true);&quot; value=&quot;
M&iuml;&Aacute;&quot; /&gt;&lt;span id=&quot;t&quot;&gt;&lt;/span&gt;
        &lt;div id=&quot;a&quot; style=&quot;position:absolute;height:200px;width:300px;background:red;left:100px;top:200px;overflow:auto;&quot;&gt;
            &lt;div id=&quot;b&quot; style=&quot;position:absolute;height:50px;width:200px;background:black;left:120px;top:210px;&quot;&gt;
            &lt;/div&gt;
            &lt;div style=&quot;position:absolute;height:800px;width:2000px;left:20px;top:420px;&quot;&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/body&gt;
    script:
    var b = new Xwb.ui.Base({view:$('#b')[0]});
    var t = $('#t');
    $('#a').scroll(function(){
        var r = b.getHiddenAreaOffsetVeti(this);
        var text = (r === false?'垂直可见':'垂直遮罩');
        r = b.getHiddenAreaOffsetHori(this);
        text += (r === false?',水平可见':',水平遮罩');
        t.text(text);
    });
 </code></pre>
       * @param {DOMElement|CC.Base} [container]
       * @return {Boolean}
       */
      getHiddenAreaOffsetHori : function(ct){
        var c = ct.view||ct[0]||ct;
        var el = this.view;
            var cl = parseInt(c.scrollLeft, 10),
            o = this.offsetsTo(c),
                l = o[0] + cl,
                ew = el.offsetWidth,
                cw = c.clientWidth,
                r = l+ew,
                cr = cl + cw;
        if(ew > cw || l < cl){
            return l;
        }else if(r > cr){
            r -= cw;
            if(r != cl){
              return r;
             }
        }
        return false;
      },
      
      
    
		// pa:t,b,c, pb:l,c,r
		/**
		 * 定位控件到指定元素边沿。<br/>
		 * 定位方位分为上，中，下，左，右，用字母分别表达t,c,b,l,r。<br/>
		 * 计算顺序为：上中下
        * <pre><code>
            // 将控件定位于元素的上方并居中
            component.anchor(anchorElement, 'lc');
         </code></pre>
         * 例子可参见demo/anchor.html
		 * @param {HTMLElement|jQuery} anchorElement 作为锚点的元素
		 * @param {String} direction 对齐方向，上下，左右与中间的结合，上下：t,b；左右l,r，中间c
		 * @param {Function} [prehandler] 计算出对齐数据后至应用数据前可通过该方法对数据进行二次处理
		 * @param {Boolean} [restrictIntoView] 如果控件超出可视区域，是否调整到可视区域内
		 */
		anchor : function(targetEl, pos, prehandler, intoView){
		    var jqT  = $(targetEl), jq = this.jq();
		    var toff = jqT.offset(),
		        tw   = jqT.width(),
		        th   = jqT.height(),
		        sw   = jq.width(),
		        sh   = jq.height();
		    var pa = pos.charAt(0), pb = pos.charAt(1);

		    var l = toff.left, t = toff.top;
		    switch(pa){
		        case 't' :
		            t-=sh;
		        break;
		        case 'b':
		            t+=th;
		        break;
		        case 'c':
		            t+= Math.floor((th-sh)/2);
		        break;
		    }
		    
		    switch(pb){
		        case 'c' :
		            l+= Math.floor((tw-sw)/2);
		        break;
		        case 'r':
		            l+=tw-sw;
		        break;
		    }
		    
		    if(prehandler){
		        var ret = ret = [l, t];
		        prehandler(ret, sw, sh);
		        l = ret[0];
		        t = ret[1];
		    }
		    // 限制宽在可见范围内
		    if(intoView){
		        if(t<0) t=0;
		        else {
    		        var vph = jqWin.height();
    		        if(t+sh-jqDoc.scrollTop()>vph){
    		            t = vph-sh+jqDoc.scrollTop();
    		        }
		        }
		        if(l<0)
		            l=0;
		        else {
    		        var vpw = jqWin.width();
    		        if(l+sw-jqDoc.scrollLeft()>vpw){
    		            l = vpw-sw+jqDoc.scrollLeft();
    		        }
		        }
		    }
		    
		    jq.css('left', l+'px')
		      .css('top', t+'px');
		},
		/**
		 * 控件相对当前文档视图居中
		 */
        center : function(){
          var jq  = this.jq(),
              sz  = [jqWin.width(), jqWin.height()],
              dsz = [jq.width(), jq.height()],
              off = (sz[1] - dsz[1]) * 0.8;
          this.view.style.left = Math.max((((sz[0] - dsz[0]) / 2) | 0), 0) + jqDoc.scrollLeft() + 'px';
          this.view.style.top  = Math.max(off - off/2|0, 0)+jqDoc.scrollTop() + 'px';
          return this;
        },
        
        /**
         * 控件视图从当前DOM父元素脱离，外包一层DIV元素，绝对定位置于document.body层，但控件的位置长度保持不变。<br/>
         * 控件视图只能在外包DIV层内活动，DIV层display:hidden，所以超出DIV层控件视图部份将被剪切。<br/>
         * 该函数主要作用是，方便相对外包DIV层内控制控件的位置，使得控件滑动时具有剪切效果。<br/>
         * 为防闪烁，调用函数前可先设置view的visiblity属性为隐藏(hidden)，<br/>
         * style.display为显示，调用后view外层元素的visiblity属性是隐藏(hidden)的。
         */
        clip : function(){
            if(!Base.CLIP_WRAPPER_CSS){
                Base.CLIP_WRAPPER_CSS = {
                    position:'absolute',
                    clear : 'both',
                    overflow:'hidden'
                };
                Base.CLIPPER_CSS = {
                    position:'absolute',
                    left:0,
                    top:0
                };
            }
            // 防止多次调用时产生多层包裹
            if(!this.jqClipWrapper){
                var jqWrap = $(X.ax.Cache.get('div')),
                    v      = this.getView(),
                    jq     = this.jq(),
                    pNode  = v.parentNode,
                    voff   = jq.offset();
                    
                jqWrap.css(Base.CLIP_WRAPPER_CSS)
                      .css(voff)
                      .css('width', jq.width()+'px')
                      .css('height', jq.height()+'px')
                      .css('z-index', jq.css('z-index'))
                      .append(v);
    
                // 保存状态，clip结束恢复
                var tmpCps = this._tmpClipedCss = {};
                for(var k in Base.CLIPPER_CSS){
                    tmpCps[k] = v.style[k];
                }
                jq.css(Base.CLIPPER_CSS);
                
                pNode && jqWrap.appendTo(pNode);
                this.jqClipWrapper = jqWrap;
            }
            return this.jqClipWrapper;
        },
        /**
         *  恢复{@link #clip}前控件状态
         */
        unclip : function(){
            if(this.jqClipWrapper){
                var wr = this.jqClipWrapper[0],
                    wrst = wr.style,
                    jq = this.jq(),
                    st = jq[0].style;
                
                for(var k in Base.CLIP_WRAPPER_CSS)
                    wrst[k] = '';
    
                this.jqClipWrapper
                    .css('overflow','')
                    .css('width','')
                    .css('height','');
                
                var tmpCps = this._tmpClipedCss;
                for(k in tmpCps)
                    st[k] = tmpCps[k];
                delete this._tmpClipedCss;
                
                wr.removeChild(jq[0]);
                if(wr.parentNode)
                    this.jqClipWrapper.replaceWith(jq);
                X.ax.Cache.put('div', wr);
                delete this.jqClipWrapper;
           }
        },
        
        /**
         * 滑动显示或隐藏。<br/>
         * 如果是隐藏，调用前要设置控件的visiblity:hidden,display:NOT HIDDEN样式。
         * @param {String} fromTo l,r,t,b|l,r,t,b，两位字母表示
         * @param {Boolean} visible 显示或隐藏
         * @param {Function} [callback]
         * @param {Object} [props] jquery动画配置
         * @param {Object} [duration]
         * @param {Function} [easing]
         */
        slide : function(fromto, show, fn, props, duration, easing){
            var jq = this.jq(),
                l  = 0, t  = 0,
                w  = jq.width(),
                h  = jq.height(),
                fl = l,ft = t,tl = l,tt = t,
                jqWr = this.clip();
            var from = fromto.charAt(0), 
                to = fromto.charAt(1);
            switch(from){
                case 'l' :
                    fl = l-w;
                break;
                case 'r':
                    fl = l+w;
                break;
                case 't':
                    ft=t-h;
                break;
                case 'b':
                    ft=t+h;
                break;
            }
            
            switch(to){
                case 'l' :
                    tl = l-w;
                break;
                case 'r':
                    tl = l+w;
                break;
                case 't':
                    tt=t-h;
                break;
                case 'b':
                    tt=t+h;
                break;
            }
            jq.css('left',fl)
              .css('top',ft);
            if(!props) props = {};
            if(tl!=fl){
                props.left = props.left === undefined?tl:props.left + tl;
            }
            if(tt!=ft){
                props.top  = props.top===undefined?tt:props.top+tt;
            }
            if(show)
                jq.css('visibility','');
            var self = this;
            jq.animate(props, duration||'fast', easing , function(){
                if(!show){
                    self.display(false);
                    jq.css('visibility', '');
                }
                setTimeout(function(){
                    self.unclip();
                    fn && fn(self);
                }, 0);
            });
        }
};

X.reg('base', Base);


})(Xwb, $);