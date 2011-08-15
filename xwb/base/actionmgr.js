(function(X, Util, $){
    var undefined;
/**
 * @class Xwb.ax.ActionEvent
 当一个动作触发后，就生成一个Xwb.ax.ActionEvent实例作参数传给处理方法。
 本类携带了与该动作相关的数据和方法，如触发源元素，当前元素，获得当前路径数据等。
 类无需手动实例化，由{@link Xwb.ax.ActionMgr}内部维护。
<pre>
技巧：
利用该类获得动作关联元素常用方法：
1. 给相关元素设定局部唯一ID
2. 利用e.jq()方法或$(e.getEl())返回一定范围父元素的jq对象
3. 根据设定的id获得元素
例：
在处理方法中，
<code>
function( e ){
    // 假如事件源元素 rel="w:123765"
    // 获得包含w属性的html元素
    var jqWb = e.jq('w');
    var targetEl = jqWb.find('#xwb_tar');
    // ...
}
</code>
</pre>
 */

/**
 * @property evt
 触发该动作的浏览器事件对象
 * @type DOMEvent
 */
 
/**
 * @property src
 触发该动作的源元素
 * @type HTMLElement
 */
 
/**
 * @property data
 * 当前处理元素的rel数据
 * @type Object
 */
function ActionEvent(rels){
    this.q = rels;
    // 初始状态
    this.idx = -1;
    // end pos
    this.end = this.q.length-1;
};


ActionEvent.prototype = {

    prevented : undefined,
    
    stopPropagationed : undefined,
    
/**
 * 当前DOM路径内向上查找rel属性中包含name键的数据
  <pre><code>
  // rel="w:123456"
  var wbId = e.get('w');
 </code></pre>

 * @param {String} name
 * @return {String} value
 */
    get : function(name){
        var r = this.getRel(name);
        return r && r.data && r.data[name];
    },
/**
 * 返回经escape函数转义后的字符串数据
 * @param {String} name
 * @return {String}
 */
    escape : function(name){
        var v = this.get(name);
        if(v !== undefined)
            return escape(v);
    },
/**
 * 当前DOM路径内向上查找含有rel以name为键的元素
 * <pre><code>
  // 从当前产生事件的元素开始向上查找获得包含w字段的元素
  var parent = e.getEl('w');
 </code></pre>
 * @param {String} name
 * @return {HTMLElement}
 */
    getEl : function(name){
        var r = this.getRel(name);
        return r && r.src;
    },
/**
 * 清空元素rel数据。
 */
    clear : function(name){
        var wrap = name?this.getRel(name):this;
        var jq = $(wrap.src);
        jq.data('xwb_rel', null);
        jq.attr('rel', '');
    },
/**
 * 保存一个键值对到含有name键的元素的rel属性中，如未指定name值，数据被保存到当前触发元素，即e.src中。<br/>
 */
    save : function(k, v, name){
        var wrap = name?this.getRel(name):this;
        var jq = $(wrap.src);
        
        // 是否存在缓存
        var rel = jq.data('xwb_rel');
        if(rel){
            rel = rel[k] = v;
        }else {
            rel = X.ax.ActionMgr.parseRel(jq.attr('rel'));
            rel[k] = v;
        }
        
        wrap.data = rel;
        // 更新缓存
        jq.data('xwb_rel', rel);
        
        var serial = [];
        for(var i in rel){
            var val = rel[i] || '';
            serial.push(i+':'+ val.replace(':','\\:').replace(',','\\,'));
        }
        serial = serial.join(',');
        jq.attr('rel', serial);
    },

/**
 * 上溯DOM获得rel含有name键元素或其子元素的jQuery对象
 *@param {String} name 字段名
 * @param {Selector} [child] 可查找元素下的子元素
 * @return {jQuery}
 */
    jq : function(name, child){
        var jq =  $(this.getEl(name));
        if(child)
            jq = jq.find(child);
        return jq;
    },
    
// private
    getRel : function(name){
        var set = this.q;
        for(var i=this.idx,end=this.end;i<=end;i++){
            var d = set[i].data;
            if(d[name] !== undefined)
                return set[i];
        }
    },
    
// private
    _next : function(){
        var nxt = this.q[++this.idx];
        // 最终状态
        if(nxt === undefined)
            this.idx = 0;
        return nxt;
    },

// private 拷贝包括当前状态等所有数据。
    clone : function(){
        var act = new ActionEvent(this.q);
        act.idx = 0;
        return act;
    },

/**
 * 是否终止浏览器默认操作，<b>默认为终止</b>。<br/>
 常见的处理完checkbox或radio元素的事件后，调用该方法使得元素改变选择状态。<br/>
 * @param {Boolean} prevented
 */
    preventDefault : function(set){
        this.prevented = set;
    },
/**
 * 是否停止浏览器的事件冒泡，<b>默认为停止</b>。
 * 对于{@link Xwb.ui.Base}组件，在有自身的actionMgr处理的同时，也有全局或更父层action处理的情况下，
 * 可以在{@link Xwb.ui.Base#onactiontrig}方法中调用本方法将动作事件上传到父层，这样父层的监听器就能正确处理其它事件。
 * 例如：
 * <pre>
 * <code>
    new Xwb.ui.Base({
        view:'#panel',
        actionMgr:true,
        // 默认的onactiontrig处理后是停止事件上传的，
        // 所以要手动开启以将未处理的提交到父层处理。
        onactiontrig:function(actEvent){
            switch(actEvent.get('e')){
                case 'local' :
                    // do something local stuff here.
                break;
                
                // or else , take other events to parents.
                default:
                    e.stopPropagation(false);
                break;
            }
        }
    });
 * </code>
 * </pre>
 * @param {Boolean} stopPropagation
 * @see #preventDefault
 */    
    stopPropagation : function(set){
        this.stopPropagationed = set;
    },
/**
 * 标记当前动作，或获得当前动作标记。
 * 常用于标记以防止动作重复触发动作。
 * @param {Boolean} locked
 * @param {String} [name] name
 *<pre><code>
 // 锁定动作元素，使得不能再触发
 e.lock(1);
 // 待请求处理后恢复
 Xwb.request.post(data, function(){
    // 解除锁定
    e.lock(0);
 });
 </code></pre>

 */
    lock : function(set, name){
        var k = 'xwb_e_' + this.data.e;
        if(name)
            k+= '_' + name;
        if(set === undefined)
            return $(this.src).data(k);
        $(this.src).data(k, set);
    }
};

/**
 * @class Xwb.ax.ActionMgr
 * 本类行为类似DOM事件模型中的事件冒泡，
 * 在某一个元素内集中监听各种事件，包括子元素的事件，
 * 并在事件触发时方便获得相关数据，而无需对子元素绑定类似事件。
 * <pre><code>
  将动作事件管理器绑定到元素上
  var mgr = new Xwb.ax.ActionMgr({target:'#selector'});
  
  注册动作处理，当指定动作发生时执行处理
  mgr.reg('myaction', function(actEvt){
        // 显示a元素
        alert(actEvt.src);
        
        // 显示myaction
        alert(actEvt.data.e);
        
        // 显示123456
        alert(actEvt.get('u'));
  });
  
  将动作添加到HTML模板中，用户点击元素时就能触发
  &lt;li rel=&quot;u:123456&quot;&gt;&lt;a href=&quot;#&quot; rel=&quot;e:myaction&quot;&gt;click me&lt;/a&gt;&lt;/li&gt;
  
  更多关于本类的使用方法详见actions.js文件。
 </code></pre>
 * @constructor
 * @param {Object} config
 */
/**@cfg {jQuery|HTMLElement} target 在该元素范围内监听action事件*/
X.ax.ActionMgr = X.reg('ActionMgr', function(cfg){
   cfg && $.extend(this, cfg);
   if(!this.actions)
        this.actions = {};
   if(!this.filters)
        this.filters  = [];
   
   if(this.target){
        this.bind(this.target);
        delete this.target;
   }
});

var globalFilters = [];

/**
 * 解析rel字符串为JSON对象数据
 * @param {String|HTMLElement} relDataOrRelElement
 * @static
 * @return {Object}
 */
X.ax.ActionMgr.parseRel = function(rel){
    if(typeof rel === 'string')
        return Util.parseKnV(rel);
    return Util.parseKnV($(rel).attr('rel'));
};

// 解析HTML元素及父元素的rel属性，并返回该属性链的JSON数据，以被{@link Xwb.ax.ActionEvent}利用。
X.ax.ActionMgr.collectRels = function(trigSource, stopEl, cache){
    var 
        rels, 
        rel, 
        self = this;
    
    if(cache===undefined)
        cache = true;
    
    // 往上收集rel
    Util.domUp(trigSource, function(el){
        var jq = $(el);
        
        if(cache){
            rel = jq.data('xwb_rel');
            if(!rel){
                rel = jq.attr('rel');
                if(rel){
                    rel = {src:el, data:self.parseRel(rel)};
                    jq.data('xwb_rel', rel);
                }
            }
        }else {
            rel = jq.attr('rel');
            if(rel)
                rel = {src:el, data:self.parseRel(rel)};
        }
    
        if(rel){
            if(!rels)
                rels = [];
            rels[rels.length] = rel;
        }
    
    } , stopEl);
    
    return rels;
};

/**
 * 解析DOM树中的rel属性值，返回该属性链接相关的{@link Xwb.ax.ActionEvent}类，以便利用该类获得链中的数据
 * @param {HTMLElement} sourceElement 开始元素
 * @param {HTMLElement} [toElement] 结束元素
 * @return {Xwb.ax.ActionEvent}
 * @static
 */
X.ax.ActionMgr.wrapRel = function(el, stopEl, cacheNodeData){
    var rels = this.collectRels(el, stopEl, cacheNodeData);
    var e = new ActionEvent(rels);
    e._next();
    return e;
};

/**
 * 获得具体单个rel键值
 * @param {HTMLElement} sourceElement 开始元素
 * @param {String} name
 * @param {HTMLElement} [toElement] 结束元素
 * @return {String}
 */
X.ax.ActionMgr.getRel = function(el, name, stopEl){
    return this.wrapRel(el, stopEl).get(name);
};

/**@cfg {String} trigEvent 触发动作的事件名称，默认为click */
X.ax.ActionMgr.prototype = {
    
    trigEvent : 'click',

    cacheNodeData : true,
    
/**
 * 注册动作处理方法，当参数只有一个时注册全局监听器，可监听来自该管理器的所有动作<br/>
 * 只有一个参数时时监听管理器内所有动作
 * @param {String} actionName 动作名称
 * @param {Function} handler 动作处理方法
 * @param {Xwb.ax.ActionConfig} config 动作信息
 *@return this
 */
    reg : function(act, handler, cfg){
        var d = { n : act, h : handler };
        if( cfg )
            $.extend( d, cfg );
        
        this.actions[act] = d;
        return this;
    },
    
/**
 * 获得一个动作配置信息
 * @param {String} name
 * @return {Xwb.ax.ActionConfig}
 */
    get : function( name ){
        return this.actions[ name ];
    },
    
/**
 * 增加动作拦截器，可拦截来自当前管理器或所有管理器的每个动作。
 *  @param {Function} filter
 * @param {Boolean} [global] 是否为所有动作的拦截器，默认只拦截当前管理器的动作
 * @return this
 */
    addFilter : function(filter, global){
        global ? globalFilters.push(filter) : this.filters.push(filter);
        return this;
    },
    
/**
 * 如果不想通过{@link #target}配置绑定面板，可调用该方法将管理器绑定到指定元素
 * @param {Selector} target
 * @return this
 */
    bind : function(selector, evt){
        var scope = this;
        $(selector).bind(evt || this.trigEvent, function(e){
           var rels = X.ax.ActionMgr.collectRels(e.target, this, this.cacheNodeData);
           rels && scope.fireRels(rels, e);
        });
        return this;
    },

/**
 * 可以手动触发动作，从某个元素起，至某个父元素结束
 * @param {HTMLElement} sourceElement
 * @param {HTMLElement} stopElement
 */
    doAct : function(el, stopEl, cacheNodeData){
        var rels = X.ax.ActionMgr.collectRels(el, stopEl, cacheNodeData);
        return !(rels && this.fireRels(rels));        
    },

    // @return {Boolean} handled
    fireRels : function(rels, evt){
        var e = new ActionEvent(rels);
        e.evt = evt;
        if(__debug) console.log('act e:', e);
        
        var rel, data,
            hs = globalFilters.length,
            hg = this.filters.length,
            handled,
            prevented, stopPropagationed;
        
        while ( (rel = e._next()) ){
           // 存在action
           data = rel.data;
           if(data.e){
               e.src  = rel.src;
               e.data = data;
                // 如果当前操作已锁定，取消操作并返回，防止重复响应
                if(!e.lock()){
                   var act = this.actions[data.e];
                   if( hs ){
                      handled = true;
                      if( this._fireArray(globalFilters, e, act) === false ){
                        stopPropagationed = e.stopPropagationed;
                        prevented     = e.prevented;
                        break;
                      }
                   }
                   
                   if( hg ){
                        handled = true;
                        if( this._fireArray(this.filters, e, act) === false ){
                            break;
                        }
                   }
                   stopPropagationed = e.stopPropagationed;
                   prevented     = e.prevented;
                   if(act){
                        // clone e
                        var hdE  = e.clone();
                        hdE.src  = e.src;
                        hdE.data = data;
                        hdE.evt  = evt;
                        if(__debug) console.log('act e:',hdE);
                        if(!handled)
                            handled = true;
                        if( act.h.call(this, hdE) === false){
                            if(hdE.stopPropagationed !== undefined)
                                stopPropagationed = hdE.stopPropagationed;
                            if(hdE.prevented !== undefined)
                                prevented = hdE.prevented;
                            break;
                        }
                        if(hdE.stopPropagationed !== undefined)
                            stopPropagationed = hdE.stopPropagationed;
                        if(hdE.prevented !== undefined)
                            prevented = hdE.prevented;
                   }
                }else { // marked
                    if(__debug) console.warn('action e:'+e.data.e+' has been locked for resubmiting');
                    handled = true;
                    stopPropagationed = true;
                    prevented = true;
                    break;
                }
           }
        }
        
        if(evt && handled){
            // we defaultly preventDefault and stopPropagation
            if(prevented === undefined)
                prevented = true;
            if(stopPropagationed === undefined)
                stopPropagationed = true;
            
            if(prevented)
                evt.preventDefault();
    
            if(stopPropagationed)
                evt.stopPropagation();
        }
    },
    
    // 如果未注册action:，act有可能为空，所以act应用时要作空检查
    _fireArray : function(gs, e, act){
        for(var i=0,len=gs.length;i<len;i++)
            if( gs[i].call( this, e, act) === false )
                return false;
    }
};

// 页面action
X.reg('action', X.use('ActionMgr'));


})(Xwb, Xwb.util, $);