/*!
 * X weibo JavaScript Library v1.1
 * http://x.weibo.com/
 * 
 * Copyright 2010 SINA Inc.
 * Date: 2010/10/28 21:22:06
 */

 
(function(X, $){
var FALSE = false,

	TRUE = true,

    R = X.request,
    Box = X.ui.MsgBox,
	getCfg = X.getCfg,
	getWb = X.getWb;

X.use('action')
/**
 * @class Xwb.mod.GlobalActionFilter
 * 全局动作拦截器
 * @static
 */
 
/**
 * @property authFilter
 * 该拦截器检测登录用户是否具备执行当前动作的权限。<br/>
 * 目前检测的权限有：
  * <ul>
 * <li>
    登录权限
   </li>
 * </ul>
    登录权限：如果当前action.na未设置为true，则提示要求用户登录。<br/>
    登录类型由全局配置loginCfg属性指定。<br/>
    登录类型：
 * <ul>
 * <li>仅使用新浪帐号直接登录</li>
 * <li>仅使用原有站点帐号登录</li>
 * <li>使用新浪帐号与原有站点帐号并存方式登录</li>
 * </ul>

 */


// 增加全局action拦截器，
// 对于要求登录的action转至登录页面
.addFilter(function( e, act){
    // 如果e:name未注册action或者action.na未设置为true
    // 则操作前要求用户登录
	if( !act || !act.na ){
		var uid = X.getUid(),
			siteUid = X.getSiteUid(),
			loginType = getCfg('loginCfg')||1;
		if (!uid){
            // 有无自定义登录方式
            if(e.get('e')=='lg')
                loginType = e.data.t || loginType;

			if (siteUid){
				if (e.get('e')=='lg')
					X.mod.authLogin.direct('bind');
				else 
					window.location = R.mkUrl('account', 'bind');
			} else {
				switch (parseInt(loginType,10)) {
    				//使用新浪帐号与原有站点帐号并存方式登录
    				case 3:
    					X.use('loginBox').display(TRUE);
    					break;
    
    				//仅使用原有站点帐号登录
    				case 2:
    					window.location = R.mkUrl('account','siteLogin');
    					break;
    
    				//仅使用新浪帐号直接登录
    				case 1:
    				default:
    					X.mod.authLogin.direct();
				}
			}
			return FALSE;
		}	
    }
}, TRUE)

/**
 * @class Xwb.mod.PageActions
 * 公共action处理
 * @static
 */

/**
 * @event sd
 * 发布微博弹框
 * @param {String} [m] 弹出时微博框内容
 */
.reg('sd', function( e ){
    var box = X.use('postBox');
    var text = e.get('m');
    box.display(TRUE)
       .reset()
       .selectionHolder.setText(text||'');
    if(text)
        box.checkText();
})


/**
 * @event fw
 * 弹出微博转发框
 * @param {String} w 微博ID
 */
.reg('fw', function( e ){
    var wbId = e.get('w');
    // 打开转发框
    var fb = Xwb.use('forwardBox');
    fb.display(true)
      .setContent(wbId, getWb(wbId), X.getUid())
      .selectionHolder
      .focusStart();
})

/**
 * @event fl
 * 加关注
 * @param {String} u 关注用户ID
 * @param {Number} t 动作类型
 * t值可为<br/>
  * <ul>
 * <li>1:用&lt;span class=&quot;followed-btn&quot;&gt;样式显示已关注；</li>
 * <li>2:用&lt;em&gt;显示已关注</li>
 * <li>其它为刷新当前页</li>
 * </ul>
 */
.reg('fl', function( e ){
    var uid    = e.get('u');
    var jqTrig = $(e.src);
    
    // 设置action提交标记，可有效防止重复响应
    e.lock(1);
    R.follow(uid, 0, function( ed ){
        // #1020805，用户先前已关注，但由于缓存未更新引起，现作为关注成功处理
        if( ed.isOk() || ed.getCode() == '1020805'){
			var type = e.get('t');
			var $src = $(e.src);
			switch (parseInt(type)) {
    			case 1: //今日话题、他的微博
    				$src.replaceWith('<span class="followed-btn">已关注</span>');
    			break;
    
    			case 2: //挂件栏
    				$src.replaceWith('<em>已关注</em>');
    			break;
                // ta
                case 3:
                    $src.replaceWith('<div class="operated-box"><span class="followed-btn">已关注</span><em>|</em><a href="#" rel="e:ufl,t:3" class="cancel">取消</a></div>');
                break;
    			default:
    				location.reload();
			}
        }else {
            if(ed.getCode() == '1020806'){
                //如果该用户一天超过500次关注行为，弹窗提示
                Box.confirm('', '你今天已经关注了足够多的人，先去看看他们在说些什么吧？', function(btn){
                    if(btn == 'ok')
                        location.href = Req.mkUrl('ta', '', 'id='+uid);
                });
            }else Box.tipWarn(ed.getMsg());
        }
        e.lock(0);
    });
})

/**
 * @event ufl
 * 取消关注
 * @param {String} u 用户ID
 * @param {Number} [f] 动作类型
 * f值可为<br/>
  * <ul>
 * <li>1:显示“关注他”标签</li>
 * <li>其它为刷新当前页</li>
 * </ul>
 */
.reg('ufl', function(e) {
	Box.anchorConfirm(e.src,'确定要取消关注？', function(btnId){
        if(btnId == 'ok'){
            e.lock(1);
			var uid = e.get('u');
			var act = parseInt(e.get('t'));

			R.unfollow(uid, '', function(re) {
				if (re.isOk()){
				    switch(act){
				        case 1:
				            $(e.src).replaceWith('<a rel="e:fl,t:2" href="#">关注他</a>');
				        break;
				        case 3:
				            $(e.src).parent().replaceWith('<a class="skin-bg addfollow-btn" rel="e:fl,t:3" href="#">加关注</a>');
				        break;
				        default:
				            window.location.reload();
				        break;
				    }
				} else {
					Box.tipWarn(re.getMsg());
				}
			    e.lock(0);
			});
		}
	});
})

/**
 * @event rs
 * 弹出举报对话框
 * @param {String} w 微博ID
 */
.reg('rs', function(e){
    var wbId = e.get('w');
    var wb = getWb(wbId);
    var box = Xwb.use('Box', {
    	cs:'win-report',
        contentHtml : 'SpanBoxContent',
        title:'举报不良信息',
        appendTo : document.body,
        closeable:true,
        mask:true,
        destroyOnClose : true,
        actionMgr:true,
        autoCenter:true,
        // html template data
        nick : wb.u.sn,
        img  : wb.u.p,
        text : wb.tx,
        onactiontrig:function(e){
            switch(e.data.e){
                case 'ok' :
                    var text = this.jq('#content').val();
                    R.reportSpam(wbId, text, function(ret){
                        if(ret.isOk()){
                            Box.success('', '您的举报已提交，我们将尽快处理，感谢您对我们工作的支持！');
                        }
                        box.close();
                    });
                break;
                
                case 'cancel':
                    this.close();
                break;
            }
        }
    });
    
    box.display(true);
    box.jq('#content')
       .focus();
})
/**
 * @event blm
 * 弹出屏蔽微博对话框
 * @param {String} w 微博ID
 */
.reg('blm', function(e){
	 Box.anchorConfirm(e.src,'确定要屏蔽该微博？', function(btnId){
        if(btnId == 'ok'){
            var wbId = e.get('w');
            e.lock(1);
            R.shieldBlog(wbId, function( r ){
                if( r.isOk() ){
                    Box.anchorTipOk(e.src, '屏蔽成功！');
                    $(e.src).replaceWith('<span>已屏蔽</span>');
                }
                e.lock(0);
            });
        }
    });
})

//刷新页面
/**
 * @event rl
 * 刷新页面
 */
.reg('rl', function(){
	location.reload();
}, {na: TRUE})

// 收藏, favourite
/**
 * @event fr
 * 弹出收藏对话框
 * @param {String} w 微博ID
 */
.reg('fr', function( e ){
    var wbId = e.get('w');
    e.lock(1);
    R.fav(wbId, function( r ){
        if( r.isOk() ){
            Box.anchorTipOk(e.src, '收藏成功！');
            $(e.src).replaceWith('<span>已收藏</span>');
        }else {
            Box.tipWarn(r.getMsg());
        }
        e.lock(0);
    });
})

/**
 * @event fr
 * 弹出取消收藏对话框
 * @param {String} w 微博ID
 * @param {Number} t 为1时当请求成功后将微博从列表移除，否则显示“收藏”按钮
 */
.reg('ufr', function(e) {
	 Box.anchorConfirm(e.src,'确定要删除该收藏？', function(btnId){
        if(btnId == 'ok'){
            e.lock(1);
			var wbId = e.get('w');
			R.delFav(wbId, function( r ){
				if( r.isOk() ){
				    // 如果指定t的值为1，将微博从列表移除
				    if(e.data.t == 1){
				        var jq = $(e.getEl('w'));
						jq.slideUp(500, function() {
							jq.remove();
							e.lock(0);
						});
					} else {
						$(e.src).replaceWith('<a rel="e:fr" href="#">收藏</a>');
						e.lock(0);
					}
				}
			});
		}
	 })
})

/**
 * @event cm
 * 评论微博
 * @param {String} w
 */
.reg('cm', function( e ){
     var wbId = e.get('w'),
         itemEl = $( e.getEl('w') ),
         cmt = itemEl.data('xwb_cmt');
     
     if( !cmt ){
	   var wb = getWb(wbId);

       cmt =  X.use('CmtArea', {
                wbId:wbId, 
                wbUid    : wb && wb.u.id,
                appendTo : itemEl.find('.feed-content'), 
                trigEl : e.src
              });
       itemEl.data('xwb_cmt', cmt);
     }
     
     if(! cmt.display() ){
        cmt.display(TRUE);
        cmt.load(function(){
            cmt.cmtBox.jqInputor.focus();
        });
     }else cmt.display(FALSE);
})

// trun left 向左转
.reg('tl', function(e) {
	var $wb = $(e.getEl('w'));
	var wbEle = $wb.data('wbEle');

	if (!wbEle) {
		var wid = e.get('w');
		wbEle = X.use('WbElement', {$wb: $wb, wbData: getWb(wid)});
		
		$wb.data('wbEle', wbEle);
	}

	wbEle.trun('left');
}, {na:TRUE})

// trun right 向右转
.reg('tr', function(e) {
	var $wb = $(e.getEl('w'));
	var wbEle = $wb.data('wbEle');

	if (!wbEle) {
		var wid = e.get('w');
		wbEle = X.use('WbElement', {$wb: $wb, wbData: getWb(wid)});
		
		$wb.data('wbEle', wbEle);
	}

	wbEle.trun('right');
}, {na:TRUE})

//还原原来的缩略图片
.reg('zo', function(e) {
	var $wb = $(e.getEl('w'));
	var wbEle = $wb.data('wbEle');

	if (!wbEle) {
		var wid = e.get('w');
		wbEle = X.use('WbElement', {$wb: $wb, wbData: getWb(wid)});
		
		$wb.data('wbEle', wbEle);
	}

	wbEle.zoomOut();
}, {na:TRUE})

// zoom in 放大图片
.reg('zi', function( e ) {
	var $wb = $(e.getEl('w'));
	var wbEle = $wb.data('wbEle');

	if (!wbEle)
	{
		var wid = e.get('w');
		wbEle = X.use('WbElement', {$wb: $wb, wbData: getWb(wid)});
		
		$wb.data('wbEle', wbEle);
	}

	wbEle.zoomIn();

}, {na:TRUE})

// play video 播放视频
.reg('pv', function(e) {
	var $wb = $(e.getEl('w'));
	var wbEle = $wb.data('wbEle');

	if (!wbEle)
	{
		var wid = e.get('w');
		wbEle = X.use('WbElement', {$wb: $wb, wbData: getWb(wid)});
		
		$wb.data('wbEle', wbEle);
	}

	wbEle.playVideo(e);

}, {na:TRUE})

//close video
.reg('cv', function(e) {
	var $wb = $(e.getEl('w'));
	var wbEle = $wb.data('wbEle');

	if (!wbEle)
	{
		var wid = e.get('w');
		wbEle = X.use('WbElement', {$wb: $wb, wbData: getWb(wid)});
		
		$wb.data('wbEle', wbEle);
	}

	wbEle.closeVideo(e);
}, {na:TRUE})

/**
 * @event dl
 * 弹出删除我发布的微博对话框
 * @param {String} w 微博ID
 */
.reg('dl', function( e ){
    var wbId = e.get('w');
    Box.anchorConfirm(e.src,'确定删除该微博吗？', function(btnId){
        if(btnId === 'ok'){
            e.lock(1);
            R.del(wbId, function(re){
                var el = $(e.getEl('w'));
                if( re.isOk() ){
    				el.slideUp('normal', function(){
                        el.remove();
                    });
                }else Box.tipWarn(re.getMsg());
                e.lock(0);
            });
        }
    });
})

//关闭活动
.reg('clsevt', function(e){
    var id = e.get('id');
    if (id) {
        Box.anchorConfirm(e.src, '确定要关闭此活动？' , function(bt) {
            if (bt !== 'ok') return;
            
            e.lock(1);
            R.eventClose(id, function(r){
                if (r.isOk()) {
                    location.reload();
                } else {
                    Box.tipWarn(e.getMsg());
                }
            });
        });
    }
})
//删除活动
.reg('delevt', function(e){
    var id = e.get('id');
    if (id) {
        Box.anchorConfirm(e.src, '确定要删除此活动？' , function(bt) {
            if (bt !== 'ok') return;
            
            e.lock(1);
            R.eventDelete(id, function(r){
                if (r.isOk()) {
                    location.reload();
                } else {
                    Box.tipWarn(e.getMsg());
                }
            });
        });
    }
})

/**
 * @event mop
 * TA的微博、粉丝页 “更多”按键
 */
.reg('mop', function(e) {
	var $ele = $(e.src);
	var layer = $ele.data('morelayer');

	if (!layer) {
		layer = X.use('MoreList', {
			view: $('#more_list')[0]
		});
		$ele.data('morelayer', layer);
	}

	layer.display(1);
})

/**
 * @event sdm
 * 发私信
 * @param {String} [c] 内容
 * @param {String} [n] 昵称
 */
.reg('sdm', function( e ){
    var myMsg = X.use('myMsg');
    myMsg.display(TRUE)
         .reset();
    var content = e.get('c');
    if(content)
        myMsg.selectionHolder.setText(content);
    var nick = e.get('n');
    if(nick)
         myMsg.jqSender.val(nick);
    
    if(nick)
        myMsg.jqContent.focus();
    else myMsg.jqSender.focus();
})

/**
 * @event rm
 * 回复私信
 * @param {String} [u] 用户ID
 * @param {String} [n] 昵称
 */
.reg('rm', function( e ){
    X.use('myMsg').reply(
        e.get('u'), e.get('n')
    );
})

/**
 * @event dm
 * 删除私信
 * @param {String} m 私信ID
 */
.reg('dm', function(e){
	 Box.anchorConfirm(e.src,'确定要删除该私信？', function(btnId){
        if(btnId == 'ok'){
            e.lock(1);
            var mid    = e.get('m');
            R.delMsg(mid, function(rt){
                if(rt.isOk())
                    location.reload();
                e.lock(0);
            });
        }
    });
})

/**
 * @event dbl
 * 删除黑名单
 * @param {String} u 用户ID
 */
.reg('dbl', function(e) {
	
	function removeBl() {
		e.lock(1);
		var uid = e.get('u');

		R.blacklistDel(uid, '', function(r) {
			if (r.isOk())
			{
				location.reload();
			} else {
				Box.tipWarn(r.getMsg());
			}

			e.lock(0);
		});
	}

	var m = e.data.m;

	if (m)
	{
		Box.confirm('提示', m, function(bt) {
			bt === 'ok' && removeBl();
		});
	} else {
		removeBl();
	}

})
/**
 * @event dfan
 * 移除粉丝
 * @param {String} u 用户ID
 */
.reg('dfan', function(e){
    // 有必要时可改为anchorBox提示
    Box.confirm('提示','移除之后将取消'+name+'对你的关注?', function(bid){
        if(bid=='ok'){
            var uid = e.get('u');
            var itemElem = e.getEl('u');
            e.lock(1);
            R.removeFans(uid, '', function(ret){
                if(ret.isOk()){
                    $(itemElem).slideUp(500, function() {
                        e.lock(0);
                        $(itemElem).remove();
                    });
                }else {
                    Box.tipWarn(e.getMsg());
                    e.lock(0);
                }
            });
        }
    });
})
//关注话题
.reg('addSubject',function(e){
	var self=$(e.src);
	e.lock(1);
	R.postReq(R.apiUrl('action','addSubject'),{text:e.get('subject')},function(r){
		if(r.isOk()){
			self.parent().replaceWith('<span>已关注(<a href="javascript:;" rel="e:delSubject">取消关注</a>)</span>');
			X.fire('subrefresh',{'subject':e.get('subject'),type:'add'});
		} else {
			Box.alert('提示',r.getError());
		}
		e.lock(0);
	});
})
//删除关注话题
.reg('delSubject',function(e){
	var self=$(e.src);
	e.lock(1);
	R.postReq(R.apiUrl('action','deleteSubject'),{text:e.get('subject')},function(r){
		if(r.isOk()){
			self.parent().replaceWith('<span class="topic-follow"><a href="javascript:;" rel="e:addSubject">关注该话题</a></span>');
			X.fire('subrefresh',{'subject':e.get('subject'),type:'del'});
		} else {
			Box.alert('提示',r.getError());
		}
		e.lock(0);
	});
});

})(Xwb, $);