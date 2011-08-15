(function(X){
    //
    //  给Xwb加上事件处理功能
    //
    X.ax.Eventable.apply(X);
    /**
     * @class Xwb
     */
     
    /**
     * @event pipe.start
     * 页面块加载前发送
     * <pre><code>
        // 模块加载前做预处理
        Xwb.on('pipe.start', function(cfg){
            alert(cfg.page);
        });
     </code></pre>
     * @param {Object} cfg 全局配置信息，该信息可通过{@link Xwb.getCfg}方法获得
     */
     
    /**
     * @event pipe.end
     * 页面所有块加载结束后发送，可替代jQuery里的DOMReady处理。
     */
    
    /**
     * 加载每个块前发送
     * @event page.before
     * @param {Object} pageConfig 当前页面块配置信息
     */
    
    /**
     * @event page.after 块加载完成后发送
     * @param {Xwb.ax.Pagelet} pagelet 当前块实例
     */
    
    
    /**
     * @class Xwb.ax.PipeMgr
     * 把一个页面划分为多个块，每个块有自身独立的数据与结构，数据可理解为与块相关的属性配置信息，结构可理解为输出到该块处的HTML代码。<br/>
     * 在Xwb库中用{@link Xwb.ax.Pagelet}类描述这种块。
     * 每个块的数据由后端生成，它的生命周期是，通过&lt;script&gt;标签输出到页面并触发该块的初始化，直至该块的视图(HTML元素)和交互就绪。
     * 这个过程是块的数据流由一个管道(pipe)由后端推送到前端的过程。<br/>
     * 创建一个页面块在前端可分为两个过程：
     *  <ul>
     * <li>注册指定块</li>
     * <li>等待库的回调执行初始化块信息</li>
     * </ul>
     * 注册块可通过{@link #reg}方法。
     * @singleton
     */
    
     
    X.ax.PipeMgr = {
        
        // 页面已注册的{@link Xwb.ax.Pagelet}模块类
        pages : {},
        
        // 已实例化的pagelet
        instances : {},
        
        /**
         * 注册一个页面块{@link Xwb.ax.Pagelet}。
         * @param {String} name
         * @param {Xwb.ax.Pagelet} pagelet
         * @param {Boolean} [override]　是否覆盖原有对象
         * @return this
         */
        reg : function(name, page, override){
            if(!override && this.pages[name])
                throw 'Object existed exception.['+name+']';
            this.pages[name] = page;
            
            return this;
        },
        
        // implements
        // 这个方法由后端输出的脚本回调。
        // pipe开始时调用。
        start : function( cfg ){
            X.cfg = cfg;
            X.fireOnce('pipe.start', cfg, this);
        },
        
        // 这个方法由后端输出的脚本回调。
        // pipe逐个加载Pagelet时调用。
        load : function(pagelet){
            X.fire('page.before', pagelet, this);
            // 优先应用pagelet.pagelet作类型，
            // 如果不存在，再应用pagelet.data.cls类型
            var pl = this.pages[pagelet.pagelet] || 
                     this.pages[pagelet.data && pagelet.data.cls];
            if(!pl)
                pl = Pagelet;
             
            if(typeof pl === 'function')
                pl = new pl();
            //　如果设置中有pipe属性，优先使用该属性作为pipe类
            else pl = new (pl.pipe||Pagelet)(pl);
            this.instances[pagelet.id] = pl;
            
            pl.load(pagelet);
            X.fire('page.after', pl, this);
        },
        
        // 这个方法由后端输出的脚本回调。
        // pipe结束时调用。
        end : function(){
            X.fireOnce('pipe.end', this);
        },
        
        /**
         *  获得页面实例
         * @param {String} id
         */
        getPage : function(id){
            return this.instances[id];
        }
    };
    
    X.reg('pipeMgr', Xwb.ax.PipeMgr);
    /**
     * @class Xwb.ax.Pagelet
     * 表征页面内某个块（区域）的类，所有块都应该应用或继承该类。关于该类的原理参见{@link Xwb.ax.PipeMgr}。
     * 一般来说，一个定制块只需实现{@link onViewReady}方法即可，这个是个回调方法，
     * 当块视图HTML元素生成并放到页面DOM上的时候，库就会回调该方法，定制块可在该方法里作所有的初始化。<br/>
     * 块间的通讯可通过调用{@link Xwb.fire}，{@link Xwb.on}方法来发送与监听事件。<br/>
     * 一个块后端返回的配置信息为：
     * <pre><code>
        {
            // 块ID
            id : '',
            
            // 块的HTML代码，生成HTML元素后替换到页面中块所在的位置，块无HTML时该项为null
            html : '',
            
            // 标识该块是属于哪种“类”，该类主要为方便后端识别
            pagelet : '',
            
            // 块自身的数据
            data : {
                // 约定为使用指定的Pagelet类实例化块
                cls : 'wblist'
            }
        }
     </code></pre>
     pipe初始化查找块配置所在的注册类过程为：
     <ul>
     <li>判断pagelet属性，如果存在注册类，则用该类实例化块
     <li>如果未找到，继续判断data.cls属性，如果存在注册类，则用该类实例化块
     <li>如果未找到，用{@link Xwb.ax.Pagelet}类实例化该块
     </ul>
     应用例子：
     * <pre><code>
     // 直接应用Pagelet类
     Xwb.ax.PipeMgr.reg('TestPagelet', {
        // 实现接口，参数cfg为后台传来的pagelet属性
        onViewReady : function(cfg){
            this.jq().css('background', 'red');
        } 
     });
    
     或继承Pagelet类
     Xwb.ax.WeiboList = Util.create(Pagelet, {
        ui : {cls:X.ui.WeiboList},
        onViewReady : function(cfg){
            if(cfg.data.attr)
                this.doSomething();
        },
        doSomething : function(){
            // ...
        }
     });
     
     Xwb.ax.PipeMgr.reg('wblist', Xwb.ax.WeiboList);
     
     // 可直接利用Pagelet类，或通过pipe属性指定Pagelet类实例化该块
     Xwb.ax.PipeMgr.reg('plTest.pg', {
     
        // 可指定使用某Pagelet类实例化该块
        pipe : MyPipeClass, 
        
        ui : {
            // 可通过cls指定该UI类，不指定时采用Xwb.ui.Base类实例化该UI
            cls:Xwb.ui.Box,
            // UI配置信息
            contextable:true
        },
        
        // 实现接口
        onViewReady : function(){
            this.jq()
                .css('background', '#ccc');
        }
     });
    
    X.on('pipe.end', function(){
        // alert('end');
    });
    
    X.on('page.before', function(cfg){
       // alert(cfg.id);
    });
     </code></pre>
     * 更详细用法参见ux/ready.js
     * @cfg {Function} pipe 指定当前配置实例化时的{@link Xwb.ax.Pagelet}类
     * @cfg {Xwb.ui.Base|Object} ui 指定Pagelet模板中当getUI()方法调用后返回的UI类，通常这个UI封装了当前Pagelet的视图部份
     */
     
    /**@property id*/
        var Pagelet = X.ax.Pagelet = X.util.create();
        
        Pagelet.prototype = {
            
            // 1为替换原有结点，
            // 2为对原有结点应用innerHTML
            htmlMode : 1,
            
            init : function(ext){
                if(ext)
                    $.extend(this, ext);
            },
            
            // 调用入口
            load : function(cfg){
                // 
                this.id = cfg.id;
                // 
                this.type = cfg.pagelet;
                if(cfg.data && cfg.data.cls)
                    this.cls  = cfg.data && cfg.data.cls;
    
                if(cfg.perch){
                    this.applyHtml(this.createContent(cfg));
                    // 生成对应的UI控件实现
                    if(this.ui)
                        this.getUI();
    
                    this.onViewReady(cfg);
                }
            },
            
            // protected
            // 可重写该方法生成HTML内容
            createContent : function(cfg){
                return cfg.html||'';
            },
            
            // protected
            applyHtml : function(html){
                var el = this._getPlaceholder();
                if(this.htmlMode === 1){
        			//替换标签而不是填充内容
        			var rl = $(html);
        			// 无根标签，保全
                    if(rl.length>1){
                        var wrap = X.ax.Cache.get('div');
                        rl.appendTo(wrap);
                        rl = $(wrap);
                    }

        			$(el).replaceWith(rl);
        			this.contentView = rl[0];
        		}else if(this.htmlMode === 2){
        		    // 应用innerHTML后显示
        		    $(el).html(html).cssDisplay(true);
        		    this.contentView = el;
        		}
            },

            
            /**
             * 返回与该页面关联的UI控件，如果想通过{@link Xwb.ui.Base}的类或子类控制该块，可调用该方法返回块对应的UI类实例。<br/>
             * 库会根据注册块时的ui属性配置来初始化UI类。
             * @return {Xwb.ui.Base}
             */
            getUI : function(){
                var ui = this.ui;
                
                if(!ui || !ui.cacheId){
                    var cls = ui?ui.cls||X.ui.Base : X.ui.Base;
                    this.ui = ui = new cls($.extend({view:this.contentView},ui));
                    // 触发onViewReady
                    ui.getView();
                }
    
                // 已是实例
                return ui;
            },
            
            /**
             * 等同调用 this.getUI().jq()
             * @return {jQuery}
             */
            jq : function(){
                var ui = this.getUI();
                return ui.jq.apply(ui, arguments);
            },
            
            // 获得最初位置结点
            _getPlaceholder : function(){
                return document.getElementById(this.id);
            },
            
            /**
             * @cfg {Function} onViewReady 接口方法，在页面元素就绪后调用
             */
            onViewReady : $.noop
        };
        
    if(__debug) { Pagelet.prototype.toString = function(){ return '#'+this.id+'['+this.type+']'; } }
})(Xwb);