/**
 * @author fuqiang
 * @date 20110726
 * 通用浮出层功能部分,最后扩展成为jquery插件形式被调用
 */
(function(W,doc,$,G){
	/**
	 * 对IE6进行兼容shade fixed
	 */
	var overlay=function(cg){

		var _overlay=function(){
			return {
				_init:function(o){
					/**
					* 默认配置
					* cover 默认有遮罩  50%的灰色，不可自己定义, 可以用css后期自己改，统一所有对象使用一个#J_GM_Cover
					* drag 默认不可以拖拽，先不实现，后期再实现 20110726 -涉及到多层互相覆盖的问题，比如页面上有多个overlay，这个是目前不允许的
					* content 内容为HTML，直接进行注入
					*/
					var _o={
						wrapId:'J_GM_OverlayWrap', //默认的全局wrap-ID
						wrapCls:'J_GM_OverlayWrapCls',
						coverId:'J_GM_Cover',
						width:400,
						height:200,
						content:'',
						_destroy:false, 
						cover:true,
						drag:false
					};

					$.extend(_o,o);

					this.config=_o;

				}
			}
		}();

		/**
		 * 开放出去的通用api
		 */
		_overlay._init.prototype={
			//触发
			fire:function(html,callback){
				var that=this,config=that.config;

				if(config._destroy) return;

				if(!doc.getElementById(config.wrapId)){

					var wrap=$('<div>',{id:config.wrapId}),

						close=$(config.closeCls);

					wrap.appendTo('body').html(config.content);

					that.reset(config.width,config.height,config.wrapCls);

					if(html) $('#'+config.wrapId).html(html);

					if(config.cover && $('#'+config.coverId).length==0) that._cover();

					that._fix(wrap,that);

				}else{
					if(html) $('#'+config.wrapId).html(html);

					$('#'+config.coverId).show();

					$('#'+config.wrapId).show();
				}

				if(callback) callback(wrap);

			},
			//可以在此处重置样式与高宽
			reset:function(w,h,cls){

				var that=this,config=that.config;

				config.width=w;
				config.height=h;
				config.wrapCls=cls;

				$('#'+config.wrapId).css({
					'width':w,
					'height':h,
					'z-index':1000
				}).addClass(cls);
				
				that._fix($('#'+config.wrapId),that);
				
			},
			//关闭
			close:function(callback){

				var that=this,config=that.config;

				$('#'+config.coverId).hide();

				$('#'+config.wrapId).hide();

				if(callback) callback($('#'+config.coverId),$('#'+config.wrapId));

			},
			//拖拽
			_drag:function(callstart,callend){

			},
			//遮罩
			_cover:function(){

				var that=this,config=that.config,
					cover=$('<div>',{id:config.coverId}),
					ie6=($.browser.msie && $.browser.version=='6.0');

				cover.css({
					'background-color':'#ccc',
					'opacity':'0.5',
					'height': doc.documentElement.clientHeight,
					'z-index':999
				}).prependTo('body');

		        if (ie6) {
		            cover.append("<" + "iframe style='width:100%;" +
		                "height:expression(this.parentNode.offsetHeight);" +
		                "filter:alpha(opacity=0);" +
		                "z-index:-1;'>");
		        }

		        that._fixScroll();

			},
			//fix复位
			_fix:function(node,host){

				var that=host,config=that.config,
					ie6=($.browser.msie && $.browser.version=='6.0'),
					scrollTop=$(doc).scrollTop();

				node.css({
						'position':ie6 ? 'absolute' : 'fixed',
						'left':'50%',
						'top':ie6 ? ((doc.documentElement.offsetHeight-config.height)/2)+scrollTop : '50%',
						'margin-left':-(config.width/2),
						'margin-top':ie6 ? 0 : -(config.height/2)
				});

				$('#'+config.coverId).css({
					'position':ie6 ? 'absolute' : 'fixed',
		            'left':0,
		            'top':ie6 ? scrollTop : 0,
		            'width':ie6 ?  Math.max(doc.documentElement.clientWidth,doc.body.clientWidth) : "100%"
		        });
			},
			_fixScroll:function(){
				var that=this,config=that.config;
				$(W).bind('scroll resize',{host:that},that._windowBind);
			},
			_windowBind:function(e){
				var host=e.data.host;
				host._fix($('#'+host.config.wrapId),host);
				$('#'+host.config.coverId).css({'height': doc.documentElement.clientHeight});
			},
			//注销
			destroy:function(){
				var that=this;config=that.config;
				$('#'+config.coverId).remove();
				$('#'+config.wrapId).remove();
				$(W).unbind('scroll resize',that._windowBind);
				if(G.tools.overlay) G.tools.overlay=new _overlay._init({_destroy:true});
			}
		};

		/**
		 * 每次引用都返回唯一一个全局的浮层对象
		 */

		if(!G.tools.overlay) G.tools.overlay=new _overlay._init(cg);

		return 	G.tools.overlay;
	};

	//扩展到jquery原型上，不绑定到GM上
	$.extend({
		overlay:overlay
	});

})(window,document,jQuery,GM);
