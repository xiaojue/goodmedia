/*!
 * X weibo JavaScript Library v1.1
 * http://x.weibo.com/
 * 
 * Copyright 2010 SINA Inc.
 * Date: 2010/10/28 21:22:06
 */

(function(X){

if(!window.__debug)
    __debug = false;

var 
    localDomain  = location.hostname,
    domainReg = /:\/\/(.[^\/]+)/;

var XwbRequest = {
    
/**
 * @class Xwb.ax.RequestConfig
 * @extends Xwb.ax.AjaxConfig
 */
 
 /**
  * @cfg {Function} success
  * @param {Xwb.ax.ResponseDefinition} data
  */

/**
 * @class Xwb.request
 * Xwb库数据层API。<br/>
 * 发起任何请求前请先执行初始化{@link #init}。
 * @singleton
 */

/**
 *  初始化请求。发起任何请求前请先初始化。
 * @param {String} serverBaseUrl 服务器URL.
 * @return this
 */
    init : function(server){
        this.basePath = server;
        return this;
    },
    
/**
 * 发起一个请求。<br>请求不必理会是否跨域，系统会判断是否同域调用ajax或JSONP请求。
 * @param {Xwb.ax.RequestConfig} config
 * @return {Connector} connector XMLHttpRequest|SCRIPT
 */
    direct : function(cfg){
        if(!cfg)
            cfg = {};
            
        // make a success handler wrapper
        var handler = cfg.success, connector;
        cfg.success = function(data, connector){
            var e = new ( cfg.responseDefinition || XwbRequest.DefaultResponseDefinition ) (data, cfg, connector);
            
            if(__debug) console.log('req e:', e);
            
            if(cfg.scope)
                handler.call(cfg.scope, e);
            else handler(e);
            
            data = null;
            e = null;
            connector = null;
        };
        // check domain the same
        var domain = cfg.url.match(domainReg);
        connector = !domain || domain[1] == localDomain ? Util.ajax(cfg) : Util.jsonp(cfg);
        return connector;
    },
    
/**
 * 利用给定参数发起一个POST请求
 * <code><pre>
    // POST
    Xwb.request.post(
        'http://demo.rayli.com.cn/?m=action.getCounts',
        {ids:'3042338323,3042296891'},
        function(e){
            if(e.isOk()){
                console.log(e.getRaw());
            }
        }
    );
   </pre></code>
 * @param {String} url
 * @param {Object} data
 * @param {Function} successCallback
 * @param {Xwb.ax.RequestConfig} config
 * @return {Connector} connector XMLHttpRequest|SCRIPT
 */
    postReq : function(url, data, success, cfg){
        !cfg && (cfg = {});
        cfg.method = 'POST';
        return this.q(url, data, success, cfg);
    },

/**
 * 利用给定参数发起一个请求。
 * q是query的缩写。 
 * <code><pre>
    // JSONP
    Xwb.request.q(
        'http://bbs.rayli.com.cn/api/sinax.php',
        {
            action : 'sinalogin',
            name   : 'yourname',
            pwd    : 'youpassword'
        },
        function(e){
            if(e.isOk()){
                console.log(e.getRaw());
            }
        },
        
        // 默认 'jsonp'，可根据具体目标而设置
        {jsonp:'jscallback'}
    );
   </pre></code>
 * @param {String} url
 * @param {Object} data
 * @param {Function} successCallback
 * @param {Xwb.ax.RequestConfig} config
 * @return {Connector} connector XMLHttpRequest|SCRIPT
 */
    q : function(url, data, success, cfg){
        !cfg && (cfg = {});
        cfg.url = url;
        // merge data
        if(cfg.data)
            Util.extend(cfg.data, data);
        else cfg.data = data;
        cfg.success = success;
        return this.direct(cfg);
    },
    
    basePath : '/',
    
/**
 * 发起XWB的action请求
 * @param {String} actionName
 * @param {Xwb.ax.RequestConfig} config
 * @return {Connector} connector XMLHttpRequest|SCRIPT
 */
    act : function(name, data, success, cfg){
        var url = this.apiUrl('action', name);
        return this.postReq(url, data, function(){
            success && success.apply(this, arguments);
            // 数据层发送 act.开头的各种action事件
            var arg = ['api.'+name];
            for(var i=0,len=arguments.length;i<len;i++)
                arg.push(arguments[i]);
            X.fire.apply(X, arg);
        }, cfg);
    },
    
/**
 * 创建Xwb页面链接
 * @param {String} moduleName
 * @param {String} actionName
 * @param {String} [queryString]
 * @param {String} [entry]
 * @return {String}
 */
    mkUrl : function(module, action, queryStr, entry){
        var params = (entry||'')+'?m=' + module;
        if (action)
            params += '.' + action;

        if (queryStr){
          params += '&';
          typeof queryStr === 'string' ?  params += queryStr : params+=Util.queryString(queryStr);
        }
        return this.basePath + params;
    },
    
/**
 * 获得api/weibo/请求URL
 * @param {String} moduleName
 * @param {String} actionName
 * @param {String} [queryString]
 */
    apiUrl : function(module, action, queryStr){
        return this.mkUrl('api/weibo/'+module, action, queryStr);
    },

/**
 * 解析原始返回的数据，很少会用到本方法，除非要手动解释返回的JSON数据。
 * @param {Object} rawData
 * @return {Xwb.request.DefaultResponseDefinition}
 */
    parseProtocol : function(ret){
        return new XwbRequest.DefaultResponseDefinition( ret );
    },
    
    event : function(name, data, success, cfg) {
        var url = this.mkUrl('event', name);
        this.postReq(url, data, success, cfg);
    },
    
// ------------------------------------
// XWB具体数据请求API
// ------------------------------------

/**
 * 发布微博
 * @param {String} text 微博内容
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {String} pic
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    post : function(text, fn, pic, cfg){
        var data = {text:text};
        if(pic)
            data.pic = pic;
        XwbRequest.act('update', data, fn, cfg);
    },
    
/**
 * 分享图片微博
 * @param {String} text 微博内容
 * @param {String} picId 图片pid
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    postImgText : function(text, picId, fn, cfg){
        XwbRequest.act('upload', {text:text, pic:picId}, fn, cfg);
    },
    
/**
 * 转发微博
 * @param {String} postId  微博id
 * @param {String} text    微博内容
 * @param {String} userList   同时作为userList的评论发布，用户ID用逗号分隔
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    repost : function(id, text, uids, fn, cfg){
        XwbRequest.act('repost', {
            id:id, 
            text:text, 
            rtids : uids
          }, fn, cfg
        );
    },
/**
 * 获取表情数据
 * 
 */
	getEmotion: function(fn) {
		XwbRequest.act('emotions', null,fn);
	},

/**
 * 删除微博
 * @param {String} postId 微博id
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    del : function(id, fn, cfg){
        XwbRequest.act('destroy', {id:id}, fn, cfg);
    },

/**
 * 评论微博
 * @param {String} postId 微博id
 * @param {String} text 微博内容
 * @param {Number} forward 是否作为一条新微博发布，1是，0否
 * @param {Number} headPictureType 评论显现头像类型, 默认是1，30大小的头像，2，50大小的头像
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    comment : function(id, text, forward, hpt, fn, cfg){
        XwbRequest.act('comment', {
            id:id,
            text:text,
            forward : forward,
            type:hpt
           }, fn, cfg
        );
    },

/**
 * @param {String} commentId 评论微博id
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    delComment : function(id, fn, cfg){
        XwbRequest.act('comment_destroy', {id:id}, fn, cfg);
    },
    
/**
 * 回复微博评论
 * @param {String} postId 微博id
 * @param {String} commentPostId 要回复的评论ID
 * @param {String} text 微博内容
 * @param {Number} forward 是否作为一条新微博发布，1是，0否
 * @param {Number} headPictureType 评论显现头像类型, 默认是1，30大小的头像，2，50大小的头像
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    reply : function(id, cid, text, forward, hpt, fn, cfg){
        XwbRequest.act('reply', {
            id:id,
            cid:cid,
            text:text,
            forward : forward,
            type:hpt
           }, fn, cfg
        );
    },
/**
 * 关注某人，或批量关注用户
 * @param {String} user 关注用户，UID或微博名称
 * @param {Number} userDataType user参数类型，0为user id，1为微博名称
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    follow : function(user, dt, fn, cfg){
        XwbRequest.act('createFriendship', {uid:user, type:dt}, fn, cfg);
    },

/**
 * @param {String} user 关注用户，UID或微博名称
 * @param {Number} userDataType user参数类型，0为user id，1为微博名称
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    unfollow : function(user, name, fn, cfg){
        XwbRequest.act('deleteFriendship', {id:user, name:name, is_follower:0}, fn, cfg);
    },
	
/**
 * 移除粉丝
 * @param {String} user 关注用户，UID或微博名称
 * @param {Number} userDataType user参数类型，0为user id，1为微博名称
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
	removeFans : function(user, name, fn, cfg) {
		XwbRequest.act('deleteFriendship', {id:user, name:name, is_follower:1}, fn, cfg);
	},

/**
 * 收藏微博
 * @param {String} blogId 要收藏的微博ID
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    fav : function(id, fn, cfg){
        XwbRequest.act('createFavorite', {id:id}, fn, cfg);
    },
    
    delFav : function(id, fn, cfg){
        XwbRequest.act('deleteFavorite', {id:id}, fn, cfg);
    },

/**
 * 更改头像。
 * WARNING : 更改头像需要由form提交
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    updateHeadPic : function(image, fn, cfg){
        XwbRequest.act('updateProfileImage', {image:image}, fn, cfg);
    },
    
/**
 * 更新用户资料
 * @param {Object} data 用户资料（键值对）
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    setProfile : function(data, fn, cfg){
        XwbRequest.act('saveProfile', data, fn, cfg);
    },

/**
 * 获取未读数 包括新微博数，@我的微博数，评论数，粉丝数，私信
 * @param {String} lastReadId 最新已读微博ID
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    unread : function(id, fn, cfg){
        XwbRequest.act('unread', {id:id}, fn, cfg);
    },
    
/**
 * 清零未读消息数目
 * @param {Number} messageType  1为清零评论，2为清零@me，3为清零私信，4为清零粉丝，默认清零全部
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    clearUnread : function(type, fn, cfg){
        XwbRequest.act('clearTip', {type:type}, fn, cfg);
    },
    
/**
 * 获取指定的微博评论列表
 * @param {String} id 微博ID
 * @param {Number} page 评论的页码
 * @param {Number} type 列表类型, 默认是1，微博列表的某条微博评论列表，2单条微博的详细评论列表
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    getComments : function(id, page, type, fn, cfg){
        XwbRequest.act('getComments', {id:id, page:page, type:type||1}, fn, cfg);
    },

/**
 * 发私信
 * @param {String} targetUserId 用户帐号ID，与用户微博名称两者给出其一即可
 * @param {Number} userType 指明第一个参数的类型，用户ID时值为0, 用户微博名称时为1，默认为0
 * @param {String} targetWeiBoName 用户微博名称与帐号ID两者给出其一即可
 * @param {String} text 私信内容
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    msg : function(uid, userType, text, fn, cfg){
        XwbRequest.act('sendDirectMessage', {id : userType?'':uid, name: userType?uid:'', text:text}, fn, cfg);
    },

/**
 * 删除私信
 * @param {String} msgId 私信ID
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    delMsg : function(id, fn, cfg){
        XwbRequest.act('deleteDirectMessage', {id:id}, fn, cfg);
    },
/**
 * 查看某人是否是目标用户的粉丝
 * @param {String} user 目标用户
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Number} targetAccountType 目标帐号类型，如果参数传入的是用户ID，为0,如果参数为用户微博名称则为1
 * @param {String} src 源用户(不指定，就使用当前登录用户)
 * @param {Number} sourceAccountType 源帐号类型，如果参数传入的是用户ID，为0,如果参数为用户微博名称则为1
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    followed : function(user, fn, userType, src, srcType, cfg){
        var data = {};
        if( userType )
            data.t_name = user;
        else data.t_id  = user;
        if(src){
            if(srcType)
                data.s_name = src;
            else data.s_id  = src;
        }
        XwbRequest.act('friendShip', data, fn, cfg);
    },
    
/**
 *  个人设置
 * @param {String} type 设置类型，默认是’autoshow’新微博显示方式，’tipshow’未读数显示方式
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    setting : function(type, fn, cfg){
        XwbRequest.act('setting',{type:type}, fn, cfg);
    },

/**
 *  屏蔽单条微博
 * @param {String} weiboId 微博ID
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    shieldBlog : function(wbId, fn, cfg){
        XwbRequest.postReq(XwbRequest.mkUrl('show', 'disabled'), {id:wbId}, fn, cfg);
    },
/**
 *  举报单条微博
 * @param {String} weiboId 微博ID
 * @param {String} content
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    reportSpam : function(wbId, content, fn, cfg){
        XwbRequest.postReq(XwbRequest.mkUrl('show', 'reportSpam'), {cid:wbId, content:content}, fn, cfg);
    },

/**
 *  增加标签
 * @param {String} tagList 逗号分隔
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    createTags : function(tagList, fn, cfg){
        XwbRequest.act('createTags', {tagName:tagList}, fn, cfg);
    },

/**
 * 删除标签
 */
    delTag : function(tagId, fn, cfg){
        XwbRequest.act('deleteTags', {tag_id:tagId}, fn, cfg);
    },
    
    updateShowProfile : function(data, fn, cfg){
        XwbRequest.act('saveShow', data, fn, cfg);
    },
    
    updateNoticeProfile : function(data, fn, cfg){
        XwbRequest.act('saveNotice', data, fn, cfg);
    },
/**
 * 发送提醒。
 * @param {String} userId, (sina_id), 0表示本站所有用户
 * @param {String} title
 * @param {String} content
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    notice : function(uid, title, content, time, fn, cfg){
        XwbRequest.postReq(XwbRequest.apiUrl('action', 'sendNotice'), {available_time:time,uid:uid,title:title,content:content}, fn, cfg);
    },
    
/**
 * 设置皮肤
 * @param {Object} 皮肤参数（如果只有skin_id，表示使用皮肤列表，否则就是自定义皮肤）
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    saveSkin : function(data, fn, cfg){
        // url, data, success, cfg
        XwbRequest.postReq(XwbRequest.mkUrl('setting', 'setSkin'), data, fn, cfg);
    },
    
/**
 * 设置皮肤(后台设置)
 * @param {Object} 皮肤参数（如果只有skin_id，表示使用皮肤列表，否则就是自定义皮肤）
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    saveMgrSkin : function(data, fn, cfg){
        // url, data, success, cfg
        XwbRequest.postReq(XwbRequest.mkUrl('mgr/setting', 'setSkin'), data, fn, cfg);
    },
    
/**
 * 获取多条微博转发数，评论数等信息
 * @param {String} weiboIds 微博ID列表，由逗号分隔
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    counts : function(ids, fn, cfg){
        XwbRequest.act('getCounts', {ids:ids}, fn, cfg);
    },

/**
 * 添加用户黑名单
 * @param {String} id 用户ID
 * @param {String} name 用户昵称 
 * 参数二选一即，如只知道昵称 (null, 'billgate');
 */
	blacklistAdd : function(id, name, fn, cfg) {
		XwbRequest.act('createBlocks', {id:id,name:name}, fn, cfg);
	},

	blacklistDel : function(id, name, fn, cfg) {
		XwbRequest.act('deleteBlocks', {id:id,name:name}, fn, cfg);
	},
	

/**
 * 获取省份城市列表
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 */
	getProvinces : function(fn) {
		XwbRequest.act('getProvinces', null, fn);
	},

/**
 * 用户反馈
 * @param {Object} data 微博ID列表，由逗号分隔
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
	feedback : function(data, fn, cfg){
	    this.postReq( this.mkUrl('feedback','save'), data, fn, cfg );
	},

/**
 * @class Xwb.request
 */
/**
 * 解析短链接,ID可为多个，逗号分隔。<br/>
 * 一般情况下，不必直接调用本方法，利用{@link Xwb.ax.Shortlink}类提供各种解析短链的方法，包括文本，DOM上的短链接，可解决大部份问题。
 * @param {String} shortLinkId
 * @param {Function} callback 成功后回调方法，参数为 callback(Xwb.ax.ResponseDefinition definition)
 * @param {Xwb.ax.RequestConfig} [config] 可选，请求配置信息
 */
    sinaurl : function(id, fn){
        XwbRequest.act('sinaurl', {id:id}, fn);
    },
    

    eventSave : function(data, fn) {
        XwbRequest.event('saveEvent', data, fn);
    },
    
    eventJoin : function(data, fn) {
        data = $.extend({}, data, {action: 'join'});
        XwbRequest.event('joinEvent', data, fn);
    },
    
    eventClose : function(id, fn) {
        XwbRequest.event('closeEvent', {eid: id}, fn);
    },
    
    //删除活动
    eventDelete : function(id, fn) {
        XwbRequest.event('deleteEvent', {eid: id}, fn);
    },

    
    // 退出活动
    eventExit : function (eid, fn, cfg) {
        XwbRequest.event('doAction', {action:'exit',eid:eid}, fn, cfg);
    }
};


/**
 * @class Xwb.ax.ResponseDefinition
 * 该类定义获得返回内容数据的方式，即封装了底层数据返回的具体结构，外部应用可以以一致的<b>方法</b>读取返回的数据。<br/>
 * 异步返回的JSONP数据格式是前端与后台既定的一个格式，<strong>任何异步请求都要遵循该格式</strong>。<br/>
 * 一般情况下不必直接实现化本类，当{@link Xwb.request}发起的异步请求返回时，回调传递的参数就是本类的实例化对象。
 * <pre><code>
    // response参数即为Xwb.ax.ResponseDefinition类实例
    Xwb.request.q('http://server.com/', {}, function(response){
        if(response.isOk()){
            alert(response.getData());
        }
   });
 </code></pre>
 * @constructor
 * @param {Object} rawData row json data responsed by server
 * @param {Object} requestConfig 连接配置信息
 * @param {XMLHttpRequest|JSONP} connector 发起请求的连接器(ajax:XMLHttpRequest或JSONP:script结点)
 */
XwbRequest.DefaultResponseDefinition = function(rawData, reqCfg, connector){
    this.raw = rawData;
    this.reqCfg = reqCfg;
    if(connector)
        this.connector = connector;
};

XwbRequest.DefaultResponseDefinition.prototype = {
/**
 * 获得该请求发起时的配置信息
 * @return {Object}
 */
    getRequestCfg : function(){
        return this.reqCfg;
    },
/**
 * 获得该请求所使所有连接器(ajax:XMLHttpRequest对象或JSONP:script结点)
 * @return {Object}
 */
    getConnector : function(){
        return this.connector;
    },
    
/**
 * 获得请求原始返回数据，根据请求数据类型的不同返回text文本或json对象
 * @return {Object} jsonData
 */
    getRaw : function(){
        return this.raw;
    },

/**
 * 获得该请求的应用数据
 * @return {Object}
 */
    getData : function(){
        return this.getRaw().rst;
    },

/**
 * 检测服务器数据调用是否成功。
 * 该检测处于服务器成功返回之后，
 * 对客户端提交的请求数据有效性的一种反应。
 * @return {Boolean}
 */
    isOk : function(){
        return !this.getCode();
    },

/**
 * 获得返回码
 * @return {Number}
 */
    getCode : function(){
        return this.getRaw().errno;
    },

/**
 * 获得错误的具体信息。这个错误信息是API默认返回的错误信息，主要给开发人员参考。
 * @return {Object} errorInfo
 */
    getError : function(){
        return this.getRaw().err;
    },
    
/**
 * 从ERRORMAP获得错误码对应信息，返回的信息是面向用户的信息，如果要获得开发人员参考的错误信息，请用{@link #getError}。
 * @param {String} defaultString 如果不存在，返回该字符串。
 * @return {String}
 */
    getMsg : function(def){
        if(__debug) if( !ERRORMAP[ this.getCode() ] ) console.warn('未定义错误码消息：' + this.getCode(), '@', this.getRaw());
        // '系统繁忙，请稍后重试！'
        return ERRORMAP[ this.getCode() ] || def || ('系统不给力，请稍后再试试吧。');
    },

/**
 * 枚举返回的data数据，只枚举下标为数字的条项。
 * @param {Function} callback
 * @param {Object} scope
 */
    each : function(func, scope){
        var i = 0, data = this.getData();
        for( var item in data ){
            if( isNaN (item) )
                continue;
            if( scope ){
                if( func.call(scope, data[item], i) === false)
                    break;
            } else if( func(data[item], i) === false)
                 break;
            i++;
        }
    }
};


//
//  这里只限定后台返回的错误码，请不要定义其它多余的错误码。
//
var ERRORMAP = XwbRequest.ERRORMAP = {
        '0': '发布失败。',
		'5': '超过字数了！',
		'1': '图片正在上传，请稍候。',
		'2': '正在发布,请稍候。。',
		'3': '请先输入内容。',
		'4': '请写上你要说的话题。',
		'1010005':'超出字数了哦！',
		'1020002': '请不要重复发布相同的内容。',
		'1010006': '不能采用sina域下的邮箱。',
		'1010007': '已经提交，请耐心等待管理员审核，谢谢！',
        '20011': '评论字数超过限制',
		'20016': '他还没有关注你,不能发私信',
		'30001': '皮肤保存失败，请重试。',
		//图片相关
		'20020':'上传图片为空',
		'20021':'上传图片大小超过限制',
		'20022':'上传图片类型不符合要求',
		'20023':'上传图片失败，重新试试看？',
		'20024':'非法的上传图片',
	    '1021200':'此昵称不存在',
	    '1020500':'此微博已被作者移除。',
	    '1020301':'此微博已被作者移除。',
	    '1020700':'此微博已被作者移除。',
	    '1020402':'此微博已被作者移除。',
	    '1020504':'此微博已被作者移除。',
	    '1020501':'此评论已被作者移除。',
	    '1020600':'此评论已被作者移除。',
		'1040003':'您尚未登录，请先登录再操作',
		'1040000':'您尚未登录，请先登录再操作',
		'1050000':'系统繁忙，请稍候再试。',
		'1040007':'发评论太多啦，休息一会儿吧。',
		'1040006':'发微博太多啦，休息一会儿吧。',
		'1040005':'你已经被禁止发言',
		'1040004': '请不要发表违法和不良信息。',
		'1021301': '该昵称已存在，请换一个昵称。',
		'1020104': '不要太贪心哦，发一次就够啦。',
		'1020808': '你不能关注自己。',
		'1020801': '关注的用户不存在。',
		'1020800': '关注失败',
		'1020805': '已关注该用户',
		'1050000': '操作失败，重新试试看？',
		'1020404': '由于用户设置，你暂不能发表评论。',
		'1020405': '根据对方的设置，你不能进行此操作。',
		'1020806': '你使用的帐号或IP关注过于频繁，今日将无法再进行同类操作，请谅解！',
		// 上传文件由于其它原因出错
		// 这里后台最好和上面的一致
		'2010009' : '上传图片大小超过限制。',
		'2010010' : '上传图片大小超过限制。',
		'2010011' : '上传图片的数据不完整，重新试试看？',
		'2010012' : '图片上传失败，重新试试看？',
		'2010013' : '上传图片失败，重新试试看？',
		'2010014' : '上传图片失败，重新试试看？',
        '1040016' : '出错啦，该网站调用API次数已超过限制，请联系站长解决！'		
};

var Util = X.util;

//
//  为方便处理，所有事件统一有X层发送
//
if(!X.fire)
    X.fire = function(){};

X.request = XwbRequest;

})(window.Xwb);