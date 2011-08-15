/*!
 * X weibo JavaScript Library v2.0
 * http://x.weibo.com/
 * 
 * Copyright 2010 SINA Inc.
 * Date: 2010/10/28 21:22:06
 */

/**
 * @class Xwb.mod.BufferedWeiboList
 * 具有数据缓冲，自动请求分页与自动刷新最新微博功能的微博列表。<br/>
 * 自动刷新的列表视图状态有三点：<br/>
 * 1.保持视图内的列表不变<br/>
 * 2.往视图内插入新微博<br/>
 * 3.移除视图内的旧微博<br/>
 * 满足状态1条件：a)关闭自动刷新 || b)开启自动刷新 && 首页 && 视图内首条微博在用户可视区域外 c)当前页非首页<br/>
 * 满足状态2条件：a)开启自动刷新 && 首页 && 视图内首条微博在用户可视区域内<br/>
 * 满足状态3条件：a)开启自动刷新 && 首页 && 视图内微博数据到达指定的最大量<br/>
 * 开启自动刷新后本类会轮循请求最新的列表数据，并缓存返回的新数据，当条件达到时，就往视图插入新微博列表，
 * 当列表内微博达到一定量时，就移除多余的列表。<br/>
 * 为了正确识别列表滚动条所在的元素，可通过{@link #scrollor}指定该元素。假如列表无滚动条，可以忽略该设置。<br/>
 * 自动分页当用户滚动至列表尾部某范围内后自动请求下一页微博列表数据。<br/>
 * 本类主要用在在线直播和在线访谈中。
 * @extends Xwb.mod.WeiboList
 */

/**@cfg {Number} wb_id 当前最新微博ID*/

