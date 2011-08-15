/*!
 * X weibo JavaScript Library v1.3
 * http://x.weibo.com/
 * 
 * Copyright 2011 SINA Inc.
 */
// 在线直播，在线访谈
(function(X, $){
    var Util = X.util;
    
    // 每次发布时添加的提交参数
    var postParam = {};
    
    var postBoxInited = false;
    
    X.use('action')
    // 回答
    .reg('an', function( e ){
        var box = X.use('postBox');
        
        if(!postBoxInited){
            box.jq('.add-area>a').cssDisplay(false).hide();
            box.jq('#xwb_btn_img').cssDisplay(true).show();
            box.jq('a.icon-face').cssDisplay(true).show();
            postBoxInited = true;
            
            // 关闭后清空多余的参数以防影响其它发布
            var fn = box.afterHide;
            box.afterHide = function(){
                //delete postParam['extra_params[ask_id]'];
                fn.apply(this, arguments);
            };
        }
        
        var GETPARAM = X.mod.PostBase.getParam;
        // override
        box.getParam = function(){
            var param = GETPARAM.apply(this, arguments);
            return $.extend(param, postParam);
        };
        
        var text = e.get('m');
        box.display(true)
           .reset()
           .selectionHolder.setText(text||'');
        if(text)
            box.checkText();
        var wbId = e.get('w');
        postParam['extra_params[ask_id]']=wbId;
    })
    // 提醒
    .reg('remind', function(e){
        e.lock(true);
        X.request.notice(e.get('u'), e.get('t'), e.get('c'),e.get('n'), function(r){
            if(r.isOk())
                $(e.src).replaceWith('<span>已设置提醒</span>');
        
            e.lock(false);
        });
    });
    
    X.use('pipeMgr')
     // 在线直播，在线访谈发布框
     .reg('weibo.input', {
        ui : X.util.extendIf({
            param : {},
            
            onactiontrig:function(e){
                switch(e.data.e){
                    // 例如：下拉菜单中的@
                    case '@':
                        var holder = this.selectionHolder;
                        holder.focusStart();
                        holder.insertText('@'+e.get('n')+' ');
                        holder.focusEnd();
                        this.checkText();
                    break;
                }
                return X.mod.PostBase.onactiontrig.apply(this, arguments);
        }}, X.mod.PostBase),

        onViewReady : function(cfg){
            var self = this;
            // 调用PostBase.initEx作额外初始化
            var post_ui = this.getUI();
            
            post_ui.initEx();
            post_ui.defText = post_ui.jqInputor.val();
            // @菜单
            var menu = this.atMenu = new Xwb.ui.Base({view:this.jq('.guest-list')[0], contextable:true, hidden:true});
            this.jq('.btn-guest').click(function(){
                menu.display(menu.hidden);
            });
            if(cfg.data && cfg.data.params){
               $.extend(postParam, cfg.data.params);
            }
            // 可能存在PHP输出的文本
            post_ui.checkText();
            
            var GETPARAM = X.mod.PostBase.getParam;
            // override
            post_ui.getParam = function(){
                var param = GETPARAM.apply(this, arguments);
                return $.extend(param, postParam);
            };
        }
     })
     // 直播微博列表
     .reg('live.liveWblist', {
        
            pipe : X.mod.pagelet.WeiboList,
        
            ui : {
                cls : X.mod.BufferedWeiboList,
                syncList : false,
                autoInsert : false,
                scrollor : '.feed-list',
                unreadCounter : '.feed-refresh a em',
                unreadUIElem:'.feed-refresh',
                // override to define the requesting url
                _doRequest : function(callback, param){
                    X.request.postReq(X.request.mkUrl('live','unread'), Util.extend(param, {id:this.liveid}), callback);
                }
            },
            
            onViewReady : function(cfg){
                X.mod.pagelet.WeiboList.prototype.onViewReady.apply(this, arguments);
                var ui = this.getUI();
                ui.liveid = cfg.data.liveid;
                ui.latestWid = cfg.data.wb_id;
                
                // 刷新
                this.jq('.feed-refresh a').click(function(){
                    ui.flushUnread();
                    return false;
                });
            }
     })
     
     // 访谈内容，一问一答列表
     .reg('interview.interviewWeiboList', {
            pipe : X.mod.pagelet.WeiboList,
            ui : {
                cls : X.mod.BufferedWeiboList,
                syncList : false,
                autoClean : false,
                autoNextingPage : true,
                scrollor : '.feed-list',
                totalCounter : '.title-box .que-num',
                replyCounter : '.title-box .rep-num',
                itemSelector:'>div',
                // override to define the requesting url
                _doRequest : function(callback, param){
                      X.request.postReq(X.request.mkUrl('interview','unread'), Util.extend(param, {id:this.interview_id, type:'answer'}), callback);
                },
                // override
                _updateCounterUI : function(param){
                    // 更新回复数
                    if(this.replyCounter){
                        if(param.reply !== undefined){
                            var reply = parseInt(param.reply);
                            if(this._replyRec !== reply){
                                this.jq(this.replyCounter).text(reply);
                                this._replyRec = reply;
                            }
                        }
                    }
                    X.mod.BufferedWeiboList.prototype._updateCounterUI.apply(this, arguments);
                }
            },
            onViewReady : function(cfg){
                X.mod.pagelet.WeiboList.prototype.onViewReady.apply(this, arguments);
                var ui = this.getUI();
                ui.latestWid = cfg.data.wb_id;
                ui.min_id = cfg.data.min_id;
                ui.interview_id = cfg.data.interview_id;
            }
     })
     
     // 网友提问
     .reg('interview.interviewGoingAskWeiboList', {
            pipe : X.mod.pagelet.WeiboList,
            ui : {
                cls : X.mod.BufferedWeiboList,
                syncList : false,
                autoClean : false,
                scrollor : '.feed-list',
                totalCounter : '.title-box span em',
                totalUIElem : '.title-box span',
                autoNextingPage : true,
                // override to define the requesting url
                _doRequest : function(callback,param){
                      X.request.postReq(X.request.mkUrl('interview','unread'), Util.extend(param, {id:this.interview_id}), callback);
                }
            },
            onViewReady : function(cfg){
                X.mod.pagelet.WeiboList.prototype.onViewReady.apply(this, arguments);
                var ui = this.getUI();
                ui.latestWid = cfg.data.wb_id;
                ui.min_id = cfg.data.min_id;
                ui.interview_id = cfg.data.interview_id;
            }
     })
     
     // 在线直播首页
     .reg('live.liveIndexList', {
           onViewReady : function(cfg){
               // P:未开始, I:进行中, E:已结束
               if(cfg.data.status === 'P'){
                   var jqRemind = $('.remind em');
                   var starttime = parseInt(cfg.data.starttime)*1000;
                   var delta =  parseInt(cfg.data.nowtime)*1000 - new Date().getTime();
                   setTimeout(function(){
                       var now = new Date().getTime() + delta;
                       var secs = Math.round((starttime - now)/1000);
                       if(secs < 0){
                           //setTimeout(function(){ location.reload(); }, 1000);
                           return;
                       }
                       
                       var sec = Math.floor(secs % 60);
                       var minutes = Math.floor(secs / 60);
                       var min = Math.floor(minutes % 60);
                       var hour = Math.floor(minutes / 60);
                       var h = Math.floor(hour % 24);
                       var day = Math.floor(hour / 24);
                       jqRemind.text((day?day+'天':'')+(h?h+'小时':'')+(min?min+'分':'')+sec+'秒');
                       setTimeout(arguments.callee, 1000);
                   }, 1000);
               }
               
               var $scrollor = this.jq('#scrollor');
               if($scrollor.find('li').length<6){//这个应该是php不输出
            	   this.jq('.arrow-l-s2').addClass('arrow-l-s2-disabled');
            	   this.jq('.arrow-r-s2').addClass('arrow-r-s2-disabled');
               } else {
	               $scrollor.length && $scrollor.makeScroll({
	                      prevBtn:this.jq('.arrow-l-s2'), 
	                      nextBtn:this.jq('.arrow-r-s2') ,
	                      ldisabledCs:'arrow-l-s2-disabled',
	                      rdisabledCs:'arrow-r-s2-disabled'
	              });
               }
           }
     })
     
     // 直播用户列表
     .reg('live.usersList', {
            ui : {
                actionMgr:true,
                onactiontrig:function(e){
                    switch(e.data.e){
                        case 'followall':
                            var list = this.jq('.user-sidebar ul li');
                            var uids = [];
                            list.each(function(){
                                var uid = X.ax.ActionMgr.parseRel(this).u;
                                if(uid)
                                    uids.push(uid);
                            });
                            if(uids.length){
                                e.lock(1);
                                X.request.follow(uids.join(','), 0, function(r){
                                    if (r.isOk()) {
                                        e.clear();
                                        Util.disable(e.src, true);
                                        $(e.src).find('span').text('已关注');
                                    } else {
                                        Box.tipWarn(r.getMsg());
                                    }
                                    e.lock(0);
                                });
                            }
                        break;
                        default:
                            e.stopPropagation(false);
                        break;
                    }
                }
            }
     })
    
     // 在线访谈首页
     .reg('interview.index_list', {
           onViewReady : function(cfg){
			   var $scrollor = this.jq('#scrollor');
			   if($scrollor.find('li').length<6){//这个应该是php不输出
            	   this.jq('.arrow-l-s2').addClass('arrow-l-s2-disabled');
            	   this.jq('.arrow-r-s2').addClass('arrow-r-s2-disabled');
               } else {
				   $scrollor.length && $scrollor.makeScroll({ 
	                      prevBtn:this.jq('.arrow-l-s2'), 
	                      nextBtn:this.jq('.arrow-r-s2') ,
	                      ldisabledCs:'arrow-l-s2-disabled',
	                      rdisabledCs:'arrow-r-s2-disabled'
	              });
               }
           }
     })
     
    // 在线访谈嘉宾列表
    .reg('interview.guestList', {
           ui : {
               actionMgr:true,
               onactiontrig:function(e){
                   switch(e.data.e){
                       case 'followall':
                           var list = this.jq('ul li');
                           var uids = [];
                           list.each(function(){
                               var uid = X.ax.ActionMgr.parseRel(this).u;
                               if(uid) 
                                   uids.push(uid);
                           });
                           if(uids.length){
                               e.lock(1);
                               X.request.follow(uids.join(','), 0, function(r){
                                   if (r.isOk() || '1020805'==r.getCode() ) {
                                       e.clear();
                                       Util.disable(e.src, true);
                                       $(e.src).find('span').text('已关注');
                                   } else {
                                       Box.tipWarn(r.getMsg());
                                   }
                                   e.lock(0);
                               });
                           }
                       break;
                       default:
                           e.stopPropagation(false);
                       break;
                   }
               }
           }
    });
})(Xwb, $);