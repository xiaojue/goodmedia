/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview Goodmedia前端js库core文件，负责创建GM对象和构建命名空间 基于jquery1.6.2
 */
(function(W,doc,$){
	/**
	 * @namespace
	 * @name GM
	 * @description 全局的GM对象
	 */
	
	/**
	 * @namespace
	 * @name jQuery
	 * @description 这里只对私自扩展的jQuery进行doc描述
	 */
	
	if(!W.GM) var GM={};
	/**
	 * @namespace
	 * @description 与业务紧密相关的-挂件
	 */
	GM.widget={};
	/**
	 * @namespace
	 * @description 与业务无关的比如overlay组件,最后扩展到jquery上，使用jquery的扩展机制进行最后的封装
	 */
	GM.tools={};
	/**
	 * @namespace
	 * @description 独立项目或者应用
	 */
	GM.apps={};
	/**
	 * @constant
	 * @description 根据href里德debug关键字确定是否为debug模式
	 */
	GM.debug=W.GMDEBUG.aver;
	/**
	 * @constant
	 * @description 获取当前js的根目录
	 */
	GM.host=function(){
		var scripts=doc.getElementsByTagName('script'),i,base;
		for(i=0;i<scripts.length;i++){
			var src=scripts[i].src,
					namereg=/(GM-min|GM).js/;
			if(namereg.test(src)){
				base=src.slice(0,src.lastIndexOf('/')+1);
			}
		}
		return base;
	}();
	/**
	 * @static
	 * @description 转换到本地非压缩路径
	 * @function
	 * @param {string} uri
	 * @returns {string} 处理过的路径
	 */
	GM.locality=function(uri){
		return uri.replace(/bulid/g,'src').replace(/\-min/g,'');
	}
	/**
	 * @constant
	 * @description widget的根目录
	 */
	GM.widget.host=GM.host + 'widget/';
	/**
	 * @constant
	 * @description apps的根目录
	 */
	GM.apps.host=GM.host + 'apps/';
	
	//debug模式下处理路径
	if(GM.debug){
		GM.host=W.GMDEBUG.host+'bulid/';
		GM.widget.host=GM.locality(GM.host) + 'widget/';
		GM.apps.host=GM.locality(GM.host) + 'apps/';
	}
	/**
	 * @static
	 * @description 额外加载项目文件 - 项目文件目前依赖关系依靠ant维护
	 * @function
	 * @param {string} appname
	 * @param {function} callback
	 */
	
	GM.apps.map={};

	GM.apps.require=function(appname,callback){
		if(GM.apps.map.hasOwnProperty(appname)){
			callback(GM.apps[appname]['exports']);
			return;
		}
		var appuri = GM.host + 'apps/'+appname+'/'+appname+'-min.js';
		if(GM.debug) appuri=GM.locality(appuri);
		$(function(){
			$.getScript(appuri,function(){
				if(callback){
					GM.apps.map[appname]={
						uri:appuri
					};
					callback(GM.apps[appname]['exports']);
				}
			});
		});
	}
	/**
	 * @static
	 * @description 把用过的widget储存，再次use则不再调用
	 * @private
	 */
	GM.widget.usemap={};
	/**
	 * @static
	 * @description 加载widget的方法
	 * @function
	 * @param {String} widget
	 * @param {function} callback
	 */
	GM.widget.use=function(widget,callback){
		if(GM.widget.usemap.hasOwnProperty(widget)){
			callback(GM.widget);
			return;
		}
		
		var widgeturi = GM.host + 'widget/'+widget+'/'+widget+'-min.js';
		if(GM.debug) widgeturi=GM.locality(widgeturi);
		$(function(){
			$.getScript(widgeturi,function(){
					GM.widget.usemap[widget]={
						uri:widgeturi
					}
					callback(GM.widget);
			});
		});
	}
	
	//debug 模式下开启debug.js并且初始化debug面板
	if(GM.debug){
		GM.widget.use('debug',function(widget){
			widget.debug.init();
		});
	}
	
	GM.apps.require('idongmi',function(exports){
		exports.init();
	});

	$(function(){
	if($('#J_MuenbarV2').length>0){
		GM.apps.require('cmsmuenbarv2',function(exports){
			exports.init();
		});
	}
  });	
	
	W.GM=GM;
})(window,document,jQuery);
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
			}
			
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
			fire:function(html,callback){
				var that=this,config=that.config;

				if(config._destroy) return;

				if(!doc.getElementById(config.wrapId)){

					var wrap=$('<div>',{id:config.wrapId});

					wrap.appendTo('body').html(config.content);

					if(html) $('#'+config.wrapId).html(html);
					
					//取得wrap的高宽直接传入reset
					//that.reset(config.width,config.height,config.wrapCls);
					
					if(config.cover && $('#'+config.coverId).length==0) that._cover();

				}else{
					if(html) $('#'+config.wrapId).html(html);

					$('#'+config.coverId).show();

					$('#'+config.wrapId).show();
				}
				
				$('#'+config.wrapId).css('display','inline');
				
				//高度的获取有时候会延迟在IE6下
				setTimeout(function(){
					that.reset($('#'+config.wrapId).innerWidth(),$('#'+config.wrapId).innerHeight(),config.wrapCls);
				},10);
				
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
/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview 滚动木马组件，支持上下左右，自动延迟滚动
 */
(function(W,doc,$,G){
	/**
	 * @memberOf jQuery
	 * @constructor
	 * @description 控制指定容器里的元素，上下左右滚动的组件
	 * @param {objcet} cg
	 * @property {string} wrap <p>#wrap外部包裹容器</p>
	 * @property {string} wrapitem <p>.wrapitem内部包裹元素</p>
	 * @property {string} [direction="left"] left|top方向
	 * @property {number} [current=0] 当前指定滚动到第几页
	 * @property {boolen} [auto=false] 是否自动滚动
	 * @property {number} [autointerval=3000] 自动滚动间隔 毫秒
	 */
	var carousel=function(cg){
		
		var _carousel=function(){
			/**
			 * @private
			 * @function
			 * @param {object} cg 初始化carousel的参数
			 * @description 根据config构建需要的dom结构
			 */
			var _bulid=function(cg){
				var wrap=cg.wrap,wrapitem=cg.wrapitem;
				if(wrap=="" || wrapitem=="") return;
				
				var firstChild=$(wrapitem).eq(0),w,h,size=$(wrapitem).size();
				
				if(cg.direction=='left'){
					w=firstChild.outerWidth()*size;
					h=firstChild.outerHeight();
				}else if(cg.direction=='top'){
					w=firstChild.outerWidth();
					h=firstChild.outerHeight()*size;
				}else{
					return;
				}
				
				var WrapDiv=$('<div>').css({
					'height':h,
					'width':w,
					'position':'absolute'
				}).addClass('fixclear');
				
				$(wrap).css({
					'overflow':'hidden',
					'position':'relative',
					'width':firstChild.outerWidth(),
					'height':firstChild.outerHeight()
				}).prepend(WrapDiv);
				
				$(wrap).find(wrapitem).appendTo(WrapDiv);
				
				$(wrapitem).css('float','left');
				
				if($(wrap).find('.fixclear').length>1){
					$(wrap).find('.fixclear').last().remove();
				}
				
			};
			
			
			return {
				_init:function(o){
					var _o={
						wrap:'',
						wrapitem:'',
						direction:'left',
						before:function(){},
						after:function(){},
						current:0,
						endflg:true,
						auto:false,
						autointerval:3000
					};

					$.extend(_o,o);
					
					this.config=_o;
					this.T=null;
					
					_bulid(this.config);
					
					if(this.config.auto){
						this.auto();
						this.autoEvent();
					} 
				}
			}
		}();
		
		_carousel._init.prototype={
			/**
			 * @name jQuery.carousel#forward
			 * @function
			 * @description 向前翻一页
			 */
			forward:function(){
				var that=this,config=that.config,
					l=$(config.wrap).find(config.wrapitem).length;
				if(config.endflg){
					config.endflg=false;
					config.current++;
					if(config.current>l-1) config.current=0;
					that.to(config.current);
				}
			},
			/**
			 * @name jQuery.carousel#backward
			 * @function
			 * @description 向后翻一页
			 */
			backward:function(){
				var that=this,config=that.config,
					l=$(config.wrap).find(config.wrapitem).length;
				if(config.endflg){
					config.endflg=false;
					config.current--;
					if(config.current<0) config.current=l-1;
					that.to(config.current);
				}
			},
			/**
			 * @name jQuery.carousel#to
			 * @function
			 * @description 翻到第几页
			 * @param {number} guide 页数指针
			 */
			to:function(guide){
				var that=this,config=that.config,moveObj={},
					Realwrap=$(config.wrap).find('.fixclear'),
					l=$(config.wrap).find(config.wrapitem).length;
				
				if(guide>l-1 || guide<0) return;
				
				config.current=guide;
				
				if(config.direction=='left'){
					moveObj={'left':'-'+$(config.wrap).width()*guide}
				}else if(config.direction=='top'){
					moveObj={'top':'-'+$(config.wrap).height()*guide}
				}
				
				that.before(config.current);			
				Realwrap.animate(moveObj,500,function(){
					that.after(config.current);
					config.endflg=true;
				});
			},
			/**
			 * @private
			 * @name jQuery.carousel-auto
			 * @function
			 * @description 激活自动滚动 |配置项没激活的话，这里可以唤醒
			 */
			auto:function(){
				var that=this,config=that.config;
				that.T=setInterval(function(){
					that.forward();
				},config.autointerval);
			},
			stopauto:function(){
				var that=this;
				clearInterval(that.T);
			},
			/**
			 * @private
			 * @function
			 * @name jQuery.carousel-autoEvent
			 * @description 绑定自动滚动需要的事件
			 */
			autoEvent:function(){
				var that=this,config=that.config;
				$(config.wrap).live('mouseenter',function(){
					that.stopauto();
				}).live('mouseleave',function(){
					that.auto();
				});
			},
			/**
			 * @name jQuery.carousel#before
			 * @event
			 * @param {number} current 当前到第几页了
			 * @description 翻页之前触发
			 */
			before:function(current){
				var that=this,config=that.config;
				config.before(current);
			},
			/**
			 * @name jQuery.carousel#after
			 * @event
			 * @param {number} current 当前到第几页了
			 * @description 翻页之后触发
			 */
			after:function(current){
				var that=this,config=that.config;
				config.after(current);
			},
			getcurrent:function(){
				return this.current;
			}
		};
		
		return new _carousel._init(cg);
	};
	
	$.extend({
		carousel:carousel
	});
	
})(window,document,jQuery,GM);
/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview 气泡功能，自定义划过气泡，提供一些对外的接口和方法
 */
(function(W,doc,$,G){
  /**
   * @memberOf jQuery
   * @constructor
   * @description 气泡浮出层管理，可以指定上下左右4个方向进行弹出
   */
	var bubble=function(config){
		var _config={
			width:0,
			height:0,
			cls:'',
			postion:'bottom', //left right top bottom 上下左右
			target:'',
			id:'#J_Bubble'+new Date().valueOf().toString().slice(3)
		}
		
		$.extend(_config,config);
		
		this.config=_config;
	};
	
	
	bubble.prototype={
    /**
     * @name jQuery.bubble#init
     * @description 初始化bubble功能
     */
		init:function(){
			var that=this,cg=that.config;
			that.createWrap(cg.target);
		},
    /**
     * @name jQuery.bubble#remove
     * @description 删除这个bubble
     */
		remove:function(){
			var that=this,cg=that.config;
			$(cg.id).remove();
		},
    /**
     * @name jQuery.bubble#show
     * @description 显示 
     */
		show:function(){
			var that=this,cg=that.config;
			$(cg.id).show();
		},
    /**
     * @name jQuery.bubble#hide
     * @description 隐藏
     */
		hide:function(){
			var that=this,cg=that.config;
			$(cg.id).hide();
		},
    /**
     * @name jQuery.bubble#setcontent
     * @description 设置气泡层内部html
     * @param {string} html 需要设置的内容
     */
		setcontent:function(html){
			var that=this,cg=that.config;
			$(cg.id).html(html);
		},
    /**
     * @name jQuery.bubble#createWrap
     * @private
     * @designsor 内部私有方法，构造整个bubble结构
     */
		createWrap:function(target){
			var cg=this.config,
				postion=$(target).offset(),
				boxH=$(target).height(),
				boxW=$(target).width(),
				postionsign={
				bottom:{
          left:postion.left+(boxW-cg.width)/2,
					top:postion.top+boxH
				},
				top:{
          left:postion.left+(boxW-cg.width)/2,
					top:postion.top-cg.height
				},
				right:{
					left:postion.left+boxW,
          top:postion.top+(boxH-cg.height)/2
				},
				left:{
					left:postion.left-cg.width,
          top:postion.top+(boxH-cg.height)/2
				}
			};
			
			//根据位置进行创建wrap
			if(postionsign.hasOwnProperty(cg.postion)){
				var wrap=$('<div>')
					.height(cg.height)
					.width(cg.width)
					.addClass(cg.cls)
					.offset({
					left:postionsign[cg.postion].left,
					top:postionsign[cg.postion].top
					})
					.css({
						'z-index':50,
						'position':'absolute',
						'display':'none'
					})
					.attr('id',cg.id.slice(1));
				$('body').prepend(wrap);
			}else{
				console.log('config.postion is error puts left,right,top or bottom');
			}
		}
	}
	
	$.extend({
		bubble:bubble
	});
	
})(window,document,jQuery,GM);
/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110906
 * @fileoverview switchable组件，哥实在扛不住挨个页面写一堆了……,没什么好介绍的，直接看cg参数
 */
(function(W,G,$){
  /**
   * @memberOf jQuery
   * @description  switchable组件，哥实在扛不住挨个页面写一堆了……,没什么好介绍的，直接看cg参数
   */
	var switchable=function(cg){
		
		function _switch(cg){
			var _cg={
				shownu:0, //默认第一个显示
				targets:null, //elements
				wraps:null, //elements
				action:'click',
				switchafter:function(){}
			}
			
			$.extend(_cg,cg);
			
			this.config=_cg;
		};
		
		_switch.prototype={
      /**
       * @name jQuery.switchable#init
       * @description 初始化switch，参数均在config里设置
       */
			init:function(){
				var that=this,cg=that.config;
				$(cg.wraps).hide();
				$(cg.wraps).eq(cg.shownu).show();
				$(cg.targets).live(cg.action,function(){
					var ele=$(this),
						index=ele.index(cg.targets),
						wrap=$(cg.wraps).eq(index);
						$(cg.wraps).hide();
						wrap.show();
						cg.shownu=index;
						cg.switchafter(index,ele,wrap);
				});
			}
		}
		
		return new _switch(cg).init();
		
	};
	
	$.extend({
		switchable:switchable
	})
	
})(window,GM,jQuery);
/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110808
 * @fileoverview 模板替换，操作模板字符串等方法集合$.substitute,$.analyse
 */
(function(W,G,$){
  /**
   * @memberOf jQuery
   * @description temp方法集合
   */
	var temp=function(){
		
		return{
      /**
       * @name jQuery.substitute
       * @param {String} str 替换的字符串
       * @param {Object} o 匹配的object
       * @param {regexp} regexp 附属匹配的正则
       * @description 先写一个replace方法用着-copy for kissy~
       */
			substitute:function(str,o,regexp){
	            return str.replace(regexp || /\\?\{([^{}]+)\}/g, function(match, name) {
	                if (match.charAt(0) === '\\') {
	                    return match.slice(1);
	                }
	                return (o[name] === undefined) ? '' : o[name];
	            });				
			},
      /**
       * @name jQuery.analyse
       * @param {String} str 传入xx=oo&aa=b
       * @return {Object}
       * @description 根据传入的xxx=oo&aa=vv的url返回对应键值的object
       */
			analyse:function(str){
				var str=$.trim(str);
				if(str=="" || !str) return {};
				var tempary=str.split('&'),i,returnobj={};
					for(i=0;i<tempary.length;i++){
						var data=tempary[i].split('='),val='';
						if(data.length>2){
							for(var i=1;i<data.length;i++){
								val+=data[i]+'=';
							}
							val=val.slice(0,val.length-1);
						}else{
							val=data[1];
						}
						returnobj[data[0]]=val;
					}
				return returnobj;
			}
		}
	}();
	
	//扩展到jquery对象上
	$.extend({
		substitute:temp.substitute,
		analyse:temp.analyse
	});
	
})(window,GM,jQuery);
/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110807
 * @fileoverview
 * <p>直接引用jquery 开源cookie插件
 * <a href="https://github.com/carhartl/jquery-cookie" target="_blank">jquery-cookie</a></p>
 */
(function(W,G,$){
	/**
	 * @memberOf jQuery
	 * @class
	 * @description 存取改cookie值
	 * @param {string} key cookie的键值
	 * @param {string} value 设置cookie的新值
	 * @param {objcet} options
	 * @property {boolen} [raw=false] 是否encodeURIComponent
	 * @property {number} [expires=-1] 过期时间，天为单位
	 * @property {string} [path=""] cookie路径
	 * @property {string} [domain=""] domain设置
	 * @property {boolen} [secure="secure"] 默认是secure的
	 * @example
	 *  <h3>使用方法</h3>
	 *	<p>Create session cookie:<br>
	 *	$.cookie('the_cookie', 'the_value');<br>
	 *	Create expiring cookie, 7 days from then:<br>
	 *	$.cookie('the_cookie', 'the_value', { expires: 7 });<br>
	 *	Create expiring cookie, valid across entire page:<br>
	 *	$.cookie('the_cookie', 'the_value', { expires: 7, path: '/' });<br>
	 *	Read cookie:<br>
	 *	$.cookie('the_cookie'); // => 'the_value'<br>
	 *	$.cookie('not_existing'); // => null<br>
	 *	Delete cookie by passing null as value:<br>
	 *	$.cookie('the_cookie', null);</p> 
	 */
	var cookie = function (key, value, options) {
	    // key and at least value given, set cookie...
	    if (arguments.length > 1 && String(value) !== "[object Object]") {
	        options = jQuery.extend({}, options);
	
	        if (value === null || value === undefined) {
	            options.expires = -1;
	        }
	
	        if (typeof options.expires === 'number') {
	            var days = options.expires, t = options.expires = new Date();
	            t.setDate(t.getDate() + days);
	        }
	
	        value = String(value);
	
	        return (document.cookie = [
	            encodeURIComponent(key), '=',
	            options.raw ? value : encodeURIComponent(value),
	            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
	            options.path ? '; path=' + options.path : '',
	            options.domain ? '; domain=' + options.domain : '',
	            options.secure ? '; secure' : ''
	        ].join(''));
	    }
	
	    // key and possibly options given, get cookie...
	    options = value || {};
	    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
	    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
	};
	
	$.extend({
		cookie:cookie
	});
	
})(window,GM,jQuery);
/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110822
 * @fileoverview 补充jquery不能$.loadcss,行内插入样式$.insertstyle
 */
(function(W,$,doc){
	//加载css
	var loadcss=function(file){
		if(GM.debug) file=GM.locality(file);
		var link=$('<link>').attr({
					type:'text/css',
					rel:'stylesheet',
					href:file+'?t='+new Date().valueOf()+'.css'
				});
		$('head').prepend(link);
	}
	
	//增加style行内样式
	var insertstyle=function(name,value){
		
	}
	
	$.extend({
		loadcss:loadcss,
		insertstyle:insertstyle
	})
	
})(window,jQuery,document);
/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110826
 * @fileoverview 主要负责修复ie6的一些bug，去你妈的IE6 -_-||
 */
(function(W,G,$,doc){

   /**
    * @member jQuery
    * @description 修复ie6下png24不透明的函数
    */
	var fixpng24=function() {
		$('img').each(function(){
			var imgName = this.src.toUpperCase();
            if (imgName.substring(imgName.length - 3, imgName.length) == "PNG") {
            	var $img=$('<span>').css({
					width: this.offsetWidth,
	                height: this.offsetHeight,
	                display:'inline-block',
	                overflow:'hidden',
	                cursor:(this.parentElement.href) ? 'hand' : ''
				}).attr({
					'title':this.alt || this.title || '',
					'class':this.className
				});						
	            $img[0].style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+this.src+'", sizingMethod="scale")';                        
	            $(this).replaceWith($img);
            }
		});	          
    };
    
    $.extend({
		fixpng24:fixpng24
	});
	
	if($.browser.msie && $.browser.version==6){
		$(window).load(function(){
			$.fixpng24(); //修复ie6 png24
			doc.execCommand("BackgroundImageCache", false, true); //修复ie6 不缓存背景图
			//一天提醒一次
			if(!$.cookie('ie6tips') || $.cookie('ie6tips')!=1){
				G.apps.require('ie6tips',function(exports){
					exports.init();
				});
			}
		});
	};
      
})(window,GM,jQuery,document);
/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110819
 * @fileoverview
 * <p>全局的console对象，对其扩展之后，拥有自带调试的走自带，没有的，则返回空<br>
 * 避免调试代码污染  方便进行调试的开发模式</p>
 */
(function(W,G,$){
	
	if(!W.console){
		W.console={}
		var method=['log','debug','info','warn','exception','assert','dir','dirxml','trace','group','groupEnd','groupCollapsed','time','timeEnd','profile','profileEnd','count','clear','table','error','notifyFirebug','firebug','userObjects'];
			options=function(){
				var i,options={};
				for(i=0;i<method.length;i++){
					options[method[i]]==$.noop;
				}
			}();
			
		$.extend(W.console,options);
	};
	
})(window,GM,jQuery);
/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview
 * <p>阻止用户复制区域文本 | IE阻止全部复制，非IE阻止局部复制<br>
 * IE下如果不全部屏蔽功能，则可以通过ctrl+a或者从其他节点复制过来，造成影响。这里封装为IE下强制屏蔽复制，什么都不可以选，不可以复制。</p>
 */
(function(W,doc,G){
  /**
   * @name GM.widget.detercopy
   * @function
   * @description 阻止用户勾选与复制，ie非ie通用
   */
	var detercopy=function(selector){
		$(function(){
		
			if($(selector).length==0) return;
			
			if(document.attachEvent){
				
				var falseFn=function(){return false;};
				
				doc.body.attachEvent("onselectstart",falseFn);
				
				doc.body.attachEvent('oncontextmenu',falseFn);
				
				doc.body.attachEvent('oncopy',falseFn);
				
				doc.body.attachEvent('oncut',falseFn);
				
				$(document).keydown(function(){
					if(event.ctrlKey && event.keyCode==67){
						event.keyCode=0;
						event.returnValue=false;
					}
				});
				
				if(doc.selection){
					doc.selection.empty();
					doc.unselectable = "on";
   					doc.documentElement.style['userSelect'] = "none";
				}
				
			}else{
				$(selector).each(function(index,node){
					node.style.cssText+="-moz-user-select:none;-webkit-user-select:none;";
				});
			}
		});
	}
	
	if(G && G.widget){
		G.widget.detercopy=detercopy;
		/**
		 * 主动触发一次,禁止复制的钩子为J_NoCopy
		 */
		G.widget.detercopy('.J_NoCopy');
	} 
	
})(window,document,GM);
