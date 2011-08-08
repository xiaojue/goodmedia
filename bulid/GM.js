/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110726
 * 基于jquery1.6.2
 * Goodmedia前端js库core文件，负责创建GM对象和构建命名空间
 */
(function(W,doc,$){
	if(!window.GM) var GM={};
	
	//与业务紧密相关的-挂件
	GM.widget={};
	//与业务无关的比如overlay组件,最后扩展到jquery上，使用jquery的扩展机制进行最后的封装
	GM.tools={};
	//独立项目或者应用
	GM.apps={};
	
	//额外加载项目文件 - 项目文件目前依赖关系依靠ant维护
	GM.apps.require=function(appname,callback){
		var ishost=(W.location.href.match('idongmi.com')),
		uri=(ishost) ?'http://x.idongmi.com/static/GM/' : 'http://172.16.2.215/gm/'
		var appuri= uri + 'bulid/apps/'+appname+'/'+appname+'.js';
		$(function(){
			$.getScript(appuri,function(){
				if(callback) callback(GM.apps[appname]['exports'])
			});
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
/**
 * @author fuqiang
 * @date 20110726
 * 气泡功能，自定义划过气泡，提供一些对外的接口和方法
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
						endflg:true
					};

					$.extend(_o,o);
					
					this.config=_o;
					
					_bulid(this.config);
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
			stop:function(){
				var that=this,config=that.config;
				
			},
			auto:function(){
				var that=this,config=that.config;
				
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
			//先写一个replace方法用着-copy to kissy~
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
	})
	
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
 * @date 20110804
 * 内部似有方法，分享消息到新浪微博
 * 
 */
(function(W,G){
	
	var sharetosina=function(data){
		
		if(!data) return;
		
		var url="/course/courseAction.jsp";
		
		$.ajax({
			url:url,
			data:data,
			success:function(result){
				if($.trim(result)==1){
					alert('分享成功！');
				}else{
					alert('网络超时,请重试');
				}	
			},
			error:function(){
				alert('网络超时,请重试');
			},
			timeout:5000
		})
	}
	
	if(G && G.widget) G.widget.sharetosina=sharetosina;
	
})(window,GM);/**
 * @author fuqiang
 * @date 20110725
 * 联动地区菜单
 */
(function(W,G){
	
	var Cityzone=function(pbid,pserid,cityname,districtname){
		
		var pb_arr=["北京|昌平区,朝阳区,崇文区,大兴区,东城区,丰台区,海淀区,门头沟区,石景山区,通州区,西城区,宣武区",
		"长春|朝阳区,二道区,高新区,宽城区,绿园区,南关区",
		"长沙|芙蓉区,开福区,天心区,雨花区,岳麓区",
		"常州|湖塘镇,天宁区,新北区,钟楼区",
		"成都|成华区,金牛区,锦江区,郫县,青羊区,温江县,武侯区,新都区",
		"大连|甘井子区,金州区,开发区,沙河口区,西岗区,中山区",
		"东莞|东城区,虎门镇,南城区,石碣镇,石龙镇,莞城区,万江区",
		"佛山|禅城区,南海区,顺德区",
		"福州|仓山区,鼓楼区,鼓楼新区,晋安区,马尾区,台江区",
		"广州|白云区,番禺区,海珠区,花都区,黄埔区,开发区,荔湾区,萝岗区,天河区,越秀区,增城区",
		"哈尔滨|道里区,道外区,开发区,南岗区,松北区,香坊区,平房区",
		"杭州|滨江区,拱墅区,江干区,西湖区,下城区,萧山区,上城区",
		"呼和浩特|回民区,新城区",
		"济南|高新区,槐荫区,历城区,历下区,市中区,天桥区",
		"嘉兴|秀城区",
		"昆明|盘龙区,五华区,西山区",
		"兰州|城关区,七里河区,西固区",
		"南京|白下区,鼓楼区,建邺区,江宁区,秦淮区,下关区,玄武区,雨花台区",
		"南宁|江南区",
		"宁波|海曙区,江北区,江东区,鄞州区,镇海区",
		"青岛|城阳区,李沧区,市北区,市南区,四方区",
		"上海|宝山区,长宁区,虹口区,黄浦区,嘉定区,金山区,静安区,卢湾区,闵行区,南汇区,浦东区,浦东新区,浦西区,普陀区,青浦区,松江区,徐汇区,杨浦区,闸北区,奉贤区,黄埔区",
		"深圳|宝安区,福田区,龙岗区,罗湖区,南山区,盐田区",
		"沈阳|大东区,和平区,皇姑区,沈河区,铁西区,于洪区",
		"石家庄|长安区,开发区,桥东区,桥西区,新华区,裕华区",
		"苏州|沧浪区,常熟市,工业园区,金阊区,昆山市,平江区,太仓市,吴中区,相城区",
		"太原|小店区",
		"唐山|开平区",
		"天津|东丽区,和平区,河北区,河东区,河西区,红桥区,蓟县,静海县,南开区",
		"温州|龙湾区,鹿城区,瓯海区,瑞安市,永嘉县,新城区",
		"无锡|城东区,城中区,崇安区,惠山区,江阴市,南长区,南闸镇,青阳镇,霞客镇,新区,宜兴市,滨湖区",
		"武汉|汉口区,汉阳区,洪山区,江岸区,江汉区,青山区,武昌区",
		"西安|霸桥区,碑林区,长安区,莲湖区,未央区,新城区,雁塔区,高新区",
		"厦门|海沧区,湖里区,集美区,思明区,同安区",
		"烟台|福山区,开发区,莱山区,芝罘区",
		"郑州|二七区,管城区,惠济区,金水区,郑东新区,中原区",
		"重庆|巴南区,大渡口,江北区,九龙坡区,南岸区,沙坪坝区,渝北区,渝中区",
		"珠海|斗门区,拱北区,金湾区,香洲区"];
		
		function removeFiret(selector){
			 $.each($(selector).children(),function(index,opt){
			 	if(opt.value==0) opt.parentNode.removeChild(opt);
			 });
		};
		
		function selectOption(selector,city){
			var opts=$(selector).get()[0];
			if(opts){
				opts=opts.getElementsByTagName('option');
				for(var i=0;i<opts.length;i++){
					if(opts[i].value==city){
						$(selector).get()[0].selectedIndex=i;
						removeFiret(selector);
						break;
					}
				}
			}
		};
		
		return {
			init_city:function(city,district){
				var that=this;
				
				$(pbid).append('<option value="0">城市</option>');
				
				for(var i=0;i<pb_arr.length;i++){
					var cityname=pb_arr[i].split('|')[0];
					$(pbid).append('<option value="'+cityname+'">'+cityname+'</option>');
				}
				
				$(pserid).append('<option value="0">城区</option>');
				
				if(city){
					selectOption(pbid,city);
					that.init_cityzone();
				}
				
				if(city && district){
					selectOption(pserid,district);
				}
			},
			init_cityzone:function(){
				if($(pbid).val()!=0){
					 removeFiret(pbid);
				     for(var i=0;i<pb_arr.length;i++){
				     	var ary=pb_arr[i].split('|'),
				     		city=ary[0];
				     	if($(pbid).val()!=city) continue;
				     	var districts=ary[1].split(',');
						if($(pbid).val()==city){
							$(pserid).html('');
							$(pserid).append('<option value="0">请选择城区</option>')
							for(var j=0;j<districts.length;j++){
								$(pserid).append('<option value="'+districts[j]+'">'+districts[j]+'</option>');
							}
						}
					}
				 }
			},
			init:function(selectfn,callback){
				var that=this;
				that.init_city(cityname,districtname);
				$(pbid).change(that.init_cityzone);
				$(pserid).change(function(){
					var str=$(pbid).val()+' '+$(pserid).val();
					if(selectfn) selectfn(str);
				});
				if(callback) callback();
			}
		}
		
	};
	
	if(G && G.widget) G.widget.Cityzone=Cityzone;
	
})(window,GM);/**
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
	
})(window,document,GM);/**
 * @author fuqiang
 * @dete 20110725
 * 为GM对象添加widget空间下的countdown组件
 */
(function(W,G){
	
	var countdown=function(cg){
		
		var fn={
			init:function(){
				return new fn._bind(cg);	
			},
			//绑定事件，创建构造器
			_bind:function(cg){
				var _cg={
					main:'',
					wrap:'',
					errorCls:'',
					holdTarget:'',
					holdAction:function(){},
					max:140 //默认最多140字
				}
				
				$.extend(_cg,cg);
				
				for(var i in _cg){
					this[i]=_cg[i];
				}
				
				if(this.main=="" || this.wrap=="") return;
				
				var that=this,
					main=$(that.main),
					wrap=$(that.wrap),
					holdTarget=$(that.holdTarget),
					error=that.errorCls,
					max=that.max;
					
				var	holdfn=function(){
					var l=parseInt(main.val().length),putout;
					
					if(l <= max || l == 0){
						wrap.removeClass(error);
						putout='你还可以输入<font>'+(max-l)+'</font>字';
					}else{
						wrap.addClass(error);
						putout='已超出<font>'+(l-max)+'</font>字';
					}
					
					holdTarget.unbind('click');
					
					holdTarget.bind('click',function(){
						if(l<=max) that.holdAction();
					});
					
					wrap.html(putout);
				};
					
				holdfn();
				main.keyup(holdfn);
			}
		};
		
		return fn;
	};
	
	if(G && G.widget) G.widget.countdown=countdown;
	
})(window,GM);/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110805
 * google map api 接口实现地理定位
 */
(function(W,G){
	
	var map=function(cg){
		
		if(!cg) return;
				
		var _cg={
			q:'',
			markerhtml:'',
			name:'',
			target:'',
			width:210,
			height:270,
			drag:false,
			bar:true,
			revise:false,
			center:null,
			siteNo:null
		};
		
		$.extend(_cg,cg);
		
		for(var i in _cg){
			this[i]=_cg[i];
		}
		
	};
	
	map.prototype={
		init:function(){
			
			var that=this,target=document.getElementById(that.target);
			
			//set wrap
			function setwrap(target){
				target.style.cssText+='width:'+that.width+'px;height:'+that.height+'px;border:1px solid #CCC;';
			};
			
			//error handler
			function error(target){
				target.parentNode.removeChild(target);
			};
			
			
			//bulid bar
			function bulidbar(target){
				if(that.bar){
					var revise='';
					if(that.revise) revise='<li style="float: left; display: block; margin: 0pt 10px;line-height:12px;font-size:12px;"><a style="color:#4077C7;" href="javascript:void(0);" class="J_EditMap">修订坐标</a></li>';
					var bar='<ul style="margin: 5px 0pt;width:240px;padding:0px;">'+
							'<li style="float: left; display: block; margin: 0pt 10px;line-height:12px;font-size:12px;"><a style="color:#4077C7;" href="javascript:void(0);" class="J_LookBigMap">查看全图</a></li>'+
							'<li style="float: left; display: block; margin: 0pt 10px;line-height:12px;font-size:12px;"><a style="color:#4077C7;" href="javascript:void(0);" class="J_LookWay">公交/驾车</a></li>'+
							revise+
							'</ul>';
					$('#'+target).after(bar);
				}
			};
			
			//得到了坐标-绘制地图的函数
			function drawmap(target,center,name,siteNo){
				if(google){
    				geocoder = new google.maps.Geocoder();
				    var latlng = new google.maps.LatLng(center[1],center[0]); //首次加载定义的中心点
				    var myOptions = {
				        zoom:15,
				        center:latlng,
				        mapTypeId: google.maps.MapTypeId.ROADMAP
				      };
				      
				    var map=new google.maps.Map(target,myOptions);//载入地图
				    
				    var marker = new google.maps.Marker({
				    	 title:name,     
						 position: latlng,         
					 	 map: map,
					 	 draggable:function(){
					 	 	if(that.drag) return true;
					 	 	return false;
					 	 }()
					});
					
					if(that.markerhtml!=""){
						var infowindow = new google.maps.InfoWindow({
					    	content:that.markerhtml
						});

					    google.maps.event.addListener(marker,'click', function () {
					    	infowindow.open(map,marker);
			            });
					}
					
					if(that.drag){
						google.maps.event.addListener(marker,'dragend', function () {
							var center=marker.getPosition();
							if(confirm('指定这里为新的场馆坐标么?')){
								GM.tools.overlay.close();
								$.ajax({
									url:'xxx.jsp',
									data:{
										siteNo:siteNo,
										lat:center['Na'],
										lng:center['Oa']
									},
									success:function(){
										alert('本次修改已经提交');
									},
									error:function(){
										alert('服务响应超时，请重试');
									},
									timeout:5000
								});
							}
			            });
					}
					//构建bar
					bulidbar(that.target);
			    }
			};
			
			function errorClick(){
				var BigMap='<div style="position:relative;width:200px;height:200px;border:#ccc solid 2px;background:#fff;">'+
						'<div style="margin-top:80px;font-size:12px;color:red;text-align:center;">对不起,没有可以查看的地图信息</div>'+
							'<a href="javascript:void(0);" class="J_OverlayClose" style="position:absolute;right:-10px;top:-10px;display:block;width:15px;height:15px;background:#000;color:#fff;line-height:15px;text-align:center;">&times</a>'+
						'</div>';
				GM.tools.overlay.reset(200,200);
				GM.tools.overlay.fire(BigMap);
			};
			
			
			
			//不给坐标的情况下，给关键字q，自己搜索绘制
			if(!that.center){
				//没有坐标的时候，用内置反查询搜索q的位置，如果q还没有搜到，则不显示
				if(google){
    				geocoder = new google.maps.Geocoder();
    				geocoder.geocode( { 'address': that.q}, function(results, status) {
				      if (status == google.maps.GeocoderStatus.OK) {
				      	var location=results[0].geometry.location;
				        that.center=[location['Oa'],location['Na']];
				        drawmap(target,that.center,that.name,that.siteNo);
				      } else {
				        error(target);
				      }
				    });
    			}
			}else if(that.center){
				//给了坐标，直接根据坐标绘制地图，name为场馆名字
				drawmap(target,that.center,that.name,that.siteNo);
			}
			
			//设置高宽
			setwrap(target);
			
			//查看全图
			$.overlay();
			
			
			//绑定bar的事件
			$('.J_LookBigMap').live('click',function(){
				if(that.coord || that.center){
					var diget=new Date().valueOf(),
						BigMap='<div style="position:relative;width:500px;height:500px;border:#ccc solid 2px;">'+
						'<div id="J_Map_'+diget+'" style="height:500px;"></div>'+
							'<a href="javascript:void(0);" class="J_OverlayClose" style="position:absolute;right:-10px;top:-10px;display:block;width:15px;height:15px;background:#000;color:#fff;line-height:15px;text-align:center;">&times</a>'+
						'</div>';
					GM.tools.overlay.reset(500,500);
					GM.tools.overlay.fire(BigMap);
					var map=new GM.widget.map({
						q:that.q,
						markerhtml:that.markerhtml,
						target:'J_Map_'+diget,
						width:500,
						height:500,
						bar:false,
						name:that.name,
						center:that.center,
						siteNo:that.siteNo
					}).init();
				}else{
					errorClick();
				}
			});
			
			//查询路线
			$('.J_LookWay').live('click',function(){
				if(that.coord || that.center){
					var Way='<div style="position:relative;width:300px;height:100px;border:#ccc solid 2px;background:#fff;">'+
						'<form action="http://ditu.google.cn/maps" method="get" target="_blank" style="padding: 10px; text-align: center;">'+
							'<div style="color:#78A000; font-size: 14px; font-weight: bold;">请输入出发所在地</div>'+
							'<div style="margin: 10px 0pt;">'+
							'<span style="margin-right: 10px;font-size:12px;">出发地</span>'+
							'<input type="text" name="saddr" value="" class="profile_box1">'+
							'</div>'+
							'<div><input type="submit" value="确认" class="space_button"></div>'+
							'<input value="'+that.q+','+that.name+'" type="hidden" name="daddr"/>'+
						'</form>'+
						'<a href="javascript:void(0);" class="J_OverlayClose" style="position:absolute;right:-10px;top:-10px;display:block;width:15px;height:15px;background:#000;color:#fff;line-height:15px;text-align:center;">&times</a>'+
						'</div>';
						
					GM.tools.overlay.reset(300,100);
					GM.tools.overlay.fire(Way);
				}else{
					errorClick();
				}
			});
			
			//关闭覆层，注销map
			$('.J_OverlayClose').live('click',function(){
				GM.tools.overlay.close();
			});
			
			//修改坐标
			$('.J_EditMap').live('click',function(){
				if(that.coord){
					var diget=new Date().valueOf(),
						BigMap='<div style="position:relative;width:500px;height:500px;border:#ccc solid 2px;">'+
						'<div id="J_Map_'+diget+'"></div>'+
							'<a href="javascript:void(0);" class="J_OverlayClose" style="position:absolute;right:-10px;top:-10px;display:block;width:15px;height:15px;background:#000;color:#fff;line-height:15px;text-align:center;">&times</a>'+
						'</div>';
					GM.tools.overlay.reset(500,500);
					GM.tools.overlay.fire(BigMap);
					var map=new GM.widget.map({
						q:that.q,
						markerhtml:that.markerhtml,
						target:'J_Map_'+diget,
						width:500,
						height:500,
						bar:false,
						name:that.name,
						center:that.center,
						siteNo:that.siteNo
					}).init();
				}else{
					errorClick();
				}
			});
			
		}
	};
	
	if(G && G.widget) G.widget.map=map;
	
})(window,GM);