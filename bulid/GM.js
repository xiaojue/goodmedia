/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110726
 * 基于jquery1.6.2
 * Goodmedia前端js库core文件，负责创建GM对象和构建命名空间
 */
(function(W,doc,$){
	if(!W.GM) var GM={};
	
	//与业务紧密相关的-挂件
	GM.widget={};
	//与业务无关的比如overlay组件,最后扩展到jquery上，使用jquery的扩展机制进行最后的封装
	GM.tools={};
	//独立项目或者应用
	GM.apps={};
	
	//是否是debug模式
	GM.debug=function(){
		var isdebug=(W.location.href.match('debug'));
		return isdebug;
	}();

	//判断使用路径
	//先找到当前的路径
	GM.host=function(){
		var scripts=doc.getElementsByTagName('script'),i,base;
		for(i=0;i<scripts.length;i++){
			var src=scripts[i].src,
					namereg=/(GM-min|GM).js/;
			if(namereg.test(src)){
				base=src.slice(0,src.lastIndexOf('/')+1)
			}
		}
		return base;
	}();

	if(GM.debug){
		GM.host='http://172.16.2.215/gm/bulid/';
		$(function(){
				$('a').each(function(){
					var href=$(this).attr('href');
						$(this).attr('href',href+'&debug');
				});
		});
	}

	//转换到本地非压缩路径
	function locality(uri){
		return uri.replace('bulid','src').replace('-min','');
	} 
	
	//额外加载项目文件 - 项目文件目前依赖关系依靠ant维护
	GM.apps.require=function(appname,callback){
		var appuri = GM.host + 'apps/'+appname+'/'+appname+'-min.js';
		if(GM.debug) appuri=locality(appuri);
		$(function(){
			$.getScript(appuri,function(){
				if(callback) callback(GM.apps[appname]['exports'])
			});
		});
	}
	
	//加载widget的方法
	GM.widget.usemap={};
	
	GM.widget.use=function(widget,callback){
		if(GM.widget.usemap.hasOwnProperty(widget)){
			if(callback) callback(GM.widget);
			return;
		} 
		var widgeturi = GM.host + 'widget/'+widget+'/'+widget+'-min.js';
		if(GM.debug) widgeturi=locality(widgeturi);
		$(function(){
			$.getScript(widgeturi,function(){
				GM.widget.usemap[widget]=widgeturi;
				if(callback) callback(GM.widget);
			});
		});
	}
	//debug 模式下开启debug.js并且初始化debug面板
	if(GM.debug){
		GM.widget.use('debug',function(widget){
				widget.debug.init();
		});
	} 
	
	W.GM=GM;
})(window,document,jQuery);
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
			//触发
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
			//可以在此处重置样式与高宽还有透明度
			opacity:function(opacity){
				var that=this,config=that.config;
				config.opacity=opacity;
			},
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
				
				$('#'+config.wrapId).css({
					'width':'auto',
					'height':'auto'
				});

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
			//注销
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
 * @author fuqiang
 * @date 20110726
 * 滚动木马组件，支持上下左右，自动延迟滚动
 */
(function(W,doc,$,G){
	
	var carousel=function(cg){
		
		var _carousel=function(){
			
			
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
					/* HTML Structure
					 * <div id="wrapCls">
					 * 	<div>
					 * 		<div class="Wrapitem"></div>
					 * 		<div class="Wrapitem"></div>
					 * 		<div class="Wrapitem"></div>
					 * 		<div class="Wrapitem"></div>
					 * 	</div>
					 * </div>
					 */			
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
			to:function(guide){
				var that=this,config=that.config,moveObj={},
					Realwrap=$(config.wrap).find('.fixclear'),
					l=$(config.wrap).find(config.wrapitem).length;
				
				if(guide>l || guide<0) return;
				
				if(config.direction=='left'){
					moveObj={'left':'-'+$(config.wrap).width()*guide}
				}else if(config.direction=='top'){
					moveObj={'top':'-'+$(config.wrap).height()*guide}
				}
				that.before(guide);			
				Realwrap.animate(moveObj,500,function(){
					that.after(guide);
					config.endflg=true;
				});
			},
			auto:function(){
				var that=this,config=that.config;
				that.T=setInterval(function(){
					that.forward();
				},config.autointerval);
			},
			autoEvent:function(){
				var that=this,config=that.config;
				$(config.wrap).live('mouseenter',function(){
					clearInterval(that.T);
				}).live('mouseleave',function(){
					that.auto();
				});
			},
			before:function(current){
				var that=this,config=that.config;
				config.before(current);
			},
			after:function(current){
				var that=this,config=that.config;
				config.after(current);
			}
		};
		
		return new _carousel._init(cg);
	};
	
	$.extend({
		carousel:carousel
	});
	
})(window,document,jQuery,GM);
/**
 * @author fuqiang
 * @date 20110726
 * 气泡功能，自定义划过气泡，提供一些对外的接口和方法
 */
(function(W,doc,$,G){
	
	var bubble=function(){
		
		var _bubble=function(){
			
			return {
				_init:function(){
					
				}
			}
		};
		
		_bubble.prototype={
			
		};
		
		return new _bubble._init(cg);
	};
	
})(window,document,jQuery,GM);
/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110808
 * 模板替换，操作模板字符串等方法集合
 */
(function(W,G,$){
	
	var temp=function(){
		
		return{
			//先写一个replace方法用着-copy for kissy~
			substitute:function(str,o,regexp){
	            return str.replace(regexp || /\\?\{([^{}]+)\}/g, function(match, name) {
	                if (match.charAt(0) === '\\') {
	                    return match.slice(1);
	                }
	                return (o[name] === undefined) ? '' : o[name];
	            });				
			}
		}
	}();
	
	//扩展到jquery对象上
	$.extend({
		substitute:temp.substitute
	});
	
})(window,GM,jQuery);
/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110807
 * 直接引用jquery 开源cookie插件
 * https://github.com/carhartl/jquery-cookie
 *
 *	 使用方法
 *	Create session cookie:
 *	
 *	GM.cookie('the_cookie', 'the_value');
 *	
 *	Create expiring cookie, 7 days from then:
 *	
 *	GM.cookie('the_cookie', 'the_value', { expires: 7 });
 *	
 *	Create expiring cookie, valid across entire page:
 *	
 *	GM.cookie('the_cookie', 'the_value', { expires: 7, path: '/' });
 *	
 *	Read cookie:
 *	
 *	GM.cookie('the_cookie'); // => 'the_value'
 *	GM.cookie('not_existing'); // => null
 *	
 *	Delete cookie by passing null as value:
 *	
 *	GM.cookie('the_cookie', null);
 */
(function(W,G,$){
	
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
 * @author fuqiang
 * @date 20110726
 * 阻止用户复制区域文本 | IE阻止全部复制，非IE阻止局部复制
 * IE下如果不全部屏蔽功能，则可以通过ctrl+a或者从其他节点复制过来，造成影响。这里封装为IE下强制屏蔽复制，什么都不可以选，不可以复制。
 */
(function(W,doc,G){
	
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