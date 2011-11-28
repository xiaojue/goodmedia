/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview 通用浮出层功能部分,最后扩展成为jquery插件形式被调用
 */
(function(W,doc,$,G){
	/**
   * @memberOf jQuery
   * @constructor
	 * @description 对IE6进行兼容shade fixed
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
						width:null,
						height:null,
						content:'',
						cover:true,
						drag:false,
						opacity:0.5
					};

					$.extend(_o,o);

					this.config=_o;

				}
      };
			
		}();

		/**
		 * 开放出去的通用api
		 */
		_overlay._init.prototype={
      /**
       * @name jQuery.overlay#fire
       * @param {String} html [accessLevel] 覆盖掉覆盖层内部区域的字符串
       * @param {Function} callback [accessLevel] 触发浮出层后的回调
       * @description 触发覆盖层浮出
       */
			fire:function(html,callback,recover){
				var that=this,config=that.config;

				if(config._destroy) return;

				if(!doc.getElementById(config.wrapId)){

					var wrap=$('<div>',{id:config.wrapId});

					wrap.appendTo('body').html(config.content);

					if(html) $('#'+config.wrapId).html(html);
					
					//取得wrap的高宽直接传入reset
					//that.reset(config.width,config.height,config.wrapCls);
					
					if(config.cover && $('#'+config.coverId).length===0) that._cover();
				  $('#'+config.wrapId).css('display','inline');
				}else{
					if(html) $('#'+config.wrapId).html(html);
          if(!recover){
				    $('#'+config.wrapId).css('display','inline');
            $('#'+config.coverId).show();
          }
				}
				
				//高度的获取有时候会延迟在IE6下
        if($.browser.msie && $.browser.version <= 6){
				setTimeout(function(){
					that.reset($('#'+config.wrapId).innerWidth(),$('#'+config.wrapId).innerHeight(),config.wrapCls);
				},10);
        }else{
					that.reset($('#'+config.wrapId).innerWidth(),$('#'+config.wrapId).innerHeight(),config.wrapCls);
        }
				if(callback) callback(wrap);

			},
      /**
       * @name jQuery.overlay#opacity
       * @param {Number} opacity 透明度值 
       * @description 可以重新设置透明
       */
			opacity:function(opacity){
				var that=this,config=that.config;
				config.opacity=opacity;
			},
      /**
       * @name jquery.overlay#reset
       * @param {Number} w 宽度
       * @param {Number} h 高度
       * @param {Number} cls 样式名
       * @description 重写设置高宽和样式
       */
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
      /**
       * @name jQuery.overlay#close
       * @description 关闭覆盖层
       * @param {Function} callback 关闭后的回调
       */
			close:function(callback){

				var that=this,config=that.config;

				$('#'+config.coverId).hide();

				$('#'+config.wrapId).hide();
				
				$('#'+config.wrapId).css({
					'width':'auto',
					'height':'auto'
				});

				if(callback) callback($('#'+config.coverId),$('#'+config.wrapId));

			},
			//遮罩+拖拽把手
			_cover:function(){

				var that=this,config=that.config,
					cover=$('<div>',{id:config.coverId}),
					ie6=($.browser.msie && $.browser.version=='6.0');

				cover.css({
					'background-color':'#ccc',
					'opacity':config.opacity,
					'height': doc.documentElement.clientHeight,
					'z-index':999
				}).prependTo('body');

		        if (ie6) {
		            cover.append("<iframe style='width:100%;" +
		                "filter:alpha(opacity=0);" +
		                "z-index:-1;'>");
		            cover.find('iframe').css('height',cover.height());
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
					'zoom':1,
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
      /**
       * @name jQuery.overlay#destroy
       * @description 注销覆盖层
       */
			destroy:function(){
				var that=this;config=that.config;
				$('#'+config.coverId).remove();
				$('#'+config.wrapId).remove();
				$(W).unbind('scroll resize',that._windowBind);
				if(G.tools.overlay) G.tools.overlay=null;
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
