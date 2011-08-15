/*!
 * X weibo JavaScript Library v1.2
 * http://x.weibo.com/
 * 
 * Copyright 2010 SINA Inc.
 * Date: 2010/10/28 21:22:06
 */
 
/*
 * 页面初始化，所有交互初始化入口
 */

(function(X, $){
    var getCfg = X.getCfg,
        Req = X.request,
        Util = X.util,
        Box = X.ui.MsgBox,
        Pagelet = X.ax.Pagelet;

    // 监听pipe开始事件
    X.on('pipe.start', function(cfg){
    	if (Util.ie6 && $('#logo').length)
    		$('#logo').fixPng();
        if(!cfg)
            cfg = {};

        // 绑定到空间
    	X.cfg = cfg;

        // 绑定全局页面action
        X.use('action').bind(document.body);
        
    	//初始化请求路径
    	cfg.basePath && Req.init(cfg.basePath);
    	
        if(X.getUid()){
            // 消息提醒面板
            var rt = cfg.remind;
            var bd = rt ? document.body : $('#xwbInnerNav')[0];
            if(bd){
                X.use('notice', {
                    appendTo : bd,
                    remindType : rt
                });                
            }
        }
        
        // 初始化短链url
        X.mod.shortlink.local = cfg.shortLink;
    })
    
    .on('pipe.end', function(){
    	
    	if(X.cfg.wbList){
    	    
    	    //查询页面中微博列表评论和转发数
    	    
    	    var list = X.cfg.wbList, ids = [], wb;
    	    
    	    for(var id in list){
    	        ids.push(id);
    	        // 内容内转发的微博id
    	        var wb = list[id];
    	        wb.rt && ids.push(wb.rt.id);
    	    }
    	    Req.counts(ids.join(','), $.noop);
    	    ids = null;
    	    
    	    
            // 解析页面中微博的短链接
            var Act = X.ax.ActionMgr;
            X.mod.shortlink.from(list, function(){
                $('.feed-list ul>li').each(function(){
                    var jq = $(this);
                    var id = Act.getRel(this,'w',this);
                    if(id){
                        var wb = list[id];
                        var sls = wb.shortlinks;
                        if(sls && sls.length){
                            X.mod.shortlink.renderWeiboShortlink(jq, wb, sls);
                        }
                    }
                });
            });
    	}
    	
        // 搜索框
        $('#xwb_search_form').each(function(){
            X.use('SearchEntry', {view:this}).display(true);
        });
        
    	//上报数据
        X.report.start();
        var unload = function () {
            X.report.report();
        };
        // 不能用JQ来绑定unload事件
        if (window.addEventListener)
            window.addEventListener("unload", unload, false);
        else if (window.attachEvent)
            window.attachEvent('onunload', unload);
    	
    	// 广告初始化
    	if(getCfg('ads'))
    	    X.mod.AdMgm.init(getCfg('ads'));
    	    
    	// 页面内的新微博横条提示
    	// 如果非“TA”的页面
    	if(getCfg('page') !== 'ta'){
        	var jqWbTip = $('#new_wb_tips');
        	if(jqWbTip.length){
        	    X.on('api.unread', function(e){
        	        if(e.isOk()){
        	            var unread = e.getData().unread[0];
        	            jqWbTip.cssDisplay(!!unread);
        	        }
        	    });
        	}
        }
    	
        if(X.getUid()){
        	// 发起轮询未读数
        	var checking = false;
        	// 半分钟查一次
        	var interval = 30000;
        	var latestWid = getCfg('maxid');
        	
        	function onUnreadLoad(){
        	    checking = false;
        	    setTimeout(doCheck, interval);
        	}
        	
        	function doCheck(){
        	    if(!checking){
        	        checking = true;
        	        Req.unread(latestWid, onUnreadLoad);
        	    }
        	}
        	
        	doCheck();
        }
                
    	// 顶部菜单效果
    	$('.main-menu>li').slideMenu('>ul','menu-over');
    	
    	// 回到顶部
    	$('#gotop').each(function(){
    	    var jqDoc = $(document);
    	    var jq = $(this);
    	    var ct = $('#container');
    	    var hid = true;
    	    var posed;
    	    var moving;
    	    jq.css('bottom','95px');
    	    $(window).scroll(function(){
    	        var st = jqDoc.scrollTop();
                if(st == 0){
                    if(!hid){
                        jq.cssDisplay(false);
                        hid = true;
                    }
                    moving = false;
                }else if(!moving){
                    if(hid){
                        jq.cssDisplay(true);
                        hid = false;
                    }
                    /*
                    if(!Util.ie6){
                        // 是否超过ct最底部，超过则持平ct底部
                        var cth = ct.offset().top + ct.height();
                        var eth = jq.offset().top + jq.height();
                        if(eth > cth){
                            if(!posed){
                                jq.css('bottom', jqDoc.height() - cth);
                                posed = true;
                            }
                        }else if(eth < cth && posed){
                            posed = false;
                            jq.css('bottom', '');
                        }
                    }*/
                    
                }
    	    });
    	    
    	    jq.click(function(){
    	        moving = true;
    	        $('html,body').animate({'scrollTop': 0}, 150);
    	        return false;
    	    });
    	});
        
    });
    
    // DOM Ready
    $(function(){
    	// TODO:变为Pagelet输出
    	$('#focus_index').each(function(){
    	    //我的首页，聚焦位推广
            var idx = X.use('base', {
            	actionMgr: true,
            	view:this,
            	onactiontrig: function(e) {
            		var data = e.data;
            		switch (data.e){
                		case 'cls': //关闭
                			$.cookie(e.get('cn'), 1);
                			this.display(0);
                		break;
                
                		case 'do': //按键被点击
                			var op = data.op;
                			//发主题微博
                			if (op == 1) {
                				var postArea = X.use('postBox');
                				X.use('postBox').display(true)
                				if(postArea)
                				    postArea.selectionHolder.insertText('#' + data.tp + '# ');
                			} else if (op == 2){
                				data.ln && window.open(decodeURIComponent(data.ln.replace(/\+/g, '%20')));
                			}
                		break;
            		}
            	}
            });
            idx.display(true);
    	});
    	
    	$('#xwb_today_topic').each(function() {
    		$(this).find('p.feedback').substrText(80, 1);
    		$(this).find('div.column-item:first').removeClass('next');
    
    		X.use('FadeBox', {view: this}).display(1);
    	});
    });
    
    window.xwbPipe = X.ax.PipeMgr;

})(Xwb, $);