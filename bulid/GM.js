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
		var ishost=(W.location.href.match('dev.ifiter')),
		uri=(ishost) ?'http://dev.ifiter.com/static/GM/' : 'http://goodmedia01-pc/gm/'
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
					'height':h
				}).addClass(cls);
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
					'height': doc.documentElement.clientHeight
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
			var opts=$(selector).get()[0].getElementsByTagName('option');
				for(var i=0;i<opts.length;i++){
					if(opts[i].value==city){
						$(selector).get()[0].selectedIndex=i;
						removeFiret(selector);
						break;
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
						if(l<=max && l>0) that.holdAction();
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
	
})(window,GM);