Xwb.mod.BufferedWeiboList = Xwb.util.create(Xwb.mod.WeiboList, function(superclass){
    var X = Xwb;
    var Util = X.util;
    var B = new X.ui.Base();
    return {
        
        /**@cfg {Number} 请求轮循间隔，当一个请求处理后至下一请求开始时的时间间隔，默认10秒*/
        interval : 10000,
        
        /**@cfg {Boolean} 是否自动刷新，可动态设置该值以控制自动刷新行为，默认true*/
        autoRefresh : true,
        
        /**@cfg {Boolean} 是否自动清除过多的微博列表，默认true*/
        autoClean : true,

        /**@cfg {Number} max 视图列表最大条数，但本类实现时到达max并未立即执行清除，
         * 而是超过max+this._batchCleanSize才执行清除工作，
         * _batchCleanSize是非公开变量，主要是避免当到达max时，
         * 新插入的列表不会连续执行增加删除操作，而是有个小缓冲，超过max+this._batchCleanSize时才清理。*/
        max : 100,
        
        /**@cfg {Boolean} 是否开启当滚动将近列表结尾时自动加载下一页，默认false*/
        autoNextingPage : false,
        
        /**@cfg {Boolean} autoInsert 是否自动将未读微博插入到列表，默认true。也可以设为false，只将未读微博放入缓存。*/
        autoInsert : true,
        
        syncList : true,
        
        // 当前分页
        page : 1,
        
        /**@cfg {jQuery} scrollor 滚动条所在元素，默认#xwb_weibo_list_scrollor*/
        scrollor : '#xwb_weibo_list_scrollor',
        /**@cfg {jQuery} emptyTip 当列表为空时，空提示信息所在的元素ID，默认为#emptyTip*/
        emptyTip : '#emptyTip',
        
        // 用户未读数
        // 这是个总计数。注意，当数据请求回后，放到缓存，
        // 缓存只缓存有限数目数据，多出的未读数据会被丢弃，
        // 用该属性记录用户所有未读的微博数，包括被缓存丢弃的未读数
        // 用户点击查看时清零
        unreadCount : 0,
        
        innerViewReady : function(){
            superclass.innerViewReady.apply(this, arguments);
            
            this.cache = [];
            
            
            this.setAutoRefresh(this.autoRefresh);
            
            this.scrollor = this.jq(this.scrollor)[0];
            // 滚动结束后检测
            this.scrollor && $(this.scrollor).scroll(Util.bind(this._onCtScroll, this));
            this.emptyTip = this.jq(this.emptyTip);
        },
        
        /**
         *  更新视图，先检测clean，再检测insert
         */
        update : function(){
            this._clean();
            this._insert();
        },
        
        /**
         *  检测当前状态是否允许插入
         * @return {Boolean}
         */
        isInsertEnabled : function(){
            if(this.autoRefresh && this.autoInsert){
                var first = this.jqCt.find(this.itemSelector+':first-child');
                var visible = !first.length || !this.scrollor || ( B.fly(first[0]).getHiddenAreaOffsetVeti(this.scrollor) === false );
                return this.page == 1 && visible;
            }
            return false;
        },
        
        /**@cfg {Number} pagingCheckpontDelta 当距离列表底部设定高度时触发请求下一页数据。*/
        pagingCheckpontDelta : 250,
        
        /**
         * 检测当前状态是否允许请求下一页
         * @return {Boolean}
         */
        isNextingPageEnabled : function(){
            var scrollor = this.scrollor;
            return this.autoNextingPage && scrollor && 
                    ( scrollor.scrollHeight - scrollor.scrollTop - this.scrollor.offsetHeight <= this.pagingCheckpontDelta)
        },

        // 而是超过max+_b
        // 到达max并未立即执行清除，而是超过max+_batchCleanSize才执行清除工作
        _batchCleanSize : 5,
        
        /**
         *  是否允许执行清除处理
         * @return {Boolean}
         */
        isCleanEnabled : function(){
            return this.autoRefresh && this.autoClean && this.page == 1 && 
                   this.jqCt.find(this.itemSelector).length > this.max+this._batchCleanSize;
        },
        
        /**
         *  发起数据请求最新微博
         */
        request : function(){
            if(!this.requesting){
                this._clearTimer();
                this.requesting = true;
                this._doRequest(Util.getBind(this, '_latestLoad'), {wb_id:this.latestWid});
            }
        },
        
        // 将缓存微博插入到视图，清空未读数。
        flushUnread : function(){
            this._doClean();
            this._doInsert();
            this.unreadCount = 0;
            this._updateCounterUI({});
        },
        
        // 可以重写以定义请求URL
        _doRequest:$.noop,
        
        /**@cfg {String} itemSelector 定义微博列表项选择器 */
        itemSelector : '>li',
        
        // 清理视图内多余的微博
        // 检查允许后执行
        _clean : function(){
            if(this.isCleanEnabled()){
                this._doClean();
            }
        },
        
        // 直接清除不检查
        _doClean : function(){
            if(__debug) console.log('do clean');
            var jq = this.jqCt.find(this.itemSelector);
            for(var i=jq.length-1;i>this.max;i--){
                $(jq[i]).remove();
            }
        },
        
        // 插入缓存内的微博数据到视图
        // 检测允许后执行
        _insert : function(){
            if(this.isInsertEnabled()){
                this._doInsert();
            }
        },
        
        // 直接插入不检查
        _doInsert : function(){
            if(__debug) console.log('do insert',this.cache);
            var cache = this._trimCache();

            for(var i=0,len=cache.length;i<len;i++){
                var wbsData = cache[i];
                var list = wbsData.list;
                var htmls = wbsData.html;
                this.batchAppend(list, htmls);
            }
            
            this.cache = [];
        },
        
        // 获得下一页数据
        _nextPage : function(){
            if(this.isNextingPageEnabled()){
                if(!this.pageRequesting){
                    if(__debug) console.log('get next page');
                    this.pageRequesting = true;
                    // 当上次加载数目加0时不再提示
                    if(this._latestPageRowCount)
                        this._decorateLoading();
                    this._doRequest(Util.getBind(this, '_onPageLoad'), {min_id:this.min_id});
                }
            }
        },
        
        _onPageLoad : function(r){
            if(r.isOk()){
                var retData = r.getData();
                retData.count = parseInt(retData.count);
                retData.total = parseInt(retData.total);
                if(retData.count){
                    this.min_id = retData.min_id;
                    var list = retData.list;
                    var htmls = retData.html;
                    this.batchAppend(list, htmls, true);
                }
                this._updateCounterUI(retData);
                // 防止到末页后继续显示加载提示，影响体验
                this._latestPageRowCount = retData.count;
            }
            this.pageRequesting = false;
            this._decorateLoading();
        },
        
        _decorateLoading : function(){
            if(!this.jqLoading)
                this.jqLoading = $(Xwb.ax.Tpl.get('Loading'));
    
            this.pageRequesting ? this.jqLoading.appendTo(this.jqCt) :
                this.jqLoading.detach();
        },
        
        /**@cfg {jQuery} totalCounter 更新微博总条件所在元素*/
        /**@cfg {jQuery} unreadCounter 未读微博条数所在元素*/
        _updateCounterUI : function(param){
            // 更新总条数
            if(this.totalCounter){
                if(param.total !== undefined && this._totalRec !== param.total){
                    this.jq(this.totalCounter).text(param.total);
                    this.totalUIElem && this.jq(this.totalUIElem).cssDisplay(!!param.total);
                    this._totalRec = param.total;
                }
            }
            // 更新用户未读数
            // 读取本地unreadCount
            if(this.unreadCounter){
                if(this.unreadCount !== this._unreadRec){
                    this.jq(this.unreadCounter).text(this.unreadCount);
                    this.unreadUIElem && this.jq(this.unreadUIElem).cssDisplay(this.unreadCount);
                    this._unreadRec = this.unreadCount;
                }
            }
            
            // 移除零微博提示,If any
            if(this.emptyTip && param.count){
                this.emptyTip.remove();
                this.emptyTip = false;
            }
        },
        
        // 防止缓存无限增长
        _trimCache : function(){
            var cache = this.cache;
            // 多于最大缓存数量，截短只取前最新
            if(cache.length > this.max)
                cache = cache.slice(cache.length - this.max);
            return cache;
        },
        
        // 重写可定义返回数据推入缓存的方式
        _push : function(retData){
            if(retData.count){
                this.latestWid = retData.wb_id;
                this.cache.push(retData);
                this._trimCache();
            }
        },
        
        _latestLoad : function(r){
            if(r.isOk()){
                var data = r.getData();
                data.count = parseInt(data.count);
                data.total = parseInt(data.total);
                
                if(data.count)
                    this.unreadCount += data.count;
                
                this._push(data);
                if(this.cache.length)
                    this.update();
                if(this.autoRefresh)
                    this.setAutoRefresh(true);
                this._updateCounterUI(r.getData());
            }
            this.requesting = false;
        },
        
        /**
         * 开启动关闭自动刷新功能。
         * @param {Boolean} autoRefresh
         */
        setAutoRefresh : function(b){
            if(b)
                this.reqTimer = setTimeout(Util.getBind(this, 'request'), this.interval);
            else if(this.reqTimer){
                clearTimeout(this.reqTimer);
                delete this.reqTimer;
            }
            this.autoRefresh = b;
        },
        
        _clearTimer : function(){
            if(this.reqTimer){
                clearTimeout(this.reqTimer);
                this.reqTimer = false;
            }
        },
        
        // 滚动结束后检测视图更新
        _onCtScroll : function(){
            if(this._scrollTimer)
                clearTimeout(this._scrollTimer);
            // onScrollEnd
            this._scrollTimer = setTimeout(Util.getBind(this,'_onScrollEnd'), 400);
        },
        
        _onScrollEnd : function(){
            // check insert
            this._insert();
            if(!this.pageRequesting){
                // check next page
                this._nextPage();
            }
        }
    };
});
