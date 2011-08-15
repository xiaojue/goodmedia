/*!
 * X weibo JavaScript Library v1.1
 * http://x.weibo.com/
 * 
 * Copyright 2010 SINA Inc.
 * Date: 2010/10/28 21:22:06
 */

// 当ready.js一些功能复用的比较多时可经重构后放到本JS文件来，再在ready.js里引用。

(function(X, $){

var 
	undefined,
	ui = X.ui, 
    Util = X.util, 
    doc = document, 
    Base = ui.Base, 
    T = X.ax.Tpl, 
    Req = X.request,
	hideCls = 'hidden',
    exceedCS = 'out140',
    MB = X.use('msgbox'),
	getCfg = X.getCfg,
	getUid = X.getUid,
	getWb = X.getWb,
	setWb = X.setWb;

if(!X.mod)
    X.mod = {};

var mod = X.mod;

/**
 * @class Xwb.mod.emotion
 * 表情弹窗
 * @extends Xwb.ui.Box
 * @singleton
 */
X.reg('emotion', function(){

var inst = X.use('Box', {
    
	contentHtml: 'Loading',
    
    boxOutterHtml : 'ArrowBoxBottom',
    
    cs : 'win-emotion',
    
    appendTo : doc.body,
    
    closeable : true,
        
    actName : 'em',
    
    contextable : true,
    
    actionMgr : true,

	emotions: null,

	//当前选中的分类
	$categorySelected: null,

	//当前显示的表情列表
	$categoryShowed: null,

	//分类索引->数据映射
	cateMaps: {},
    
    onactiontrig : function(e){
        switch(e.data.e){
            case 'em':
                if( this.onselect ){
                    if( this.onselect(this.findEmotionText(e), e) === false)
                        return;
                }
                this.display(false);
            break;

			case 'sc': //选择分类
				//console.debug(e);
				this.emSwitch(e.data.idx, e.src);
			break;
        }
    },
    
    setHandler : function(hd){
        this.onselect = hd;
        return this;
    },
    
    setSelectionHolder : function(selHolder, oninsert, scope){
        this.setHandler(function( selected ){
            selHolder.insertText(selected);
            oninsert && oninsert.call(scope||this, selHolder, selected);
        });
        return this;
    },
    
    showAt : function(anchor){
        var off = $(anchor).offset();
        off.left -= 24;
        off.top += 20;
        this.offset(off)
            .display(true);
    },

	initEmotion: function(resp) {
		if (resp.isOk())
		{
			var data = resp.getData();
			
			var 

				emotions = {},
				hots = [],

				//模板值
				category = [],
				hotFaces = [],

				//分类索引ID
				cateIdx = 0,
				cateMaps = {};;


			$.each(data, function(i, e) {
				if (e.type != 'face')
				{
					return;
				}

				var cateName = e.category ? e.category: '默认';
				if (!emotions[cateName])
				{

					emotions[cateName] = [e];
					
					cateMaps[cateIdx] = emotions[cateName];

					category.push(['<a href="#" rel="e:sc,idx:',cateIdx,'">',cateName,'</a>'].join(''));

					cateIdx++;
					
				} else {
					emotions[cateName].push(e);
				}
				
				if (e.is_hot)
				{
					hots.push(['<a href="#" rel="e:em" title="' ,e['phrase'] ,'"><img width="22px" height="22px" src="', e['url'] ,'" /></a>'].join(''))
				}
			});

			var faceHtml = [];

		    // 过滤重复表情
		    var hot = 0;
    		$.each(emotions['默认'], function(i, fc) {
    			if(fc['is_hot']) hot++;
    			if(!fc['is_hot'] || hot>15)
    			    faceHtml.push(['<a href="#" rel="e:em" title="' ,fc['phrase'] ,'"><img width="22px" height="22px" src="', fc['url'] ,'" /></a>'].join(''));
    		});

			if (hots.length > 15)
			{ //热门的只显示１５个
				hots = hots.slice(0, 15);
			}

			var assigns = {
				category: category.join(''),
				faces: faceHtml.join(''),
				hotList: hots.join('')
			};
			
			var $show = $(T.parse('EmotionBoxContent', assigns));

			this.jq('#xweibo_loading').hide();
			this.jq('#xwb_dlg_ct').append($show);

			this.$categorySelected = this.jq('#cate>a:first').addClass('current');
			this.$categoryShowed = this.jq('#flist0');

			this.emotions = emotions;
			this.cateMaps = cateMaps;
		}
	},

	// 创建表情显示区
	createEmArea: function(i) {

		var faces = this.cateMaps[i];
		var html = ['<div class="e-list" id="flist' + i + '">'];

		$.each(faces, function(i, fc){
			html.push(['<a href="#" rel="e:em" title="' ,fc['phrase'] ,'"><img width="22px" height="22px" src="', fc['url'] ,'" /></a>'].join(''));
		});

		html.push('</div>');

		return $(html.join(''));
	},
	
	//切换分类
	emSwitch: function(i, src) {
		var $src = $(src);
		var current = 'current';

		if ($src.hasClass(current))
		{
			return;
		}
		this.$categorySelected.removeClass(current);
		this.$categorySelected = $src.addClass(current);

		this.$categoryShowed.addClass(hideCls);

		if (i > 0)
		{
			this.jq('#hotEm').addClass(hideCls);
		} else {
			this.jq('#hotEm').removeClass(hideCls);
		}
			

		var $show = this.jq('#flist'+i);

		if (!$show.length)
		{
			$show = this.createEmArea(i).appendTo(this.jq('#box'));
		}

		this.$categoryShowed = $show.removeClass(hideCls);
	},

	// 加载表情数据
	loadEmotion: function() {
		var self = this;
		Req.getEmotion(function(r) {
			self.initEmotion(r);
		});
	},

	onViewReady: function() {
		this.loadEmotion();
	},
	
    // 定义如何获得表情文本
    findEmotionText : function(e){
        return e.src.title;
    }
});

// override function -> object
X.reg('emotion', inst, true);

return inst;
});

/**
 * @class Xwb.mod.forwardBox
 * 转发对话框
 * @extends Xwb.ui.Dialog
 * @singleton
 */
X.reg('forwardBox', function(){

var inst = X.use('Dlg', {
    cs : 'win-forward',
    appendTo : doc.body,
    autoCenter : true,
    dlgContentHtml : 'ForwardDlgContentHtml',
    title:'转发到我的微博',
    defBtn : 'forward',
    buttons : [
        {title:'转 发', id:'forward'},
        {title:'取 消', id:'cancel'}
    ],

    checkText : function(){
        var v = $.trim( this.jqInputor.val() );
        var left = Util.calWbText(v);
        if (left >= 0)
            this.jqWarn.html('您还可以输入'+left+'字');
        else
            this.jqWarn.html('已超出'+Math.abs(left)+'字');
        this.jqWarn.checkClass(exceedCS,left<0);
        return left>=0 && v;
    },
    
    
    onViewReady : function(){
        this.jq('#xwb_face_trig')
            .click(Util.bind( this.onFaceTrig, this ));
            
        this.jqInputor = this.jq('#xwb_fw_input');
        this.jqWarn    = this.jq('#xwb_warn_tip');
        this.jqContent = this.jq('#xwb_forward_text');
        this.jqLabelCt = this.jq('#xwb_fw_lbl');
        
        this.jqInputor.bind('keyup', Util.bind( this.onInputorKeyup, this ));
        this.selectionHolder = X.use('SelectionHolder', {elem:this.jqInputor[0]});
        this.atWho = X.use('atWho',{
            appendTo : doc.body,
            Inputor : this.jqInputor,
            autoRender : true
        });
    },
    
    onInputorKeyup : function(e){
        if(this.checkText()){
            // ctrl + enter post
            if(e.ctrlKey && ( e.which == 13||e.which == 10 ))
                this.submit();
        }
    },
    
    onFaceTrig : function(e){
        X.use('emotion')
         .setSelectionHolder( this.selectionHolder , this.checkText, this)
         .showAt(e.target);
        return false;
    },
    
    setContent : function(wbId, wbData, uid){
        
        this._predCfg = { id : wbId, data : wbData, uid : uid };
        
        // Make sure view node is created
        this.jq();
        
        var otherCmts = [], text, inputText;
        
        if( uid !== wbData.u.id )
            otherCmts.push( T.parse( 'ForwardDlgLabel', {uid:wbId, nick:wbData.u.sn}) );
        
        var rt = wbData.rt;
        if (rt) {
            text = rt.tx;
            inputText = '//@' + wbData.u.sn + ':' + wbData.tx;
            
            //if (rt.u.id != uid) 
                otherCmts.push( T.parse('ForwardDlgLabel', { uid: rt.id, nick: rt.u.sn }) );
        }
        else {
            text = wbData.tx;
            inputText = '';
        }
        
        this.jqContent.text( Util.escapeHtml( text ) );
        this.selectionHolder.setText( inputText );
        this.checkText();
        this.jqLabelCt.html( otherCmts.join('') );
        
        return this;
    },
    
    submit : function(){
        
        if( this.isLoading )
            return false;

        this.isLoading = true;
        
        var v = this.checkText();
        if( v  === '' ){
            v = '转发微博';
        }else if( !v ){
            this.jqInputor.focus();
            this.isLoading = false;
            return false;
        }
        
        var uids = [];
        this.jq('input[type="checkbox"]:checked').each(function(){
            uids[uids.length] = $(this).val();
        });
        
        var d = this._predCfg;
        Util.disable( this.getButton('forward') , true);
        Req.repost(d.id, v, uids.join(','), Util.getBind(this, 'onSubmitLoad'), { data : {_route:X.getModule() }});
    },
    
    onSubmitLoad : function( e ){
        
        Util.disable( this.getButton('forward') , false);
        this.close();
        // todo : 关闭在tip隐藏后
        if(e.isOk()){
            MB.tipOk('转发成功');
        }
        else MB.tipWarn(e.getCode() == '1040016' ? '抱歉，目前微博转发功能暂不可用，请联系网站管理员！': e.getMsg());
        this.isLoading = false;
    },
    
    onbuttonclick : function(bid){
        if( bid === 'forward' ){
            this.submit();
            return false;
        }
    }
});

X.reg('forwardBox', inst, true);

return inst;

});

/*!
 * 
 * http://flowplayer.org/tools/toolbox/flashembed.html
 *
 * Since : March 2008
 * Date  :    Wed May 19 06:53:17 2010 +0000 
 * modify by : guolianghu
 * opts.height 高 （必须）
 * opts.width 宽 (必须）
 * opts.id dom-id
 * opts.name dom-name
 * opts.src flash地址 （必须）
 * opts.nocache 禁用cache （可选）
 * opts.w3c 
 * 
 * conf: 配置  （可选）
 */ 
ui.getFlash = function(opts, conf) {
	var IE = $.browser.msie;

	opts = opts || {};
	
	/******* OBJECT tag and it's attributes *******/
	var html = '<object width="' + opts.width + 
		'" height="' + opts.height + 
		(opts.id ? '" id="' + opts.id: '') + 
		(opts.name ? '" name="' + opts.name: '') + '"';
	
	if (opts.nocache) {
		opts.src += ((opts.src.indexOf("?") != -1 ? "&" : "?") + Math.random());		
	}
	
	if (opts.w3c || IE) {
		html += ' data="' +opts.src+ '" type="application/x-shockwave-flash"';		
	} else {
		html += ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';	
	}
	
	html += '>'; 
	
	// nested PARAM tags
	if (opts.w3c || IE) {
		html += '<param name="movie" value="' +opts.src+ '" />'; 	
	} 
	
	// not allowed params
	opts.width = opts.height = opts.id = opts.w3c = opts.src = null;
	opts.onFail = opts.version = opts.expressInstall = null;
	
	for (var key in opts) {
		if (opts[key]) {
			html += '<param name="'+ key +'" value="'+ opts[key] +'" />';
		}
	}	

	// FLASHVARS 
	var vars = "";
	
	if (conf) {
		for (var k in conf) { 
			if (conf[k]) {
				var val = conf[k]; 
				vars += k +'='+ (/function|object/.test(typeof val) ? f.asString(val) : val) + '&';
			}
		}
		vars = vars.slice(0, -1);
		html += '<param name="flashvars" value=\'' + vars + '\' />';
	}
	
	html += "</object>";	
	
	return html;
}

ui.WbElement = X.reg('WbElement', Util.create(Base,{
	//this.$wb jQuery li微博对象
	//this.wbData 数据对象

	init: function() {
		Base.prototype.init.apply(this, arguments);

		this.picLoadState = 0;

		this.isFw = this.wbData.rt ? 1: 0;

		this.$preview = this.$wb.find('div.preview-img');

		//console.log(this);
	},

	playVideo: function(e) {
		var wid = e.get('w'),
		vid = e.get('i'),
		urls = X.mod.shortlink.getUrls(),
		info = urls[vid],
			
		width = this.$wb.find('div.feed-content').width() - 35,
			
		height = parseInt(width / 1.25),

		flash = ui.getFlash({
				src: info.flash,
				width: width,
				height: height,
				w3c: 1,
				id: 'sinaVideo_'+(+new Date()),
				quality: 'high',
				allowScriptAccess: 'always',
				wmode: 'transparent',
				allowFullscreen: 'true',
				flashvars: 'playMovie=true&auto=1'
			}); 

		if (this.$video)
		{
			this.$video.remove();
		}
		
		var selector,html,tpl;

		if (this.isFw)
		{
			selector = 'div.forward>p';
			tpl = 'VideoBoxForward';
		} else {
			selector = 'p.feed-main';
			tpl = 'VideoBox';
		}

		html = T.parse(tpl, {
			href: info.url,
			title: info.title,
			flash: flash
		});

		this.$video = $(html).insertAfter(this.$wb.find(selector));

		this.switchView('video', 1);
	},

	closeVideo: function() {
		this.switchView('video', 0);
	},

	loadPic: function() {
		this.picLoadState = 1;

		var self = this, wbData = this.wbData;

		var cfg = this.isFw ? {
			org: wbData.rt['op'],
			img: wbData.rt['mp']
		}: {
			org: wbData['op'],
			img: wbData['mp']
		};

//		cfg.fw = this.isFw;

		var $thumbImg = this.$thumbImg = this.$wb.find('img.zoom-move');

		this.$loadEl = $('<div class="loading-img"></div>').appendTo($thumbImg.parent());

		var tpl;

		if (this.isFw)
		{
			tpl = 'PictureBoxForward';
		} else {
			tpl = 'PictureBox';
		}

		this.$picBox = $(T.parse(tpl, cfg));

		//'<img src="{.img}" class="narrow-move">';
		var img = this.img = new Image();

		$(img).bind('load', function() {
			self.onPicLoaded();
		})
		.addClass('narrow-move')
		.attr('rel', 'e:zo')
		.attr('src', cfg.img);
	},

	onPicLoaded: function() {
		var conSelector = this.isFw ? 'div.forward': 'div.feed-content:first';
		var $container = this.$wb.find(conSelector),
			img = this.img,
			$picBox = this.$picBox;

		$container.css('visibility', hideCls);

		var width = this.$wb.find('div.feed-content').width() - 35;

		//图标追加到box对象
		$(img).appendTo($picBox.find('div[name=img]'));
		$container.children('div.preview-img').after($picBox);

		this.switchView('pic', 1);


		if (img.width > width)
		{
			if ($.browser.msie)
			{
				img.height = img.height * (width/img.width);
			}
			img.width = width;
		}

		$container.css('visibility', '');

//$(img).show();

		this.$loadEl.remove();
		

		this.picLoadState = 2;

	},
	
	//图片放大
	zoomIn: function() {
		if (this.picLoadState == 0) {
			this.loadPic();
		} else if (this.picLoadState == 2) {
			this.switchView('pic', 1);
		}
	},

	//还原缩略图显示
	zoomOut: function() {
		this.switchView('pic', 0);
	},

	//图片转向
	trun: function(pos) {
		$(this.img).imgRotate(pos)
	},

	// 切换显示区域
	switchView: function(type, isShow) {
		if (isShow)
		{
			if (type == 'pic')
			{
				this.$picBox.show();
		
				this.$video && this.$video.remove();
				this.$video = null;

			} else if(type == 'video') {
				this.$video.show();
				this.$picBox && this.$picBox.hide();
			}

			this.$preview.hide();
		} else {
			if (type == 'pic')
			{
				this.$picBox && this.$picBox.hide();
			} else if (type == 'video')
			{
				this.$video && this.$video.remove();
				this.$video = null;
			}

			this.$preview.show();
		}
		

	}
}));

/**
 * @class Xwb.mod.CmtBox
 * 页面内的评论框
 * @extends Xwb.ui.Base
 */
// pCt 接口方法：afterSend, postWeibo
mod.CmtBox = X.reg('CmtBox', Util.create(Base, {
    actionMgr : true,
    view : 'CmtBox',
    exceedCS : 'over-limit',
    autoH : true,
    wbUid : null,
    headPicType:1,
    innerViewReady : function( v ){
		this.wbUid = X.getUid();

        Base.prototype.innerViewReady.call(this, v);
        this.jqExtra('inputor', 'warn', 'sync');
        this.selectionHolder = X.use('SelectionHolder', {elem:this.jqInputor[0]});
        var self = this;
        this.jqInputor
        .bind('keyup', function(e){
             self.onInputorKeyup(e);
        });
        
        
        this.atWho = X.use('atWho',{
        	appendTo:doc.body,
        	Inputor : this.jqInputor,
        	autoRender : true
        });

    },
    
    reset : function(){
        this.getView();
        this.selectionHolder.setText('');
        this.jqSync.attr('checked', false);
        this.checkText();
    },
    

    checkText : function(){
        var ipt = this.jqInputor, val = $.trim( ipt.val() );
        var left = Util.calWbText(val,70);
        var jqWarn = this.jqWarn;
        if (left >= 0)
            jqWarn.html('还可以输入'+left+'个字');
        else
            jqWarn.html('已超出'+Math.abs(left)+'个字');

        jqWarn.checkClass(this.exceedCS,left<0);
        
        // 检查高度，自动适应
        if( this.autoH && ipt.height() !== ipt[0].scrollHeight ) 
            ipt.height(ipt[0].scrollHeight);
 
        return left>=0 && val;
    },
    
    
    send : function(){
        if(!this.sending){
            var v = this.checkText();
            if( !v )
                setTimeout( Util.bind(function() { this.jqInputor.focus();}, this), 0 );
            else {
                if(this.sndBtn) 
                    Util.disable( this.sndBtn , true );
                this.sending   = true;
                var replyCmtId = this.jqInputor.data('xwb_reply_cid');
                if( replyCmtId && /^回复@.*?:/.test(v) )
                    Req.reply(
                      this.wbId, 
                      replyCmtId, 
                      v, 
                      this.jqSync.attr('checked')?1:0, 
                      this.headPicType, 
                      Util.getBind(this, 'onSendLoad'),
                      { data:{_route:X.getModule()} }
                    );
                else Req.comment( 
                      this.wbId, 
                      v, 
                      this.jqSync.attr('checked')?1:0, 
                      this.headPicType, 
                      Util.getBind(this, 'onSendLoad'),
                      { data:{_route:X.getModule()} }
                     );
            }
        }
    },
    
    onSendLoad : function( e ){
        if( e.isOk() ){
            this.pCt.afterSend(e);
            this.reset();
            // 同时发一条微博
            var data = e.getData();
            if( data.html ){
                this.pCt.postWeibo(data.wb, data.html);
            }
        }else {
            MB.tipWarn(e.getCode() == 1040016 ? '抱歉，目前评论功能不可用，请联系网站管理员！': e.getMsg());
        }
        if(!this.pCt.afterNofocus)
        	this.jqInputor.focus();
        if(this.sndBtn) 
            Util.disable( this.sndBtn , false);
        this.sending = false;
    },
    
    reply : function(cmtId, nick){
        var holder = this.selectionHolder, 
            jq     = this.jqInputor,
            rex    = /^回复@.*?:/;
        this.reset();
        holder.setText('回复@' + nick + ':' + jq.val().replace(rex, ''));
        jq.data('xwb_reply_cid', cmtId);
        this.checkText();
        setTimeout(function(){ holder.focusEnd(); }, 0);
    },
    
    onFaceTrig : function(e){
        X.use('emotion')
         .setSelectionHolder( this.selectionHolder , this.checkText, this)
         .showAt(e.src);
        return false;
    },
        
    onInputorKeyup : function(e){
        if(this.checkText()){
            // ctrl + enter post
            if(e.ctrlKey && ( e.which == 13||e.which == 10 ))
                this.send();
        }
    },
    
    onactiontrig : function(e){
        switch ( e.data.e ){
            // 点击图标
            case 'ic' :
                this.onFaceTrig(e);
                break;
                
            // 点击评论按钮
            case 'sd' :
                if(!this.sndBtn)
                    this.sndBtn = e.src;
                this.send();
                break;
        }
    }
}));

/**
 * @class Xwb.mod.CommentArea
 * 页面内的单条微博的评论区域
 * @extends Xwb.ui.Base
 */
// parent container interface :
// function:afterSend
// postWeibo
mod.CommentArea = X.reg('CmtArea', Util.create(Base, {
    
    view : 'CommentArea',
    
    readSize : 10,
    
    cmtType : 1,
    
    hdPicSz : 30,
    
    cmtCount : 0,
    
    page : 1,
    
    cmtPageSz : 20,
	
    // html
    cmtBoxHtml:'CmtBox',
    commentHtml : 'Comment',
    // 开启action点击监听
    actionMgr : true,
    cmtBox : 'CmtBox',
    
    initUI : function(){
        // prepare for templting
        this.cmtUrl = Req.mkUrl('show', '', 'id='+this.wbId);
        this.jqExtra('pre','first','next');
        Base.prototype.initUI.call(this);
    },
    
    getFromUser : function(){
        if(!this.wbUid) {
		  var wb = getWb(this.wbId);
          this.wbUid = wb && wb.u.id;
		}
        return this.wbUid;
    },
    
    innerViewReady : function( v ){
       Base.prototype.innerViewReady.call(this, v);
       this.jqExtra('cmtCt', 'more', 'lefCnt');
       this.initCmtBox();
    },
    
    decorateLoading : function(){
        if( this.isLoading ){
            $(T.get('Loading')).appendTo(this.getView().parentNode);
        }else $(this.getView().parentNode).find('#xweibo_loading').remove();
        this.display(!this.isLoading);
    },
    
    initCmtBox : function(){
       this.cmtBox    = X.use('CmtBox', {
            view : this.jq('#cmtBox')[0],
            wbId : this.wbId,
            pCt  : this,
            headPicType : this.hdPicSz==30?1:2
       });
       this.cmtBox.getView();

    },
    
    load : function(callback){
        // 确保view已创建
        this.getView();
        if( !this.isLoading ){
            this.isLoading = true;
            this.decorateLoading();
            callback && ( this.onload = callback );
            Req.getComments(this.wbId, this.page, this.cmtType,  Util.getBind(this, 'onCmtsLoad'));
        }
    },
        
    // callback by cmtBox
    postWeibo : function(wbData, htmls){
       // X.fire('wb.create', {data:wbData, html:htmls});
    },
    
    // callback by cmtBox
    afterSend : function(e){
        var jq = $(this.createCmtUI(e.getData().comment));
        this.jqCmtCt.prepend( jq );
        this.jqCmtCt.cssDisplay(true);
        this.updateCmtCountUI(1, true);
        // 解析评论里的短链接
        X.mod.shortlink.render(jq, function(urlInfo, aHref){
            aHref.title = urlInfo && urlInfo.url || '无效链接';
        });
    },
    
    // 评论返回后
    onCmtsLoad : function( e ){
        
        if( e.isOk() ){
            this.createListUI( e );
			var total = e.getData().total;
            total && this.updateCmtCountUI( total );
            this.updateCmtPageUI(e.getData());
        }
        
        this.isLoading = false;
        this.decorateLoading();
        if( this.onload )
            this.onload( e );
        /*
        console.log('CommentArea init')    ;
        
        this.atWho = X.use('atWho',{
        	appendTo:doc.body,
        	Inputor : this.cmtBox.jqInputor,
        	autoRender : true
        });
        */
    },
    
    // 创建评论列表
    createListUI : function( e ){
        this.jqCmtCt.empty();
        var listData = e.getData();
        var lef = listData.total - Math.min( listData.limit, listData.total );
        var htmls = [];
        e.each(function(cmt){
            htmls[htmls.length] = this.createCmtUI(cmt);
        }, this);
        
        if(htmls.length){
            this.jqCmtCt.html( htmls.join('') );
            if( lef ){
                this.jqMore.cssDisplay(true);
                this.jqLefCnt.text(lef);
            }else this.jqMore.cssDisplay(false);
            this.jqCmtCt.cssDisplay(true);
        }else {
            this.jqCmtCt.cssDisplay(false);
            this.jqMore.cssDisplay(false);
        }
        // 解析评论里的短链接
        X.mod.shortlink.render(this.jqCmtCt, function(urlInfo, aHref){
            aHref.title = urlInfo && urlInfo.url || '无效链接';
        });
    },
    
    createCmtUI : function(cmt){
        var wbUid = this.getFromUser(),
			UID = getUid();
        cmt.verifiedHtml = cmt.user.verified_html;
        cmt.usrUrl= cmt.user.profileUrl;
        cmt.picSz = this.hdPicSz;
        cmt.time  = cmt.create_at;
        if (wbUid === UID || cmt.uid === UID)
            cmt.canDel = true;
        return T.parse( this.commentHtml, cmt );
    },
    
    updateCmtPageUI : function(pageInfo){
        // 如果存在分页按钮
        if(this.jqPre.length){
            this.jqPre.cssDisplay(this.page !== 1);
            // 第三页后显示首页按钮
            this.jqFirst.cssDisplay(this.page >= 3);
            this.jqNext.cssDisplay(pageInfo.total != 0);
        }
    },
    
    updateCmtCountUI : function(count, cal){
        if( this.trigEl ){
            if(cal===undefined){
                $ (this.trigEl).text('评论('+count+')');
                this.cmtCount = count;
            }else { 
                this.cmtCount += count;
                $ (this.trigEl).text('评论('+this.cmtCount+')');
            }
        }
    },
    
    onactiontrig : function(e){
        switch ( e.data.e ){
            // 点击回复
            case 'rp' :
                this.onReplyTrig(e);
                break;
            case 'dl':
                this.onDelTrig(e);
                break;
            case 'nx' :
                this.goPage(this.page+1);
                break;
            case 'pr' :
                this.goPage(this.page-1);
            break;
            case 'fi':
                this.goPage(1);
            break;
        }
    },
    
    onDelTrig : function(e){
        var self = this;
        MB.anchorConfirm(e.src, '确定要删除该评论吗？', function(bid){
            if(bid === 'ok' && !self.deletingCmt){
                self.deletingCmt = true;
                Req.delComment(e.get('c'), function(re){
                    var cmtEl = e.getEl('c');
                    if(re.isOk()){
                        $(cmtEl).remove();
                        self.updateCmtCountUI(-1, true);
                        if(self.cmtCount == 0)
                            self.cmtBox.jqInputor.focus();
                    }else MB.tipError(re.getMsg());
                    self.deletingCmt = false;
                });
            }
        });
    },
    
    onReplyTrig : function( e ){
        var jq = this.jq();
        var off = this.offsetsTo(window);
        if(off[1] < 0){
            //跳到可视范围
            //增强体验
            if(jq[0].scrollIntoView)
                jq[0].scrollIntoView();
        }
        var cmtId = e.get('c'),
            nick  = e.get('n');
        this.cmtBox.reply(cmtId, nick);
    },
    
    goPage : function(page){
        if(this.topCmtBox.getView().scrollIntoView)
            this.topCmtBox.getView().scrollIntoView();
        this.page = page;
        this.load();
    }
}));

/**
 * @class Xwb.mod.MBlogCmtArea
 * 具体微博的评论区域
 * @extends Xwb.mod.CommentArea
 */
mod.MBlogCmtArea = X.reg('MBlogCmtArea', Util.create(mod.CommentArea, {
    
    commentHtml:'MBlogCmt',

	cmtType: 2,
	
	hdPicSz : 50,
    
    // override
    createListUI : function(e){
        this.jqCmtCt.empty();
        var listData = e.getData();
        var htmls = [];

		var facesize = this.faceSize;

        e.each(function(cmt){
			if (facesize){
				cmt.profileImg = cmt.profileImg.replace('/30/', '/'+facesize+'/');
			}

            htmls[htmls.length] = this.createCmtUI(cmt);
        }, this);
        
        this.cmtCount = htmls.length;
        
        if(htmls.length){
            this.jqCmtCt.html( htmls.join('') );
            this.jqCmtCt.cssDisplay(true);
        }else {
            this.jqCmtCt.cssDisplay(false);
            this.jqMore.cssDisplay(false);
        }
        // 解析评论里的短链接
        X.mod.shortlink.render(this.jqCmtCt, function(urlInfo, aHref){
            aHref.title = urlInfo && urlInfo.url || '无效链接';
        });
    },
    
    initCmtBox : function(){
       this.cmtBox    = X.use('CmtBox', {
            wbId : this.wbId,
            pCt  : this,
            view : 'MBCmtBox',
            headPicType : this.hdPicSz==30?1:2
       });
       this.cmtBox.getView();
       this.topCmtBox = X.use('CmtBox', {
            wbId : this.wbId,
            pCt  : this,
            autoH : false,
            view : this.topCmtBox,
            headPicType : this.hdPicSz==30?1:2
       });
       this.topCmtBox.getView();
    },
    
    updateCmtCountUI : $.noop,
    
    onReplyTrig : function(e){
       this.cmtBox.jq().insertAfter( e.jq('c').find('#trigs') );
        var cmtId = e.get('c'),
            nick  = e.get('n');
        this.cmtBox.display(true).reply(cmtId, nick);
    },
    
    // callback by cmtBox, override
    postWeibo : $.noop,
    
    // callback by cmtBox
    afterSend : function(e){
        var jq = $(this.createCmtUI(e.getData().comment));
        this.jqCmtCt.prepend( jq ).cssDisplay(true);
        this.cmtBox.display(false);
        this.topCmtBox.jqInputor.focus();
        // 解析评论里的短链接
        X.mod.shortlink.render(jq, function(urlInfo, aHref){
            aHref.title = urlInfo && urlInfo.url || '无效链接';
        });
    },
    
    onload : function(){
        this.jq('#pager').cssDisplay(true);
        this.topCmtBox.jqInputor.focus();
    }
}));

/**
 * @class Xwb.mod.videoBox
 * 视频地址输入框，目前用于发布微博功能。
 * @extends Xwb.ui.Box
 * @singleton
 */
X.reg('videoBox', function(){

var inst = X.use('Box', {
  	cs:' win-insert',
  	contentHtml:'MediaBoxContentHtml',
  	boxOutterHtml:'ArrowBoxBottom',
  	appendTo:doc.body,
  	actionMgr : true,
    closeable : true,
  	contextable : true,
  	onViewReady:function(v){
  		this.jqInputor = this.jq('#xwb_inputor');
  		this.jqTip     = this.jq('#xwb_err_tip');
  		this.selectionHolder = X.use('SelectionHolder', {elem:this.jqInputor[0]});
  	},

  	onactiontrig : function( e ){
  		switch(e.data.e){
  			case 'ok':
                var v = this.checkText();
                if( v ){
                    this.onselect && this.onselect(v);
                    this.close();
                }else this.jqInputor.focus();
  			break;
  			// cancel
  			case 'cc':
  				this.close();
  			break;
  			// normal link
  			case 'nm':
  				this.onselect && this.onselect($.trim(this.jqInputor.val()));
  				this.close();
  			break;
  		}
  	},
  	/**
  	 * 验证输入框
  	 */
  	checkText : function(){
  	    var jqInputor = this.jqInputor, 
  	        holder = this.selectionHolder,
  	        v = $.trim(jqInputor.val());
  	    if(v == '' || v == 'http://'){
  	        setTimeout(function(){
  	            jqInputor.focus();
  	            holder.setText('http://');
  	            jqInputor.select();
  	        });
  	        return false;
  	    }else if(!this.checkUrl(v)){
  	        this.jqTip.cssDisplay(true);
  	        return false;
  	    }
  	    return  v;
  	},
  	
  	
    checkUrl : function(url){
        return url.indexOf('http://') === 0;
    },
    
    showAt : function(anchor, onselect){
        this.onselect = onselect;
        var off = $(anchor).offset();
        off.left -= 140;
        off.top += 20;
        this.offset(off)
            .display(true);
        var self = this;
        setTimeout( function(){
            self.selectionHolder.setText('http://');
            self.jqInputor.focus();
            self.jqInputor[0].select();
        }, 0);
        this.jqTip.cssDisplay(false);
    }
});

X.reg('videoBox', inst, true);

return inst;

});

/**
 * @class Xwb.mod.musicBox
 * 音乐地址输入框，目前用于发布微博功能。
 * @extends Xwb.ui.Box
 * @singleton
 */
X.reg('musicBox', function(){

var inst = X.use('Box', {
  	cs:' win-insert',
  	contentHtml:'MusicBoxContentHtml',
  	boxOutterHtml:'ArrowBoxBottom',
  	appendTo:doc.body,
    closeable : true,
  	actionMgr : true,
  	contextable : true,
  	onViewReady:function(v){
  		this.jqInputor = this.jq('#xwb_inputor');
  		this.jqTip     = this.jq('#xwb_err_tip');
  		this.selectionHolder = X.use('SelectionHolder', {elem:this.jqInputor[0]});
  	},

    
  	checkText : function(){
  	    var jqInputor = this.jqInputor,
  	        v = $.trim(jqInputor.val()),
  	        holder = this.selectionHolder;
  	        
  	    if(v == '' || v == 'http://'){
  	        setTimeout(function(){
  	            jqInputor.focus();
  	            holder.setText('http://');
  	            jqInputor[0].select();
  	        });
  	        return false;
  	    }else if(!this.checkUrl(v)){
  	        this.jqTip.cssDisplay(true);
  	        return false;
  	    }
  	    return  v;
  	},
  	
  	checkUrl : function(url){
        return url.indexOf('http://') === 0;
  	},
  	
  	onactiontrig : function( e ){
  		switch(e.data.e){
  			case 'ok':
                var v = this.checkText();
                if( v ){
                    this.onselect && this.onselect(v);
                    this.close();
                }else this.jqInputor.focus();
  			break;
  			// cancel
  			case 'cc':
  			    this.onselect && this.onselect();
  				this.close();
  			break;
  			// normal link
  			case 'nm':
  				this.onselect && this.onselect($.trim(this.jqInputor.val()));
  				this.close();
  			break;
  		}
  	},
  	
    showAt : function(anchor, onselect){
        this.onselect = onselect;
        var off = $(anchor).offset();
        off.left -= 140;
        off.top += 20;
        this.offset(off)
            .display(true);
        var self = this;
        setTimeout( function(){
            self.selectionHolder.setText('http://');
            self.jqInputor.focus();
            self.jqInputor[0].select();
        }, 0);
        this.jqTip.cssDisplay(false);
    }
});

X.reg('musicBox', inst, true);

return inst;
});

mod.atWho = X.reg('atWho',Util.create(ui.Layer,{
	view: 'atwho',
	now : 0,
	length :0,
	key : '',
	atWhoShow : 0,
//	cache:[],
	oldXhr : null,
    //@字符所在位置
    flagAt : null,
    
    //是否正在使用
    useable : 1,
    
    //设置或者取得使用状态
    run : function(makeuse) {
        if (makeuse === undefined) 
            return this.useable;
            
        this.useable = makeuse;
    },
    
	onViewReady : function(){
		var self = this;
		this.Inputor        
		.bind('keyup', function(e){
	        self.showWho(e);
	    })
	    .bind('keydown',function(e){
	        return self.onkeydown(e);
	    })
        
		.bind('focus', function(e) {
			self.showWho(e);
		})

		.bind('click' ,function(e){
			self.showWho(e);
		})

		.bind('blur', function() {
			 if(self.atWhoShow){
			 this.TimeoutID=setTimeout(function(){
					self.display(false);
					self.atWhoShow = false;},150);
			 }
		});

		this.jq('#mainUL').click(function(e){
			if(e.target.tagName == 'LI'){
                self.choose();
			}
		});
		this.jq('#mainUL').mousemove(function(e){
			if(e.target.tagName == 'LI'){
				$(this).find('li:eq('+ self.now +')').removeClass('cur');
				$(e.target).addClass('cur');
				self.now = $(this).find('li').index(e.target);
			}
		});
	},
    //延时计时器
    //trigTimer : null,
    
    //延时时长 (ms)
    //delay : 100,
    
	showWho:function(e){
        if (!this.run()) return;
        
		var key=this.getKey(this.Inputor[0]);
		if (__debug) console.log(key);
		this.txtobj = key;
		if( key ){
			if(key.text == this.key ) return;
			this.reload( key.text );
		} else {
			this.key = "";
			this.length= 0 ;
			this.display(false);
		}
	},
	onkeydown : function(e){
        if (!this.atWhoShow){
            return;
        }
        
		switch(e.keyCode){
			//上
			case 38 : 
				if(this.now == 0) return false;
				//this.jq('#mainUL li:eq('+( this.now-1 )+')').addClass('cur');
				this.jq('#mainUL li:eq('+ this.now +')')
                    .removeClass('cur')
                    .prev()
                    .addClass('cur');
				this.now--;
				return false;
				break;
			//下
			case 40 : 
				if(this.now+1 == this.length) return false;
				//this.jq('#mainUL li:eq('+( this.now+1 )+')').addClass('cur');
				this.jq('#mainUL li:eq('+ this.now +')')
                    .removeClass('cur')
                    .next()
                    .addClass('cur');
				this.now++;
				return false;
				break;
			case 13 :
				if(this.length != 0){
                    this.choose();
					this.display(false);
				}
				return false;
				break;
			default :return true;
		}
	},
    
    //选取一个数据内容
    choose : function(idx) {
        var inputor = this.Inputor,
            selHolder = inputor.data('xwb_selholder'),
            idx = idx || this.now,
            key = this.key,
            rows = this.cache(key);
            
        if (!rows || !rows.length) return;
        
        var data = rows[idx],
            nickname = this.format(data),
            txtobj = this.txtobj;
        
        this.run(0);
        
        if( selHolder ){
            selHolder.replaceString(nickname, txtobj.form, txtobj.to);
        } else {
            this.Inputor.val(Util.stringReplace(inputor.val(), nickname,txtobj.form, txtobj.to))
            Util.setCursor(inputor[0] , txtobj.form + nickname.length )
        }
        
        this.afterChoose();
        
        this.run(1);
    },
    
    //选中后的动作
    afterChoose : $.noop,
    
    //转换格式
    format : function(row) {
        return row.nickname + ' ';
    },
    
	//搜索关键字
	getKey:function(elem,val){
		var now = Util.getCursorPos(elem),
			val = elem.value,
			nowchar = val.substring(now-1,now),
			text = "";
		if( this.noAt === true ) {
			if(val.length !== 0){
				this.flagAt = 0;
				return {text:val,form:0,to:val.length};
			} else {
				return false;
			}
		}
		if(nowchar == ' ' || nowchar == '@' ) 	return false;
		for(var i=now;i>0;i--){
			if(val.substring(i,i-1) == ' ') return false; //搜索中途遇到空格终止搜索
			if(val.substring(i,i-1) == '@'){ //遇到@确认关键字
				text = val.substring(i,now);
				if(val.length > now){  //如果现在的光标不在最后那么我们延伸关键字（到下一空格是不是我们选择出来的）
					for(var j=now+1;j<=val.length;j++){
						if(val.substring(j,j-1) == ' ' || j == val.length){
							var key = val.substring(i,val.substring(j,j-1) == ' ' ? j-1 : j );
							$(this.data).each(function(){
								if(key == this.nickname){
									now = j;
								}
							})
						}
					}
				}
                
                this.flagAt = i;
                if(text.length > 20 ) return false;
				return {text:text,form:i,to:now};
			}
		}	
		return false;
		
	},
    
    //调整浮层位置
    rePosition : function() {
        var offset = Util.getCursorOffset(this.Inputor, this.flagAt-1);
        if (offset) {
            var ipOffset = this.Inputor.offset();
            var st = this.Inputor.scrollTop();
            
            var line_h = parseInt($(this.Inputor).css('lineHeight'));

            if (isNaN(line_h)) {
                line_h = 20;
            }
            
            //scrollTop 偏移量
            var stOffset = line_h - st;
            
            this.jq().css({
                top : ipOffset.top + offset.top + stOffset,
                left : ipOffset.left + offset.left
            });
        }
        
        return this;
    },
    
    onResize : $.noop,
    
    //显示前调整位置
    beforeShow : function() {
        this.rePosition();
        ui.Layer.prototype.beforeShow.apply(this, arguments);
    },
    
    //显示后监听resize事件
    afterShow : function() {
        if (__debug) {
            console.log('atWho: listen resize event.');
        }
        this.onResize = Util.bind(this.rePosition, this);
        $(window).resize(this.onResize);
        
        ui.Layer.prototype.beforeShow.apply(this, arguments);
        
        this.atWhoShow = 1;
    },
    
    //隐藏后取消监听resize事件
    afterHide : function() {
        if (__debug) {
            console.log('atWho: unlisten resize event.');
        }
        
        $(window).unbind('resize', this.onResize);
        
        this.atWhoShow = 0;
        ui.Layer.prototype.afterHide.apply(this, arguments);
    },
    
    //对关键字加黑
    highlight : function(txt, search) {
        return txt.replace(search, '<b>' + search + '</b>');
    },
    
    //显示用户列表
    showUser : function(userlist) {
    	this.length = userlist.length;
        this.data = userlist;
        
        if (!userlist || !userlist.length) {
            return this.display(0);
        }
        
        var ul = [], highlight = this.highlight ,self = this;
        
        $.each(userlist, function(i, usr){
            var remark = usr.remark,
                nickname = usr.nickname,
                eleHtml = '<li>' + highlight(usr.nickname , self.key);
                
            if (remark) {
                eleHtml = eleHtml + '(' + highlight(remark , self.key) + ')';
            }
            
            eleHtml += '</li>';

            ul.push(eleHtml);
        });
        
        this.now = 0
        
        this.jq('#mainUL')
            .html(ul.join(''))
            .find(':first-child')
            .addClass('cur');
            
        if (this.display()) {
            this.rePosition();
        }
        this.display(1);
    },
    
    //查询完成后回调
    loaded : function(e) {
        if (e.isOk()) {
            var rst = e.getData();
            this.cache(rst.key, rst.data);
            this.showUser(rst.data);
        }
    },
    
	//请求关键字
	reload : function(key){
		this.key = key;
		var rst= this.cache(this.key);
		if (__debug) console.log('seach:',key,'return:',rst,'cache:',mod.atWho.cache);
		if( rst !== undefined ) { 
			this.showUser(rst);
		} else { 
            if( this.oldXhr && (this.oldXhr.readyState !== 4 || this.oldXhr.status !== 200) )this.oldXhr.abort();
			this.oldXhr = Req.q(Req.apiUrl('action','getAtUsers'),{ keyword:this.key },Util.getBind(this,'loaded'));
		}
	},
	//根据关键字搜索或存储缓存
	cache : function(key, data){
        if (data === undefined)
            return mod.atWho.cache[key];
            
        mod.atWho.cache[key] = data;
	}
}));
//atWho查询缓存
mod.atWho.cache = {};
/**
 * @class Xwb.mod.PostBase
 * 发布微博功能基类，
 * 所有属性和方法被复制到子类，子类初始化后调用{@link #initEx}方法初始化基类。
 */

/**
 * @cfg {Function} beforeSend 发布微博前回调，回调参数为 posebase.beforeSend(text, this.uploadPic, requestParams)，如果需更改text内容，请在beforeSend返回text内容。
 * beforeSend 返回 false时取消发布。
 * 可在requestParams里丰富提交参数，也可以在{@link #param}属性增减提交参数，它们是同一对象。
 */
/**
 * @cfg {Object} param，可指定该属性设置每次发布微博时的提交参数，初始化后可往该属性动态添加或减少提交参数。
 */
mod.PostBase = {
    
    actionMgr : true,
    
    //输入框内的默认文字
    defText : '',

    initEx : function(){
        var jqInputor = this.jqInputor = this.jq('#xwb_inputor');
        var jqSendBtn = this.jqSendBtn = this.jq('#xwb_send_btn');
		var jqInputorParent = this.jq(this.focusEl||'#focusEl');
        
        this.jqWarn      = this.jq('#xwb_word_cal');
        this.jqImgFile   = this.jq('#xwb_img_file');
        this.jqBtnImg    = this.jq('#xwb_btn_img');
        this.jqUploadTip = this.jq('#xwb_upload_tip');
        this.jqPhotoName = this.jq('#xwb_photo_name');
        this.jqForm      = this.jq('#xwb_post_form');
        this.$uploadBtn  = this.jq('#uploadBtn');
        
        this.selectionHolder = X.use('SelectionHolder', {elem:this.jqInputor[0]});
        
        var self = this;
        
        this.jqImgFile.change(function(e){
            self.onImgFileChange(e);
        });
        
        if( this.btnHoverCS )
            jqSendBtn.hover(
                function(){ jqSendBtn.addClass(self.btnHoverCS); }, 
                function(){ jqSendBtn.removeClass(self.btnHoverCS); }
            );

        this.atWho = X.use('atWho',{
        	appendTo:doc.body,
        	Inputor : jqInputor,
        	autoRender : true
        });
        
        jqInputor
        .bind('keyup', function(e){
            self.onInputorKeyup(e);
        })
		.bind('focus', function(e) {
			jqInputorParent.addClass('post-focus');
		})
		.bind('blur', function() {
			jqInputorParent.removeClass('post-focus');
		});
    },

    getUploader : function(){
        if(!this.uploader)
            this.uploader = X.use('Uploader', {
                form:this.jqForm[0], 
                action : Req.mkUrl('api/weibo/action', 'upload_pic'),
                onload:Util.getBind(this, 'onUploadLoad')
            });
        return this.uploader;
    },
    
    reset : function(){
        this.jqUploadTip.cssDisplay(false);
        this.jqPhotoName.cssDisplay(false);
        //this.jqBtnImg.cssDisplay(true);
        //this.jqForm.cssDisplay(true);
        this.$uploadBtn.cssDisplay(1);
        this.selectionHolder.setText(this.defText);
        this.jqForm[0].reset();
        this.uploadPic = false;
        this.checkText();
        this.sending = false;
        return this;
    },
    
    onactiontrig : function(e){
        switch(e.data.e){
            case 'sd' :
                this.post();
                break;
            case 'ic' :
                X.use('emotion')
                 .setSelectionHolder( this.selectionHolder , this.checkText, this)
                 .showAt(e.src);
            break;
            case 'vd' :
                 X.use('videoBox')
                  .showAt(e.src, Util.getBind(this, 'onBoxTextReturn'));
            break;
            case 'ms' :
                  X.use('musicBox')
                   .showAt(e.src, Util.getBind(this, 'onBoxTextReturn'));
            break;
            case 'tp' :
                this.insertTopic();
            break;
            // 删除已上传图片
            case 'dlp':
                this.uploadPic = false;
                //this.jqBtnImg.cssDisplay(true);
                //this.jqForm.cssDisplay(true);
                this.$uploadBtn.cssDisplay(1);
                this.jqPhotoName.cssDisplay(false);
                this.jqInputor.focus();
                break;
        }
    },
    
    onBoxTextReturn : function(text){
        if(text)
            this.selectionHolder.insertText(text);
        this.checkText();
    },
    
    checkText : function(){
        var v = $.trim( this.jqInputor.val() );
        var left = Util.calWbText(v);
        if (left >= 0)
            this.jqWarn.html('您还可以输入<span>'+left+'</span>字');
        else
            this.jqWarn.html('已超出<span>'+Math.abs(left)+'</span>字');
            
        this.jqWarn.checkClass(exceedCS,left<0);     
        return left>=0 && v;
    },
    
    checkImg : function(fileName){
		var pieces = fileName.split('.');
		return pieces.length && $.inArray(pieces.pop().toLowerCase(), ['jpg', 'png', 'gif','jpeg']) !== -1;
    },
    
    onInputorKeyup : function(e){
        if(this.checkText()){
            // ctrl + enter post
            if(e.ctrlKey && ( e.which == 13||e.which == 10 ))
                this.post();
        }
    },
    
    TOPIC_TIP : '请在这里输入自定义话题',
    
    insertTopic : function(topic){
        if(!topic)
            topic = this.TOPIC_TIP;
        var inputor = this.jqInputor[0];
        var hasCustomTopic = new RegExp('#'+this.TOPIC_TIP+'#').test(inputor.value);
        var text = topic, start=0,end=0;
        
        inputor.focus();
        
        if (document.selection) {
            var cr = document.selection.createRange();
            //获取选中的文本
            text = cr.text || topic;
        
            //内容有默认主题，且没选中文本
            if (text == topic && hasCustomTopic) {
                start = RegExp.leftContext.length + 1;
                end   =   topic.length;
            }
            //内容没有默认主题，且没选中文本
            else if(text == topic) {
                cr.text = '#' + topic + '#';
                start = inputor.value.indexOf('#' + topic + '#') + 1;
                end   = topic.length;
            }
            //有选中文本
            else {
                cr.text = '#' + text + '#';
            }
        
            if (text == topic) {
                cr = inputor.createTextRange();
                cr.collapse();
                cr.moveStart('character', start);
                cr.moveEnd('character', end);
            }
        
            cr.select();
        }
        else if (inputor.selectionStart || inputor.selectionStart == '0') {
            start = inputor.selectionStart;
            end = inputor.selectionEnd;
        
            //获取选中的文本
            if (start != end) {
                text = inputor.value.substring(start, end);
            }
        
            //内容有默认主题，且没选中文本
            if (hasCustomTopic && text == topic) {
                start = RegExp.leftContext.length + 1;
                end = start + text.length;
            }
            //内容没有默认主题，且没选中文本
            else if (text == topic) {
                inputor.value = inputor.value.substring(0, start) + '#' + text + '#' + inputor.value.substring(end, inputor.value.length);
                start++;
                end = start + text.length;
            }
            //有选中文本
            else {
                inputor.value = inputor.value.substring(0, start) + '#' + text + '#' + inputor.value.substring(end, inputor.value.length);
                end = start = start + text.length + 2;
            }
        
            //设置选中范
            inputor.selectionStart = start;
            inputor.selectionEnd = end;
        }
        else {
            inputor.value += '#' + text + '#';
        }
        
        this.checkText();
        this.selectionHolder.saveSpot();
    },
    
    post : function(){
        var text = this.checkText();
        
        if(!text){
            this.jqInputor.focus();
            return;
        }

        if( this.getUploader().isLoading() ){
            MB.tipWarn('图片正在上传，请稍候..');
            return;
        }
        
        if(this.sending){
            MB.tipWarn('正在发布,请稍候..');
            return;
        }
        
        var param = $.extend({}, this.getParam());
        
        if(this.beforeSend){
            var ret = this.beforeSend(text, this.uploadPic, param);
            if(ret === false)
                return;
            text = ret || text;
        }
        
        this.sending = true;
        // 传递当前页面标识_route，以返回不同HTML内容
        Req.post(text, Util.getBind(this, 'onSendLoad'), this.uploadPic, { data : param});
    },
    
    /**
     * 返回发布微博时额外的提交参数。
     * @private
     */
    getParam : function(){
        var param = this.param;
        if(!param)
            param = this.param = {};
        if(!param._route)
            param._route = X.getModule();
        return param;
    },
    
    onImgFileChange : function(){
        var jq = this.jqImgFile;
        var fn = jq.val(), self = this;
        
        this.uploadPic = null;
        
        if( !fn || !this.checkImg(fn) ){
            this.jqForm[0].reset();
            MB.alert('', '只支持 jpg、png、gif格式的图片。', function(){
                self.jqInputor.focus();
            });
            return ;
        }
        this.jq('#xwb_upload_tip').cssDisplay(true);
        //this.jqForm.cssDisplay(false);
        //this.jqBtnImg.cssDisplay(false);
        this.$uploadBtn.cssDisplay(0);
        // add submit disabled class
	    this.getUploader().upload();
    },
    
    onUploadLoad : function(e){
        if( e.isOk() ){
            var data = e.getData();
            this.uploadPic = data.msg;
            this.jqPhotoName.html(Util.getFileName(this.jqImgFile.val(), 10) + T.get('UploadImgBtn') );
            this.jqPhotoName.cssDisplay(true);
            !$.trim(this.jqInputor.val()) && this.selectionHolder.setText('分享图片');
            this.checkText();
        }else {
            MB.alert('', e.getCode() == '1040016' ? '抱歉，目前图片发布功能不可用，请联系网站管理员！': e.getMsg());
            //this.jqBtnImg.cssDisplay(true);
            //this.jqForm.cssDisplay(true);
            this.$uploadBtn.cssDisplay(1);
        }
        this.jqUploadTip.cssDisplay(false);
        this.jqForm[0].reset();
        this.jqInputor.focus();
        // remove disabled class
    },
    
    // 参数二为可选
    onSendLoad : function( e , callback){
        var jqInputor = this.jqInputor;
        if(e.isOk()){
            var jqMask = this.jqMask;
            if(!jqMask){
                this.jqMask = jqMask = this.jq('#xwb_succ_mask');
                this.jqMaskPt = jqMask.parent();
            }
            
            jqMask.cssDisplay(true)
                  .show()
                  .appendTo(this.jqMaskPt);

            jqInputor.focus();
            var self = this;
            jqMask.fadeOut(1800, function(){
                // 修正IE下滤镜使得层不会隐藏的BUG，
                // 如果不移除，则不会隐藏
                jqMask.remove();
                jqMask[0].style.filter = null;
                self.reset();
                callback && callback.call(self, e);
            });
            
            // 发送新微博事件
            // X.fire('wb.create', e.getData(), e);
        }else {
            MB.alert('', e.getMsg(), function(){
                Util.focusEnd(jqInputor[0]);
            });
            this.sending = false;
        }
    }
};

/**
 * @class Xwb.mod.postBox
 * 发布微博弹出框
 * @extends Xwb.ui.Box
 * @extends Xwb.mod.PostBase
 * @singleton
 */
 
// 这写法是调用时才实例化
X.reg('postBox', function(){
    
    var inst = $.extend({}, mod.PostBase);
    
    $.extend(inst, {
        
        title : '发微博',
        
        closeable : true,
        autoCenter : true,
        appendTo : doc.body,
        
        mask : true,
        
        cs : 'win-post',
        
        contentHtml : 'PostBoxContent',

        onViewReady : function(v){
            this.initEx();
        },
        
        onbuttonclick : function(bid){
            if( bid == 'ok'){
                this.post();
                // 取消对话框关闭
                return false;
            }
        },
        
        // override
        
        onSendLoad : function(e){
            mod.PostBase.onSendLoad.call(this, e, function(e){
                if( e.isOk()){
                    this.close();
                    // fix bug#334,IE下光标隐藏后不消失
                    this.jqInputor[0].blur();
                }          
            });
        }
    });
    
    inst = X.use('Box', inst);
    
    X.reg('postBox', inst, true);
    
    return inst;
});

/**
 * @class Xwb.mod.WeiboList
 * 微博列表UI
 * @extends Xwb.ui.Base
 */
mod.WeiboList = X.reg('WeiboList', Util.create(Base, {
    
    ctNode : '#xwb_weibo_list_ct',
    
    innerViewReady : function(v){
        Base.prototype.innerViewReady.call(this, v);
        this.jqCt = this.jq(this.ctNode);
        // unsyncList属性置为真时不监听微博更新列表
        if(this.syncList){
            X.on('api.update', this.onWbCreate, this);
            // 转发时目前后台PHP未对返回的头像进行处理
            // X.on('api.repost', this.onWbCreate, this);
        }
    },
    
    // 插入到weibo list
    // item = {data:{wbid:wbData}, html:html}
    // 出于性能考虑，该UI类只维护追加新微博HTML内容到列表，
    // 不维护删除某此微博内容，删除列表中某条微博内容由其它功能自己实现。
    // 不排除以后根据需要实现该功能。
    onWbCreate : function(e){
        var retData = e.getData();
        var wbsData = retData.data;
        // 这个返回的数据结构设计的很奇怪
        for(var id in wbsData){
            this.append(id, wbsData[id], retData.html);
            break;
        }
    },
    
    /**
     * 追加微博到列表。参数config可选属性如下：<br/>
     * {Boolean} noSlide 是否有动画效果<br/>
     * {Boolean} append prepend OR append<br/>
     * {Boolean} cancelParseShortlink<br/>
     * @param {String} weiboId
     * @param {Object} weiboData
     * @param {String} weiboHtml
     * @param {Object} config
     * @return {jQuery} item, 无html时返回空
     */
    append : function(id, item, html, cfg){
        this.item(id, item);
        cfg = cfg || {};
        if(html){
            html = $.trim(html);
            var self = this;
            var jq = $(html);
            
            if(!cfg.append)
                jq.prependTo(this.jqCt);
            else
                jq.appendTo(this.jqCt);
            
            if(!cfg.noSlide){
              jq.hide()
                .fadeIn(1000, function(){
                   if(!cfg.cancelParseShortlink){
                       var obj = {};
                       obj[id] = item;
                       X.mod.shortlink.from(obj, function(list){
                           X.mod.shortlink.renderWeiboShortlink(jq, list[id], list[id].shortlinks);
                       });
                    }
                });
            }else {
                   if(!cfg.cancelParseShortlink){
                       var obj = {};
                       obj[id] = item;
                       X.mod.shortlink.from(obj, function(list){
                           X.mod.shortlink.renderWeiboShortlink(jq, list[id], list[id].shortlinks);
                       });
                    }
            }
            
            return jq;
        }
    },
    
    batchAppend : function(list, htmls, append){
        var items = [];
        var cfg = {noSlide:true, append:append,cancelParseShortlink:true};
        for(var id in list){
            items.push( id, this.append(id, list[id], htmls[id], cfg) );
        }
        X.mod.shortlink.from(list, function(linkedList){
            for(var i=0,len=items.length;i<len;i+=2){
                var id = items[i];
                var jq = items[i+1];
                // 有可能无HTML输出
                if(jq)
                    X.mod.shortlink.renderWeiboShortlink(jq, linkedList[id], linkedList[id].shortlinks);
            }
        });
    },
    
    item : function(id, v){
        if( v === undefined )
            return getWb(id);
        setWb(id, v);
    }
}));

/**
 * @class Xwb.mod.SearchEntry
 * 搜索框
 * @extends Xwb.ui.Base
 */
mod.SearchEntry = X.reg('SearchEntry', Util.create(Base, {
    focusText : '搜微博/找人',
    focusCs   : 'search-box-focus',
    // 30个字节
    maxLen    : 30,
    
    innerViewReady : function(v){
        Base.prototype.innerViewReady.call(this, v);
        var jqInputor = this.jqInputor = this.jq('#xwb_inputor'),
            jqTrigBtn = this.jq('#xwb_trig'),
            self = this;

        jqTrigBtn.click(function(){
            return self.submit();
        });
        
        
        jqInputor.keydown(function(e){
            var kc = e.keyCode;
            if(kc===13)
                self.submit();
        });
        
        if(this.focusText)
            jqInputor.focusText(this.focusText, this.focusCs, this.getView());
    },

 
    submit : function(){
        var kw = $.trim(this.jqInputor.val());
        if(kw == this.focusText)
            kw = '';
        if(!kw){
            this.jqInputor.focus();
        }else {
            var kw = encodeURIComponent( Util.byteCut(kw, this.maxLen) ),
                url = Req.mkUrl('search','', 'k=' + kw);
            window.location.href = url;
        }
    }
}));

/**
 * @class Xwb.mod.shortlink
 * 短链接解析基础类{@link Xwb.ax.Shortlink}的实例化对象，用以解析本站相关的短链接。<br/>
 * 它添加了{@link #renderWeiboShortlink}方法，以定义微博列表单条微博短链内容的解析。
 * @singleton
 * @extends Xwb.ax.Shortlink
 */
mod.shortlink = new X.ax.Shortlink({
    /**
     * 处理单条微博内的短链接。
     * @param {jQuery} jqWeiboItem
     * @param {Object} weiboItemData
     * @param {Array} shortlinks 参见{@link #from}里shortlinks格式
     */
    renderWeiboShortlink : function(jqWb, wbData, shortlinks){
        var links = jqWb.find('a');
        var S = this;
        var sl,uinf, fw;
        var sz = shortlinks.length;
        var jqFw   = jqWb.find('div.forward');
        var jqFeed = jqWb.find('p.feed-main');
        var jqPreview;
        links.each(function(){
            sl = S.is(this.href);
            if(sl){
                var jq = $(this);
                // 短链信息
                uinf = shortlinks[sl];
                // 有可能为无效链接
                if(uinf){
                    // 是否来自转发
                    fw   = uinf[1];
                    // url info
                    uinf = uinf[0];
                    if(uinf){
                        jq.attr('title', uinf.url);
                        
                        switch(uinf.type){
                            case 'music':
                                jq.addClass('icon-music-url icon-bg');
                            break;
                            case 'video':
                                jq.addClass('icon-video-url icon-bg');
                                //检测是否有preview的div，没就生成
                                if(fw){
                                    jqPreview = jqFw.find('>div.preview-img');
                                    if(!jqPreview.length)
                                        jqPreview = $(T.parse('PreviewBox')).appendTo(jqFw); 
                                }else {
                                    jqPreview = jqFeed.next('div.preview-img');
                                    if(!jqPreview.length)
                                        jqPreview = $(T.parse('PreviewBox')).insertAfter(jqFeed);
                                }
                                
                        		//URL在转发区->添加缩略图
                        		//URL在非转发并且该微博是原创 -> 添加缩略图
                        		if(fw || (!fw && !jqFw.length)){
                        		    jq.attr('rel', 'e:pv,i:'+uinf.id);
                        		    $( T.parse('VideoThumbHtml', {img: uinf.screen,id:uinf.id}) )
                        		     .appendTo(jqWb.find((fw? 'div.forward ':'')+'div.preview-img'));
                        		}
                            break;
                        }
                    }else jq.attr('title', '无效链接');
            	}else {
            	    if(__debug) console.warn('未解析链接：@'+sl+' From '+jq.attr('href')+',请在Xwb.ax.Shortlink.from内添加解析区域');
            	    jq.attr('title', jq.attr('href')||'');
            	}
            }
        });
    }

});

/**
 * @class Xwb.mod.myMsg
 * 发私信弹出框
 * @extends Xwb.ui.Box
 * @singleton
 */
X.reg('myMsg', function(){

var inst = X.use('Box', function(proto){

return {
    contentHtml:'PrivateMsgContent',
    appendTo:doc.body,
    cs:'win-mes',
    actionMgr : true,
    title:'发私信',
    autoCenter : true,
    closeable:true,
    mask:true,
    onViewReady : function( v ){
        var self = this;
        this.jqExtra('word', 'warn', 'sender', 'content', 'warnPos', 'uid');
        this.jqContent.keyup(Util.bind(this.checkText, this));
        this.jqSender.blur(function(){
            var v = $.trim(this.value);
            self.checkFans(v,1,null,true);
        });
        this.selectionHolder = X.use('SelectionHolder', {elem:this.jqContent[0]});
        this.atWho = X.use('atWho',{
            appendTo : doc.body,
            Inputor : this.jqSender,
            autoRender : true,
            //override
            format : function(data) {
                return data.nickname
            },
            afterChoose : function() {
                self.jqContent.focus();
            },
            noAt:true
        });
    },
    
    checkText : function(){
        var v = $.trim(this.jqContent.val()),
            left = Util.calWbText(v, 140);
        this.jqWord.html(
            left >= 0 ? '您还可以输入'+left+'个字' : '已超出' + Math.abs(left) + '字'
        );
        return left>=0 && v;
    },
    
    afterShow : function(){
        proto.afterShow.call(this);
        if( this.jqSender.val() === '' )
            this.jqSender.focus();
        else this.jqContent.focus();
    },
    
    onactiontrig : function( e ){
        switch(e.data.e){
            // 点击发送
            case 'sd' :
                this.send();
            break;
            case 'ic':
                 X.use('emotion')
                  .setSelectionHolder( this.selectionHolder , this.checkText, this)
                  .showAt(e.src);
            break;
        }
    },
    
    send : function(){
        if(!this.sending){
            var d = this.validate(), 
                fn = Util.getBind(this, 'onSendLoad'),
                sndBtn = this.jqSendBtn;
            if(d){
                this.checkFans( d.u, d.t, function(){
                    Util.disable( sndBtn, true);
                    Req.msg(d.u, d.t, d.c, fn);
                });
            }
        }
    },
    
    onSendLoad : function( e ){
        if(e.isOk()){
            this.display(false);
        }else {
            var msg;
            switch(e.getCode()){
                case 20014:
                    MB.alert('', e.getMsg());
                    break;
                case 1010005:
                    alert('内容长度不能超过140个字。');
                    this.jqContent.focus();
                    break;
                default : msg = e.getMsg();
            }
            if(msg && this.display()){
                this.jqWarnPos.cssDisplay(true).text(msg);             
            }
        }
        this.sending = false;
        Util.disable( this.jqSendBtn, false);
    },
    
    checkFans : function(user, type, onsuccess, disableFocus){
		 var self = this; 

		if (!user)
		{
			self.jqWarnPos.cssDisplay(true)
                .text('请输入要发送的用户昵称。');
			return;
		}

          // 对方是否为我的粉丝
          Req.followed(
            user,
            function( e ){
                if(e.isOk()){
                    if(e.getData()){
                        self.jqWarnPos.cssDisplay(false);
                        onsuccess && onsuccess.call(this, e);
                    }else {
                        self.jqWarnPos.cssDisplay(true)
                            .text(Req.ERRORMAP['20016']);
                        !disableFocus && self.jqSender.focus();
                    }
                }else {
                    self.jqWarnPos.cssDisplay(true)
                        .text(e.getMsg());
                    !disableFocus && self.jqSender.focus();
                }
            },
            type
          );
    },
    
    /***/
    reset : function(){
        this.jqSender.attr('disabled', false).val('');
        this.jqContent.val('');
        this.jqUid.val('');
        this.jqWarnPos.cssDisplay(false);
        this.checkText();
        return this;
    },
    
    validate : function(){
        var name    = $.trim(this.jqSender.val()),
            content = this.checkText(),
            uid     = this.jqUid.val();
        
        if(!name){
            this.jqSender.focus();
            return;
        }
        
        if(!content){
            if(!$.trim(this.jqContent.val()).length)
                MB.tipWarn('请输入私信内容。');
            else MB.tipWarn('内容长度不能超过140个字。');
            this.jqContent.focus();
            return;
        }
        
        if(uid)
            return {u:uid, c:content};
        return {u:name, c:content,t:1};
    },
    
    reply : function(uid, name){
        this.getView();
        this.reset();
        this.display(true);
        this.jqSender.val(name).attr('disabled', true);
        this.jqUid.val(uid);
        this.jqContent.focus();
        this.checkText();
    }
};

});



X.reg('myMsg', inst, true);

return inst;

});

/**
 * @class Xwb.mod.notice
 * 消息提示浮层
 * @extends Xwb.ui.Box
 * @singleton
 */
X.reg('notice', function( cfg ){

var inst = X.use('Layer', function(proto){

    return $.extend({
        view : 'NoticeLayer2',
        hidden : true,
        closeable : true,
        actionMgr : true,
        remindType:1, 
        // 关闭后是否清空消息
        clearOnClose : true,
        // 该数组下标顺序对应后台返回的类型数组下标
        types : ['wbs', 'refer','cmts', 'fans', 'msgs','notify'],
        wbsUrl : Req.mkUrl('index'),
        referUrl : Req.mkUrl('index', 'atme'),
        cmtsUrl : Req.mkUrl('index', 'comments'),
        msgsUrl : Req.mkUrl('index', 'messages'),
        fansUrl : Req.mkUrl('index', 'fans'),
        notifyUrl : Req.mkUrl('index', 'notices'),
        initUI : function(){
            if( this.remindType )
                this.view = 'NoticeLayer';
            proto.initUI.call(this);
            this.getView();
            // 监听轮询事件
            X.on('api.unread', Util.bind(this.unreadLoad, this));
        },
        
        push : function(type, num){
            var jqItem = this.jq('#'+type),
                jqCnt  = jqItem.find('#c'),
                cur    = parseInt(jqCnt.text());

            // 数目与原先不同，显示或隐藏单条
            if( num != cur ){
                jqCnt.text(num);
                jqItem.cssDisplay(!!num);
            }
            
            // 显示主面板
            if(num && !this.display())
                this.display(true);
        },
        
        onclose : function(){
            if(this.clearOnClose)
                this.clearUnread();
        },
        
        clearUnread : function(){
            var self = this;
            $.each(this.types, function(){
                var item = self.jq('#'+this);
                item.cssDisplay(false);
                item.find('#c').text('0');
            });
            // 清零服务器
            Req.clearUnread('', $.noop);
        },
        
        unreadLoad : function( e ){
            if(e.isOk()){
                // [好友新微博数,@me数,评论数,粉丝,私信]
                var unread = e.getData().unread;
                var none = true;
                // 目前提示面板不计好友新微博数
                for(var i=1,len=this.types.length;i<len;i++){
                    if(unread[i]){
                        this.push(this.types[i], unread[i]);
                        none = false;
                    }
                }
                // 全为0时隐藏面板
                if(none)
                    this.display(false);
            }
        }
    }, cfg);
});


X.reg('notice', inst, true);

return inst;

});


// 换肤
/**
 * @class Xwb.mod.Skin
 * 提供换肤功能
 * @extends Xwb.ui.Base
 */
X.mod.Skin = function(opt){
    var inst = X.use('base', $.extend({
        
        actionMgr : true,
        
        skinSelectedCS : 'current',
        
        onViewReady : function(v){
            this.tab = X.use('Switcher', this.tab);
        },
        
        onactiontrig : function(e){
            switch(e.data.e){
                // change skin
                case 'cs' :
                    this.change(e.get('sk'), e.get('id'));
                    this.decorateSelected(e.src);
                break;
                // 保存
                case 'sv' :
                    if(this.using){
                        this.save(this.using);
                    }else {
                    	this.display(false);
                    	this.reload();
                    }
                break;
                // 取消
                case 'cc' :
                    if(this.usedSkin)
                        this.change(this.usedSkin);
                    this.close();
                    this.reload();
                break;
            }
        },
        
        beforeHide : function(){
            // #IE7下，关闭浮层#header CSS样式表现不正确，需要reflow才能显示正确。
            if($.browser.msie){
                var dv = X.ax.Cache.get('div');
                $('#wrapper').css('clear','both');
                X.ax.Cache.Cache.put(dv);
            }
        },
        
        change : function(skin, id){
            var self = this;
            $('link[rel=stylesheet]').each(function(){
                if(this.href.indexOf('/skin.css') !== -1){
                    // 保存最初skin，方便恢复
                    if(!self.usedSkin)
                        self.usedSkin = this.href.match(/\/css\/default\/([\S\s]*?)\/skin.css$/i)[1];
                    this.href = this.href.replace(/\/css\/default\/[\S\s]*?\/skin.css$/i, '/css/default/'+skin+'/skin.css');
                }
            });
            this.using = id;
        },
        
        save : function(skinId){
            var self = this;
            Req.saveSkin(skinId, function(e){
                if(e.isOk()){
                    self.display(false);
                    self.reload();
                }else MB.alert('', e.getMsg());
            });
        },
        
        reload : function() {
        	var reg = /skinset[^A-Za-z0-9\/]{1}1/g;
        	window.location = String(window.location.href).replace(reg, '');
        },
        
        decorateSelected : function(currentEl){
            if(!this.jqPreSel)
                this.jqPreSel = this.jq('#tabPanels .'+this.skinSelectedCS);
            this.jqPreSel.removeClass(this.skinSelectedCS);
            this.jqPreSel = $(currentEl);
            this.jqPreSel.addClass(this.skinSelectedCS);
        }
        
    }, opt));
    return inst;
};

/**
 * @class Xwb.mod.feedback
 * 意见反馈浮层
 * @extends Xwb.ui.Box
 * @singleton
 */
X.reg('feedback', function(opt){
    var inst = X.use('Box', $.extend({
        view:$('#feedbackBox')[0],
        mask:true,
        closeable:true,
        onViewReady : function(){
            // 三栏模式下，浮层不在BODY内，
            // 此时添加到BODY元素内
            if(this.view.parentNode !== doc.body)
                this.appendAt(doc.body);

            var jqForm = this.jq('#fbForm');
            this.validator = X.use('Validator', {
                form:jqForm,
                trigger:this.jq('#trig'),
                validators :{
                	radio : function(elem,v,data,next){
                		var mail = $(this.context.form).find('input[name="mail"]').val();
                		var qq =  $(this.context.form).find('input[name="qq"]').val();
                		if( mail == '邮箱地址' && qq == 'QQ' ){
                			data.m = '至少填写一种联系方式';
                			this.report(false,data);
                		} else
                			this.report(true,data);
                		next();
                	}
                },
                onsuccess : function(data, next){
                    Req.feedback(data, function(e){
                        if(!e.isOk())
                            MB.tipWarn(e.getMsg());
                        inst.close();
                        next();
                    });
                    return false;
                }
            });
        },
        afterShow : function(){
            X.ui.Box.prototype.afterShow.call(this);
            this.reset();
        },
        
        reset : function(){
            this.jq('[name=content]').val('').focus();
            this.jq('[name=mail]').val('邮箱地址');
            this.jq('[name=qq]').val('QQ');
            this.jq('#feedbackTip').cssDisplay(false);
        }
    }, opt));
    
    X.reg('feedback', inst, true);
    
    return inst;
});

/**
 * @class Xwb.mod.authLogin
 * SINA账号与本站账号登录相关的处理
 * @singleton
 */
mod.authLogin = {
    /**
     * 利用window.open方法弹出auth登录框
     * @param {String} action 请求account.sinaLogin时向后台传递的动作
     * @param {String} redirect 登录后重定向的URL
     */
    open : function(action, redirect){
        var logWin = this.logWin;
        
        if(logWin && !logWin.closed)
            logWin.focus();
        else {
			var act = action || '',
                url = Req.mkUrl('account', 'sinaLogin', 'popup=1&cb=' + act);
                
            if (redirect)
                url += '&loginCallBack=' + encodeURIComponent(redirect);

			this.logWin = window.open(
				url, 
				"logWin","resizable=1,location=0,status=0,scrollbars=0,width=570,height=380"
			);
			
			if(!window.loginCallback)
			    window.loginCallback = Util.bind(this.onPopupCallback, this);
        }
    },
    /**
     * 采用系统默认的跳转URL进行登录。
     * <br/>跳转URL判断方法为：<br/>
     * 1. 如果当前是登录页(account.login)，提取URL中loginCallBack参数值作为跳转值<br/>
     * 2. 其它一律采用当前页面地址作为跳转值
     * @param {HTMLElement} [action]
     */
    direct : function(action){
        var loc = location.href;
        
        // 如果当前是登录页
        // 返回跳转到登录页该跳的位置
        if(X.getModule() === 'account.login')
            loc = Util.dequery(loc).loginCallBack || loc;
        
        this.open(action, loc);
        return false;
    },
    
    /**
     * 绑定{@link #open}方法到元素。<br/>
     * 跳转URL系统会自行判断并添加。判断方法为：<br/>
     * 1. 如果当前是登录页(account.login)，提取URL中loginCallBack参数值作为跳转值<br/>
     * 2. 其它一律采用当前页面地址作为跳转值
     * @param {HTMLElement} element
     * @param {String} eventName
     */
    bind : function(elem, evt){
        var self = this;
        $(elem).bind(evt||'click', function(){
            self.direct();
        });
    },
    
    // private
    // 当SINA AUTH验证通过后，
    // 跳转到PHP统一页面(account.oauthCallback)，
    // 再由该页面输出一段脚本
    // 回调opener窗口的loginCallback方法
    onPopupCallback : function(redirect){
	    this.logWin.close();
	    if(redirect){
	        location.href = redirect;
	    }else {
	        var page = X.getModule();
	        // 需求定如果在首页或者广场，统一跳到pub
	        if( page.indexOf('pub') || 
	            page.indexOf('index'))
	            location.href = Req.mkUrl('pub');
	        else location.reload();
	    }
    }
};

/**
 * @class Xwb.mod.loginBox
 * Xwb登录框
 * @extends Xwb.ui.Box
 * @singleton
 */
mod.loginBox = X.reg('loginBox', function(){
	
	var inst = X.use('Box', {
		contentHtml : 'Login',
		cs : 'win-bind-login win-fixed',
		appendTo : doc.body,
		mask:true,
		closeable : true,
		onViewReady: function() {
			mod.authLogin.bind(this.jq('#oauth'));
		},
		
		siteName: getCfg('siteName'),
		siteLoginUrl: Req.mkUrl('account', 'siteLogin'),
		regUrl: X.getCfg('siteReg'),
		sinaRegUrl: X.getCfg('sinaReg')
	});

	// override function -> object
	X.reg('loginBox', inst, true);

	return inst;
});


/**
 * @class Xwb.mod.FadeShow
 * 今日话题切换效果
 * @extends Xwb.ui.Base
 */
// 今日话题切换效果
mod.FadeShow = X.reg('FadeBox', Util.create(Base, {
	curr: 0,

	length: 0,

	duration: 300,
	
	delay: 5000,
	
	running: false,

	runTimer: null,

	onViewReady: function() {
	  var j = this.jq;

	  this.$list = $(this.view).children();

	  this.length = this.$list.length;

	  var self = this;

	  $(this.view).mouseover(function() {
		  
		  self.stop();

	  }).mouseout(function(e) {

		  var relatedTarget = e.relatedTarget;

		  if (!relatedTarget || !$.contains(self.view, relatedTarget))
		  {
			  self.start();
		  }
	  });

	  this.start();
	},

	start: function() {
		if (this.length <= 1)
		{
			return;
		}

		if (!this.runTimer)
		{
			var self = this;

			this.runTimer = setTimeout(function() {
				self.fade();
			}, this.delay);

			this.running = true;
		}
	},

	stop: function() {
		if (this.runTimer)
		{
			clearTimeout(this.runTimer);
			this.runTimer = null;
		}
		this.running = false;
	},

	fade: function() {
	  //todo: 将要显示的元素
	  var curr = this.curr,
		  next = ++this.curr,
		  self = this;
	  
	 

	  if (next >= this.length)
	  {
		  this.curr = next = 0;
	  }

	  var $curr = $(this.$list[curr]),
		  $next = $(this.$list[next]);

		$curr.animate({'opacity': 0}, {
			'duration': self.duration,
			'complete': function() {
				$curr.addClass('next');

				$next.removeClass('next')
				.css({'opacity':0})
				.animate({'opacity':1}, {
					'duration': self.duration, 
					'complete': function() {
						self.runTimer = null;
						self.running && self.start();
					}
				})
			}
		});


	}
}));

/**
 * @class Xwb.mod.HoverList
 * 列表mouseover，mouseout效果，例如粉丝页、关注页飘过动作可用本类。
 * @extends Xwb.ui.Base
 */
X.mod.HoverList = Util.create(Base, {
    innerViewReady : function(){
        Base.prototype.innerViewReady.call(this);
        this.jq(this.itemSelector)
            .hover(this.onMouseOver, this.onMouseOut);
    },
    onMouseOver : $.noop,
    onMouseOut : $.noop
});

//快速添加话题
X.reg('addFollow',function(cfg){
	var layer = X.use('Box',$.extend({
		
		actionMgr: true,
		
		cs:'add-topic',
		
		boxOutterHtml:'<div class="arrow all-bg"></div>',
		
		closeable:true,
		
		contentHtml:'addFollowContent',
		
		onactiontrig:function(data){
			var self=this;
			switch (data.get('e')){
				case 'cls': 
					this.close();
					break;
				case 'submit':
					data.lock(1);
					Req.postReq(Req.apiUrl('action','addSubject'),{text:this.jq('#Content').val()},function(r){
    					if(r.isOk()){
    						X.fire('subrefresh',{'subject':self.jq('#Content').val(),type:'add'});
    						self.close();
    					} else {
    						self.jq('.warn').prev('p').addClass('hidden');
    						self.jq('.warn').removeClass('hidden').html(r.getError());
    					}
    					data.lock(0);
    				});
			}
		},
		beforeShow : function(){
			var c = this.jq('#Content').val('');
			setTimeout(function(){
				c.focus();
			},1);
		},
		onViewReady : function(){
			var self = this;
			this.jq('#Content').focus(function(){
				self.jq('.warn').cssDisplay(false);
				self.jq('.warn').prev('p').cssDisplay(true);
			});
		}
	},cfg));
	layer.display(true);
	return layer;
});

X.reg('MoreList', function(cfg) {
	var layer = X.use('Layer', $.extend({
	    
		closeable: true,

		contextable: true,

		actionMgr: true,
		
		onactiontrig: function(e) {
			var data = e.data;
			var uid = e.get('u');

			switch (data.e){
    			case 'abl':
    				MB.confirm('提示', 
    				           '确定将'+data.nick+'加入到黑名单吗？<span>你和' + 
    				              (data.gender == 'f' ? '她': '他') + 
    				              '将自动解除关注关系，并且她不能再关注你，给你发评论、私信、@通知。</span>', 
    				           function(click) {
                					if (click === 'ok'){
                						Req.blacklistAdd(uid, '', function(e) {
                							if (e.isOk()) {
                								window.location.reload();
                							}
                						});
                					}
    				            });
    			break;
			}
		}
	}, cfg));

	X.reg('MoreList', layer, true);

	return layer;
});

/**
 * 数据上报
 * @method report
 * @member Xwb
 */
X.report = (function() {
	//上报地址
	var url = 'http://beacon.x.weibo.com/a.gif',

	//图片对象
		img,

		//用户ID，如果未登录，生成一个随机ID
		uid,

		//初始化上报参数
		reqOpt = {
			pjt: 'xwb',
			ver: '2.0',
			xt: 'stay'
		};

	//生成随机ID
	function genId(num) {
		var str = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var len = str.length;

		var num = num || 16;

		var chars = ['u'], at;
		for (var i = 0 ;i< num ;i++)
		{
			at = Math.ceil(Math.random()*len)-1;
			chars.push(str.charAt(at));
		}

		return chars.join('');
	}

	//取得用户ID
	function getUniqueUid() {
		var        
            cookieName = 'x3w4b',

		    uid = $.cookie(cookieName);

			if (!uid)
			{
				uid = genId();
				$.cookie(cookieName, uid, {
					expires: 90000
				});
			}

		return uid;
	}

	function report(params) {
		params.random = Math.random();
		params.c_id = getUniqueUid();
		params.akey = X.getCfg('akey');
        params.p_id = X.getCfg('page');
        var sinaid = X.getCfg('uid');
        
        if (sinaid) {
            params.uid = sinaid;
        }

		var opt = $.extend(params, reqOpt);
		
		var qstrs = [];

		$.each(opt, function(i, k) {
			qstrs.push(i + '=' + encodeURIComponent(k));
		});

		img.src = url + '?' + qstrs.join('&');
	}

	//在线时长汇报
	var olReporter = (function() {
		var timer,
			//上报间隔
			interval = 1800000,

			//初始化状态
			inited = false,
				
			bootTime = new Date().getTime(),

			lastTime = 0,
				
			uid;

		function init() {
			if (inited)
			{
				return;
			}

			uid = getUid();

			img = new Image();

			inited = true;
		}

		function doReport() {
			var now = new Date().getTime(),

			params = {
				time: now - (lastTime ? lastTime: bootTime),
				p: X.getCfg('page')
			};

			if (!lastTime && document.referrer)
			{
				params.t_id = document.referrer;
			}
			

			report(params);

			lastTime = now;
		}

		return {
			start: function() {
				init();
				timer = window.setInterval(doReport, interval);
			},

			report: function() {
				!inited && init();
				doReport();
			}
		}
	})();

	return {
		start: function() {
			olReporter.start();
		},

		report: function() {
			olReporter.report();
		}
	}

})();

/**
 * @class Xwb.mod.AdMgm
 * 广告管理模块
 */
X.mod.AdMgm = {
    
    /**
     *  传入所有广告配置初始化广告内容管理。
     *  [{"flag":"global_bottom","cfg":{}},...]
     * @param {Array} adConfigList
     */
    init : function(adConfigList){
        adConfigList = this.cfgs = adConfigList || {};
        var gbls = !!this.globalHandlers, 
            hds = this.handlers;

        for(var i=0, len=adConfigList.length;i<len;i++){
            var ad = adConfigList[i];
            gbls && this.fireGlobal(ad);
            if(hds && hds[ad.flag])
                hds[ad.flag](ad, this);
        }
        this.inited = true;
    },
    
    fireGlobal : function(ad){
        var gbls = this.globalHandlers;
        if(gbls){
             for(var i=0,len=gbls.length;i<len;i++)
                gbls[i](ad, this);
        }
    },
    
    /**
     *  注册广告单元处理器。
     *  如果管理器已初始化，并且有匹配的广告单元，将立即执行处理器。
     *  如果已存在处理器，则重写。
     * @param {String} adId
     * @param {Function} handler handler(adInf, adMgr);
     */
    reg : function(adId, handler){
        // global
        if(handler === undefined){
            if(!this.globalHandlers)
                this.globalHandlers = [adId];
            else this.globalHandlers.push(adId);
        }else {
            if(!this.handlers)
                this.handlers = {};
            this.handlers[adId] = handler;
            if(this.inited)
                if(this.cfgs[adId])
                    handler(this.cfgs[adId], this);
        }
    },
    
    /**
     *  获得广告单元配置信息。
     *  如果参数为空，返回所有单元。
     *  @param {String} adId
     */
    getAd : function(adId){
        if(!adId)
            return this.cfgs;
        if(this.cfgs){
            for(var i=0;i<this.cfgs.length;i++)
                if(this.cfgs[i].flag == adId)
                    return this.cfgs[i];
        }
    }
};

})(Xwb, jQuery);
