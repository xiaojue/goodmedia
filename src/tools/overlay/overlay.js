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
					* effect 分多种，目前默认用1，就是直接关掉，没动画效果
					* cover 默认有遮罩  50%的灰色，不可自己定义, 可以用css后期自己改，统一所有对象使用一个#J_GM_Cover
					* drag 默认不可以拖拽，先不实现，后期再实现 20110726 -涉及到多层互相覆盖的问题，比如页面上有多个overlay，这个是目前不允许的
					* content 内容为HTML，直接进行注入
					*/
					var _o={
						close:'#J_GM_OverlayClose',
						target:'#J_GM_OverlayTarget',
						effect:1,
						width:400,
						height:500,
						content:'hi,i am overlay content',
						cover:true,
						drag:false
					};
					
					$.extend(_o,o);
					
					this.config=_o;
				}
			}
		};
		
		/**
		 * 开放出去的通用api
		 */
		_overlay.prototype={
			//触发
			fire:function(callback){
				
			},
			//关闭
			close:function(callback){
				
			},
			//拖拽
			_drag:function(callstart,callend){
				
			},
			//遮罩
			_cover:function(cg){
				
			},
			//fix复位
			_fix:function(cg){
				
			}
		};
		
		
		/**
		 * 每次引用都返回一个新的浮层对象
		 */
		return new _overlay._init(cg);		
	};
	
})(window,document,jQuery,GM);
